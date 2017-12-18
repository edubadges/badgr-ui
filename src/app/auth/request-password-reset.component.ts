import { Component } from "@angular/core";
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router, } from "@angular/router";
import { EmailValidator } from "../common/validators/email.validator";
import { SessionService } from "../common/services/session.service";
import { MessageService } from "../common/services/message.service";

import { markControlsDirty } from "../common/util/form-util";
import { BaseRoutableComponent } from "../common/pages/base-routable.component";

@Component({
	selector: 'password-reset-request',
	template: `
		<main>
			<form-message></form-message>
			
			<div class="l-auth">
				<!-- OAuth Banner -->
				<oauth-banner></oauth-banner>
	
				<!-- Title Message -->
				<h3 class="l-auth-x-title title title-bold" id="heading-form">Forgot your password?</h3>
				<p class="l-auth-x-text text text-quiet">Fill in your email, and we'll help you reset your password</p>
	
				<!-- Login Form -->
				<form class="l-form l-form-span " 
				      role="form"
				      aria-labelledby="heading-form"
				      [formGroup]="requestPasswordResetForm" 
				      (ngSubmit)="submitResetRequest()" 
				      novalidate
				>
					<fieldset role="group" aria-labelledby="heading-forgotpassword">
						<legend class="visuallyhidden" id="heading-forgotpassword">Forgot Password</legend>
						<bg-formfield-text [control]="requestPasswordResetForm.controls.username"
						                   [label]="'Email'"
						                   [errorMessage]="'Please enter a valid email address'"
						                   [autofocus]="true"
						                   [initialValue]="prefilledEmail || ''"
						></bg-formfield-text>
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
						        loading-message="Resetting Password"
						>Reset Password
						</button>
					</div>
				</form>
			</div>
		</main>
	`
})
export class RequestPasswordResetComponent extends BaseRoutableComponent {
	readonly authLinkBadgrLogoSrc = require("../../breakdown/static/images/logo.svg");

	requestPasswordResetForm: FormGroup;

	get prefilledEmail() {
		return this.route.snapshot.params["email"];
	}

	constructor(
		private fb: FormBuilder,
		private sessionService: SessionService,
		private messageService: MessageService,
		route: ActivatedRoute,
		router: Router
	) {
		super(router, route);
	}

	ngOnInit() {
		super.ngOnInit();

		if (this.sessionService.isLoggedIn) {
			this.router.navigate([ '/userProfile' ]);
		}

		this.requestPasswordResetForm = this.fb.group({
			'username': [
				'',
				Validators.compose([
					Validators.required,
					EmailValidator.validEmail
				])
			],
		});
	}

	submitResetRequest() {
		var email: string = this.requestPasswordResetForm.value.username;

		this.sessionService.submitResetPasswordRequest(email)
			.then(
				response => this.router.navigate([ '/auth/reset-password-sent' ]),
				err => this.messageService.reportAndThrowError("Failed to send password reset request. Please contact support.", err)
			);
	}


	clickSubmit(ev) {
		var controlName: string;

		if (!this.requestPasswordResetForm.valid) {
			ev.preventDefault();
			markControlsDirty(this.requestPasswordResetForm);
		}
	}
}
