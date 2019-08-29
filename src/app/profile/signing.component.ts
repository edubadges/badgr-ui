import { BgAwaitPromises } from './../common/directives/bg-await-promises';
import { SigningApiService } from './../common/services/signing-api.service';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { Component, OnInit } from "@angular/core";
import { Title } from "@angular/platform-browser";
import { ActivatedRoute, Router } from "@angular/router";
import { SessionService } from "../common/services/session.service";
import { BaseAuthenticatedRoutableComponent } from "../common/pages/base-authenticated-routable.component";
import { markControlsDirty } from "../common/util/form-util";


@Component({
	selector: 'signing',
	template: `
	<main>
		<form-message></form-message>

		<div class="l-containerhorizontal l-containervertical l-childrenvertical wrap">
			
			<form class="l-form l-form-span"
						role="form"
						aria-labelledby="heading-form"
						[formGroup]="passwordForm"
						(ngSubmit)="onSubmit(passwordForm.value)"
						novalidate
			>
				<fieldset role="group" aria-labelledby="heading-badgrsignup2">
					<bg-formfield-text 	*ngIf='symmetricKeyExists'
															[control]="passwordForm.controls.password"
															[label]="'Password (Must be at least 8 characters)'"
															fieldType="password"
															placeholder='You already have a password set, are you sure you need to change this?'
															[errorMessage]="{ required: 'Please enter a password with your ubikey' }"
					></bg-formfield-text>
					<bg-formfield-text *ngIf='!symmetricKeyExists'
															[control]="passwordForm.controls.password"
															[label]="'Password (Must be at least 8 characters)'"
															fieldType="password"
															placeholder='Enter password here'
															[errorMessage]="{ required: 'Please enter a password with your ubikey' }"
					></bg-formfield-text>
				</fieldset>


				<ng-template [bgAwaitPromises]='[symmetricKeyExistsLoaded]'>
					<div class="l-form-x-offset l-childrenhorizontal l-childrenhorizontal-small l-childrenhorizontal-right">
						<a [routerLink]="['/']"
								class="button button-primaryghost"
								[disabled-when-requesting]="true"
						>Cancel</a>
						<button *ngIf='!symmetricKeyExists'
										type="submit"
										class="button"
										[disabled]="!! addPasswordFinished"
										(click)="clickSubmit($event)"
										[loading-promises]="[ addPasswordFinished ]"
										loading-message="Adding"
						>Add Yubikey Password</button>
						<button *ngIf='symmetricKeyExists'
										type="submit"
										class="button"
										[disabled]="!! addPasswordFinished"
										(click)="clickSubmit($event)"
										[loading-promises]="[ addPasswordFinished ]"
										loading-message="Adding"
						>Change Yubikey Password</button>
					</div>

				</ng-template>
			</form>

		</div>

	</main>
	`
})
export class SigningComponent extends BaseAuthenticatedRoutableComponent implements OnInit {

	passwordForm: FormGroup;
	addPasswordFinished: Promise<any>;
	symmetricKeyExistsLoaded: Promise<any>;
	symmetricKeyExists: boolean = false;


	constructor(
		fb: FormBuilder,
		router: Router,
		route: ActivatedRoute,
		sessionService: SessionService,
		protected title: Title,
		private signingApiService: SigningApiService
	) {
		super(router, route, sessionService);
		title.setTitle("Signing - Badgr");

		this.symmetricKeyExistsLoaded = this.signingApiService.getSymmetricKeyExistance()
			.then(answer => {
				this.symmetricKeyExists = answer.length? true : false
			})
			this.passwordForm = fb.group({
				'password': [ '', Validators.compose([ Validators.required, passwordValidator ]) ],
				}, 
			);

	}

	onSubmit(formState) {
		let password = formState.password
		this.addPasswordFinished = this.signingApiService.addPasswordForSigning(password)
	}
	
	
	clickSubmit(ev) {
		if (!this.passwordForm.valid) {
			ev.preventDefault();
			markControlsDirty(this.passwordForm);
		}
	}

}

function passwordValidator(control: FormControl): { [errorName: string]: any } {
	if (control.value.length < 8) {
		return { 'weakPassword': "Password must be at least 8 characters" }
	}
}