import { Component, Injector } from "@angular/core";
import { ActivatedRoute } from "@angular/router";

import { StudentsEnrolledApiService } from "../issuer/services/studentsenrolled-api.service"
import { SessionService } from "../common/services/session.service";
import { preloadImageURL } from "../common/util/file-util";
import { PublicApiService } from "./services/public-api.service";
import { UserProfileApiService } from "../common/services/user-profile-api.service"
import { LoadedRouteParam } from "../common/util/loaded-route-param";
import { PublicApiBadgeClassWithIssuer, PublicApiIssuer } from "./models/public-api.model";
import { EmbedService } from "../common/services/embed.service";
import { addQueryParamsToUrl, stripQueryParamsFromUrl } from "../common/util/url-util";
import { routerLinkForUrl } from "./public.component";
import { UserProfile } from "../common/model/user-profile.model";
import { UserProfileManager } from "../common/services/user-profile-manager.service";
import { QueryParametersService } from "../common/services/query-parameters.service";

@Component({
	template: `
		<ng-template [bgAwaitPromises]="badgeIdParam">
			<!-- Embedded View -->
			<div class="l-cardembedded" *ngIf="embedService.isEmbedded">
				<div class="card card-largeimage">
					<a class="card-x-main" [href]="badgeClass.id" target="_blank">
						<div class="card-x-image">
							<img [loaded-src]="badgeClass.image"
							     [loading-src]="badgeLoadingImageUrl"
							     [error-src]="badgeFailedImageUrl"
							     width="60" height="60" />
						</div>
						<div class="card-x-text">
							<h1>{{ badgeClass.name }}</h1>
							<small>{{ issuer.name }}</small>
							<p [truncatedText]="badgeClass.description" [maxLength]="100"></p>
						</div>
					</a>
				</div>
			</div>

			<!-- Regular View -->
			<main *ngIf="! embedService.isEmbedded">
				<form-message></form-message>

				<header class="wrap wrap-light l-containerhorizontal l-heading">
					<div class="heading">
						<!-- Badge Assertion Image -->
						<div class="heading-x-imageLarge">
							<div class="badge badge-flat">
								<img [loaded-src]="badgeClass.image"
								     [loading-src]="badgeLoadingImageUrl"
								     [error-src]="badgeFailedImageUrl"
								     width="200" />
							</div>
						</div>
							<ng-template [ngIf]="loggedIn">
								<div *bgAwaitPromises="[profileLoaded]">
									<div *ngIf="! studentsEnrolledButtonDisabled" class="heading-x-actions">
										<a class="button button-major" (click)="clickEnrollStudent()" [disabled-when-requesting]="true">{{buttonText}}</a>
									</div>
									<div *ngIf="studentsEnrolledButtonDisabled" class="heading-x-actions">
										<a class="button button-major button-is-disabled" style='background-color:#78768D;'>{{buttonText}}</a>
									</div>
								</div>
							</ng-template>
							<ng-template [ngIf]="!loggedIn">
								<div class="heading-x-actions">
									<button class="button button-major" (click)="sessionService.initiateUnauthenticatedExternalAuth(provider)" >Enroll</button>
								</div>
							</ng-template>
					</div><br>

					<div style="display:inline-block;">

						<div class="heading-x-text">

							<!-- Badge Name -->
							<h1>{{ badgeClass.name }}</h1>

							<!-- Issuer Information -->
							<a class="stack" [routerLink]="routerLinkForUrl(issuer.id)">
								<div class="stack-x-image">
									<img [loaded-src]="issuer.image"
									     [loading-src]="issuerImagePlaceholderUrl"
									     [error-src]="issuerImagePlaceholderUrl"
									     width="80" />
								</div>
								<div class="stack-x-text">
									<h2>{{ issuer.name }}</h2>
								</div>
							</a>

							<p style="font-size: 16px">{{ badgeClass.description }}</p>

							<!-- criteria -->
							<section *ngIf="badgeClass.criteria">
								<h1>Criteria</h1>
								<show-more *ngIf="badgeClass.criteria.narrative">
									<markdown-display [value]="badgeClass.criteria.narrative"></markdown-display>
								</show-more>

								<div class="l-childrenhorizontal l-childrenhorizontal-small l-childrenhorizontal-right"
								     *ngIf="badgeClass.criteria.criteriaUrl">
									<a class="button button-primaryghost"
									   [href]="badgeClass.criteria.criteriaUrl"
									   target="_blank">View external Criteria URL</a>
								</div>
							</section>

							<!-- tags -->
							<section>
								<h1 *ngIf="badgeClass.tags">Tags</h1>
								<div class="l-childrenhorizontal l-childrenhorizontal-small l-childrenhorizontal-left">
									<span
										*ngFor="let tag of badgeClass.tags; last as last">
										{{tag}}<span *ngIf="!last">,</span>
									</span>
								</div>
							</section>

							<!-- alignment -->
							<section>
								<h1 *ngIf="badgeClass.alignment && badgeClass?.alignment.length>0">Alignment</h1>
								<div class="bordered l-padding-2x l-marginBottom-2x"
								     *ngFor="let alignment of badgeClass.alignment; let i=index">
									<div class="l-childrenhorizontal l-childrenhorizontal-small l-childrenhorizontal-spacebetween">
										<h1>{{alignment.targetName}}</h1>
										<small>{{alignment.targetCode}}</small>
									</div>

									<ng-template [ngIf]="alignment.targetDescription">
										{{ alignment.targetDescription }}
									</ng-template>

									<div *ngIf="alignment.frameworkName">
										<h1>Framework</h1>
										{{ alignment.frameworkName }}
									</div>
									<div class="l-childrenhorizontal l-childrenhorizontal-small l-childrenhorizontal-right">
										<a
											*ngIf="alignment.targetUrl"
											class="button button-primaryghost"
											[href]="alignment.targetUrl"
											target="_blank">View alignment URL</a>
									</div>
								</div>
							</section>

							<!-- URLs -->
							<section>
								<a [href]="v1JsonUrl"
								   class="button button-primaryghost"
								>v1 JSON</a>
								<a [href]="v2JsonUrl"
								   class="button button-primaryghost"
								>v2.0 JSON</a>
								<a [href]="badgeClass.sourceUrl"
								   *ngIf="badgeClass.sourceUrl"
								   class="button button-primaryghost"
								>View Original</a>
							</section>
						</div>
					</div>
				</header>
			</main>
		</ng-template>
	`
})
export class PublicBadgeClassComponent {
	readonly issuerImagePlaceholderUrl = preloadImageURL(require(
		'../../breakdown/static/images/placeholderavatar-issuer.svg'));
	readonly badgeLoadingImageUrl = require('../../breakdown/static/images/badge-loading.svg');
	readonly badgeFailedImageUrl = require('../../breakdown/static/images/badge-failed.svg');

	badgeIdParam: LoadedRouteParam<PublicApiBadgeClassWithIssuer>;
	routerLinkForUrl = routerLinkForUrl;
	loggedIn: boolean = false;
	profile: UserProfile;
	studentsEnrolledButtonDisabled: boolean;
	buttonText: string;
	profileLoaded: Promise<any>;
	provider: object;

	constructor(
		private injector: Injector,
		public embedService: EmbedService,
		private sessionService: SessionService,
		private profileManager: UserProfileManager,
		private queryParams: QueryParametersService,
		protected studentsEnrolledApiService: StudentsEnrolledApiService,
		protected userProfileApiService: UserProfileApiService,
	) {
		this.badgeIdParam = new LoadedRouteParam(
			injector.get(ActivatedRoute),
			"badgeId",
			paramValue => {
				const service: PublicApiService = injector.get(PublicApiService);
				return service.getBadgeClass(paramValue)
			}
		);

		this.studentsEnrolledButtonDisabled = false
		this.buttonText = 'Enroll'
		if (this.sessionService.isLoggedIn){
			this.profileLoaded = profileManager.userProfilePromise
			.then(profile => {
				this.profile = profile
				this.isCurrentUserAlreadyEnrolled()
			})
		}
		if (this.queryParams.queryStringValue("enrollmentStatus", true)){
			let enrollmentStatus = this.queryParams.queryStringValue("enrollmentStatus", true)
			this.handleEnrollmentStatus(enrollmentStatus)
		}
	}

	get badgeClass(): PublicApiBadgeClassWithIssuer { return this.badgeIdParam.value }

	get issuer(): PublicApiIssuer { return this.badgeClass.issuer }

	private get rawJsonUrl() {
		return stripQueryParamsFromUrl(this.badgeClass.id) + ".json";
	}

	get v1JsonUrl() {
		return addQueryParamsToUrl(this.rawJsonUrl, {v: "1_1"});
	}

	get v2JsonUrl() {
		return addQueryParamsToUrl(this.rawJsonUrl, {v: "2_0"});
	}

	isCurrentUserAlreadyEnrolled(){
		this.badgeIdParam.loadedPromise.then(badgeClass => {
			let badgeClassSlug = badgeClass.id.split('/').slice(-1)[0]
			this.userProfileApiService.fetchSocialAccounts()
				.then(response => {
					let eduID = this.getEduID(response)
					this.studentsEnrolledApiService.isStudentEnrolled(badgeClassSlug, eduID)
						.then(r => this.handleEnrollmentStatus(r['_body']))
				})
		})
	}

	getEduID(socialAccounts:object[]) {
		let eduIDSocialAccount = null
		for (let account of socialAccounts) {
			if (account['provider']=='edu_id') {
				return account['uid']
			}
		}
	}

	handleEnrollmentStatus(enrollmentStatus){
		if (enrollmentStatus=='"enrolled"') {
			this.buttonText = 'enrolled'
			this.studentsEnrolledButtonDisabled = true
		}
		if (enrollmentStatus=='"alreadyEnrolled"') {
			this.buttonText = 'Already enrolled'
			this.studentsEnrolledButtonDisabled = true
		}
	}

	enrollStudent(socialAccounts:object[]){
		if (socialAccounts) {
			let eduID = this.getEduID(socialAccounts)
			if (eduID) {
				let badgeClassSlug = this.badgeClass.id.split('/').slice(-1)[0]
				let email = this.profile.apiModel['email']
				let first_name = this.profile.apiModel['first_name']
				let last_name = this.profile.apiModel['last_name']
				this.studentsEnrolledApiService.enrollStudent(eduID, email, first_name, last_name, badgeClassSlug)
					.then(response => this.handleEnrollmentStatus(response._body))
			} else {
				this.userHasNoEduidWarning()
			}
		}
	}

	clickEnrollStudent(){
		this.userProfileApiService.fetchSocialAccounts()
			.then(response => this.enrollStudent(response))
			.catch(e => alert(e))
	}

	userHasNoEduidWarning(){
		alert("Sorry, we couldn't find your eduID. Please log in with EduID and try again")
	}

	ngOnInit() {
		this.loggedIn = this.sessionService.isLoggedIn;
		this.sessionService.loggedin$.subscribe(
			loggedIn => setTimeout(() => this.loggedIn = loggedIn)
		);
		for (let provider of this.sessionService.enabledExternalAuthProviders){
      if (provider.name == 'EduID') {
        this.provider = provider
      }
    }
	}

}
