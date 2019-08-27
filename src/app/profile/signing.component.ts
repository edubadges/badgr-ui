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
			</form>
			<fieldset role="group" aria-labelledby="heading-badgrsignup2">
				<bg-formfield-text [control]="passwordForm.controls.password"
																	[label]="'Password (Must be at least 8 characters)'"
																	fieldType="password"
																	[errorMessage]="{ required: 'Please enter a password with your ubikey' }"
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
				>Add Yubikey Password</button>
			</div>
		</div>

	</main>
	`
})
export class SigningComponent extends BaseAuthenticatedRoutableComponent implements OnInit {

	passwordForm: FormGroup;
	addPasswordFinished: Promise<any>;


	constructor(
		fb: FormBuilder,
		router: Router,
		route: ActivatedRoute,
		sessionService: SessionService,
		protected title: Title
	) {
		super(router, route, sessionService);
		title.setTitle("Signing - Badgr");

		this.passwordForm = fb.group({
			'password': [ '', Validators.compose([ Validators.required, passwordValidator ]) ],
			}, 
		);
	}

	onSubmit(formState) {
		console.log('submit')
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