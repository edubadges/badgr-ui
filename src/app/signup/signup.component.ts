// import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
// import { Component, OnInit } from "@angular/core";
// import { ActivatedRoute, Router, } from "@angular/router";
// import { SignupModel } from "./signup-model.type";
// import { SignupService } from "./signup.service";
// import { SessionService } from "../common/services/session.service";
// import { BaseRoutableComponent } from "../common/pages/base-routable.component";
// import { MessageService } from "../common/services/message.service";
// import { EmailValidator } from "../common/validators/email.validator";
// import { Title } from "@angular/platform-browser";
// import { markControlsDirty } from "../common/util/form-util";
// import { SystemConfigService } from "../common/services/config.service";
// import { OAuthManager } from "../common/services/oauth-manager.service";

// @Component({
// 	selector: 'sign-up',
// 	template: `
// 		<main>
// 			<form-message></form-message>

// 			<div class="l-auth">
// 				<!-- OAuth Banner -->
// 				<oauth-banner></oauth-banner>
	
// 				<!-- Title Message -->
// 				<h3 class="l-auth-x-title title title-bold" id="heading-form">
// 					Create a {{ currentTheme.serviceName }} Account
// 				</h3>
// 				<p class="l-auth-x-text text text-quiet" *ngIf="! oAuthManager.currentAuthorization">
// 					Already have an account? <a [routerLink]="['/auth/login']">Sign in</a>.
// 				</p>
// 				<p class="l-auth-x-text text text-quiet" *ngIf="oAuthManager.currentAuthorization">
// 					The application <strong>{{ oAuthManager.currentAuthorization.application.name }}</strong> would like to sign 
// 					you in using {{ currentTheme.serviceName }}.
// 					Already have an account? <a [routerLink]="['/login']">Sign in</a>!
// 				</p>
				
// 				<!-- Sign Up Form -->
// 				<form class="l-form l-form-span"
// 				      role="form"
// 				      aria-labelledby="heading-form"
// 				      [formGroup]="signupForm"
// 				      (ngSubmit)="onSubmit(signupForm.value)"
// 				      novalidate
// 				>
// 					<!-- Social Account Buttons -->
// 					<fieldset role="group"
// 					          aria-labelledby="heading-socialsignup"
// 					>
// 						<legend class="visuallyhidden" id="heading-socialsignup">Sign up with third-party social account</legend>
	
// 						<div class="formfield" *ngIf="sessionService.enabledExternalAuthProviders.length > 0">
// 							<p class="formfield-x-label">Sign Up With</p>
// 							<div class="l-authbuttons">
// 								<div *ngFor="let provider of sessionService.enabledExternalAuthProviders">
// 									<button type="button"
// 									        class="buttonauth buttonauth-{{ provider.slug }}"
// 									        (click)="sessionService.initiateUnauthenticatedExternalAuth(provider)"
// 									>{{ provider.name }}</button>
// 								</div>
// 							</div>
// 						</div>
// 					</fieldset>
// 				</form>
// 			</div>
// 		</main>
// 	`,
// })
// export class SignupComponent extends BaseRoutableComponent implements OnInit {
// 	signupForm: FormGroup;
// 	passwordGroup: FormGroup;

// 	signupFinished: Promise<any>;

// 	agreedTermsService: boolean = false;

// 	get currentTheme() { return this.configService.currentTheme }

// 	constructor(
// 		fb: FormBuilder,
// 		private title: Title,
// 		public messageService: MessageService,
// 		private configService: SystemConfigService,
// 		public sessionService: SessionService,
// 		public signupService: SignupService,
// 		public oAuthManager: OAuthManager,
// 		router: Router,
// 		route: ActivatedRoute
// 	) {
// 		super(router, route);
// 		let serviceName: string;
// 		serviceName = this.configService.currentTheme.serviceName;
// 		title.setTitle("Login - " + serviceName);

// 		this.passwordGroup = fb.group({
// 				'password': [ '', Validators.compose([ Validators.required, passwordValidator ]) ],
// 				'passwordConfirm': [ '', Validators.required ],
// 			}, { validator: passwordsMatchValidator }
// 		);
// 		this.signupForm = fb.group({
// 				'username': [
// 					'',
// 					Validators.compose([
// 						Validators.required,
// 						EmailValidator.validEmail
// 					])
// 				],
// 				'firstName': [ '', Validators.required ],
// 				'lastName': [ '', Validators.required ],
// 				'passwords': this.passwordGroup,
// 				'agreedTermsService': [false, Validators.requiredTrue],
// 				'marketingOptIn': [false],
// 			}
// 		);
// 	}

// 	ngOnInit() {
// 		if (this.sessionService.isLoggedIn) {
// 			this.router.navigate([ '/userProfile' ]);
// 		}
// 	}

// 	onSubmit(formState) {
// 		let signupUser = new SignupModel(
// 			formState.username,
// 			formState.firstName,
// 			formState.lastName,
// 			formState.passwords.password,
// 			formState.agreedTermsService,
// 			formState.marketingOptIn
// 		);

// 		this.signupFinished = new Promise((resolve, reject) => {

//             this.signupService.submitSignup(signupUser)
//                 .subscribe(
//                     response => {
// 						this.sendSignupConfirmation(formState.username);
// 						resolve();
// 					},
//                     error => {
//                         if (error) {
//                           if (error.password) {
//                             this.messageService.setMessage("Your password must be uncommon and at least 8 characters. Please try again.", "error");
//                           } else {
//                             this.messageService.setMessage("" + error, "error");
//                           }
//                         }
//                         else {
//                             this.messageService.setMessage("Unable to signup.", "error");
//                         }
// 						resolve();
// 					}
// 				);
// 		}).then(() => this.signupFinished = null);
// 	}

// 	sendSignupConfirmation(email) {
// 		this.router.navigate([ 'signup/success', { email: email } ]);
// 	}

// 	clickSubmit(ev) {
// 		var controlName: string;

// 		if (!this.signupForm.valid) {
// 			ev.preventDefault();
// 			markControlsDirty(this.signupForm);
// 			markControlsDirty(this.passwordGroup);
// 		}
// 	}

// 	get showMarketingOptIn() {
// 		return !!!this.currentTheme.hideMarketingOptIn;
// 	}
// }

// function passwordValidator(control: FormControl): { [errorName: string]: any } {
// 	if (control.value.length < 8) {
// 		return { 'weakPassword': "Password must be at least 8 characters" }
// 	}
// }
// function passwordsMatchValidator(group: FormGroup): { [errorName: string]: any } {
// 	if (group.controls[ 'password' ].value !== group.controls[ 'passwordConfirm' ].value) {
// 		return { passwordsMatch: "Passwords do not match" }
// 	}
// }
