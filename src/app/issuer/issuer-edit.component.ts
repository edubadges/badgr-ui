import { Component, Inject, OnInit, forwardRef } from "@angular/core";
import { ActivatedRoute, Router } from "@angular/router";
import { FormBuilder, FormControl, FormGroup, Validators, FormArray } from "@angular/forms";

import { BaseAuthenticatedRoutableComponent } from "../common/pages/base-authenticated-routable.component";

import { SessionService } from "../common/services/session.service";
import { MessageService } from "../common/services/message.service";
import { BadgrApiFailure } from './../common/services/api-failure';
import { IssuerManager } from "./services/issuer-manager.service";
import { UrlValidator } from "../common/validators/url.validator";
import { EmailValidator } from "../common/validators/email.validator";
import { Title } from "@angular/platform-browser";
import { ApiIssuerForEditing } from "./models/issuer-api.model";
import { markControlsDirty } from "../common/util/form-util";
import { Issuer } from "./models/issuer.model";

import { preloadImageURL } from "../common/util/file-util";
import { ApiUserProfileEmail } from "../common/model/user-profile-api.model";
import { FormFieldSelectOption } from "../common/components/formfield-select";
import { UserProfileManager } from "../common/services/user-profile-manager.service";
import { UserProfileEmail } from "../common/model/user-profile.model";
import { CommonEntityManager } from "../entity-manager/common-entity-manager.service";

@Component({
	selector: 'issuer-edit',
	template: `
		<main>
		  <form-message></form-message>
		  <header *ngIf="issuerLoaded" class="wrap wrap-light l-containerhorizontal l-heading">

		    <nav>
		      <h1 class="visuallyhidden">Breadcrumbs</h1>
		      <ul class="breadcrumb">
		        <li><a [routerLink]="['/issuer']">Issuers</a></li>
			      <li *ngIf="issuer"><a [routerLink]="['/issuer/issuers', issuerSlug]">{{ issuer.name }}</a></li>
		        <li class="breadcrumb-x-current">Edit Issuer</li>
		      </ul>
		    </nav>
				
		    <div class="heading">
		      <div class="heading-x-text">
		        <h1>Edit Issuer</h1>
		        <p>Edit the information associated with this issuer profile.</p>
		      </div>
					<div><small>Your Role: {{ issuer.currentUserStaffMember?.roleInfo.label }}</small></div>
		    </div>

		  </header>

		  <div class="l-containerhorizontal l-containervertical l-childrenvertical wrap">

		    <form (ngSubmit)="onSubmit(issuerForm.value)" novalidate>


					<!-- new form -->

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
											<a target="_blank" href="https://duo.nl/open_onderwijsdata">BRIN: basisregister instellingen</a>
											<a target="_blank" href="https://www.iau-aiu.net">IAU: International Association of Universities</a>
										</p>
									</div>
								</div>
								<div class="l-formsection-x-inputs">
									<bg-formfield-text 	[control]="issuerForm.controls.issuer_extensions['controls'].InstitutionIdentifierExtension" 
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
																			[control]="issuerForm.controls.issuer_extensions['controls'].GradingTableExtension" 
																			label="Grading Table url (optional)" 
									></bg-formfield-text>
								</div>
							</div>
						</fieldset>

					</div>

					<!-- footer -->

					<hr class="rule l-rule">
					<div class="l-form-x-offset l-childrenhorizontal l-childrenhorizontal-small l-childrenhorizontal-right">
						<a [routerLink]="['/issuer/issuers', issuerSlug]"
							 class="button button-primaryghost"
							 [disabled-when-requesting]="true"
						>Cancel</a>
						<button type="submit"
										class="button button-green"
										[disabled]="!! editIssuerFinished"
										(click)="clickSubmit($event)"
										[loading-promises]="[ editIssuerFinished ]"
										loading-message="Adding"
										
						>Save</button>
					</div>
		    </form>
		  </div>
		</main>
	`
})
export class IssuerEditComponent extends BaseAuthenticatedRoutableComponent implements OnInit {
	readonly issuerImagePlacholderUrl = preloadImageURL(require('../../breakdown/static/images/placeholderavatar-issuer.svg'));

	issuer: Issuer;
	issuerSlug: string;

	issuerForm: FormGroup;
	emails: Array<UserProfileEmail>;
	emailsOptions: FormFieldSelectOption[];
	facultiesOptions: FormFieldSelectOption[];

	editIssuerFinished: Promise<any>;
	issuerLoaded: Promise<any>;
	facultiesLoaded: Promise<any>;
	issuerExtensions: Object;
	userInstitutionName: String = '';

	constructor(
		loginService: SessionService,
		router: Router,
		route: ActivatedRoute,
		protected profileManager: UserProfileManager,
		protected formBuilder: FormBuilder,
		protected title: Title,
		protected messageService: MessageService,
		protected issuerManager: IssuerManager
	) {
		super(router, route, loginService);
		title.setTitle("Edit Issuer - Badgr");

		this.issuerSlug = this.route.snapshot.params['issuerSlug'];

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
					EmailValidator.validEmail
					/*Validators.maxLength(75),*/
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
				'GradingTableExtension': ['', UrlValidator.validUrl],
				'InstitutionIdentifierExtension': ['', Validators.required]
			})

		} as issuerForm<any[], FormGroup>);

		this.issuerLoaded = this.issuerManager.issuerBySlug(this.issuerSlug).then(
			(issuer) => {
				this.issuer = issuer;
				this.editControls.issuer_name.setValue(this.issuer.name, { emitEvent: false });
				this.editControls.issuer_description.setValue(this.issuer.description, { emitEvent: false });
				this.editControls.issuer_email.setValue(this.issuer.email, { emitEvent: false });
				this.editControls.issuer_url.setValue(this.issuer.websiteUrl, { emitEvent: false });
				this.editControls.issuer_image.setValue(this.issuer.image, { emitEvent: false });
				if (this.issuer.faculty){
					delete this.issuer.faculty['slug']
					this.editControls.issuer_faculty.setValue(JSON.stringify(this.issuer.faculty), { emitEvent: false });
				}
				this.editControls.issuer_extensions['controls']['GradingTableExtension'].setValue(this.issuer.extensions['GradingTableExtension']['gradingTable'], { emitEvent: false });
				this.editControls.issuer_extensions['controls']['InstitutionIdentifierExtension'].setValue(this.issuer.extensions['InstitutionIdentifierExtension']['value'], { emitEvent: false });


				this.title.setTitle("Issuer - " + this.issuer.name + " - Badgr");

			}, error => {
				this.messageService.reportLoadingError(`Issuer '${this.issuerSlug}' does not exist.`, error);
			}
		);

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
					});
			});
				
	}

	get editControls(): issuerForm<FormControl, FormArray> {
		return this.issuerForm.controls as any;
	}

	ngOnInit() {
		super.ngOnInit();
	}

	onSubmit(formState) {
		var issuer: ApiIssuerForEditing = {
			'name': formState.issuer_name,
			'description': formState.issuer_description,
			'email': formState.issuer_email,
			'url': formState.issuer_url,
			'extensions': formState.issuer_extensions,
		};

		if (formState.issuer_faculty){
			issuer['faculty'] = JSON.parse(formState.issuer_faculty)
		}

		if (formState.issuer_image && String(formState.issuer_image).length > 0) {
			issuer.image = formState.issuer_image;
		}

		if (formState.issuer_extensions.InstitutionIdentifierExtension) {
			issuer['extensions']['InstitutionIdentifierExtension'] = {
				"identifier_type": 'brin',
				'value': formState.issuer_extensions.InstitutionIdentifierExtension
			}
		} else {
			delete issuer['extensions']['InstitutionIdentifierExtension']
		}
		if (formState.issuer_extensions.GradingTableExtension) {
			issuer['extensions']['GradingTableExtension'] = {
				'gradingTable': formState.issuer_extensions.GradingTableExtension
			}
		} else {
			delete issuer['extensions']['GradingTableExtension']
		}
		 

		this.editIssuerFinished = this.issuerManager.editIssuer(this.issuerSlug,issuer).then((new_issuer) => {
			this.router.navigate([ 'issuer/issuers', new_issuer.slug ]);
			this.messageService.setMessage("Issuer created successfully.", "success");
		}, error => {
				this.messageService.reportAndThrowError(
					`Unable to update issuer: ${BadgrApiFailure.from(error).verboseError}`,
					error
				)
		}).then(() => this.editIssuerFinished = null);
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

	/// EXTENSIONS ///

	extensionsEnabled = false
	gradingTableExtensionEnabled = false
	institutionIdentifierExtensionEnabled = false

	initExtensionFromExisting(extensionName: string){
		let extension = this.makeFormGroup(extensionName)
		return extension
	}

	makeFormGroup(extensionName: string){
		if (extensionName=='GradingTableExtension'){
			let gradingTable = (this.issuer.extensions['GradingTableExtension']) ? this.issuer.extensions['GradingTableExtension']['gradingTable'] : ''
			return this.formBuilder.group({
				GradingTableExtension: this.formBuilder.group({
					gradingTable: [gradingTable, Validators.compose([Validators.required, UrlValidator.validUrl])]
				})
			})
		}
		if (extensionName=='InstitutionIdentifierExtension'){
			let institutionIdentifier = (this.issuer.extensions['InstitutionIdentifierExtension']) ? this.issuer.extensions['InstitutionIdentifierExtension']['institutionIdentifier'] : ''
			return this.formBuilder.group({
				InstitutionIdentifierExtension: this.formBuilder.group({
					institutionIdentifier: [institutionIdentifier, Validators.required]
				})
			})
		}
	}
}

interface issuerForm<T, ExtensionsType> {
	issuer_name: T;
	issuer_description: T;
	issuer_email: T;
	issuer_url: T;
	issuer_image: T;
	issuer_faculty: T;
	issuer_extensions: ExtensionsType;
}
