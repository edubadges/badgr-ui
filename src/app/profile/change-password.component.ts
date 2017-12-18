import { Component } from "@angular/core";

import { FormBuilder, FormGroup, Validators } from "@angular/forms";
import { ActivatedRoute, Router } from "@angular/router";
import { SessionService } from "../common/services/session.service";
import { MessageService } from "../common/services/message.service";
import { Title } from "@angular/platform-browser";
import { markControlsDirty } from "../common/util/form-util";
import { BaseRoutableComponent } from "../common/pages/base-routable.component";
import { UserProfileManager } from "../common/services/user-profile-manager.service";
import { UserProfile } from "../common/model/user-profile.model";


@Component({
	selector: 'change-password',
	template: `
		<main>
			<form-message></form-message>
			<header class="wrap wrap-light l-containerhorizontal l-heading">

				<nav>
					<h1 class="visuallyhidden">Breadcrumbs</h1>
					<ul class="breadcrumb">
						<li>
							<a [routerLink]="['/profile/profile']">Profile</a>
						</li>
						<li class="breadcrumb-x-current">Change Password</li>
					</ul>
				</nav>
		
				<div class="heading">
					<div class="heading-x-text">
						<h1>Enter a new password</h1>
						<p>Enter in your new password.</p>
					</div>
				</div>
		
			</header>
		
			<div class="l-containerhorizontal l-containervertical l-childrenvertical wrap">
		
				<form class="l-form" [formGroup]='changePasswordForm' (ngSubmit)="submitChange()" novalidate>
		
					<fieldset>
						<bg-formfield-text [control]="changePasswordForm.controls.password1"
						                   [label]="'New Password'"
						                   [errorMessage]="'Please enter a new password'"
						                   [password]="true"
						                   [autofocus]="true">              
							<span label-additions>(MUST BE AT LEAST 6 CHARACTERS)</span>
						</bg-formfield-text>
		
						<bg-formfield-text [control]="changePasswordForm.controls.password2"
						                   [label]="'Confirm New Password'"
						                   [password]="true"
						                   [errorMessage]="{ required: 'Please confim your new password' }"
						                   [errorGroup]="changePasswordForm">
						</bg-formfield-text>
					</fieldset>
		
					<div class="l-form-x-offset l-childrenhorizontal l-childrenhorizontal-right">
						<a class="button button-secondary"
						   (click)="cancel()"
						   [disabled-when-requesting]="true"
						>Cancel</a>
		
						<button class="button"
						        type="submit"
						        (click)="clickSubmit($event)"
						        [loading-when-requesting]="true"
						        loading-message="Changing Password"
						>Change Password</button>
					</div>
				</form>
			</div>
		</main>

	`
})
export class ChangePasswordComponent extends BaseRoutableComponent {
	changePasswordForm: FormGroup;
	profile: UserProfile;

	constructor(
		private fb: FormBuilder,
		private title: Title,
		private sessionService: SessionService,
		private profileManager: UserProfileManager,
		route: ActivatedRoute,
		router: Router,
		private _messageService: MessageService
	) {
		super(router, route);

		title.setTitle("Change Password - Badgr");

		this.profileManager.userProfilePromise
			.then(profile => this.profile = profile);
	}

	ngOnInit() {
		super.ngOnInit();

		this.changePasswordForm = this.fb.group({
				password1: [ '', Validators.required ],
				password2: [ '', Validators.required ]
			}, { validator: this.passwordsMatch }
		);
	}

	submitChange() {
		const new_password: string = this.changePasswordForm.controls[ 'password1' ].value;

		this.profile.updatePassword(new_password)
			.then(
				() => {
					this._messageService.reportMajorSuccess('Your password has been changed successfully.', true);
					this.router.navigate([ "/profile/profile" ]);
				},
				err => this._messageService.reportAndThrowError('Unable to change password.', err)
			);
	}

	clickSubmit(ev: Event) {
		if (!this.changePasswordForm.valid) {
			ev.preventDefault();
			markControlsDirty(this.changePasswordForm);
		}
	}

	passwordsMatch(group: FormGroup) {
		let valid = true;
		let val: string;

		for (let name in group.controls) {
			if (val === undefined) {
				val = group.controls[ name ].value
			} else {
				if (val !== group.controls[ name ].value) {
					valid = false;
					break;
				}
			}
		}

		if (valid) {
			return null;
		}

		return { passwordsMatch: "Passwords do not match" };
	}

	cancel() {
		this.router.navigate(["/profile/profile"]);
	}
}


