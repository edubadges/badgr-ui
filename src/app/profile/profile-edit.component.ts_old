import { Component, OnInit } from "@angular/core";
import { FormBuilder, FormControl, FormGroup, Validators } from "@angular/forms";
import { ActivatedRoute, Router } from "@angular/router";
import { MessageService } from "../common/services/message.service";
import { SessionService } from "../common/services/session.service";
import { Title } from "@angular/platform-browser";
import { markControlsDirty } from "../common/util/form-util";

import { CommonDialogsService } from "../common/services/common-dialogs.service";
import { BaseAuthenticatedRoutableComponent } from "../common/pages/base-authenticated-routable.component";
import { ApiUserProfile } from "../common/model/user-profile-api.model";
import { UserProfileManager } from "../common/services/user-profile-manager.service";
import { UserProfile } from "../common/model/user-profile.model";

@Component({
	template: `
		<main *bgAwaitPromises="[profileLoaded]">
			<form-message></form-message>
			
			<header class="wrap wrap-light l-containerhorizontal l-heading">
				<nav>
					<h1 class="visuallyhidden">Breadcrumbs</h1>
					<ul class="breadcrumb">
						<li>
							<a [routerLink]="['/profile/profile']">Profile</a>
						</li>
						<li class="breadcrumb-x-current">Edit Profile Name</li>
					</ul>
				</nav>
				
				<div class="heading">
					<div class="heading-x-text">
						<h1>
							Edit Profile Name
						</h1>
						<p>
							Edit a new name for your profile.
						</p>
					</div>
				</div>
			</header>

			<div class="l-containerhorizontal l-containervertical l-childrenvertical l-headeredsection wrap">
				<form [formGroup]="profileEditForm"
				      (ngSubmit)="submitEdit(profileEditForm.getRawValue())"
				      class="l-form"
				      novalidate
				>
					<fieldset>
						<bg-formfield-text [control]="profileEditForm.controls.firstName"
						                   [label]="'First Name'"
						                   [errorMessage]="'Please enter your first name'"
						></bg-formfield-text>

						<bg-formfield-text [control]="profileEditForm.controls.lastName"
						                   [label]="'Last Name'"
						                   [errorMessage]="'Please enter your last name'"
						></bg-formfield-text>
					</fieldset>

					<div class="l-childrenhorizontal l-childrenhorizontal-small l-childrenhorizontal-right">
						<a class="button button-primaryghost"
						   [routerLink]="['profile']"
						   [disabled-when-requesting]="true"
						>Cancel</a>
						<button type="submit"
						        class="button"
						        (click)="validateEditForm($event)"
						        [disabled-when-requesting]="true"
						>Save</button>
					</div>
				</form>
			</div>
		</main>
	`
})
export class ProfileEditComponent extends BaseAuthenticatedRoutableComponent implements OnInit {
	profile: UserProfile;

	profileLoaded: Promise<any>;

	constructor(
		router: Router,
		route: ActivatedRoute,
		sessionService: SessionService,
		protected formBuilder: FormBuilder,
		protected title: Title,
		protected messageService: MessageService,
		protected profileManager: UserProfileManager,
		protected dialogService: CommonDialogsService
) {
		super(router, route, sessionService);
		title.setTitle("Profile - Edit - Badgr");

		this.profileLoaded = profileManager.userProfilePromise.then(
			profile => this.profile = profile,
			error => this.messageService.reportAndThrowError(
				"Failed to load userProfile", error
			)
		);

		this.profileEditForm = this.formBuilder.group({
			firstName: [ '', Validators.required ],
			lastName: [ '', Validators.required ],
		} as ProfileEditFormControls<any[]>);

		this.profileLoaded.then(() => this.startEditing());
	}
	profileEditForm: FormGroup;

	get editControls(): ProfileEditFormControls<FormControl> {
		return this.profileEditForm.controls as any;
	}

	startEditing() {
		this.editControls.firstName.setValue(this.profile.firstName, { emitEvent: false });
		this.editControls.lastName.setValue(this.profile.lastName, { emitEvent: false });
	}

	submitEdit(formState: ProfileEditFormControls<string>) {
		this.profile.firstName = formState.firstName;
		this.profile.lastName = formState.lastName;

		this.profile.save().then(
			success => {
				this.messageService.reportMinorSuccess(`Saved profile changes`);
				this.router.navigate(['/profile/profile']);
			},
			error => {
				this.messageService.reportHandledError(`Failed save profile changes`, error);
			}
		);
	}

	validateEditForm(ev) {
		if (! this.profileEditForm.valid) {
			ev.preventDefault();
			markControlsDirty(this.profileEditForm);
		}
	}
}


interface ProfileEditFormControls<T> {
	firstName: T;
	lastName: T;
}
