import { Component, Inject, OnInit, forwardRef } from "@angular/core";
import { ActivatedRoute, Router } from "@angular/router";
import { FormBuilder, FormControl, FormGroup, Validators, FormArray } from "@angular/forms";

import { BaseAuthenticatedRoutableComponent } from "../common/pages/base-authenticated-routable.component";

import { SessionService } from "../common/services/session.service";
import { MessageService } from "../common/services/message.service";
import { IssuerManager } from "./services/issuer-manager.service";
import { UrlValidator } from "../common/validators/url.validator";
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
		  <header class="wrap wrap-light l-containerhorizontal l-heading">

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
		    </div>

		  </header>

		  <div class="l-containerhorizontal l-containervertical l-childrenvertical wrap">

		    <form (ngSubmit)="onSubmit(issuerForm.value)" novalidate>
					<div class="l-formsection wrap wrap-well" role="group">
			      <fieldset>
			        <bg-formfield-image #imageField
			                            label="Image (Optional)"
			                            imageLoaderName="issuer"
			                            [placeholderImage]="issuerImagePlacholderUrl"
			                            [control]="issuerForm.controls.issuer_image">
							</bg-formfield-image><br>

			        <bg-formfield-text [control]="issuerForm.controls.issuer_name"
			                           [label]="'Name'"
			                           [errorMessage]="{required:'Please enter an issuer name'}"
			                           [autofocus]="true"
			        ></bg-formfield-text><br>

			        <bg-formfield-text [control]="issuerForm.controls.issuer_url"
			                           [label]="'Website URL'"
			                           [errorMessage]="'Please enter a valid URL'"
			                           [urlField]="true"
			        ></bg-formfield-text><br>

							<bg-formfield-select [control]="issuerForm.controls.issuer_faculty"
			                           [label]="'Faculty'"
																 [placeholder]="'No faculty selected'"
																 [options]="facultiesOptions"
			        ></bg-formfield-select><br>

			        <bg-formfield-select [control]="issuerForm.controls.issuer_email"
			                           [label]="'Contact Email'"
			                           [placeholder]="'Please select a verified email'"
			                           [options]="emailsOptions"
			                           [errorMessage]="{required:'Please select a verified email'}"
			        ></bg-formfield-select><br>

			        <bg-formfield-text [control]="issuerForm.controls.issuer_description"
			                           [label]="'Description'"
			                           [errorMessage]="{ required: 'Please enter a description'}"
			                           [multiline]="true"
			        ></bg-formfield-text><br>

			      </fieldset>
					</div>

					<!-- Extensions -->

					<div class="l-formsection wrap wrap-well" role="group" aria-labelledby="heading-extension" *ngIf="extensionsEnabled">
						<h3 class="l-formsection-x-legend title title-ruled" id="heading-extension"> Extensions <span>(optional)</span></h3>
						<div class="l-formsection-x-container">
							<div class="l-formsection-x-help">
								<h4 class="title title-bordered" id="heading-whatsextension">What's an extension?</h4>
								<p class="text text-small"> Extensions are optional extra values you can add to your badgeclass.</p>
								<a class="button button-tertiaryghost" href="http://www.imsglobal.org/sites/default/files/Badges/OBv2p0Final/extensions/index.html" aria-labelledby="heading-whatsextension" target="_blank">Learn More</a>
							</div>
							<div class="l-formsection-x-inputs">
								<div class="l-formsectionnested wrap wrap-welldark" *ngFor="let extension of issuerExtensions.controls">

									<div *ngIf="extension.controls.GradingTableExtension">
										<bg-formfield-text [urlField]="true" [control]="extension.controls.GradingTableExtension.controls.gradingTable" label="Please Type in the URL to the Grading Table" ></bg-formfield-text>
										<button class="l-formsectionnested-x-remove formsectionremove"
														(click)="removeExtension(extension)"
														type="button"
										>Remove</button>
									</div>

									<div *ngIf="extension.controls.InstitutionIdentifierExtension">
										<bg-formfield-text [control]="extension.controls.InstitutionIdentifierExtension.controls.institutionIdentifier" label="Please Type in the institution Identifier - BRIN in the Netherlands" ></bg-formfield-text>
										<button class="l-formsectionnested-x-remove formsectionremove"
														(click)="removeExtension(extension)"
														type="button"
										>Remove</button>
									</div>

								</div>
							</div>
						</div>
					</div>

					<!-- Extension Adder Buttons -->

					<div class="l-formsection l-formsection-span wrap wrap-well" role="group" aria-labelledby="heading-addoptionaldetails">
						<h3 class="l-formsection-x-legend title title-ruled title-ruledadd" id="heading-addoptionaldetails">Add Extensions</h3>
						<div class="l-formsection-x-container">
							<div class="l-formsection-x-inputs">
								<div class="l-squareiconcards">
									<button class="squareiconcard squareiconcard-extension"
													type="button"
													(click)="addExtension('GradingTableExtension')"
													[disabled]="gradingTableExtensionEnabled"
									>
										<span class="squareiconcard-x-container">grading Table</span>
									</button>

									<button class="squareiconcard squareiconcard-extension"
													type="button"
													(click)="addExtension('InstitutionIdentifierExtension')"
													[disabled]="institutionIdentifierExtensionEnabled"
									>
										<span class="squareiconcard-x-container">institution Identifier</span>
									</button>

								</div>
							</div>
						</div>
					</div>

					<!-- footer -->

					<hr class="rule l-rule">
					<div class="l-form-x-offset l-childrenhorizontal l-childrenhorizontal-small l-childrenhorizontal-right">
						<a [routerLink]="['/issuer/issuers', issuerSlug]"
							 class="button button-primaryghost"
							 [disabled-when-requesting]="true"
						>Cancel</a>
						<button type="submit"
										class="button"
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
	emailsLoaded: Promise<any>;
	issuerLoaded: Promise<any>;
	facultiesLoaded: Promise<any>;
	issuerExtensions: Object;

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
			'issuer_faculty': [ '' ],
			'issuer_image': [ '' ],
			'issuer_extensions' : formBuilder.array([])
		} as issuerForm<any[], FormArray>);

		this.issuerLoaded = this.issuerManager.issuerBySlug(this.issuerSlug).then(
			(issuer) => {
				this.issuer = issuer;

				this.editControls.issuer_name.setValue(this.issuer.name, { emitEvent: false });
				this.editControls.issuer_description.setValue(this.issuer.description, { emitEvent: false });
				this.editControls.issuer_email.setValue(this.issuer.email, { emitEvent: false });
				this.editControls.issuer_url.setValue(this.issuer.websiteUrl, { emitEvent: false });
				this.editControls.issuer_image.setValue(this.issuer.image, { emitEvent: false });
				this.editControls.issuer_faculty.setValue(JSON.stringify(this.issuer.faculty), { emitEvent: false });
				for (let extension of Object.keys(this.issuer.extensions)){
					(this.editControls.issuer_extensions as FormArray).push(this.initExtensionFromExisting(extension))
				}
				this.title.setTitle("Issuer - " + this.issuer.name + " - Badgr");

				/*this.badgesLoaded = new Promise((resolve, reject) => {
					this.badgeClassService.badgesByIssuerUrl$.subscribe(
						badgesByIssuer => {
							this.badges = badgesByIssuer[this.issuer.issuerUrl];
							resolve();
						},
						error => {
							this.messageService.reportAndThrowError(
								`Failed to load badges for ${this.issuer ? this.issuer.name : this.issuerSlug}`, error
							);
							resolve();
						}
					);
				});*/
			}, error => {
				this.messageService.reportLoadingError(`Issuer '${this.issuerSlug}' does not exist.`, error);
			}
		);

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
			.then(profile => profile.faculties.loadedPromise)
			.then(faculties => {
				this.facultiesOptions = faculties.entities.map((f) => {
					return {
						label: f.name,
						value: JSON.stringify({'id': f.numericId, 'name': f.name})
					}
				});
			});
		this.issuerExtensions = this.issuerForm.controls["issuer_extensions"]
	}

	get editControls(): issuerForm<FormControl, FormArray> {
		return this.issuerForm.controls as any;
	}

	get extensions() {
		return this.issuerForm.controls["issuer_extensions"] as FormArray;
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
			'faculty': formState.issuer_faculty,
			'extensions': this.extensionsEnabled ? formState.issuer_extensions: [],
		};

		if (formState.issuer_image && String(formState.issuer_image).length > 0) {
			issuer.image = formState.issuer_image;
		}

		this.editIssuerFinished = this.issuerManager.editIssuer(this.issuerSlug,issuer).then((new_issuer) => {
			this.router.navigate([ 'issuer/issuers', new_issuer.slug ]);
			this.messageService.setMessage("Issuer created successfully.", "success");
		}, error => {
			this.messageService.setMessage("Unable to create issuer: " + error, "error");
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
		this.enableExtension(extension)
		return extension
	}

	disableExtension(extension: FormGroup){
		let extensionName = Object.keys(extension.controls)[0]
		this[extensionName+'Enabled']=false
	}

	async removeExtension(extension: FormGroup) {
		this.extensions.removeAt(this.extensions.controls.indexOf(extension));
		this.disableExtension(extension)
		if (this.extensions.length == 0){
			this.extensionsEnabled = false;
		}
	}

	enableExtension(extension: FormGroup){
		let extensionName = Object.keys(extension.controls)[0]
		this.extensionsEnabled = true
		this[extensionName+'Enabled']=true
	}
	addExtension(extensionName: string){
		let extension = this.makeFormGroup(extensionName);
		this.extensions.push(extension);
		this.enableExtension(extension)
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
