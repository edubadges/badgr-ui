import { Component, forwardRef, Inject, OnInit } from "@angular/core";
import { FormBuilder, FormControl, FormGroup, Validators } from "@angular/forms";
import { ActivatedRoute, Router } from "@angular/router";
import { MessageService } from "../common/services/message.service";
import { IssuerManager } from "./services/issuer-manager.service";
import { BaseAuthenticatedRoutableComponent } from "../common/pages/base-authenticated-routable.component";
import { UrlValidator } from "../common/validators/url.validator";
import { Title } from "@angular/platform-browser";
import { ApiIssuerForCreation } from "./models/issuer-api.model";
import { markControlsDirty } from "../common/util/form-util";
import { SessionService } from "../common/services/session.service";
import { preloadImageURL } from "../common/util/file-util";
import { UserProfileManager } from "../common/services/user-profile-manager.service";
import { UserProfileEmail } from "../common/model/user-profile.model";
import { FormFieldSelectOption } from "../common/components/formfield-select";
import {SystemConfigService} from "../common/services/config.service";

@Component({
	selector: 'issuer-create',
	template: `
		<main>
		  <form-message></form-message>
		  <header class="wrap wrap-light l-containerhorizontal l-heading">
		
		    <nav>
		      <h1 class="visuallyhidden">Breadcrumbs</h1>
		      <ul class="breadcrumb">
		        <li><a [routerLink]="['/issuer']">Issuers</a></li>
		        <li class="breadcrumb-x-current">Create Issuer</li>
		      </ul>
		    </nav>
		
		    <div class="heading">
		      <div class="heading-x-text">
		        <h1>Create Issuer</h1>
		        <p>Creating an issuer allows you to award badges to recipients.</p>
		      </div>
		    </div>
		
		  </header>
		
		  <div class="l-containerhorizontal l-containervertical l-childrenvertical wrap">
		
		    <form (ngSubmit)="onSubmit(issuerForm.value)" class="l-form" novalidate>
		
		      <fieldset>
		        <bg-formfield-image #imageField
		                            label="Image (Optional)"
		                            imageLoaderName="issuer"
		                            [placeholderImage]="issuerImagePlacholderUrl"
		                            [control]="issuerForm.controls.issuer_image"></bg-formfield-image>
		
		        <bg-formfield-text [control]="issuerForm.controls.issuer_name"
		                           [label]="'Name'"
		                           [errorMessage]="{required:'Please enter an issuer name'}"
		                           [autofocus]="true"
		        ></bg-formfield-text>
		
		        <bg-formfield-text [control]="issuerForm.controls.issuer_url"
		                           [label]="'Website URL'"
		                           [errorMessage]="'Please enter a valid URL'"
								   [urlField]="true"
								   type="url"
		        ></bg-formfield-text>
		
		        <bg-formfield-select [control]="issuerForm.controls.issuer_email"
		                           [label]="'Contact Email'"
		                           [placeholder]="'Please select a verified email'"
		                           [options]="emailsOptions"
		                           [errorMessage]="{required:'Please select a verified email'}"
		        ></bg-formfield-select>
		
		        <bg-formfield-text [control]="issuerForm.controls.issuer_description"
		                           [label]="'Description'"
		                           [errorMessage]="{ required: 'Please enter a description'}"
		                           [multiline]="true"
		        ></bg-formfield-text>
		        
					<label [class.formcheckbox-is-error]="issuerForm.controls.agreedTerms.dirty && !issuerForm.controls.agreedTerms.valid" class="formcheckbox  l-marginBottom-2x" for="terms">
						<input name="terms" id="terms" type="checkbox" [formControl]="issuerForm.controls.agreedTerms">
						<span class="formcheckbox-x-text">I have read and agree to the <a target="_blank" [href]="currentTheme.dataProcessorTermsLink ? currentTheme.dataProcessorTermsLink : 'https://badgr.com/en-us/data-processing.html'">Data Processor Addendum</a>.</span>
						<span *ngIf="issuerForm.controls.agreedTerms.dirty && !issuerForm.controls.agreedTerms.valid" class="formcheckbox-x-errortext">Please read and agree to the Data Processor Addendum if you want to continue.</span>
					</label>
		
		        <div class="l-form-x-offset l-childrenhorizontal l-childrenhorizontal-small l-childrenhorizontal-right">
		          <a [routerLink]="['/issuer']"
		             class="button button-primaryghost"
		             [disabled-when-requesting]="true"
		          >Cancel</a>
		          <button type="submit"
		                  class="button"
		                  [disabled]="!! addIssuerFinished"
		                  (click)="clickSubmit($event)"
		                  [loading-promises]="[ addIssuerFinished ]"
		                  loading-message="Adding"
		          >Add Issuer</button>
		        </div>
		
		      </fieldset>
		    </form>
		  </div>
		</main>
	`
})
export class IssuerCreateComponent extends BaseAuthenticatedRoutableComponent implements OnInit {
	readonly issuerImagePlacholderUrl = preloadImageURL(require('../../breakdown/static/images/placeholderavatar-issuer.svg'));

	issuerForm: FormGroup;
	emails: UserProfileEmail[];
	emailsOptions: FormFieldSelectOption[];
	addIssuerFinished: Promise<any>;
	emailsLoaded: Promise<any>;

	get currentTheme() { return this.configService.currentTheme }

	constructor(
		loginService: SessionService,
		router: Router,
		route: ActivatedRoute,
		private configService: SystemConfigService,
		protected profileManager: UserProfileManager,
		protected formBuilder: FormBuilder,
		protected title: Title,
		protected messageService: MessageService,
		protected issuerManager: IssuerManager
	) {
		super(router, route, loginService);
		title.setTitle("Create Issuer - Badgr");

		this.issuerForm = formBuilder.group({
			'issuer_name': [
				'',
				Validators.compose([
					Validators.required,
					Validators.maxLength(1024)
				])
			],
			'issuer_description': [
				'',
				Validators.compose([
					Validators.required,
					Validators.maxLength(1024)
				])
			],
			'issuer_email': [
				'',
				Validators.compose([
					Validators.required,
					/*Validators.maxLength(75),
					EmailValidator.validEmail*/
				])
			],
			'issuer_url': [
				'',
				Validators.compose([
					Validators.required,
					UrlValidator.validUrl
				])
			],
			'issuer_image': [ '' ],
			'agreedTerms': [false, Validators.requiredTrue],
		});

		this.emailsLoaded = this.profileManager.userProfilePromise
			.then(profile => profile.emails.loadedPromise)
			.then(emails => {
				this.emails = emails.entities.filter(e => e.verified);
				this.emailsOptions = this.emails.map((e) => {
					return {
						label: e.email,
						value: e.email,
					}
				});
			});
	}

	ngOnInit() {
		super.ngOnInit();
	}

	onSubmit(formState) {
		var issuer: ApiIssuerForCreation = {
			'name': formState.issuer_name,
			'description': formState.issuer_description,
			'email': formState.issuer_email,
			'url': formState.issuer_url,
		};

		if (formState.issuer_image && String(formState.issuer_image).length > 0) {
			issuer.image = formState.issuer_image;
		}

		this.addIssuerFinished = this.issuerManager.createIssuer(issuer).then((new_issuer) => {
			this.router.navigate([ 'issuer/issuers', new_issuer.slug ]);
			this.messageService.setMessage("Issuer created successfully.", "success");
		}, error => {
			this.messageService.setMessage("Unable to create issuer: " + error, "error");
		}).then(() => this.addIssuerFinished = null);
	}

	clickSubmit(ev) {
		if (!this.issuerForm.valid) {
			ev.preventDefault();
			markControlsDirty(this.issuerForm);
		}
	}

	urlBlurred(ev) {
		var control: FormControl = <FormControl>this.issuerForm.controls[ 'issuer_url' ];
		UrlValidator.addMissingHttpToControl(control);
	}
}
