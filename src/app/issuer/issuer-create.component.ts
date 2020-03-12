import { Component, forwardRef, Inject, OnInit } from "@angular/core";
import { FormBuilder, FormControl, FormGroup, Validators, FormArray } from "@angular/forms";
import { ActivatedRoute, Router } from "@angular/router";
import { MessageService } from "../common/services/message.service";
import { IssuerManager } from "./services/issuer-manager.service";
import { BaseAuthenticatedRoutableComponent } from "../common/pages/base-authenticated-routable.component";
import { UrlValidator } from "../common/validators/url.validator";
import { EmailValidator } from "../common/validators/email.validator";
import { Title } from "@angular/platform-browser";
import { ApiIssuerForCreation } from "./models/issuer-api.model";
import { markControlsDirty } from "../common/util/form-util";
import { SessionService } from "../common/services/session.service";
import { BadgrApiFailure } from "../common/services/api-failure";
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

		  <div *bgAwaitPromises="[facultiesLoaded]" class="l-containerhorizontal l-containervertical l-childrenvertical wrap">

		    <form (ngSubmit)="onSubmit(issuerForm.value)" novalidate>

					<div class="l-formsection wrap wrap-well" role="group">
						<fieldset>
							<div class="l-formsection-x-container">
								<div class="l-formsection-x-help">
									<div>
										<h4 class="title title-bordered" id="heading-badgebasics">What is an Issuer?</h4>
										<p class="text text-small">An issuer is an organiztional unit that awards badges to earners. This can be a faculty or any other educational unit.</p>
										<a class="button button-tertiaryghost"
											href="https://wiki.surfnet.nl/display/OB/FAQ"
											aria-labelledby="heading-badgebasics"
											target="_blank"
										>Learn More</a>
									</div>
								</div>
								<div class="l-formsection-x-inputs">
									<div class="l-formsection-col">
										<bg-formfield-image #imageField
																				label="Logo of issuer"
																				imageLoaderName="issuer"
																				[placeholderImage]="issuerImagePlacholderUrl"
																				[control]="issuerForm.controls.issuer_image">
										</bg-formfield-image>
									</div>
									<div class=" formfield l-formsection-col l-formsection-col-top">
										<bg-formfield-text [control]="issuerForm.controls.institution_name"
																			[label]="'Institution Name'"
																			[autofill]="true"
										></bg-formfield-text>
									</div>
								</div>
							</div>
						</fieldset>

						<fieldset>
							<div class="l-formsection-x-container">
								<div class="l-formsection-x-help">
									<div class="formfield">
										<p class="formfield-x-label label-secondary">Select a Faculty or Educational Unit that this Issuer belongs to.</p>
									</div>
								</div>
								<div class="l-formsection-x-inputs">
																		<bg-formfield-select [control]="issuerForm.controls.issuer_faculty"
																		[label]="'Faculty or unit'"
																		[placeholder]="'No faculty selected'"
																		[options]="facultiesOptions"
									></bg-formfield-select>
								</div>
							</div>
						</fieldset>

						<fieldset>
							<div class="l-formsection-x-container">
								<div class="l-formsection-x-help">
								</div>
								<div class="l-formsection-x-inputs">
									<bg-formfield-text [control]="issuerForm.controls.issuer_name"
																		[label]="'Name of organisational unit that issues badges'"
																		[errorMessage]="{required:'Please enter an issuer name'}"
																		[autofocus]="true"
									></bg-formfield-text>
								</div>
							</div>
						</fieldset>

						<fieldset>
							<div class="l-formsection-x-container">
								<div class="l-formsection-x-help">
								</div>
								<div class="l-formsection-x-inputs">
									<bg-formfield-text [control]="issuerForm.controls.issuer_description"
																		[label]="'A short description of the organisational unit that issues badges'"
																		[errorMessage]="{ required: 'Please enter a description'}"
																		[multiline]="true"
									></bg-formfield-text>
								</div>
							</div>
						</fieldset>

						<fieldset>
							<div class="l-formsection-x-container">
								<div class="l-formsection-x-help">
									<div class="formfield">
										<p class="formfield-x-label label-secondary">This website URL will be displayed in the badge.</p>
									</div>
								</div>
								<div class="l-formsection-x-inputs">
									<bg-formfield-text [control]="issuerForm.controls.issuer_url"
																		[label]="'Website URL'"
																		[errorMessage]="'Please enter a valid URL'"
																		[urlField]="true"
																		type="url"
									></bg-formfield-text>
								</div>
							</div>
						</fieldset>

						<fieldset>
							<div class="l-formsection-x-container">
								<div class="l-formsection-x-help">
									<div class="formfield">
										<p class="formfield-x-label label-secondary">This email address wil be visible in the email sent to the earner and in the badge.</p>
									</div>
								</div>
								<div class="l-formsection-x-inputs">
									<bg-formfield-text 	[control]="issuerForm.controls.issuer_email"
																			[label]="'Contact Email'"
																			[errorMessage]="{required:'Please enter a valid email address'}"
									></bg-formfield-text>
								</div>
							</div>
						</fieldset>

						<fieldset>
							<div class="l-formsection-x-container">
								<div class="l-formsection-x-help">
									<div class="formfield">
										<p class="label-secondary">
											<a href="https://duo.nl/open_onderwijsdata">BRIN: basisregister instellingen</a>
											<a href="https://www.iau-aiu.net">IAU: International Association of Universities</a>
										</p>
									</div>
								</div>
								<div class="l-formsection-x-inputs">
									<bg-formfield-text 	[control]="issuerForm.controls.issuer_extensions.controls.institutionIdentifier" 
																			label="institution Identifier (brin code or iau code)" 
									></bg-formfield-text>
								</div>
							</div>
						</fieldset>

						<fieldset>
							<div class="l-formsection-x-container">
								<div class="l-formsection-x-help">
									<div class="formfield">
										<p class="label-secondary">This should be a persistent URL.</p>
									</div>
								</div>
								<div class="l-formsection-x-inputs">
									<bg-formfield-text 	[urlField]="true" 
																			[control]="issuerForm.controls.issuer_extensions.controls.gradingTable" 
																			label="Grading Table url (optional)" 
									></bg-formfield-text>
								</div>
							</div>
						</fieldset>

					</div>

					<!-- Footer -->

					<hr class="rule l-rule">
					<div class="l-form-x-offset l-childrenhorizontal l-childrenhorizontal-small l-childrenhorizontal-right">
						<a [routerLink]="['/issuer']"
							class="button button-primaryghost"
							[disabled-when-requesting]="true"
						>Cancel</a>
						<button type="submit"
										class="button button-green"
										[disabled]="!! addIssuerFinished"
										(click)="clickSubmit($event)"
										[loading-promises]="[ addIssuerFinished ]"
										loading-message="Adding"
						>Add Issuer</button>
					</div>

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
	facultiesOptions: FormFieldSelectOption[];
	addIssuerFinished: Promise<any>;
	emailsLoaded: Promise<any>;
	facultiesLoaded: Promise<any>;
	issuer_extensions: Object;
	userInstitutionName: String = '';

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
			'institution_name': [
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
					Validators.maxLength(345),
					EmailValidator.validEmail
				])
			],
			'issuer_url': [
				'',
				Validators.compose([
					Validators.required,
					UrlValidator.validUrl
				])
			],
			'issuer_faculty': [ '' ],
			'issuer_image': ['', Validators.required],
			'issuer_extensions': this.formBuilder.group({
						'gradingTable': ['', UrlValidator.validUrl],
						'institutionIdentifier': ['', Validators.required]
				})
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

		this.facultiesLoaded = this.profileManager.userProfilePromise
			.then(profile => {
				this.userInstitutionName = profile.institution['name']
				this.issuerForm.controls.institution_name.setValue(this.userInstitutionName)
				profile.faculties.loadedPromise
					.then(faculties => {
						this.facultiesOptions = faculties.entities.map((f) => {
							return {
								label: f.name,
								value: JSON.stringify({ 'id': f.numericId, 'name': f.name })
							}
						});
					})
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
			'extensions': {}
		};
		if (formState.issuer_extensions.institutionIdentifier) {
			issuer['extensions'] = {'institutionIdentifier' : formState.issuer_extensions.institutionIdentifier}
		}
		if (formState.issuer_extensions.gradingTable) {
			issuer['extensions'] = { 'gradingTable': formState.issuer_extensions.gradingTable }
		} 
		if (formState.issuer_faculty){
			issuer['faculty'] = JSON.parse(formState.issuer_faculty)
		}

		if (formState.issuer_image && String(formState.issuer_image).length > 0) {
			issuer.image = formState.issuer_image;
		}


		this.addIssuerFinished = this.issuerManager.createIssuer(issuer).then((new_issuer) => {
			this.router.navigate([ 'issuer/issuers', new_issuer.slug ]);
			this.messageService.setMessage("Issuer created successfully.", "success");
		}, error => {
				this.messageService.reportAndThrowError(
					`Unable to create issuer: ${BadgrApiFailure.from(error).verboseError}`,
					error
				)
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
