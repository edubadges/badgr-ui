import { Component, forwardRef, Inject, OnInit } from "@angular/core";
import { FormBuilder, FormControl, FormGroup, Validators, FormArray } from "@angular/forms";
import { ActivatedRoute, Router } from "@angular/router";
import { MessageService } from "../common/services/message.service";
import { IssuerManager } from "./services/issuer-manager.service";
import { BaseAuthorizedAndAuthenticatedRoutableComponent } from "../common/pages/base-authenticated-routable.component";
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
																 type="url"
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
								<div class="l-formsectionnested wrap wrap-welldark" *ngFor="let extension of issuer_extensions.controls">

									<div *ngIf="extension.controls.GradingTableExtension">
										<bg-formfield-text [urlField]="true" [control]="extension.controls.GradingTableExtension.controls.gradingTable" label="Please Type in the URL to the Grading Table" ></bg-formfield-text>
										<button class="l-formsectionnested-x-remove formsectionremove"
														(click)="removeExtension(extension)"
														type="button"
										>Remove</button>
									</div>

									<div *ngIf="extension.controls.InstitutionIdentifierExtension">
										<bg-formfield-text [control]="extension.controls.InstitutionIdentifierExtension.controls.institutionIdentifier" label="Please Type in the institution Identifier" ></bg-formfield-text>
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
													[disabled]="GradingTableExtensionEnabled"
									>
										<span class="squareiconcard-x-container">grading Table</span>
									</button>

									<button class="squareiconcard squareiconcard-extension"
													type="button"
													(click)="addExtension('InstitutionIdentifierExtension')"
													[disabled]="InstitutionIdentifierExtensionEnabled"
									>
										<span class="squareiconcard-x-container">institution Identifier</span>
									</button>

								</div>
							</div>
						</div>
					</div>

				<!-- Footer -->

				<hr class="rule l-rule">
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

		    </form>
		  </div>
		</main>
	`
})
export class IssuerCreateComponent extends BaseAuthorizedAndAuthenticatedRoutableComponent implements OnInit {
	readonly issuerImagePlacholderUrl = preloadImageURL(require('../../breakdown/static/images/placeholderavatar-issuer.svg'));

	issuerForm: FormGroup;
	emails: UserProfileEmail[];
	emailsOptions: FormFieldSelectOption[];
	facultiesOptions: FormFieldSelectOption[];
	addIssuerFinished: Promise<any>;
	emailsLoaded: Promise<any>;
	facultiesLoaded: Promise<any>;
	issuer_extensions: Object;

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
		super(router, route, loginService, profileManager, 'add_issuer');
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
					Validators.maxLength(345),
					/*EmailValidator.validEmail*/
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
			.then(profile => profile.faculties.loadedPromise)
			.then(faculties => {
				this.facultiesOptions = faculties.entities.map((f) => {
					return {
						label: f.name,
						value: JSON.stringify({'id': f.numericId, 'name': f.name})
					}
				});
			});
			this.issuer_extensions = this.issuerForm.controls["issuer_extensions"]

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
			'faculty': formState.issuer_faculty,
			'extensions': this.extensionsEnabled ? formState.issuer_extensions : []
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

	get extensions() {
		return this.issuerForm.controls["issuer_extensions"] as FormArray;
	}

	extensionsEnabled = false
	GradingTableExtensionEnabled = false
	InstitutionIdentifierExtensionEnabled = false

	disableExtension(extension: FormGroup){
		let extensionName = Object.keys(extension.controls)[0]
		this[extensionName+'Enabled']=false
	}

	enableExtension(extension: FormGroup){
		let extensionName = Object.keys(extension.controls)[0]
		this.extensionsEnabled = true
		this[extensionName+'Enabled']=true
	}

	async removeExtension(extension: FormGroup) {
		this.extensions.removeAt(this.extensions.controls.indexOf(extension));
		this.disableExtension(extension)
		if (this.extensions.length == 0){
			this.extensionsEnabled = false;
		}
	}

	makeFormGroup(extensionName: string){
		if (extensionName=='GradingTableExtension'){
			return this.formBuilder.group({
				GradingTableExtension: this.formBuilder.group({
					gradingTable: ['', Validators.compose([Validators.required, UrlValidator.validUrl])]
				})
			})
		}
		if (extensionName=='InstitutionIdentifierExtension'){
			return this.formBuilder.group({
				InstitutionIdentifierExtension: this.formBuilder.group({
					institutionIdentifier: ['', Validators.required]
				})
			})
		}
	}

	addExtension(extensionName: string){
	 let extension = this.makeFormGroup(extensionName)
	 this.extensions.push(extension);
	 this.enableExtension(extension)
	}

}
