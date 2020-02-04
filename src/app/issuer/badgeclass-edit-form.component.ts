import { Component, ElementRef, EventEmitter, Input, OnInit, Output, ViewChild } from "@angular/core";
import { ActivatedRoute, Router } from "@angular/router";
import { AbstractControl, FormArray, FormBuilder, FormControl, FormGroup, Validators } from "@angular/forms";
import { Title } from "@angular/platform-browser";
import { BaseAuthenticatedRoutableComponent } from "../common/pages/base-authenticated-routable.component";

import { SessionService } from "../common/services/session.service";
import { MessageService } from "../common/services/message.service";

import { ApiBadgeClassAlignment, ApiBadgeClassForCreation } from "./models/badgeclass-api.model";
import { BadgeClassManager } from "./services/badgeclass-manager.service";
import { IssuerManager } from "./services/issuer-manager.service";
import { markControlsDirty } from "../common/util/form-util";
import { BadgeStudioComponent } from "./badge-studio.component";
import { BgFormFieldImageComponent } from "../common/components/formfield-image";
import { UrlValidator } from "../common/validators/url.validator";
import { NumericValidator } from "../common/validators/numeric.validator";
import { CommonDialogsService } from "../common/services/common-dialogs.service";
import { BadgeClass } from "./models/badgeclass.model";
import { RFC5646LanguageTags } from "../common/util/languages";
import { FormFieldSelectOption } from "../common/components/formfield-select";


@Component({
	selector: 'badgeclass-edit-form',
	template: `
	<style>
		#selected_langbox {
		    background-color: #4CAF50; /* Green */
		    border: none;
		    color: white;
		    padding: 16px 32px;
		    text-align: center;
		    text-decoration: none;
		    display: inline-block;
		    font-size: 16px;
		    margin: 4px 2px;
		    -webkit-transition-duration: 0.4s; /* Safari */
		    transition-duration: 0.4s;
		    cursor: pointer;
		}

		#selected_langbox {
    background-color: white;
    color: black;
    border: 2px solid #555555;
		}

		#selected_langbox {
    background-color: #555555;
    color: white;
		}

	</style>

		<form-message></form-message>
		<form class="l-containerhorizontal l-containervertical"
		      [formGroup]="badgeClassForm"
		      (ngSubmit)="onSubmit(badgeClassForm.value)"
		      novalidate
		>


			<!-- General Details Panel -->
			<div class="l-formsection wrap wrap-well" role="group" aria-labelledby="heading-basicinformation">
				<h3 class="l-formsection-x-legend title title-ruled" id="heading-basicinformation">Basic Information</h3>
				<div class="l-formsection-x-container">
					<div class="l-formsection-x-help">
						<h4 class="title title-bordered" id="heading-badgebasics">Badge Class Basics</h4>
						<p class="text text-small">Badge images can be either PNGs or SVGs. <strong>All fields are required.</strong></p>
						<a class="button button-tertiaryghost"
							href="https://wiki.surfnet.nl/display/OB/FAQ"
							aria-labelledby="heading-badgebasics"
							target="_blank"
						>Learn More</a>
					</div>
					<div class="l-formsection-x-inputs">
						<div class="l-formimageupload">
							<bg-formfield-image
									#imageField
									label="Image"
									imageLoaderName="badge"
									[newDropZone]="true"
									class="l-formimageupload-x-upload"
									[placeholderImage]="badgeClassPlaceholderImageUrl"
									[control]="badgeClassForm.controls.badge_image"
								>
								<span label-additions>
									<span>(<button type="button" (click)="generateRandomImage()">generate random<span class="visuallyhidden"> badge image</span></button>)</span>
								</span>
							</bg-formfield-image>
							<div class="l-formimageupload-x-inputs">
								<badge-studio #badgeStudio [hidden]="true"></badge-studio>
								<bg-formfield-text
									[control]="badgeClassForm.controls.badge_name"
									label="Badgeclass Name"
									[errorMessage]="{ required: 'Please enter a badge name' }"
									[autofocus]="true"
								></bg-formfield-text>
								<bg-formfield-text
									[control]="badgeClassForm.controls.badge_description"
									label="Short Description"
									placeholder="A short summary of this achievement."
									[errorMessage]="{ required: 'Please enter a description' }"
									[multiline]="true"
								></bg-formfield-text>
							</div>
						</div>
					</div>
				</div>
				
				<div class="l-formsection-x-container">
					<div class="l-formsection-x-inputs">
						<bg-formfield-text
							label="Education Program Identifier - Croho/Crebo"
							[control]="badgeClassForm.controls.extensions['controls'].EducationProgramIdentifierExtension.controls.identifierValue"
						></bg-formfield-text>
					</div>
					<div class="l-formsection-x-help">
						<p class="text text-small">Consult DUO CROHO OR SBB CREBO register.</p>
					</div>
				</div>
				<div class="l-formsection-x-container">
					<div class="l-formsection-x-inputs">
						<bg-formfield-text 
							[control]="badgeClassForm.controls.extensions['controls'].NiveauExtension.controls.EQF" 
							label="NLQF LEVEL" 
							[placeholder]="'1-2-3-4-5-6-7 or 8'"
							[errorMessage]="{invalidNumber:'Please enter a value between 1 and 8'}"
							>
						</bg-formfield-text>
					</div>
					<div class="l-formsection-x-help">
						<a href="https://www.nlqf.nl/nlqf-niveaus">https://www.nlqf.nl/nlqf-niveaus</a>
					</div>
				</div>
				<div class="l-formsection-x-container">
					<div class="l-formsection-x-inputs">
						<bg-formfield-text 
							[control]="badgeClassForm.controls.extensions['controls'].ECTSExtension.controls.ECTS"
							[placeholder]="'MINIMUM 3'"
							[errorMessage]="{invalidNumber:'Please enter a 3 or higher'}"
							label="How many credit points (ects) does this badgeclass represent?" >
						</bg-formfield-text>
					</div>
					<div class="l-formsection-x-help">
						<p class="text text-small">ECTS = European Credit Transfer System (Points)</p>
					</div>
				</div>
				<div class="l-formsection-x-container">
					<div class="l-formsection-x-inputs">
						<bg-formfield-text 
							(change)="autoFillLanguage()" 
							[control]="badgeClassForm.controls.extensions['controls'].LanguageExtension.controls.typedLanguage" 
							label="Main language of instruction" >
						</bg-formfield-text>
					</div>
					<div class="l-formsection-x-help">
						<div>
							<div *ngIf="currentLangList[0].label != '' ">
									<div id="selected_langbox" class= "formfield-x-label"> {{ currentLangList[0].label }} </div>
							</div>
							<div *ngIf="currentLangList[0].label == '' ">
									<div id="selected_langbox"> No Language Selected </div>
							</div>
						</div>
					</div>
				</div>
				<div class="l-formsection-x-container">
					<div class="l-formsection-x-inputs">
						<bg-formfield-markdown
							[control]="badgeClassForm.controls.extensions['controls'].LearningOutcomeExtension.controls.learningOutcome"
							label="Shortlist of main learning Outcomes" 
							class="l-formsection-x-inputoffset"
						></bg-formfield-markdown>
					</div>
					<div class="l-formsection-x-help">
						<h4 class="title title-bordered" id="heading-badgebasics">What is Learning Outcome?</h4>
						<p class="text text-small">See 
							<a href="http://tuningacademy.org/methodology/">TUNING</a> methodology.</p>

						<a class="button button-tertiaryghost"
							href="https://wiki.surfnet.nl/display/OB/FAQ"
							aria-labelledby="heading-badgebasics"
							target="_blank"
						>Learn More</a>
					</div>
				</div>
				<div class="l-formsection-x-container">
					<div class="l-formsection-x-inputs">
						<p
							[hidden]="!alignmentFieldDirty || !badgeClassForm.hasError('criteriaRequired')"
							class="text text-is-error">Either text or URL is required.</p>

						<bg-formfield-markdown
							[control]="badgeClassForm.controls.badge_criteria_text"
							label="Criteria Description: How is this Badge Earned?"
							class="l-formsection-x-inputoffset"
							[errorMessage]="''"
						></bg-formfield-markdown>

						<bg-formfield-text
							[control]="badgeClassForm.controls.badge_criteria_url"
							label="or: Criteria URL"
							[urlField]="true"
							fieldType="url"
							[errorMessage]="'Please enter a valid URL'"
							errorMessage="URL to the Badge Criteria Page"
						></bg-formfield-text>
					</div>
					<div class="l-formsection-x-help">
						<h4 class="title title-bordered" id="heading-badgebasics">What are Criteria?</h4>
						<p class="text text-small">The criteria field describes exactly what must be done to earn this badge. Some issuers choose a URL on their website as a promotional page that explains this badge opportunity and how to earn it. <strong>Fill in at least a description or the criteria url.</strong></p>
						<a class="button button-tertiaryghost"
							href="https://wiki.surfnet.nl/display/OB/FAQ"
							aria-labelledby="heading-badgebasics"
							target="_blank"
						>Learn More</a>
					</div>
				</div>
			</div>

			<!-- Footer -->
			<hr class="rule l-rule">
			<div class="l-childrenhorizontal l-childrenhorizontal-right">
				<button
				   class="button button-primaryghost"
				   type="button"
				   [disabled-when-requesting]="true"
				   (click)="cancelClicked()"
				>Cancel</button>
				<button
					type="submit"
					class="button button-green"
					[disabled]="!! savePromise"
					[loading-promises]="[ savePromise ]"
					loading-message="{{ submittingText }}"
					(click)="submitClicked($event)"
				>{{ submitText }}</button>
			</div>
		</form>
	`
})
export class BadgeClassEditFormComponent extends BaseAuthenticatedRoutableComponent implements OnInit {
	readonly badgeClassPlaceholderImageUrl = require('../../breakdown/static/images/placeholderavatar.svg');

	savePromise: Promise<BadgeClass> | null = null;
	badgeClassForm: FormGroup;
	badgeclassExtensions: Object;

	@ViewChild("badgeStudio")
	badgeStudio: BadgeStudioComponent;

	@ViewChild("imageField")
	imageField: BgFormFieldImageComponent;

	existingBadgeClass: BadgeClass | null = null;

	@Output()
	save = new EventEmitter<Promise<BadgeClass>>();

	@Output()
	cancel = new EventEmitter<void>();

	@Input()
	issuerSlug: string;

	@Input()
	submitText: string;

	@Input()
	submittingText: string;

	@Input()
	set badgeClass(badgeClass: BadgeClass) {
		if (this.existingBadgeClass != badgeClass) {
			this.existingBadgeClass = badgeClass;
			this.initFormFromExisting();
			this.badgeclassExtensions = this.badgeClassForm.controls["extensions"]
			this.enableFormListener()
		}
	}

	get badgeClass() {
		return this.existingBadgeClass;
	}

	constructor(
		sessionService: SessionService,
		router: Router,
		route: ActivatedRoute,
		protected fb: FormBuilder,
		protected title: Title,
		protected messageService: MessageService,
		protected issuerManager: IssuerManager,
		protected badgeClassManager: BadgeClassManager,
		protected dialogService: CommonDialogsService
	) {
		super(router, route, sessionService);
		title.setTitle("Create Badge Class - Badgr");

		this.initEmptyForm()

		let langs = RFC5646LanguageTags.langs
		this.languageOptions = langs.map((l) => {
			return {
				label: l.label,
				value: l.value
			};
		});
	}

	initEmptyForm() {
		this.badgeClassForm = this.fb.group({
			badge_name: [
				'',
				Validators.compose([
					Validators.required,
					Validators.maxLength(255)
				])
			],
			badge_image: ['', Validators.required],
			badge_description: [
				'',
				Validators.compose([
					Validators.required,
					Validators.maxLength(6000)
				]),
			],
			badge_criteria_url: ['', UrlValidator.validUrl],
			badge_criteria_text: ['', Validators.maxLength(6000)],
			alignments: this.fb.array([]),

			extensions: this.fb.group({
				LanguageExtension: this.fb.group({
					language: [''],
					typedLanguage: [''],
				}),
				EducationProgramIdentifierExtension: this.fb.group({
					identifierType: ['ISAT'],
					identifierValue: ['']
				}),
				NiveauExtension: this.fb.group({
					EQF: ['', Validators.compose([NumericValidator.validEQF])]
				}),
				ECTSExtension: this.fb.group({
					ECTS: ['', Validators.compose([NumericValidator.validECTS])]
				}),
				LearningOutcomeExtension: this.fb.group({
					learningOutcome: ['']
				})
			})

		} as BasicBadgeForm<any[], FormArray, FormGroup>, {
			validator: this.criteriaRequired
		});
		this.badgeclassExtensions = this.badgeClassForm.controls["extensions"]
	}

	initFormFromExisting() {
		const badgeClass = this.existingBadgeClass;

		this.badgeClassForm = this.fb.group({
			badge_name: [
				badgeClass.name,
				Validators.compose([
					Validators.required,
					Validators.maxLength(255)
				])
			],
			badge_image: [ badgeClass.image, Validators.required ],
			badge_description: [ badgeClass.description, Validators.required ],
			badge_criteria_url: [ badgeClass.criteria_url , UrlValidator.validUrl],
			badge_criteria_text: [ badgeClass.criteria_text ],
			extensions: this.fb.group({
				LanguageExtension: this.fb.group({
					language: [badgeClass.extensions['LanguageExtension'] ? badgeClass.extensions['LanguageExtension']['language']: '' ],
					typedLanguage: [ '' ],
				}),
				EducationProgramIdentifierExtension: this.fb.group({
					identifierType: [badgeClass.extensions['EducationProgramIdentifierExtension'] ? badgeClass.extensions['EducationProgramIdentifierExtension']['identifierType']: ''],
					identifierValue: [badgeClass.extensions['EducationProgramIdentifierExtension'] ? badgeClass.extensions['EducationProgramIdentifierExtension']['identifierValue']: '']
				}),
				NiveauExtension: this.fb.group({
					EQF: [badgeClass.extensions['NiveauExtension'] ? badgeClass.extensions['NiveauExtension']['EQF']: '']
				}),
				ECTSExtension: this.fb.group({
					ECTS: [badgeClass.extensions['ECTSExtension'] ? badgeClass.extensions['ECTSExtension']['ECTS']: '' ]
				}),
				LearningOutcomeExtension: this.fb.group({
					learningOutcome: [badgeClass.extensions['LearningOutcomeExtension'] ? badgeClass.extensions['LearningOutcomeExtension']['learningOutcome']: '' ]
				}),
			}),
		} as BasicBadgeForm<any[], FormArray, FormGroup> , {
			validator: this.criteriaRequired
		});
		// this.alignmentsEnabled = this.badgeClass.alignments.length > 0;
		this.initializeTypedLanguage()
	}

	ngOnInit() {
		super.ngOnInit();
		this.enableFormListener()
	}

	get formControls(): BasicBadgeForm<FormControl, FormArray, FormArray> {
		return this.badgeClassForm.controls as any;
	}

	listener_is_on = false
	enableFormListener(){
		if (!this.listener_is_on){
			this.badgeClassForm.valueChanges.subscribe(x => this.onLangChange(x['extensions']))
		}
	}



	////// language dropdown ///////////////
	languageOptions : Array<any>;
	currentLangList = [{label: '', value: ''}];

	getCurrentTypedLanguage() {
		let value = this.badgeClassForm.controls.extensions['controls'].LanguageExtension ? this.badgeClassForm.controls.extensions['controls'].LanguageExtension.controls['typedLanguage']['value'] : ''
		return value
	}

	initializeTypedLanguage() {
		let currentLanguage = this.badgeClassForm.controls.extensions['controls'].LanguageExtension.controls['language']['value']
		for (let lang of this.languageOptions) {
			if (lang['value'] == currentLanguage) {
				this.badgeClassForm.controls.extensions['controls'].LanguageExtension.controls.typedLanguage.patchValue(lang['label'])
				this.currentLangList = [lang]
			}
		}
	}

	autoFillLanguage() {
		let currentLanguage = this.currentLangList[0].label
		this.badgeClassForm.controls.extensions['controls'].LanguageExtension.controls.typedLanguage.patchValue(currentLanguage)
	}

	setLanguage(language) {
		let currentLanguage = this.badgeClassForm.controls.extensions.value['LanguageExtension']['language']
			if (currentLanguage!=language){
				this.badgeClassForm.controls.extensions['controls'].LanguageExtension.controls.language.patchValue(language)
			}
	}

	onLangChange(extensions) {
		if (extensions) {
			let currentValue = this.getCurrentTypedLanguage()
			let currentLanguageList = this.languageOptions
				.filter(lang => {
			 	return lang.label.toLowerCase().includes(currentValue.toLowerCase())
			})
			if (currentLanguageList.length==0){
				currentLanguageList = [{label:'',value:''}]
			}
			this.currentLangList =currentLanguageList;
			}
		this.setLanguage(this.currentLangList[0].value)
	}

	//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

	criteriaRequired(formGroup: FormGroup): {[id: string]: boolean} | null {
		const controls: BasicBadgeForm<FormControl, FormArray, FormArray> = formGroup.controls as any;
		return ((controls.badge_criteria_url.value||"").trim().length || (controls.badge_criteria_text.value||"").trim().length)
			? null
			: { 'criteriaRequired' : true };
	}

	get alignmentFieldDirty() {
		return this.formControls.badge_criteria_text.dirty || this.formControls.badge_criteria_url.dirty;
	}

	filterExtensions(extensions) {
		// removes empty extensions and the typedLanguage key-value pair
		for (let key in extensions){
			let values_empty = true
			for (let k in extensions[key]) {
				if (Boolean(extensions[key][k])) {
					values_empty = false
				}
			}
			if (values_empty) {
				delete extensions[key]
			}
		}

		if ('LanguageExtension' in extensions){
			delete extensions['LanguageExtension']['typedLanguage']
		}

		return extensions
	}

	async onSubmit(formState: BasicBadgeForm<string, ApiBadgeClassAlignment[], Object[]>) {
		if (this.existingBadgeClass) {
			this.existingBadgeClass.name = formState.badge_name;
			this.existingBadgeClass.description = formState.badge_description;
			this.existingBadgeClass.image = formState.badge_image;
			this.existingBadgeClass.criteria_text = formState.badge_criteria_text;
			this.existingBadgeClass.criteria_url = formState.badge_criteria_url;
			// this.existingBadgeClass.alignments = this.alignmentsEnabled ? formState.alignments : [];
			this.existingBadgeClass.extensions = this.filterExtensions(formState.extensions);
			this.savePromise = this.existingBadgeClass.save();
		} else {
			const badgeClassData = {
				name: formState.badge_name,
				description: formState.badge_description,
				image: formState.badge_image,
				criteria_text: formState.badge_criteria_text,
				criteria_url: formState.badge_criteria_url,
				// alignment: this.alignmentsEnabled ? formState.alignments : [],
				extensions: this.filterExtensions(formState.extensions),
			} as ApiBadgeClassForCreation;

			this.savePromise = this.badgeClassManager.createBadgeClass(this.issuerSlug, badgeClassData);
		}

		this.save.emit(this.savePromise);
	}

	submitClicked(ev: Event) {
		if (! this.badgeClassForm.valid) {
			ev.preventDefault();
			markControlsDirty(this.badgeClassForm);

			// fire on next cycle, otherwise the immediate click event will dismiss the formmessage before its viewed
			setTimeout(() => {
				window.scrollTo(0,0);
				this.messageService.reportHandledError("There were errors in your submission. Please review and try again.")
			});
		}
	}

	cancelClicked() {
		this.cancel.emit();
	}

	generateRandomImage() {
		this.badgeStudio.generateRandom().then(imageUrl => this.imageField.useDataUrl(imageUrl, "Auto-generated image"))
	}
}

interface BasicBadgeForm<BasicType, AlignmentsType, ExtensionsType> {
	badge_name: BasicType;
	badge_image: BasicType;
	badge_description: BasicType;
	badge_criteria_url: BasicType;
	badge_criteria_text: BasicType;
	extensions: ExtensionsType;
}
