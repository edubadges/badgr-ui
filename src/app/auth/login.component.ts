import { AfterViewInit, Component, OnInit, ViewChild } from "@angular/core";

import { FormBuilder, FormGroup, Validators } from "@angular/forms";
import { ActivatedRoute, Router } from "@angular/router";
import { EmailValidator } from "../common/validators/email.validator";
import { UserCredential } from "../common/model/user-credential.type";
import { SessionService } from "../common/services/session.service";
import { MessageService } from "../common/services/message.service";
import { BaseRoutableComponent } from "../common/pages/base-routable.component";
import { Title } from "@angular/platform-browser";


import { markControlsDirty } from "../common/util/form-util";
import { SystemConfigService } from "../common/services/config.service";
import { FormFieldText } from "../common/components/formfield-text";
import { QueryParametersService } from "../common/services/query-parameters.service";
import { OAuthManager } from "../common/services/oauth-manager.service";


@Component({
	selector: 'login',
	template: `
		<main *bgAwaitPromises="[ initFinished ]">
			<form-message></form-message>
			
			<div  class="l-auth">
				<!-- Non-OAuth Welcome Message -->
				<ng-template [ngIf]="! oAuthManager.currentAuthorization">
					<ng-template [ngIf]="! verifiedName">
						<h3 class="l-auth-x-title title title-bold" id="heading-form">{{ currentTheme.welcomeMessage }}</h3>
						<p class="l-auth-x-text text text-quiet" *ngIf="sessionService.enabledExternalAuthProviders.length">
							Choose your sign in method to get started.
						</p>
						<p class="l-auth-x-text text text-quiet" *ngIf="! sessionService.enabledExternalAuthProviders.length">
							Sign in with your email and password.
							Don't have an account yet? <a [routerLink]="['/signup']">Create an account</a>!
						</p>
					</ng-template>
					<ng-template [ngIf]="verifiedName">
						<h3 class="l-auth-x-title title title-bold" id="heading-form">
							{{ verifiedName | ucfirst }}, {{ currentTheme.welcomeMessage }}
						</h3>
						<p class="l-auth-x-text text text-quiet">
							Your email address, {{ verifiedEmail }}, has been verified. Enter your password below to get started.
						</p>
					</ng-template>
				</ng-template>
	
				<!-- OAuth Welcome Message -->
				<ng-template [ngIf]="oAuthManager.currentAuthorization">
					<oauth-banner></oauth-banner>
	
					<ng-template [ngIf]="! verifiedName">
						<h3 class="l-auth-x-title title title-bold" id="heading-form">
							Sign in to your {{ currentTheme.serviceName }} Account
						</h3>
						<p class="l-auth-x-text text text-quiet">
							The application <strong>{{ oAuthManager.currentAuthorization.application.name }}</strong> would like to 
							sign you in using your {{ currentTheme.serviceName }} account.
							Not using {{ currentTheme.serviceName }}? <a [routerLink]="['/signup']">Create an account</a>!
						</p>
					</ng-template>
					<ng-template [ngIf]="verifiedName">
						<h3 class="l-auth-x-title title title-bold" id="heading-form">
							{{ verifiedName | ucfirst }}, welcome to {{ currentTheme.serviceName }}!
						</h3>
						<p class="l-auth-x-text text text-quiet">
							The application  <strong>{{ oAuthManager.currentAuthorization.application.name }}</strong> would like to 
							sign you in using your {{ currentTheme.serviceName }} account. Your email address, {{ verifiedEmail }}, has been verified. Enter your
							password below to continue.
						</p>
					</ng-template>
				</ng-template>
	
				<form class="l-form l-form-span"
				      role="form"
				      aria-labelledby="heading-form"
				      (ngSubmit)="submitAuth()"
				      novalidate
				>
					<!-- Social Account Buttons -->
					<fieldset role="group"
					          aria-labelledby="heading-socialsignin"
					          *ngIf="! verifiedName && sessionService.enabledExternalAuthProviders.length > 0"
					>
						<legend class="visuallyhidden" id="heading-socialsignin">Sign in with third-party social account</legend>
	
						<div class="formfield">
							<p class="formfield-x-label">Sign In With</p>
							<div class="l-authbuttons">
								<div *ngFor="let provider of sessionService.enabledExternalAuthProviders">
									<button type="button"
									        class="buttonauth buttonauth-{{ provider.slug }}"
									        (click)="sessionService.initiateUnauthenticatedExternalAuth(provider)"
									>{{ provider.name }}
									</button>
								</div>
							</div>
						</div>
					</fieldset>
	
					<div class="formdivider" *ngIf="! verifiedName && sessionService.enabledExternalAuthProviders.length > 0">
						<span>Or sign in with your email</span>
					</div>
	
					<!-- Login Email/Password Fields -->
					<fieldset role="group" aria-labelledby="heading-badgrsignin">
						<legend class="visuallyhidden" id="heading-badgrsignin">Sign In with username and password</legend>

						<bg-formfield-text [control]="loginForm.controls.username"
										   label="Email"
										   fieldType="email"
						                   [errorMessage]="'Please enter a valid email address'"
						                   [autofocus]="true"
						                   [initialValue]="verifiedEmail || ''"
						                   #usernameField
						></bg-formfield-text>
	
						<bg-formfield-text [control]="loginForm.controls.password"
						                   label="Password"
						                   [errorMessage]="'Please enter your password'"
						                   fieldType="password"
						                   #passwordField
						>
							<span label-additions>
								<a tabindex="-1"
								   [routerLink]="['/auth/request-password-reset', usernameField.value]">Forgot Password?</a>
							</span>
						</bg-formfield-text>
					</fieldset>
	
					<div class="l-form-x-offset l-childrenhorizontal l-childrenhorizontal-spacebetween">
						<label class="formcheckbox" for="remember-me">
							<input name="remember-me" id="remember-me" type="checkbox" [formControl]="loginForm.controls.rememberMe">
							<span class="formcheckbox-x-text">Remember me</span>
						</label>
	
						<div class="l-childrenhorizontal">
							<button class="button button-secondary"
							        type="button"
							        (click)="oAuthManager.cancelCurrentAuthorization()"
							        *ngIf="oAuthManager.currentAuthorization"
							>Cancel
							</button>
	
							<button class="button"
							        type="submit"
							        [disabled]="!! loginFinished"
							        [loading-promises]="[ loginFinished ]"
							        loading-message="Signing In"
							        (click)="clickSubmit($event)"
							>Sign In
							</button>
						</div>
					</div>
				</form>
			</div>
		</main>
	`
})
export class LoginComponent extends BaseRoutableComponent implements OnInit, AfterViewInit {
	loginForm: FormGroup;
	verifiedName: string;
	verifiedEmail: string;

	@ViewChild("passwordField")
	passwordField: FormFieldText;

	initFinished: Promise<any> = new Promise(() => {});
	loginFinished: Promise<any>;

	get currentTheme() { return this.configService.currentTheme }

	constructor(
		private fb: FormBuilder,
		private title: Title,
		private sessionService: SessionService,
		private messageService: MessageService,
		private configService: SystemConfigService,
		private queryParams: QueryParametersService,
		public oAuthManager: OAuthManager,
		router: Router,
		route: ActivatedRoute
	) {
		super(router, route);
		let serviceName: string;
		serviceName = this.configService.currentTheme.serviceName;
		title.setTitle("Login - " + serviceName);
		this.handleQueryParamCases();
	}

	ngOnInit() {
		super.ngOnInit();

		let email: string;

		this.initVerifiedData();

		email = this.verifiedEmail || '';

		this.loginForm = this.fb.group({
			'username': [
				email,
				Validators.compose([
					Validators.required,
					EmailValidator.validEmail
				])
			],
			'password': [ '', Validators.required ],
			'rememberMe': 'false',
		});
	}

	private handleQueryParamCases() {
		try {
			// Handle external auth case
			if (this.queryParams.queryStringValue("authToken", true)) {
				this.sessionService.storeToken({
					token: this.queryParams.queryStringValue("authToken", true)
				});

				this.initFinished = this.router.navigate([ 'recipient' ]);
				return;
			}

			// Handle external auth failure case
			else if (this.queryParams.queryStringValue("authError", true)) {
				this.sessionService.logout();
				this.messageService.reportHandledError(this.queryParams.queryStringValue("authError", true), null, true);
			}

			// Handle already logged-in case
			else if (this.sessionService.isLoggedIn) {
				this.initFinished = this.router.navigate([ 'recipient' ]);
				return;
			}

			this.initFinished = Promise.resolve(true);
		} finally {
			this.queryParams.clearInitialQueryParams();
		}
	}

	ngAfterViewInit(): void {
		if (this.verifiedEmail) {
			setTimeout(() => this.passwordField.focus());
		}
	}

	private initVerifiedData() {
		this.verifiedName = this.queryParams.queryStringValue('name');
		this.verifiedEmail = this.queryParams.queryStringValue('email');
	}

	submitAuth() {
		let credential: UserCredential = new UserCredential(
			this.loginForm.value.username, this.loginForm.value.password);

		this.loginFinished = this.sessionService.login(credential)
			.then(
				() => {
					if (this.oAuthManager.isAuthorizationInProgress) {
						this.router.navigate([ '/auth/oauth2/authorize' ]);
					} else {
						this.router.navigate([ 'recipient' ]);
					}
				},
				error => this.messageService.reportHandledError(
					"Login failed. Please check your email and password and try again.",
					error
				)
			)
			.then(() => this.loginFinished = null);
	}

	clickSubmit(ev) {
		if (!this.loginForm.valid) {
			ev.preventDefault();
			markControlsDirty(this.loginForm);
		}
	}
}
