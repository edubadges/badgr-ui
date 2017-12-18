import { Component, OnInit, ViewChild } from "@angular/core";
import { Router, ActivatedRoute } from "@angular/router";
import { SessionService } from "../common/services/session.service";
import { MessageService } from "../common/services/message.service";
import { BaseAuthenticatedRoutableComponent } from "../common/pages/base-authenticated-routable.component";
import { PathwayManager } from "./services/pathway-manager.service";
import { Title } from "@angular/platform-browser";
import { LearningPathway } from "./models/pathway.model";
import { Issuer } from "./models/issuer.model";
import { IssuerManager } from "./services/issuer-manager.service";
import { CommonDialogsService } from "../common/services/common-dialogs.service";
import { RecipientGroupSelectionDialog } from "./recipientgroup-selection-dialog.component";
import { RecipientGroup } from "./models/recipientgroup.model";


@Component({
	selector: 'pathway-group-subscription',
	template: `
	<main *bgAwaitPromises="[issuerLoaded, pathwayLoaded]">
		<form-message></form-message>
	
		<header class="wrap wrap-light l-containerhorizontal l-heading">
			<nav>
				<h1 class="visuallyhidden">Breadcrumbs</h1>
				<ul class="breadcrumb">
					<li><a [routerLink]="['/issuer']">Issuers</a></li>
					<li *ngIf="issuer"><a [routerLink]="['/issuer/issuers', issuerSlug]">{{ issuer.name }}</a></li>
					<li *ngIf="pathway"><a [routerLink]="['/issuer/issuers', issuerSlug, 'pathways', pathway.slug, 'elements', pathway.slug]">{{ pathway.name }}</a></li>

					<li class="breadcrumb-x-current">Subscribed Groups</li>
				</ul>
			</nav>

			<div class="heading">
				<div class="heading-x-text">
					<h1>Subscribed Groups</h1>
					<p> {{ pathway.description }}</p>
				</div>
				<div class="heading-x-actions">
					<button class="button button-major" (click)="subscribeGroups()">Subscribe Group</button>
				</div>
			</div>
		</header>
	
		<div class="wrap l-containerhorizontal l-containervertical l-childrenvertical">
			<h2 class="title title-is-smallmobile hidden hidden-is-tablet">{{ pathway.subscribedGroups.length }} Subscriptions</h2>

			<div class="l-overflowhorizontal">
				<!-- Subscriptions Table -->
				<table class="table">
					<!-- Table Header -->
					<thead>
						<tr>
							<th scope="col">Group</th>
							<th class="hidden hidden-is-tablet" scope="col">Members</th>
							<th class="table-x-actions hidden hidden-is-tablet" scope="col"><span class="visuallyhidden">Actions</span></th>
						</tr>
					</thead>

					<tbody>
						<!-- Subscribed Group Row -->
						<tr class="table-x-tr"
						    *ngFor="let group of pathway.subscribedGroups"
						>
							<th scope="row">
								<a [routerLink]="['/issuer/issuers', issuerSlug, 'recipient-groups', group.slug]">
									{{ group.name }}
								</a>
							</th>
							<td>
								{{ group.memberCount }}
							</td>
							<div class="table-x-td table-x-actions hidden hidden-is-tablet">
								<div class="l-childrenhorizontal l-childrenhorizontal-small l-childrenhorizontal-right">
									<button class="button button-primaryghost"
									        type="button"
									        (click)="unsubscribeGroup(group)"
									        [disabled-when-requesting]="true"
									>Unsubscribe</button>
								</div>
							</div>
						</tr>
					</tbody>
				</table>
			</div>
		</div>
	
		<recipientgroup-selection-dialog #recipientGroupSelectionDialog></recipientgroup-selection-dialog>
	</main>
	`
})
export class PathwayGroupSubscriptionComponent extends BaseAuthenticatedRoutableComponent implements OnInit {
	pathway: LearningPathway;
	issuer: Issuer;

	pathwayLoaded: Promise<any>;
	issuerLoaded: Promise<any>;

	@ViewChild("recipientGroupSelectionDialog")
	groupSelectionDialog: RecipientGroupSelectionDialog;

	constructor(
		loginService: SessionService,
		router: Router,
		route: ActivatedRoute,
		protected messageService: MessageService,
		protected title: Title,
		protected pathwayManager: PathwayManager,
		protected issuerManager: IssuerManager,
		protected dialogService: CommonDialogsService
	) {
		super(router, route, loginService);

		title.setTitle("Pathway Group Subscription - Badgr");

		this.pathwayLoaded = this.pathwayManager
			.pathwaySummaryFor(this.issuerSlug, this.pathwaySlug)
			.then(pathway => pathway.structure.loadedPromise)
			.then(
				structure => this.initWithStructure(structure),
				error => this.messageService.reportLoadingError(
					`Failed to load pathway ${this.issuerSlug}/${this.pathwaySlug}/${this.elementSlug}`,
					error
				)
			)
		;

		this.issuerLoaded = this.issuerManager
			.issuerBySlug(this.issuerSlug)
			.then(
				issuer => this.issuer = issuer,
				error => this.messageService.reportLoadingError(
					`Failed to load issuer ${this.issuerSlug}`,
					error
				)
			);
	}

	ngOnInit() {
		super.ngOnInit();
	}

	private initWithStructure(structure) {
		this.pathway = structure.pathway;
	}

	get issuerSlug() {
		return this.route.snapshot.params['issuerSlug'];
	}

	get pathwaySlug() {
		return this.route.snapshot.params['pathwaySlug'];
	}

	get elementSlug() {
		return this.route.snapshot.params['elementSlug'];
	}

	unsubscribeGroup(group: RecipientGroup) {
		this.dialogService.confirmDialog.openResolveRejectDialog({
			dialogTitle: "Unsubscribe Group?",
			dialogBody: `Completing this action will prevent ${group.name} from subscribing to ${this.pathway.name}`,
			rejectButtonLabel: "Cancel",
			resolveButtonLabel: "Unsubscribe"
		}).then(
			() => {
				this.pathway.subscribedGroups.remove(group);
				this.pathway.save().then(
					() => this.messageService.reportMinorSuccess(`Unsubscribed pathway ${this.pathway.name} from recipient group ${group.name}`),
					error => this.messageService.reportHandledError(`Failed to unsubscribed from recipient group ${group.name}`, error)
				);
			},
			() => {}
		)
	}

	subscribeGroups() {
		this.groupSelectionDialog.openDialog({
			dialogId: "pathway-group-subscribe",
			issuerSlug: this.issuerSlug,
			dialogTitle: "Subscribe a Recipient Group",
			multiSelectMode: true,
			selectedRecipientGroups: [],
			omittedRecipientGroups: this.pathway.subscribedGroups.entities
		}).then(
			newGroups => {
				this.pathway.subscribedGroups.addAll(newGroups);
				this.pathway.save().then(
					success => this.messageService.reportMinorSuccess(`Updated subscribed groups for ${this.pathway.name}`),
					error => this.messageService.reportAndThrowError(`Failed to update subscribed groups for ${this.pathway.name}`)
				)
			},
			cancel => void 0
		)
	}
}
