import { Component, OnInit } from "@angular/core";

import { ActivatedRoute, Router } from "@angular/router";
import { MessageService } from "../common/services/message.service";
import { BadgeClassManager } from "./services/badgeclass-manager.service";
import { BadgeClass } from "./models/badgeclass.model";
import { Issuer } from "./models/issuer.model";
import { Title } from "@angular/platform-browser";
import { BaseAuthenticatedRoutableComponent } from "../common/pages/base-authenticated-routable.component";
import { SessionService } from "../common/services/session.service";
import { StringMatchingUtil } from "../common/util/string-matching-util";
import { CommonDialogsService } from "../common/services/common-dialogs.service";
import { BadgeInstanceManager } from "./services/badgeinstance-manager.service";
import { BadgeClassInstances, BadgeInstance } from "./models/badgeinstance.model";


import { IssuerManager } from "./services/issuer-manager.service";
import { BadgrApiFailure } from "../common/services/api-failure";
import { preloadImageURL } from "../common/util/file-util";
import {EventsService} from "../common/services/events.service";
import {ExternalToolsManager} from "../externaltools/services/externaltools-manager.service";
import {ApiExternalToolLaunchpoint} from "../externaltools/models/externaltools-api.model";
import {BadgeInstanceSlug} from "./models/badgeinstance-api.model";
import {badgeShareDialogOptions} from "../recipient/recipient-earned-badge-detail.component";
import {ShareSocialDialogOptions} from "../common/dialogs/share-social-dialog.component";

@Component({
	selector: 'badgeclass-detail',
	template: `<main *bgAwaitPromises="[issuerLoaded, badgeClassLoaded]">
		<form-message></form-message>
		<external-tool-launch></external-tool-launch>

		<ng-template [ngIf]="badgeClass && issuer">

			<header class="wrap wrap-light l-containerhorizontal l-heading">

				<nav>
					<h1 class="visuallyhidden">Breadcrumbs</h1>
					<ul class="breadcrumb">
						<li><a [routerLink]="['/issuer']">Issuers</a></li>
						<li *ngIf="issuer"><a [routerLink]="['/issuer/issuers/', issuerSlug]">{{ issuer.name }}</a></li>
						<li class="breadcrumb-x-current" [truncatedText]="badgeClass?.name" [maxLength]="64"></li>
					</ul>
				</nav>

				<div class="heading">
					<div class="heading-x-imageLarge">
						<img src="{{badgeClass.image}}" alt="{{badgeClass.name}} image" >
					</div>
					<div class="heading-x-text">
						<h1>
							{{ badgeClass.name }}
							<button class="heading-x-edit"
							        type="button"
							        [routerLink]="['/issuer/issuers', issuerSlug, 'badges', badgeClass.slug, 'edit']"
											*ngIf="issuer.canEditBadge"	        
							>Edit
							</button>
						</h1>
						<!-- Whitespace is reserved, do not add additional whitespace within paragraph elements. -->
						<a class="stack" [routerLink]="['/issuer/issuers/', issuerSlug]" >
						  <div class="stack-x-image">
							  <img [loaded-src]="issuer.image"
							       [loading-src]="issuerImagePlaceHolderUrl"
							       [error-src]="issuerImagePlaceHolderUrl"
							       width="40"
							       alt="{{ issuer.name }} avatar"
							       />
						  </div>
						  <div class="stack-x-text">
						    <h2>{{ issuer.name }}</h2>
						    <small>{{ issuerBadgeCount }} {{ issuerBadgeCount == 1 ? 'Badge' : 'Badges' }}</small>
						  </div>
						</a>

						<div class="l-childrenhorizontal l-childrenhorizontal-small l-offsetleft">
							<a
								class="button button-primaryghost"
								[disabled-when-requesting]="true"
								(click)="deleteBadge()"
								*ngIf="issuer.canCreateBadge"
							>Delete Badge</a>
							<a
								*ngIf="badgeClass.criteria_url"
								class="button button-primaryghost"
								[href]="badgeClass.criteria_url"
								target="_blank"
							>View external Criteria</a>
						</div>

						<p class="heading-x-meta">
							Created On: <time [date]="badgeClass.createdAt" format="MM/dd/y"></time>
						</p>

						<section>
							<h1> Public Page </h1>
							<show-more>
							<a [routerLink]="['/public/badges/', badgeClass.slug]"> Go to public page</a>
							</show-more>
						</section>

						<section>
							<h1>Description</h1>
							<show-more>
								<p>{{ badgeClass.description }}</p>
							</show-more>
						</section>

						<section>
							<h1 *ngIf="badgeClass.criteria_url || badgeClass.criteria_text">
								Criteria
							</h1>

							<show-more *ngIf="badgeClass.criteria_text">
								<markdown-display [value]="badgeClass.criteria_text"></markdown-display>
							</show-more>
						</section>
						<!-- tags -->
						<section>
							<h1 class="title title-is-smallmobile" *ngIf="badgeClass.tags && badgeClass?.tags.length>0" i18n>Tags</h1>
							<div class="l-childrenhorizontal l-childrenhorizontal-small l-childrenhorizontal-left">
									<span
										*ngFor="let tag of badgeClass.tags; last as last">
										{{tag}}<span *ngIf="!last">,</span>
									</span>
							</div>
						</section>
						<!-- alignment -->
						<section>
							<h1 *ngIf="badgeClass.alignments && badgeClass?.alignments.length>0">Alignment</h1>
							<div class="bordered l-padding-2x l-marginBottom-2x"
									 *ngFor="let alignment of badgeClass.alignments; let i=index">
								<div class="l-childrenhorizontal l-childrenhorizontal-small l-childrenhorizontal-spacebetween">
									<h1>{{alignment.target_name}}</h1>
									<small>{{alignment.target_code}}</small>
								</div>

								<ng-template [ngIf]="alignment.target_description">
									{{ alignment.target_description }}
								</ng-template>

								<div *ngIf="alignment.target_framework">
									<h1>Framework</h1>
									{{ alignment.target_framework }}
								</div>
								<div class="l-childrenhorizontal l-childrenhorizontal-small l-childrenhorizontal-right">
									<a
										*ngIf="alignment.target_url"
										class="button button-primaryghost"
										[href]="alignment.target_url"
										target="_blank">View alignment URL</a>
								</div>
							</div>
						</section>
						<section *ngIf="badgeClass.extensions.ECTSExtension;">
							<h1>ECTS</h1>
							<show-more>
								<p>{{ badgeClass.extensions.ECTSExtension.ECTS }}</p>
							</show-more>
						</section>
						<section *ngIf="badgeClass.extensions.LanguageExtension;">
							<h1>Language</h1>
							<show-more>
								<p>{{badgeClass.extensions.LanguageExtension.language }}</p>
							</show-more>
						</section>
						<section *ngIf="badgeClass.extensions.EducationProgramIdentifierExtension;">
							<h1>{{ badgeClass.extensions.EducationProgramIdentifierExtension.identifierType }}</h1>
							<show-more>
								<p>{{ badgeClass.extensions.EducationProgramIdentifierExtension.identifierValue }}</p>
							</show-more>
						</section>
						<section *ngIf="badgeClass.extensions.NiveauExtension;">
							<h1>EQF</h1>
							<show-more>
								<p>{{ badgeClass.extensions.NiveauExtension.EQF }}</p>
							</show-more>
						</section>
						<section *ngIf="badgeClass.extensions.LearningOutcomeExtension;">
							<h1>Learning outcome</h1>
							<show-more>
								<p>{{ badgeClass.extensions.LearningOutcomeExtension.learningOutcome }}</p>
							</show-more>
						</section>
						
						
					</div>
					
					<div class="heading-x-actions">
						<a class="button button-major"
						   [routerLink]="['/issuer/issuers', issuerSlug, 'badges', badgeClass.slug, 'issue']"
						   [disabled-when-requesting]="true"
							 *ngIf="issuer.canAwardBadge"
						>Award Badge</a>
					</div>

				</div>

			</header>

			<div class="l-containerhorizontal l-containervertical l-childrenvertical"
					 *ngIf="issuer.canAwardBadge"
			>

				<h2 class="title title-is-smallmobile">{{ recipientCount }} Badge {{ recipientCount == 1 ? 'Recipient' : 'Recipients' }}</h2>
				<p *ngIf="showAssertionCount">{{instanceResults.length}} awards shown.  You may use the Next/Previous buttons below to view more awards or you may search for awards by exact email address/recipient identifier..</p>
	
				<input type="text"
				       class="search l-childrenhorizontal-x-offset"
				       placeholder="Filter Recipients"
				       [(ngModel)]="searchQuery"
				/>
				<ng-template [bgAwaitPromises]="[badgeInstancesLoaded, assertionsLoaded]">

					<div class="l-overflowhorizontal" *ngIf="instanceResults?.length">
						<table class="table">
							<thead>
								<tr>
									<th scope="col">Student</th>
									<th scope="col">Awarded</th>
									<th scope="col"><span class="visuallyhidden">Actions</span></th>
								</tr>
							</thead>
							<tbody>
								<tr *ngFor="let instance of instanceResults">
									<th scope="row" class="l-wordwrap">
									<div class="formfield">
										<label>
											Name: {{ instance.apiModel.extensions['extensions:recipientProfile']? instance.apiModel.extensions['extensions:recipientProfile']['name'] : "" }}
										</label>
										<label>
											Email: {{ instance.recipientEmail }}
										</label>
										<label>
											{{ instance.recipientType }}: <br>
											{{ instance.recipientIdentifier }}
										</label>
									</div>
									</th>
									<td><time [date]="instance.issuedOn" format="mediumDate"></time></td>
									<td class="table-x-minwidthtablet-400">
										<div class="l-childrenhorizontal l-childrenhorizontal-right l-childrenhorizontal-stackmobile-flexalign-end">
											<a class="button button-primaryghost" [href]="instance.url" target="_blank">View</a>
											<button type="button" class="button button-primaryghost" (click)="revokeInstance(instance)">Revoke</button>
											<ng-container *ngIf="launchpoints">
												<button *ngFor="let lp of launchpoints"
															  class="button button-primaryghost"
															  type="button"
															  (click)="clickLaunchpoint(lp, instance.slug)"
												>{{lp.label}}</button>
											</ng-container>
										</div>
									</td>
								</tr>
							</tbody>
						</table>

						<div *ngIf="hasNextPage() || hasPrevPage()" class="">
							<nav class="pagination u-margin-bottom7x">
								<h2 class="visuallyhidden">Pagination</h2>
								<div class="l-marginTop l-marginTop-2x l-childrenhorizontal l-childrenhorizontal-spacebetween">
									<button [class.is-disabled]="!hasPrevPage()" [attr.disabled]="hasPrevPage() ? null : 'disabled'" class="page" (click)="clickPrevPage()">Previous</button>
									<button [class.is-disabled]="!hasNextPage()" [attr.disabled]="hasNextPage() ? null : 'disabled'" class="page" (click)="clickNextPage()">Next</button>
								</div>
							</nav>
						</div>
					</div>
					<p class="empty" *ngIf="! allBadgeInstances?.length">No recipients.</p>
					<p class="empty" *ngIf="allBadgeInstances?.length && ! instanceResults?.length">No recipients
						matching filter.</p>
				</ng-template>
			</div>

			<!-- Show badge class endorsements -->
			<div class="l-containerhorizontal l-containervertical l-childrenvertical">
				<endorsements-badgeclass [badgeclass]="badgeClass"></endorsements-badgeclass>
			</div>
		</ng-template>
	</main>
	`
})
export class BadgeClassDetailComponent extends BaseAuthenticatedRoutableComponent implements OnInit {
	readonly issuerImagePlacholderUrl = preloadImageURL(require('../../breakdown/static/images/placeholderavatar-issuer.svg'));

	private resultsPerPage = 100;

	private issuer: Issuer;
	private badgeClass: BadgeClass;
	private allBadgeInstances: BadgeClassInstances;
	private instanceResults: BadgeInstance[] = [];
	launchpoints: ApiExternalToolLaunchpoint[];

	private _searchQuery: string = "";
	get searchQuery() { return this._searchQuery; }

	set searchQuery(query) {
		this._searchQuery = query;
		this.loadInstances(query);
	}

	badgeClassLoaded: Promise<any>;
	badgeInstancesLoaded: Promise<any>;
	assertionsLoaded: Promise<any>;
	issuerLoaded: Promise<any>;
	showAssertionCount: boolean = false;

	get issuerSlug() {
		return this.route.snapshot.params['issuerSlug'];
	}

	get badgeSlug() {
		return this.route.snapshot.params['badgeSlug'];
	}

	get confirmDialog() {
		return this.dialogService.confirmDialog;
	}

	get recipientCount() {
		return this.badgeClass ? this.badgeClass.recipientCount : null;
	}

	constructor(
		protected title: Title,
		protected messageService: MessageService,
		protected badgeManager: BadgeClassManager,
		protected issuerManager: IssuerManager,
		protected badgeInstanceManager: BadgeInstanceManager,
		sessionService: SessionService,
		router: Router,
		route: ActivatedRoute,
		protected dialogService: CommonDialogsService,
		private eventService: EventsService,
		private externalToolsManager: ExternalToolsManager
	) {
		super(router, route, sessionService);

		this.badgeClassLoaded = badgeManager.badgeByIssuerSlugAndSlug(
			this.issuerSlug,
			this.badgeSlug
		).then(
			badge => {
				this.badgeClass = badge;
				this.title.setTitle(`Badge Class - ${this.badgeClass.name} - Badgr`);
				this.loadInstances();
			},
			error => this.messageService.reportLoadingError(`Cannot find badge ${this.issuerSlug} / ${this.badgeSlug}`,
				error)
		);


		this.issuerLoaded = issuerManager.issuerBySlug(this.issuerSlug).then(
			issuer => this.issuer = issuer,
			error => this.messageService.reportLoadingError(`Cannot find issuer ${this.issuerSlug}`, error)
		);

		this.externalToolsManager.getToolLaunchpoints("issuer_assertion_action").then(launchpoints => {
			this.launchpoints = launchpoints;
		})
	}

	loadInstances(recipientQuery?: string) {
	  let instances = new BadgeClassInstances(this.badgeInstanceManager, this.issuerSlug, this.badgeSlug, recipientQuery);
		this.badgeInstancesLoaded = instances.loadedPromise
			.then(
				instances => {
					this.allBadgeInstances = instances;
					this.updateResults();
				},
				error => {
					this.messageService.reportLoadingError(
						`Could not load recipients ${this.issuerSlug} / ${this.badgeSlug}`
					);
					return error
				}
			);
	}

	get issuerBadgeCount() {
		// Load the list if it's not present
		this.badgeManager.badgesByIssuerUrl.loadedPromise;

		const badges = this.badgeManager.badgesByIssuerUrl.lookup(this.issuer.issuerUrl);
		return badges && badges.length;
	}

	ngOnInit() {
		super.ngOnInit();
	}

	private updateResults() {
		this.instanceResults = this.allBadgeInstances.entities;
		if (this.recipientCount > this.resultsPerPage) {
			this.showAssertionCount = true;
		}
	}

	revokeInstance(
		instance: BadgeInstance
	) {
		this.confirmDialog.openResolveRejectDialog({
			dialogTitle: "Warning",
			dialogBody: `Are you sure you want to revoke <strong>${this.badgeClass.name}</strong> from <strong>${instance.recipientIdentifier}</strong>?`,
			resolveButtonLabel: "Revoke Badge",
			rejectButtonLabel: "Cancel"
		}).then(
			() => {
				instance.revokeBadgeInstance("Manually revoked by Issuer").then(
					(result) => {
						this.messageService.reportMinorSuccess(`Revoked badge to ${instance.recipientIdentifier}`);
						this.badgeClass.update();
						this.updateResults();
					},
					(error) =>
						this.messageService.reportAndThrowError(`Failed to revoke badge ${error}`)
				)
			},
			() => void 0 // Cancel
		)
	}

	deleteBadge() {
		if (this.recipientCount == 0) {

			this.confirmDialog.openResolveRejectDialog({
				dialogTitle: "Warning",
				dialogBody: `Are you sure you want to delete the badge <strong>${this.badgeClass.name}</strong>?`,
				resolveButtonLabel: "Delete Badge",
				rejectButtonLabel: "Cancel",
			}).then(() => {

				this.badgeManager.removeBadgeClass(this.badgeClass).then(
					(success) => {
						this.messageService.reportMajorSuccess(`Removed badge class: ${this.badgeClass.name}.`)
						this.router.navigate([ 'issuer/issuers', this.issuerSlug ]);
					},
					(error) => {
						this.messageService.reportAndThrowError(`Failed to delete badge class: ${BadgrApiFailure.from(error).firstMessage}`);
					}
				);

			}, () => void 0);

		} else {

			this.confirmDialog.openResolveRejectDialog({
				dialogTitle: "Error",
				dialogBody: `All instances of <strong>${this.badgeClass.name}</strong> must be revoked before you can delete it`,
				resolveButtonLabel: "Ok",
				showRejectButton: false
			}).then(() => void 0, () => void 0)

		}
	}

	private hasNextPage() {
		return this.allBadgeInstances.lastPaginationResult && this.allBadgeInstances.lastPaginationResult.nextUrl;
	}
	private hasPrevPage() {
		return this.allBadgeInstances.lastPaginationResult && this.allBadgeInstances.lastPaginationResult.prevUrl;
	}

	private clickNextPage() {
		if (this.hasNextPage()) {
			this.showAssertionCount = false;
			this.assertionsLoaded = this.allBadgeInstances.loadNextPage().then(() => this.showAssertionCount = true)
		}
	}

	private clickPrevPage() {
		if (this.hasPrevPage()) {
			this.showAssertionCount = false;
			this.assertionsLoaded = this.allBadgeInstances.loadPrevPage().then(() => this.showAssertionCount = true);
		}
	}

	private clickLaunchpoint(launchpoint:ApiExternalToolLaunchpoint, instanceSlug: BadgeInstanceSlug) {
		this.externalToolsManager.getLaunchInfo(launchpoint, instanceSlug).then(launchInfo => {
			this.eventService.externalToolLaunch.next(launchInfo, );
		})
	}

	shareInstance(instance: BadgeInstance) {
		this.dialogService.shareSocialDialog.openDialog(this.badgeShareDialogOptionsFor(instance));
	}

	badgeShareDialogOptionsFor(badge: BadgeInstance): ShareSocialDialogOptions {
		return badgeShareDialogOptions({
			shareUrl: badge.instanceUrl,
			imageUrl: badge.imagePreview,
			badgeClassName: this.badgeClass.name,
			badgeClassDescription: this.badgeClass.description,
			issueDate: badge.issuedOn,
			recipientName: badge.getExtension('extensions:recipientProfile', {'name': undefined}).name,
			recipientIdentifier: badge.recipientIdentifier,
			recipientType: badge.recipientType
		});
	}
}


class MatchingAlgorithm {
	static instanceMatcher(inputPattern: string): (instance: BadgeInstance) => boolean {
		let patternStr = StringMatchingUtil.normalizeString(inputPattern);
		let patternExp = StringMatchingUtil.tryRegExp(patternStr);

		return instance => (
			StringMatchingUtil.stringMatches(instance.recipientIdentifier, patternStr, patternExp)
		)
	}
}
