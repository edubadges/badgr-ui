import { SigningApiService } from './../common/services/signing-api.service';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { Component, OnInit } from "@angular/core";
import { Title } from "@angular/platform-browser";
import { ActivatedRoute, Router } from "@angular/router";
import { SessionService } from "../common/services/session.service";
import { BaseAuthenticatedRoutableComponent } from "../common/pages/base-authenticated-routable.component";
import { markControlsDirty } from "../common/util/form-util";
import { MessageService } from '../common/services/message.service';


@Component({
	selector: 'signing',
	template: `
	<main>
		<form-message></form-message>

		<div class="l-containerhorizontal l-containervertical l-childrenvertical wrap">
			<ng-template [bgAwaitPromises]='[symmetricKeyExistsLoaded]'>

				<form *ngIf='symmetricKeyExists' 
							class="l-form l-form-span"
							role="form"
							aria-labelledby="heading-form"
							[formGroup]="updatePasswordForm"
							(ngSubmit)="onSubmit(updatePasswordForm.value)"
							novalidate
				> 
					<fieldset role="group" aria-labelledby="heading-badgrsignup2">
						<bg-formfield-text 
								[control]="updatePasswordForm.controls.old_password"
								[label]="'Old password'"
								fieldType="password"
								placeholder='Please type in your old password'
								[errorMessage]="{ required: 'Please enter a password' }"
						></bg-formfield-text>
						<bg-formfield-text 
								[control]="updatePasswordForm.controls.password"
								[label]="'New password (Must be at least 8 characters)'"
								fieldType="password"
								placeholder='Please type in your new password'
								[errorMessage]="{ required: 'Please enter a password' }"
						></bg-formfield-text>
					</fieldset>
					<a [routerLink]="['/']"
						class="button button-primaryghost"
						[disabled-when-requesting]="true"
						>Cancel
					</a>
					<button
						type="submit"
						class="button"
						[disabled]="!! addPasswordFinished"
						(click)="clickSubmit($event)"
						[loading-promises]="[ addPasswordFinished ]"
						loading-message="Adding"
						>Change Password
					</button>
				</form>

				<form *ngIf='!symmetricKeyExists' 
							class="l-form l-form-span"
							role="form"
							aria-labelledby="heading-form"
							[formGroup]="passwordForm"
							(ngSubmit)="onSubmit(passwordForm.value)"
							novalidate
				>
					<fieldset role="group" aria-labelledby="heading-badgrsignup2">
						<bg-formfield-text 
																[control]="passwordForm.controls.password"
																[label]="'Password (Must be at least 8 characters)'"
																fieldType="password"
																placeholder='Enter password here'
																[errorMessage]="{ required: 'Please enter a password' }"
						></bg-formfield-text>
					</fieldset>
					<div class="l-form-x-offset l-childrenhorizontal l-childrenhorizontal-small l-childrenhorizontal-right">
						<a [routerLink]="['/']"
								class="button button-primaryghost"
								[disabled-when-requesting]="true"
						>Cancel</a>
						<button type="submit"
										class="button"
										[disabled]="!! addPasswordFinished"
										(click)="clickSubmit($event)"
										[loading-promises]="[ addPasswordFinished ]"
										loading-message="Adding"
						>Add Password</button>
					</div>
				</form>
			</ng-template>
		</div>

	</main>
	`
})
export class SigningComponent extends BaseAuthenticatedRoutableComponent implements OnInit {

	passwordForm: FormGroup;
	updatePasswordForm: FormGroup;
	addPasswordFinished: Promise<any>;
	symmetricKeyExistsLoaded: Promise<any>;
	symmetricKeyExists: boolean = false;


	constructor(
		fb: FormBuilder,
		router: Router,
		route: ActivatedRoute,
		sessionService: SessionService,
		protected title: Title,
    protected messageService: MessageService,
		private signingApiService: SigningApiService
	) {
		super(router, route, sessionService);
		title.setTitle("Signing - Badgr");

		this.symmetricKeyExistsLoaded = this.signingApiService.getSymmetricKeyExistance()
			.then(answer => {
				this.symmetricKeyExists = answer['exists']? answer['exists']: false 
			})
			this.passwordForm = fb.group({
				'password': [ '', Validators.compose([ Validators.required, passwordValidator ]) ],
				}, 
			);
			this.updatePasswordForm = fb.group({
				'password': [ '', Validators.compose([ Validators.required, passwordValidator ]) ],
				'old_password': [ '', Validators.compose([ Validators.required, passwordValidator ]) ],
				}, 
			);

	}

	onSubmit(formState) {
		if (this.symmetricKeyExists == false){
			let password = formState.password
			this.addPasswordFinished = this.signingApiService.addPasswordForSigning(password)
				.then(r => {
					this.symmetricKeyExists = true
					this.messageService.reportMajorSuccess(
						'Password succesfully added', true
					);
				})
				.catch(error => {
					this.messageService.reportHandledError(
						'Password addition failure', error
					);
				})
		} else if (this.symmetricKeyExists == true) {
			let password = formState.password
			let old_password = formState.old_password
			this.addPasswordFinished = this.signingApiService.updatePasswordForSigning(password, old_password)
				.then(r => {
					this.messageService.reportMajorSuccess(
						'Password succesfully updated', true
					);
				})
				.catch(error => {
					this.messageService.reportHandledError(
						'Password update failure:' + error.response._body
					);
				})
		}
	}
	
	
	clickSubmit(ev) {
		if (this.symmetricKeyExists){
			if (!this.updatePasswordForm.valid) {
				ev.preventDefault();
				markControlsDirty(this.updatePasswordForm);
			}
		} else if (!this.symmetricKeyExists){ 
			if (!this.passwordForm.valid) {
				ev.preventDefault();
				markControlsDirty(this.passwordForm);
			}
		}

	}

}

function passwordValidator(control: FormControl): { [errorName: string]: any } {
	if (control.value.length < 8) {
		return { 'weakPassword': "Password must be at least 8 characters" }
	}
}