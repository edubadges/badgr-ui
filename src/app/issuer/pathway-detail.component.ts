import { Component, OnInit, ViewChild, ChangeDetectorRef, AfterViewInit } from "@angular/core";
import { Router, ActivatedRoute } from "@angular/router";
import { SessionService } from "../common/services/session.service";
import { MessageService } from "../common/services/message.service";
import { BaseAuthenticatedRoutableComponent } from "../common/pages/base-authenticated-routable.component";
import { PathwayManager } from "./services/pathway-manager.service";
import { Title } from "@angular/platform-browser";
import { LearningPathway, LearningPathwayElement } from "./models/pathway.model";
import { PathwayElementComponent } from "./pathway-element.component";
import { Issuer } from "./models/issuer.model";
import { IssuerManager } from "./services/issuer-manager.service";
import { BadgeSelectionDialog } from "./badge-selection-dialog.component";
import { CommonDialogsService } from "../common/services/common-dialogs.service";
import { RecipientGroupSelectionDialog } from "./recipientgroup-selection-dialog.component";
import { RecipientGroup } from "./models/recipientgroup.model";
import { SystemConfigService } from "../common/services/config.service";
import { preloadImageURL } from "../common/util/file-util";


@Component({
	selector: 'pathway-detail',
	template: `
		<main *bgAwaitPromises="[issuerLoaded, pathwayLoaded]">
			<form-message></form-message>
		
			<ng-template [ngIf]="pathwayElement">
		
				<header class="wrap wrap-light l-heading l-containerhorizontal">
		
					<nav [class.inactive]="editForm.isEditing">
		
						<h1 class="visuallyhidden">Breadcrumbs</h1>
		
						<ul class="breadcrumb">
							<li><a [routerLink]="['/issuer']">Issuers</a></li>
							<li *ngIf="issuer"><a [routerLink]="['/issuer/issuers', issuerSlug]">{{ issuer.name }}</a></li>
							<ng-template [ngIf]="pathwayElement">
								<li *ngFor="let ancestor of breadcrumbAncestors">
									<a [routerLink]="['/issuer/issuers', issuerSlug, 'pathways', pathway.slug, 'elements', ancestor.slug]">{{ ancestor.name }}</a>
								</li>
								<li class="breadcrumb-x-current">{{ pathwayElement.name }}</li>
							</ng-template>
						</ul>
		
					</nav>
		
					<div class="l-article">
		
						<div>
		
							<div class="heading" *ngIf="! editForm.isEditing">
								<div class="heading-x-text">
		
									<h1>
										{{ pathwayElement.name }}
										<button class="heading-x-edit"
										        type="button"
										        (click)="editForm.startEditing()"
										>Edit</button>
									</h1>
		
									<p>{{ pathwayElement.description }}</p>
		
									<div class="l-childrenhorizontal">
										<a
											[href]="pathwayElement.alignmentUrl"
											class="button button-primaryghost l-offsetleft"
											target="_blank"
											*ngIf="pathwayElement.alignmentUrl">Alignment URL</a>
										<button class="button button-primaryghost l-offsetleft"
										        (click)="deletePathway()"
										        [disabled-when-requesting]="true"
										>Delete Pathway</button>
									</div>
		
									<h2 class="titledivider">Issuer</h2>
		
									<a class="stack" [routerLink]="['/issuer/issuers/', issuerSlug]">
										<!-- TODO: Make issuer stack into a component? -->
									  <div class="stack-x-image">
										  <img [loaded-src]="issuer.image"
										       [loading-src]="issuerImagePlacholderUrl"
										       [error-src]="issuerImagePlacholderUrl"
										       width="40"
										       alt="{{ issuer.name }} avatar" />
									  </div>
									  <div class="stack-x-text">
									    <h2>{{ issuer.name }}</h2>
									    <small>{{ issuerBadgeCount }} {{ issuerBadgeCount == 1 ? 'Badge' : 'Badges' }}</small>
									  </div>
									</a>
		
								</div>
							</div>
		
							<pathway-element-edit-form #editForm [pathwayElement]="pathwayElement" [formSpan]="true"></pathway-element-edit-form>
		
						</div>
		
						<aside [class.inactive]="editForm.isEditing">
		
							<h1 class="title title-small">Completion Badge</h1>
		
							<div class="card card-action"
									 *ngIf="! pathwayElement.hasCompletionBadge">
							  <div class="card-x-main"
										 (click)="elementComponent.openCompletionBadgeDialog()">
							    <div class="card-x-image">
							        <img [src]="connectImageUrl" width="40" height="40" alt="Badge Description">
							    </div>
							    <div class="card-x-text">
							      <h1>Add Badge</h1>
							    </div>
							  </div>
							</div>
		
							<connected-badge [badge]="pathwayElement.completionBadge.entity"
							                 *ngIf="pathwayElement.hasCompletionBadge"
							                 (onRemove)="elementComponent.removeCompletionBadge()"
							></connected-badge>
		
							<h1 class="title title-small">Subscribed Groups</h1>
		
							<div class="card card-action">
							  <div class="card-x-main"
										 [routerLink]="['/issuer/issuers', issuerSlug, 'pathways', pathway.slug, 'subscribed-groups']">
							    <div class="card-x-image">
							        <img [src]="connectImageUrl" width="40" height="40" alt="Badge Description">
							    </div>
							    <div class="card-x-text">
							      <h1>{{ pathway.subscribedGroups.entities.length }} Group<span *ngIf="pathway.subscribedGroups.entities.length !== 1">s</span></h1>
										<small>{{ pathway.totalSubscribedMembers }} Total Member<span *ngIf="pathway.totalSubscribedMembers !== 1">s</span></small>
							    </div>
							  </div>
							</div>
						</aside>
					</div>
				</header>



				<div class="wrap l-containerhorizontal l-containervertical l-childrenvertical"
				     [class.inactive]="editForm.isEditing">

					<ng-template [ngIf]="viewLoaded">

						<article class="pathwayheading"
						         *ngIf="! elementComponent.hasRequirements && ! elementComponent.isAddingChild">

							<h1 class="title">Completion Requirements</h1>
							<p>The completion of an element can be based on connected badges or children. Each child can have it’s own unique completion requirements.</p>

							<div class="l-childrenhorizontal l-childrenhorizontal-small pathwayheading-x-actions">
								<button class="button"  (click)="elementComponent.openRequiredBadgeDialog()">Connect Badge</button>
								<span class="pathwayheading-x-or">or</span>
								<button class="button" (click)="elementComponent.beginAddingChild()">Add Child</button>
							</div>

						</article>

						<article class="pathwayheading"
						         *ngIf="elementComponent.hasBadgeRequirements">

							<h1 class="title">Completion Requirements</h1>
							<p>Completion of this element is based the following badge(s).</p>

							<label class="select select-inputonly select-secondary" *ngIf="elementComponent.hasMultipleRequirements">
								<span class="visuallyhidden">Completion Requirements</span>
								<select [(ngModel)]="elementComponent.requirementJunctionType">
									<option value="Conjunction">ALL badges are required for completion</option>
									<option value="Disjunction">At least ONE badge is required for completion</option>
								</select>
							</label>

							<div class="l-gridthree pathwayheading-x-actions" *ngIf="! editForm.isEditing">
								<div *ngFor="let badgeId of pathwayElement.requirements.requiredBadgeIds">
									<connected-badge [badgeId]="badgeId"
									                 (onRemove)="elementComponent.removeRequiredBadge(badgeId)">
									</connected-badge>
								</div>
							</div>

							<button class="button pathwayheading-x-actions"
							        (click)="elementComponent.openRequiredBadgeDialog()"
							>Add Required Badge</button>

						</article>

						<article class="pathwayheading"
						         *ngIf="elementComponent.hasChildElementRequirements || elementComponent.isAddingChild">

							<h1 class="title">Completion Requirements</h1>
							<p>Completion of this element is based on completing the following child element(s).</p>

							<label class="select select-inputonly select-secondary" *ngIf="elementComponent.hasChildElementRequirements">
								<span class="visuallyhidden">Completion Requirements</span>
								<select [(ngModel)]="elementComponent.requirementJunctionType">
									<option value="Conjunction">ALL checked children are required for completion</option>
									<option value="Disjunction">At least ONE checked child is required for completion</option>
								</select>
							</label>

						</article>

					</ng-template>

					<!-- Pathway element, may or may not be the root -->
					<pathway-element *ngIf="pathwayElement"
					                 [pathwayElement]="pathwayElement"
					                 [pathwayComponent]="pathwayComponent"
					                 [isRootElement]="true"
					                 class="pathway pathway-root"
					                 #elementComponent
					></pathway-element>
				</div>
			</ng-template>
		
			<badge-selection-dialog #badgeSelectionDialog></badge-selection-dialog>
			<recipientgroup-selection-dialog #groupSelectionDialog></recipientgroup-selection-dialog>
		</main>

	`
})
export class PathwayDetailComponent extends BaseAuthenticatedRoutableComponent implements OnInit, AfterViewInit {
	readonly issuerImagePlacholderUrl = preloadImageURL(require('../../breakdown/static/images/placeholderavatar-issuer.svg'));
	readonly connectImageUrl = require('../../breakdown/static/images/connect.svg');

	pathway: LearningPathway;
	pathwayElement: LearningPathwayElement;
	pathwayComponent = this;
	issuer: Issuer;

	breadcrumbAncestors: LearningPathwayElement[];

	@ViewChild("badgeSelectionDialog") badgeSelectionDialog: BadgeSelectionDialog;
	@ViewChild("groupSelectionDialog") groupSelectionDialog: RecipientGroupSelectionDialog;
	@ViewChild("elementComponent") elementComponent: PathwayElementComponent;

	pathwayLoaded: Promise<any>;
	issuerLoaded: Promise<any>;

	movingElement: LearningPathwayElement;

	viewLoaded: boolean = false;

	get isElementMoving() { return !!this.movingElement }

	get confirmDialog() { return this.dialogService.confirmDialog }

	constructor(
		loginService: SessionService,
		router: Router,
		route: ActivatedRoute,
		protected messageService: MessageService,
		protected title: Title,
		protected pathwayManager: PathwayManager,
		protected issuerManager: IssuerManager,
		protected changeDetectionRef: ChangeDetectorRef,
		protected dialogService: CommonDialogsService,
		protected configService: SystemConfigService
	) {
		super(router, route, loginService);

		title.setTitle("Pathway Detail - Badgr");

		this.pathwayLoaded = this.pathwayManager
			.pathwaySummaryFor(this.issuerSlug, this.pathwaySlug)
			.then(pathway => pathway.structure.loadedPromise)
			.then(
				this.initWithStructure.bind(this),
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

	ngAfterViewInit() {
		// Works around using ViewChild variables in the view: https://github.com/angular/angular/issues/6005
		let hack = () => {
			if (this.badgeSelectionDialog) {
				this.viewLoaded = true;
			} else {
				setTimeout(hack, 1);
			}
		};
		hack();
	}

	private initWithStructure(structure) {
		this.pathway = structure.pathway;
		this.pathwayElement = structure.entityForSlug(this.elementSlug);

		if (this.pathwayElement) {
			this.setupBreadcrumbAncestors();
		} else {
			this.messageService.reportLoadingError(
				`Could not find element ${this.elementSlug} on pathway ${this.issuerSlug}/${this.pathwaySlug}`
			);
		}
	}

	private setupBreadcrumbAncestors() {
		this.breadcrumbAncestors = [];
		for (let node = this.pathwayElement.parentElement; node; node = node.parentElement) {
			this.breadcrumbAncestors.splice(0, 0, node);
		}
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

	//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
	// Recipient Group Connection
	subscribeGroup() {
		this.groupSelectionDialog.openDialog({
			dialogId: "pathway-group-subscribe",
			issuerSlug: this.issuerSlug,
			dialogTitle: "Subscribe a Recipient Group",
			multiSelectMode: true,
			selectedRecipientGroups: this.pathway.subscribedGroups.entities
		}).then(
			newGroups => {
				this.pathway.subscribedGroups.setTo(newGroups);
				this.pathway.save().then(
					success => this.messageService.reportMinorSuccess(`Updated subscribed groups for ${this.pathway.name}`),
					error => this.messageService.reportHandledError(`Failed to update subscribed groups for ${this.pathway.name}`, error)
				)
			},
			cancel => void 0
		)
	}

	unsubscribeGroup(
		group: RecipientGroup
	) {
		this.confirmDialog.openResolveRejectDialog({
			dialogTitle: "Unsubscribe Group",
			dialogBody: `Are you sure you want to unsubscribe ${group.name} from pathway ${this.pathway.name}`,
			resolveButtonLabel: "Unsubscribe",
			rejectButtonLabel: "Cancel"
		}).then(
			() => {
				this.pathway.subscribedGroups.remove(group);
				this.pathway.save().then(
					success => this.messageService.reportMinorSuccess(`Unsubscribed ${group.name} from pathway ${this.pathway.name}`),
					error => this.messageService.reportHandledError(`Failed to unsubscribe ${group.name} from pathway ${this.pathway.name}`, error)
				)
			},
			() => void 0 // Cancel
		)
	}

	//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
	// Pathway Deletion

	deletePathway() {
		this.confirmDialog.openResolveRejectDialog({
			dialogTitle: "Delete Pathway",
			dialogBody: `Are you sure you want to delete ${this.pathway.name}? This action is permanent and cannot be undone.`,
			resolveButtonLabel: "Delete Pathway",
			rejectButtonLabel: "Cancel"
		}).then(
			() =>
				this.pathway.deletePathway().then(
					() => {
						this.messageService.reportMajorSuccess(`Deleted pathway ${this.pathway.name}`, true);
						this.router.navigate([ '/issuer/issuers', this.issuerSlug ]);
					},
					error => this.messageService.reportHandledError(`Failed to delete pathway ${this.pathway.name}`, error)
				),
			() => void 0 // Cancel
		);
	}

	//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
	// Element Moving

	checkValidMoveTarget(
		newParent: LearningPathwayElement,
		prevSibling: LearningPathwayElement
	) {
		return this.isElementMoving && this.movingElement.checkMoveTargetValidity(newParent, prevSibling);
	}

	startElementMove(element: LearningPathwayElement) {
		this.movingElement = element;
	}

	cancelElementMove() {
		this.movingElement = null;
	}

	doElementMove(
		intoParent: LearningPathwayElement,
		afterSibling: LearningPathwayElement
	) {
		if (this.movingElement) {
			var oldParent = this.movingElement.parentElement;

			var movingElement = this.movingElement;
			this.movingElement = null;

			movingElement
				.moveAfterSibling(
					intoParent,
					afterSibling
				).then(
				ok => this.messageService.reportMinorSuccess(
					afterSibling
						? `Element ${movingElement.name} moved from ${oldParent.name} into ${intoParent.name} after ${afterSibling.name}`
						: `Element ${movingElement.name} moved from ${oldParent.name} into ${intoParent.name} as the first child`
				),
				failure => this.messageService.reportHandledError(
					`Failed to move ${movingElement.name} ${oldParent.name} into ${intoParent.name}`,
					failure
				)
			);
		}
	}
}
