import { Component, OnDestroy, OnInit } from "@angular/core";
import { FormBuilder, FormControl, FormGroup, Validators } from "@angular/forms";
import { ActivatedRoute, Router } from "@angular/router";

import { EmailValidator } from "../common/validators/email.validator";
import { MessageService } from "../common/services/message.service";
import { SessionService } from "../common/services/session.service";
import { Title } from "@angular/platform-browser";
import { markControlsDirty } from "../common/util/form-util";

import { CommonDialogsService } from "../common/services/common-dialogs.service";
import { BaseAuthenticatedRoutableComponent } from "../common/pages/base-authenticated-routable.component";
import { BadgrApiFailure } from "../common/services/api-failure";
import {
	SocialAccountProviderInfo, ApiUserProfile, ApiUserProfileEmail,
	ApiUserProfileSocialAccount,
	socialAccountProviderInfoForSlug,
} from "../common/model/user-profile-api.model";
import { UserProfileManager } from "../common/services/user-profile-manager.service";
import { UserProfile, UserProfileEmail } from "../common/model/user-profile.model";
import { Subscription } from "rxjs/Subscription";
import { QueryParametersService } from "../common/services/query-parameters.service";

@Component({
	selector: 'userProfile',
	template: `
		<main *bgAwaitPromises="[profileLoaded, emailsLoaded]">
			<form-message></form-message>

			<header class="wrap wrap-light l-containerhorizontal l-heading">
				<nav>
					<h1 class="visuallyhidden">Breadcrumbs</h1>
					<ul class="breadcrumb">
						<li class="breadcrumb-x-current">Profile</li>
					</ul>
				</nav>

				<div class="heading">
					<div class="heading-x-text">
						<h1>
							{{ profile?.firstName }} {{ profile?.lastName}}
						</h1>
						
						<div class="table-x-tr" *ngFor="let email of emails">
							<div class="table-x-th" scope="row" [ngSwitch]="email.verified">
								<div class="l-childrenhorizontal">
									<span>{{ email.email }}</span>
								</div>
							</div>
						</div>						
					</div>
				</div>
			</header>
		</main>
	`
})
export class ProfileComponent extends BaseAuthenticatedRoutableComponent implements OnInit, OnDestroy {
	profile: UserProfile;
	emails: UserProfileEmail[];

	profileLoaded: Promise<any>;
	emailsLoaded: Promise<any>;

	private emailsSubscription: Subscription;

	constructor(
		router: Router,
		route: ActivatedRoute,
		sessionService: SessionService,
		protected title: Title,
		protected messageService: MessageService,
		protected profileManager: UserProfileManager,
		protected dialogService: CommonDialogsService,
		protected paramService: QueryParametersService
) {
		super(router, route, sessionService);
		title.setTitle("Profile - Badgr");

		this.profileLoaded = this.profileManager.userProfilePromise.then(
			profile => {
				this.profile = profile;

				this.emailsSubscription = profile.emails.loaded$.subscribe(update => {
					const emails = profile.emails.entities;

					this.emails = emails.filter((e) => e.primary).concat(
						emails.filter((e) => e.verified && !e.primary).concat(
							emails.filter((e) => !e.verified)
						)
					);
				});
			},
			error => this.messageService.reportAndThrowError(
				"Failed to load userProfile", error
			)
		);

		this.emailsLoaded = this.profileManager.userProfilePromise
			.then(p => p.emails.loadedPromise);
	}


	ngOnInit() {
		super.ngOnInit();

		// Handle auth errors (e.g. when linking a new social account)
		if (this.paramService.queryStringValue("authError", true)) {
			this.messageService.reportHandledError(this.paramService.queryStringValue("authError", true), null, true);
		}
		this.paramService.clearInitialQueryParams();
	}

	ngOnDestroy(): void {
		this.emailsSubscription.unsubscribe();
	}
}
