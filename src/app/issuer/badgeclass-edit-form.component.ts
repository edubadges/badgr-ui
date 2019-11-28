import { Component, ElementRef, EventEmitter, Input, OnInit, Output, ViewChild } from "@angular/core";
import { ActivatedRoute, Router } from "@angular/router";
import { AbstractControl, FormArray, FormBuilder, FormControl, FormGroup, Validators } from "@angular/forms";
import { Title } from "@angular/platform-browser";
import { BaseAuthenticatedRoutableComponent } from "../common/pages/base-authenticated-routable.component";

import { SessionService } from "../common/services/session.service";
import { MessageService } from "../common/services/message.service";

import { ApiBadgeClassAlignment, ApiBadgeClassForCreation, BadgeClassCategory } from "./models/badgeclass-api.model";
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
						<h4 class="title title-bordered" id="heading-badgebasics">Badge Basics</h4>
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
				<div *ngIf="badgeClassCategory == 'formal'"class="l-formsection-x-container">
					<div class="l-formsection-x-inputs">
						<bg-formfield-text
							label="Education Program Identifier - Croho/Crebo"
							[control]="badgeClassForm.controls.extensions.controls.EducationProgramIdentifierExtension.controls.identifierValue"
						></bg-formfield-text>
					</div>
					<div class="l-formsection-x-inputs">
						<bg-formfield-text 
							[control]="badgeClassForm.controls.extensions.controls.NiveauExtension.controls.EQF" 
							label="NLQF LEVEL" 
							[placeholder]="'1-2-3-4-5-6-7 or 8'"
							[errorMessage]="{invalidNumber:'Please enter a value between 1 and 8'}"
							>
						</bg-formfield-text>
					</div>
					<div class="l-formsection-x-help">
						<p class="text text-small">Consult DUO CROHO OR SBB CREBO register. https://www.nlqf.nl/nlqf-niveaus</p>
					</div>
				</div>
				<div *ngIf="badgeClassCategory == 'formal'"class="l-formsection-x-container">
					<div class="l-formsection-x-inputs">
						<bg-formfield-text 
							[control]="badgeClassForm.controls.extensions.controls.ECTSExtension.controls.ECTS"
							[placeholder]="'MINIMUM 3'"
							[errorMessage]="{invalidNumber:'Please enter a 3 or higher'}"
							label="How many credit points (ects or ecvet) does this badgeclass represent?" >
						</bg-formfield-text>
					</div>
					<div class="l-formsection-x-help">
						<p class="text text-small">European Credit Transfer System Points Eeropean Credit system for Vocational Education and Training.</p>
					</div>
				</div>
				<div class="l-formsection-x-container">
					<div class="l-formsection-x-inputs">
						<bg-formfield-text 
							(change)="autoFillLanguage()" 
							[control]="badgeClassForm.controls.extensions.controls.LanguageExtension.controls.typedLanguage" 
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
							[control]="badgeClassForm.controls.extensions.controls.LearningOutcomeExtension.controls.learningOutcome"
							label="Shortlist of main learning Outcomes" 
							class="l-formsection-x-inputoffset"
						></bg-formfield-markdown>
					</div>
					<div class="l-formsection-x-help">
						<h4 class="title title-bordered" id="heading-badgebasics">What is Learning Outcome?</h4>
						<p class="text text-small">See 
							<a href="http://tuningacademy.org/methodology/">TUNING</a>methodology.</p>

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
						<p class="text text-small">The criteria field describes exactly what must be doen to earn this badge. Some issuers choose a URL on their website as a promotional page that explains this badge opportunity and how to earn it.<strong>At least one field is required</strong></p>
						<a class="button button-tertiaryghost"
							href="https://wiki.surfnet.nl/display/OB/FAQ"
							aria-labelledby="heading-badgebasics"
							target="_blank"
						>Learn More</a>
					</div>
				</div>
			</div>

			<!-- Alignments Panel -->
			<div class="l-formsection wrap wrap-well"
			     role="group"
			     aria-labelledby="heading-alignment"
			     *ngIf="alignmentsEnabled"
			>
				<h3 class="l-formsection-x-legend title title-ruled"
				    id="heading-alignment"
				>
					Alignment <span>(optional)</span>
				</h3>
				<div class="l-formsection-x-container">
					<div class="l-formsection-x-help">
						<h4 class="title title-bordered" id="heading-whatsalignment">What's Alignment?</h4>
						<p class="text text-small">
							An Open Badge can optionally align to an educational standard. Alignment
							information may be relevant to people viewing an earner's awarded badges, or to a potential earner
							deciding whether to apply for the badge.
						</p>
						<a class="button button-tertiaryghost"
						   href="https://wiki.surfnet.nl/display/OB/FAQ"
						   aria-labelledby="heading-whatsalignment"
						   target="_blank"
						>Learn More</a>
					</div>
					<div class="l-formsection-x-inputs">
						<div class="l-formsectionnested wrap wrap-welldark" *ngFor="let alignment of alignments.controls; let i = index">
							<h5 class="visuallyhidden" id="heading-alignmentsubsection">{{ alignment.controls.target_name.value }}</h5>

							<bg-formfield-text
								[control]="alignment.controls.target_name"
								label="Alignment Name"
								[errorMessage]="{required:'Please enter an alignment name'}"
								id="alignment_name_{{ i }}"
							></bg-formfield-text>

							<bg-formfield-text
								[control]="alignment.controls.target_url"
								label="Alignment URL"
								[errorMessage]="{required:'Please enter an alignment URL'}"
								[urlField]="true"
								id="alignment_url_{{ i }}"
							></bg-formfield-text>

							<bg-formfield-text
								[control]="alignment.controls.target_description"
								label="Alignment Description"
								[multiline]="true"
								id="alignment_description_{{ i }}"
							></bg-formfield-text>

							<div class="l-formsectiontoggle">
								<input class="l-formsectiontoggle-x-toggle formsectiontoggle visuallyhidden"
								       type="checkbox"
								       id="alignmentAdvancedToggle_{{ i }}"
								       name="alignmentAdvancedToggle_{{ i }}"
								/>
								<label for="alignmentAdvancedToggle_{{ i }}">
									<span class="formsectiontoggle-x-showtext">Show</span>
									<span class="formsectiontoggle-x-hidetext">Hide</span>
									Advanced Options
								</label>

								<div class="l-formsectiontoggle-x-hidden">
									<bg-formfield-text
										[control]="alignment.controls.target_framework"
										label="Framework"
										id="alignment_target_framework_{{ i }}"
									></bg-formfield-text>
									<bg-formfield-text
										[control]="alignment.controls.target_code"
										label="Code"
										id="alignment_target_code_{{ i }}"
									></bg-formfield-text>
								</div>
							</div>
							<button class="l-formsectionnested-x-remove formsectionremove"
							        aria-labelledby="heading-alignmentsubsection"
							        (click)="removeAlignment(alignment)"
							        *ngIf="alignments.length > 1"
							        type="button"
							>Remove</button>
						</div>
						<button class="buttonicon buttonicon-add" type="button" (click)="addAlignment()">Add Another</button>
					</div>
				</div>
				<button class="l-formsection-x-remove formsectionremove"
				        aria-labelledby="heading-alignment"
				        (click)="disableAlignments()"
				        type="button"
				>Remove</button>
			</div>

			<!-- Footer -->
			<div class="l-formsection l-formsection-span wrap wrap-well" role="group" aria-labelledby="heading-addoptionaldetails">
				<!-- Optional Detail Enable Panel -->
				<h3 class="l-formsection-x-legend title title-ruled title-ruledadd" id="heading-addoptionaldetails">Add Optional Details</h3>
				<div class="l-formsection-x-container">
					<div class="l-formsection-x-inputs">
						<div class="l-squareiconcards">
							<button class="squareiconcard squareiconcard-alignment"
											type="button"
											(click)="enableAlignments()"
											[disabled]="alignmentsEnabled"
							>
								<span class="squareiconcard-x-container">Alignment</span>
							</button>
						</div>
					</div>
				</div>

			</div>

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
					class="button"
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
	_badgeClassCategory: BadgeClassCategory | null = null;

	@Output()
	save = new EventEmitter<Promise<BadgeClass>>();

	@Output()
	cancel = new EventEmitter<void>();

	@Input()
	issuerSlug: string;

	@Input()
	submitText: string;

	@Input()
	set badgeClassCategory(badgeClassCategory: BadgeClassCategory) {
		if (this._badgeClassCategory != badgeClassCategory){
			this._badgeClassCategory = badgeClassCategory
			this.initEmptyForm()
		}
	}

	get badgeClassCategory() {
		return this._badgeClassCategory
	}

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

			extensions: this.badgeClassCategory == 'formal' ? this.fb.group({
				LanguageExtension: this.fb.group({
					language: ['', Validators.required],
					typedLanguage: ['', Validators.required],
				}),
				EducationProgramIdentifierExtension: this.fb.group({
					identifierType: ['ISAT', Validators.required],
					identifierValue: ['', Validators.required]
				}),
				NiveauExtension: this.fb.group({
					EQF: ['', Validators.compose([Validators.required, NumericValidator.validEQF])]
				}),
				ECTSExtension: this.fb.group({
					ECTS: ['', Validators.compose([Validators.required, NumericValidator.validECTS])]
				}),
				LearningOutcomeExtension: this.fb.group({
					learningOutcome: ['', Validators.required]
				})
			}) : this.fb.group({
				LanguageExtension: this.fb.group({
					language: ['', Validators.required],
					typedLanguage: ['', Validators.required],
				}),
				LearningOutcomeExtension: this.fb.group({
					learningOutcome: ['', Validators.required]
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
					// typedLanguage: [badgeClass.extensions['LanguageExtension'] ? this.badgeClass.extensions['LanguageExtension']['typedLanguage'] : '' ],
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
			alignments: this.fb.array(this.badgeClass.alignments.map(alignment => this.fb.group({
				target_name: [ alignment.target_name, Validators.required ],
				target_url: [ alignment.target_url, Validators.compose([Validators.required, UrlValidator.validUrl]) ],
				target_description: [ alignment.target_description ],
				target_framework: [ alignment.target_framework ],
				target_code: [ alignment.target_code ],
			} as AlignmentFormGroup<any[]>)))
		} as BasicBadgeForm<any[], FormArray, FormGroup> , {
			validator: this.criteriaRequired
		});
		this.alignmentsEnabled = this.badgeClass.alignments.length > 0;
		this._badgeClassCategory = this.badgeClass.category
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
	// Alignments
	alignmentsEnabled = false;
	savedAlignments: AbstractControl[] = null;


	get alignments() {
		return this.badgeClassForm.controls["alignments"] as FormArray;
	}

	enableAlignments() {
		this.alignmentsEnabled = true;
		if (this.savedAlignments) {
			this.savedAlignments.forEach(a => this.alignments.push(a));
			this.savedAlignments = null;
		}
		if (this.alignments.length == 0) {
			this.addAlignment();
		}
	}

	addAlignment() {
		const group = this.fb.group({
			target_name: [ '', Validators.required ],
			target_url: [ '', Validators.compose([Validators.required, UrlValidator.validUrl]) ],
			target_description: [ '' ],
			target_framework: [ '' ],
			target_code: [ '' ],
		} as AlignmentFormGroup<any[]>);

		this.alignments.push(group);
	}

	disableAlignments() {
		this.alignmentsEnabled = false;

		// Save the alignments so that they aren't validated after being removed, but can be restored if the user chooses to enable alignments again
		this.savedAlignments = this.alignments.controls.slice();
		while (this.alignments.length > 0)
			this.alignments.removeAt(0);
	}

	async removeAlignment(alignment: FormGroup) {
		const controls: AlignmentFormGroup<FormControl> = alignment.controls as any;

		if (controls.target_name.value.trim().length > 0
		 || controls.target_url.value.trim().length > 0
		 || controls.target_description.value.trim().length > 0
		 || controls.target_framework.value.trim().length > 0
		 || controls.target_code.value.trim().length > 0
		) {
			if (! await this.dialogService.confirmDialog.openTrueFalseDialog({
					dialogTitle: "Remove Alignment?",
					dialogBody: "Are you sure you want to remove this alignment? This action cannot be undone.",
					resolveButtonLabel: "Remove Alignment",
					rejectButtonLabel: "Cancel"
			})) return;
		}

		this.alignments.removeAt(this.alignments.controls.indexOf(alignment));
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

	removeEmptyExtensions(extensions) {
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
		return extensions
	}

	async onSubmit(formState: BasicBadgeForm<string, ApiBadgeClassAlignment[], Object[]>) {
		if (this.existingBadgeClass) {
			this.existingBadgeClass.name = formState.badge_name;
			this.existingBadgeClass.description = formState.badge_description;
			this.existingBadgeClass.image = formState.badge_image;
			this.existingBadgeClass.criteria_text = formState.badge_criteria_text;
			this.existingBadgeClass.criteria_url = formState.badge_criteria_url;
			this.existingBadgeClass.alignments = this.alignmentsEnabled ? formState.alignments : [];
			this.existingBadgeClass.extensions = this.removeEmptyExtensions(formState.extensions);
			this.savePromise = this.existingBadgeClass.save();
		} else {
			const badgeClassData = {
				name: formState.badge_name,
				description: formState.badge_description,
				image: formState.badge_image,
				criteria_text: formState.badge_criteria_text,
				criteria_url: formState.badge_criteria_url,
				alignment: this.alignmentsEnabled ? formState.alignments : [],
				extensions: this.removeEmptyExtensions(formState.extensions),
				category: this.badgeClassCategory
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

interface AlignmentFormGroup<T> {
	target_name: T;
	target_url: T;
	target_description: T;
	target_framework: T;
	target_code: T;
}

interface BasicBadgeForm<BasicType, AlignmentsType, ExtensionsType> {
	badge_name: BasicType;
	badge_image: BasicType;
	badge_description: BasicType;
	badge_criteria_url: BasicType;
	badge_criteria_text: BasicType;
	alignments: AlignmentsType;
	extensions: ExtensionsType;
}
