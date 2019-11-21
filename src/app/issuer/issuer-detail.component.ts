import { Component, forwardRef, Inject, OnInit } from "@angular/core";
import { ChangeDetectorRef } from '@angular/core';

import { ActivatedRoute, Router } from "@angular/router";
import { SessionService } from "../common/services/session.service";
import { BaseAuthenticatedRoutableComponent } from "../common/pages/base-authenticated-routable.component";
import { MessageService } from "../common/services/message.service";
import { IssuerManager } from "./services/issuer-manager.service";
import { BadgeClassManager } from "./services/badgeclass-manager.service";
import { Issuer, issuerRoleInfoFor } from "./models/issuer.model";
import { BadgeClass } from "./models/badgeclass.model";
import { Title } from "@angular/platform-browser";
import { LearningPathway } from "./models/pathway.model";
import { PathwayManager } from "./services/pathway-manager.service";
import { RecipientGroup } from "./models/recipientgroup.model";
import { RecipientGroupManager } from "./services/recipientgroup-manager.service";
import { preloadImageURL } from "../common/util/file-util";
import { ApiUserProfileEmail } from "../common/model/user-profile-api.model";
import { ApiIssuerStaff, IssuerStaffRoleSlug } from "./models/issuer-api.model";
import { UserProfileManager } from "../common/services/user-profile-manager.service";
import { UserProfileEmail } from "../common/model/user-profile.model";
import { CommonEntityManager } from "../entity-manager/common-entity-manager.service";

import { ApiExternalToolLaunchpoint } from "app/externaltools/models/externaltools-api.model";
import { ExternalToolsManager } from "app/externaltools/services/externaltools-manager.service";
import { LtiApiService } from "../lti-api/services/lti-api.service";
import { ApiBadgeClassContextId } from "./models/badgeclass-api.model";
import { ifTrue } from "codelyzer/util/function";
import { EmbedService } from "../common/services/embed.service";


@Component({
	selector: 'issuer-detail',
	template:`
		<main>
			<form-message></form-message>

			<ng-template [bgAwaitPromises]="[issuerLoaded]">
				<header class="wrap wrap-light l-containerhorizontal l-heading ">

					<nav>
						<h1 class="visuallyhidden">Breadcrumbs</h1>
						<ul class="breadcrumb">
							<li><a [routerLink]="['/issuer']">Issuers</a></li>
							<li *ngIf="issuer" class="breadcrumb-x-current">{{issuer.name}}</li>
						</ul>
					</nav>

					<div class="heading">
						<div class="heading-x-image">
							<img *ngIf="issuer.image" [src]="issuer.image" alt="{{issuer.name}} logo " />
							<img *ngIf="!issuer.image" [src]="issuerImagePlaceHolderUrl" alt="Default issuer image">
						</div>
						<div class="heading-x-text">
							<h1>
								{{ issuer.name }}
								<button class="heading-x-edit"
								        type="button"
								        [routerLink]="['/issuer/issuers', issuerSlug, 'edit']"
												*ngIf="issuer.canEdit"
								>Edit
								</button>
							</h1>
							<h3>
								<span [truncatedText]="issuer.email" [maxLength]="64"></span> | Your Role: {{ issuer?.currentUserStaffMember?.roleInfo?.label }}
							</h3>
							<p>{{ issuer.description }}</p>
							<div class="l-childrenhorizontal">
								<a class="button button-primaryghost l-offsetleft" href="{{issuer.websiteUrl}}" target="_blank">Visit
									Website
								</a>
								<a class="button button-primaryghost l-offsetleft"
								   [routerLink]="['./staff']"
								>{{ issuer?.currentUserStaffMember?.isOwner ? "Manage": "View" }} Staff</a>
								<!--<a class="button button-primaryghost l-offsetleft" href="mailto:{{issuer.email}}">Contact Issuer</a>-->
							</div>
						</div>
					</div>

				</header>


				<div class="wrap l-containerhorizontal ">

					<div class="l-formsection wrap wrap-well" role="group" aria-labelledby="heading-basicinformation">
						<div class="l-formsection-x-container">
							<div class="l-formsection-x-inputs">

								<div class="l-formsection-x-badge-create">
									<span>NON FORMAL</span><br><span>MICRO-CREDENTIAL</span>
									<a [routerLink]="['badges/create-non-formal']" class="button button-quaternary" *ngIf="issuer.canCreateBadge">
									Create Badgeclass For non-Formal Learning
									</a>
								</div>

								<div class="l-formsection-x-badge-create">
									<span>FORMAL</span><br><span>MICRO-CREDENTIAL</span>
									<a [routerLink]="['badges/create-formal']" class="button button-quaternary" *ngIf="issuer.canCreateBadge">
									Create Badgeclass For Formal Learning
									</a>
								</div>

							</div>
							<div class="l-formsection-x-help">
								<h4 class="title title-bordered" id="heading-badgebasics">What is the difference?</h4>
								<p class="text text-small">Badgeclasses can be created for formal accredited learning and for skills recognition. 
											The mandatory metedata is different.</p>
								<a class="button button-tertiaryghost"
									href="https://www.surfnet.nl"
									aria-labelledby="heading-badgebasics"
									target="_blank"
								>Learn More</a>
							</div>
						</div>
					</div>
					
	
					<!-- Badge Class List =============================================================================================-->
					<header class="l-childrenhorizontal l-childrenhorizontal-spacebetween l-childrenhorizontal-spacebetween">
						<h2 class="title title-is-smallmobile l-marginBottom-1andhalfx">Badge Classes</h2>
					</header>
					<div class="l-overflowhorizontal" *bgAwaitPromises="[issuerLoaded, badgesLoaded]">
						<table class="table" *ngIf="badges?.length">
							<thead>
								<tr>
									<th scope="col">Badge</th>
									<th class="hidden hidden-is-desktop" scope="col">Type</th>
									<th class="hidden hidden-is-desktop" scope="col">Created</th>
									<th class="hidden hidden-is-desktop" scope="col">Recipients</th>
									<th class="hidden hidden-is-desktop" scope="col">Enrollments</th>
									<th class="table-x-hidetext hidden hidden-is-tablet" scope="col">Actions</th>
								</tr>
							</thead>
							<tbody>
								<tr *ngFor="let badge of badges">
									<th scope="row">
										<div class="l-childrenhorizontal l-childrenhorizontal-small">
											<img class="l-childrenhorizontal-x-offset"
											     src="{{badge.image}}"
											     alt="{{badge.description}}"
											     width="40">
											<a [routerLink]="['/issuer/issuers', issuer.slug, 'badges', badge.slug]">{{badge.name}}</a>
										</div>
									</th>
									<td>{{badge.type}}</td>
									<td class="hidden hidden-is-desktop">
										<time [date]="badge.createdAt" format="mediumDate"></time>
									</td>
									<td class="hidden hidden-is-desktop">{{ badge.recipientCount }}</td>
									<td class="hidden hidden-is-desktop">{{ badge.enrollmentCount }}</td>
									<td class="hidden hidden-is-tablet">
										<div class="confirmswitch"
										     [class.confirmswitch-is-active]="confirmingBadgeId && confirmingBadgeId == badge.id">
											<div class="l-childrenhorizontal l-childrenhorizontal-right">
												<a class="button button-primaryghost"
												   [routerLink]="['/issuer/issuers/', issuer.slug, 'badges', badge.slug, 'issue']"
													 *ngIf="issuer.canAwardBadge"
												>Award</a>
												
												<button class="button button-primaryghost"
													 	 (click)="addBadgeClassToLMS($event, badge,ltiContextId)"
													 *ngIf="issuer.canAwardBadge && ltiContextId && !isBadgeInLms(badge)"
												>Add badge to this LMS course</button>
												<button class="button button-primaryghost"
																(click)="removeBadgeClassFromLMS($event, badge,ltiContextId)"
																*ngIf="isBadgeInLms(badge)"
												>Remove badge from this LMS course</button>
													
												<button *ngIf="badge.recipient_count == 0"
												        type="button"
												        class="button button-primaryghost"
												        (click)="clickConfirmRemove($event, badge)"
												        [disabled-when-requesting]="true"
												>Delete
												</button>
											</div>
											<div class="l-childrenhorizontal l-childrenhorizontal-right">
												<p class="l-childrenhorizontal-x-offset"><strong>Are you sure?</strong></p>
												<button type="button" class="button" (click)="clickRemove($event, badge)">Confirm Delete
												</button>
												<button type="button" class="button button-primaryghost" (click)="clickCancelRemove($event)">
													Cancel
												</button>
											</div>
										</div>
									</td>
								</tr>
							</tbody>
						</table>
	
						<p class="empty" *ngIf="! badges?.length">
							You do not have any Badge Classes
						</p>
					</div>
				</div>
				
				<div *ngIf="legacyPathwaysVisible" class="wrap l-containerhorizontal l-headeredsection">
					
					<!-- Pathways List ================================================================================================-->
					<header>
						<h1 class="title title-is-smallmobile">Pathways</h1>
					</header>

					<div *bgAwaitPromises="[issuerLoaded, pathwaysLoaded]" class="l-gridthree">
						<div *ngFor="let pathway of pathways">
							<div class="card card-smallimage">
								<a class="card-x-main"
								   [routerLink]="['/issuer/issuers', issuerSlug, 'pathways', pathway.slug, 'elements', pathway.slug]">
									<div class="card-x-image">
										<div class="badge badge-flat">
											<badge-image [badge]="pathway.completionBadge.entity" [size]="40" [link]="false"></badge-image>
										</div>
									</div>
									<div class="card-x-text">
										<h1>{{ pathway.name }}</h1>
										<small>{{ pathway.elementCount }} Child Elements</small>
										<p [truncatedText]="pathway.description" [maxLength]="150"></p>
									</div>
								</a>
							</div>
						</div>
						<!--<div>-->
							<!--<div class="card card-placeholder">-->
								<!--<a class="card-x-add" [routerLink]="['/issuer/issuers', issuer.slug, 'pathways', 'create']">-->
									<!--Add Pathway-->
								<!--</a>-->
							<!--</div>-->
						<!--</div>-->
					</div>

					<!-- Recipient Group List =========================================================================================-->

					<header class="l-childrenhorizontal l-childrenhorizontal-spacebetween">
						<h2 class="title title-is-smallmobile">Groups</h2>
					</header>

					<div class="l-overflowhorizontal" *bgAwaitPromises="[issuerLoaded, groupsLoaded]">
						<table class="table" *ngIf="recipientGroups.length">
							<thead>
								<tr>
									<th scope="col">Group</th>
									<th class="hidden hidden-is-desktop" scope="col">Members</th>
									<th class="hidden hidden-is-tablet" scope="col">Pathways</th>
								</tr>
							</thead>
							<tbody>
								<tr *ngFor="let recipientGroup of recipientGroups">
									<th scope="row">
										<div class="l-childrenhorizontal">
											<a [routerLink]="['/issuer/issuers', issuer.slug, 'recipient-groups', recipientGroup.slug]">{{ recipientGroup.name
												}}</a>
										</div>
									</th>
									<td class="hidden hidden-is-desktop">{{ recipientGroup.memberCount }}</td>
									<td class="hidden hidden-is-tablet">
										<span *ngIf="recipientGroup.subscribedPathways.length == 0">No Subscribed Pathways</span>
										<span *ngIf="recipientGroup.subscribedPathways.length == 1">
										<a *ngFor="let pathway of recipientGroup.subscribedPathways"
										   [routerLink]="['/issuer/issuers', issuerSlug, 'pathways', pathway.slug, 'elements', pathway.slug]">
											{{ pathway.name }}
										</a>
									</span>
										<span *ngIf="recipientGroup.subscribedPathways.length > 1">
										{{ recipientGroup.subscribedPathways.length }} Pathways
									</span>
									</td>
								</tr>
							</tbody>
						</table>

						<p class="empty" *ngIf="! recipientGroups.length">
							You do not have any Recipient Groups
						</p>
					</div>
					
				</div>
			</ng-template>
		</main>
	`,
})
export class IssuerDetailComponent extends BaseAuthenticatedRoutableComponent implements OnInit {
	readonly issuerImagePlaceHolderUrl = preloadImageURL(require('../../breakdown/static/images/placeholderavatar-issuer.svg'));

	issuer: Issuer;
	issuerSlug: string;
	badges: Array<BadgeClass>;
	currentLtiBadges: Array<ApiBadgeClassContextId>;
	confirmingBadgeId: number;
	confirmingRecipientGroup: RecipientGroup;
	launchpoints: ApiExternalToolLaunchpoint[];

	pathways: LearningPathway[] = [];
	recipientGroups: RecipientGroup[] = [];
	profileEmails: UserProfileEmail[] = [];

	issuerLoaded: Promise<any>;
	groupsLoaded: Promise<any>;
	pathwaysLoaded: Promise<any>;
	badgesLoaded: Promise<any>;

	profileEmailsLoaded: Promise<any>;
	currentContextId: string = "";

	constructor(
		loginService: SessionService,
		router: Router,
		route: ActivatedRoute,
		protected messageService: MessageService,
		protected title: Title,
		protected issuerManager: IssuerManager,
		protected pathwayManager: PathwayManager,
		protected badgeClassService: BadgeClassManager,
		protected recipientGroupManager: RecipientGroupManager,
		protected profileManager: UserProfileManager,
		private externalToolsManager: ExternalToolsManager,
		private ltiManager: LtiApiService,
		private embedService: EmbedService
	) {
		super(router, route, loginService);

		title.setTitle("Issuer Detail - Badgr");
		if(this.embedService.isEmbedded) {
			ltiManager.currentContextId.then(r => {
				this.currentContextId = r['lticontext'];
				if(this.currentContextId != null) {
					ltiManager.getAllContextIdBadgeClasses(this.currentContextId).then(r => {
						this.currentLtiBadges = r;
					});
				}

			 });
		}


		this.issuerSlug = this.route.snapshot.params['issuerSlug'];

		this.externalToolsManager.getToolLaunchpoints("issuer_external_launch").then(launchpoints => {
			this.launchpoints = launchpoints.filter(lp => Boolean(lp));
		});

		this.issuerLoaded = this.issuerManager.issuerBySlug(this.issuerSlug).then(
			(issuer) => {
				this.issuer = issuer;
				this.title.setTitle("Issuer - " + this.issuer.name + " - Badgr");

				this.badgesLoaded = new Promise((resolve, reject) => {
					this.badgeClassService.badgesByIssuerUrl$.subscribe(
						badgesByIssuer => {
							this.badges = badgesByIssuer[ this.issuer.issuerUrl ];
							resolve();
						},
						error => {
							this.messageService.reportAndThrowError(
								`Failed to load badges for ${this.issuer ? this.issuer.name : this.issuerSlug}`, error
							);
							resolve();
						}
					);
				});
			}, error => {
				this.messageService.reportLoadingError(`Issuer '${this.issuerSlug}' does not exist.`, error);
			}
		);

		this.groupsLoaded = this.recipientGroupManager.loadRecipientGroupsForIssuer(this.issuerSlug)
			.then(
				groups => {
					this.recipientGroups = groups.entities
				},
				error => this.messageService.reportAndThrowError(`Failed to fetch Recipient Groups`, error)
			);

		this.pathwaysLoaded = this.pathwayManager.loadPathwaysForIssuer(this.issuerSlug)
			.then(pathways => this.pathways = pathways.entities);

		this.profileEmailsLoaded = this.profileManager.userProfilePromise
			.then(profile => profile.emails.loadedPromise)
			.then(emails => this.profileEmails = emails.entities);
	}

	ngOnInit() {
		super.ngOnInit();
	}

	get legacyPathwaysVisible(): boolean {
		return this.pathwaysLoaded && this.pathways.length > 0
	}

	deleteRecipientGroup(group: RecipientGroup) {
		group.deleteRecipientGroup().then(
			() => this.messageService.reportMinorSuccess(`Deleted recipient group ${group.name}`),
			error => this.messageService.reportAndThrowError(`Failed to delete recipient group ${group.name}`)
		)
	}

	clickCancelRemove(ev) {
		this.confirmingBadgeId = null;
	}

	addBadgeClassToLMS(ev,badge,ltiContextId){
		console.log('button clicked');

		let badgeClassContextId = {
			badgeClassEntityId:badge.slug,
			contextId: ltiContextId
		} as ApiBadgeClassContextId;
		badgeClassContextId.badgeClassEntityId = badge.slug;
		badgeClassContextId.contextId = ltiContextId;
		this.ltiManager.addBadgeClassToLMS(badgeClassContextId).then(r => { console.log('succes');
			this.ltiManager.getAllContextIdBadgeClasses(this.currentContextId).then(r => {
				this.currentLtiBadges = r;
			});
		});

	}

	removeBadgeClassFromLMS(ev,badge,ltiContextId){
		console.log('button remove clicked');

		let badgeClassContextId = {
			badgeClassEntityId:badge.slug,
			contextId: ltiContextId
		} as ApiBadgeClassContextId;
		badgeClassContextId.badgeClassEntityId = badge.slug;
		badgeClassContextId.contextId = ltiContextId;
		this.ltiManager.removeBadgeClassFromLMS(badgeClassContextId).then(r => { console.log('succes');
			this.ltiManager.getAllContextIdBadgeClasses(this.currentContextId).then(r => {
				this.currentLtiBadges = r;
			});
		});

	}

	isBadgeInLms(badge:BadgeClass){
		for(let lmsBadge in this.currentLtiBadges){
			let entity_id = this.currentLtiBadges[lmsBadge]['badgeClassEntityId']
			if(badge.slug == this.currentLtiBadges[lmsBadge]['badgeClassEntityId']){
				return true;
			}
		}
		return false;
	}

	clickConfirmRemove(ev, badge) {
		if (badge.recipientCount > 0) {
			ev.preventDefault();
		} else {
			this.confirmingBadgeId = badge.id;
		}
	}

	clickRemove(ev, badge) {
		this.badgeClassService.removeBadgeClass(badge).then(() => {
			this.messageService.setMessage("Removed badge " + badge.name, "success");
		}, error => {
			this.messageService.setMessage("Unable to remove " + badge.name, "error");
		})
	}

	deletePathway(ev, pathway: LearningPathway) {
		pathway.deletePathway();
	}

	get ltiContextId(): string{
		return this.currentContextId;
	}

	updateGroupActiveState(
		recipientGroup: RecipientGroup,
		active: boolean
	) {
		recipientGroup.active = active;
		recipientGroup.save().then(
			() => this.messageService.reportMinorSuccess(
				`${active ? 'Activated' : 'Deactivated'} recipient group ${recipientGroup.name}`
			),
			error => this.messageService.reportAndThrowError(
				`Failed to ${active ? 'activate' : 'deactivate'} recipient group ${recipientGroup.name}`,
				error
			)
		)
	}
}
