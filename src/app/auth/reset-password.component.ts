import { Component } from "@angular/core";

import { FormBuilder, FormGroup, Validators } from "@angular/forms";
import { ActivatedRoute, Router } from "@angular/router";
import { SessionService } from "../common/services/session.service";
import { MessageService } from "../common/services/message.service";
import { Title } from "@angular/platform-browser";
import { markControlsDirty } from "../common/util/form-util";
import { BaseRoutableComponent } from "../common/pages/base-routable.component";

@Component({
	selector: 'change-password',
	template: `
		<main>
			<form-message></form-message>
			
			<div class="l-auth">
				<!-- OAuth Banner -->
				<oauth-banner></oauth-banner>
	
				<!-- Title Message -->
				<h3 class="l-auth-x-title title title-bold" id="heading-form">Enter a new password</h3>
				<p class="l-auth-x-text text text-quiet">Enter in your new password.</p>
	
				<!-- Reset Password Form -->
				<form class="l-form"
				      aria-labelledby="heading-form"
				      [formGroup]='changePasswordForm'
				      (ngSubmit)="submitChange()"
				      novalidate
				>
					<fieldset role="group" aria-labelledby="heading-forgotpassword">
						<legend class="visuallyhidden" id="heading-forgotpassword">Enter a new password</legend>
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
						                   [errorMessage]="{ required: 'Please confirm your new password' }"
						                   [errorGroup]="changePasswordForm">
						</bg-formfield-text>
					</fieldset>
	
					<div class="l-form-x-offset l-childrenhorizontal l-childrenhorizontal-right">
						<a class="button button-secondary"
						   [routerLink]="['/auth/login']"
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
export class ResetPasswordComponent extends BaseRoutableComponent {
	changePasswordForm: FormGroup;

	get resetToken(): string {
		return this.route.snapshot.params['token'];
	}

	constructor(
		private fb: FormBuilder,
		private title: Title,
		private sessionService: SessionService,
		route: ActivatedRoute,
		router: Router,
		private _messageService: MessageService
	) {
		super(router, route);

		title.setTitle("Reset Password - Badgr");

		if (! this.resetToken) {
			this._messageService.reportHandledError("No reset token provided. Please try the reset link again.");
		}
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
		const token: string = this.resetToken;
		const new_password: string = this.changePasswordForm.controls[ 'password1' ].value;

		if (token) {
			this.sessionService.submitForgotPasswordChange(new_password, token)
				.then(
					() => {
						// TODO: We should get the user's name and auth so we can send them to the auth page pre-populated
						this._messageService.reportMajorSuccess('Your password has been changed successfully.', true);
						return this.router.navigate([ "/auth" ]);
					},
					err => this._messageService.reportAndThrowError('Unable to change password.', err)
				);
		}
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
}


