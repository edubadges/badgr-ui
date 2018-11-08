import { Component, ElementRef, EventEmitter, Input, OnInit, Output, ViewChild } from "@angular/core";
import { ActivatedRoute, Router } from "@angular/router";
import { AbstractControl, FormArray, FormBuilder, FormControl, FormGroup, Validators } from "@angular/forms";
import { Title } from "@angular/platform-browser";
import { BaseAuthenticatedRoutableComponent } from "../common/pages/base-authenticated-routable.component";

import { SessionService } from "../common/services/session.service";
import { MessageService } from "../common/services/message.service";
import { Issuer } from "./models/issuer.model";

import { ApiBadgeClassAlignment, ApiBadgeClassForCreation } from "./models/badgeclass-api.model"; // , ApiBadgeClassExtension
import { BadgeClassManager } from "./services/badgeclass-manager.service";
import { IssuerManager } from "./services/issuer-manager.service";
import { markControlsDirty } from "../common/util/form-util";
import { BadgeStudioComponent } from "./badge-studio.component";
import { BgFormFieldImageComponent } from "../common/components/formfield-image";
import { BadgrApiFailure } from "../common/services/api-failure";
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
						   href="https://support.badgr.io/pages/viewpage.action?pageId=327763"
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
									label="Name"
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
			</div>

			<!-- Criteria Panel -->
			<div class="l-formsection wrap wrap-well" role="group" aria-labelledby="heading-criteria">
				<h3 class="l-formsection-x-legend title title-ruled" id="heading-criteria">Criteria</h3>
				<div class="l-formsection-x-container">
					<div class="l-formsection-x-help">
						<h4 class="title title-bordered" id="heading-whatscriteria">What are Criteria?</h4>
						<p class="text text-small">
							The criteria field describes exactly what must be done to earn this badge. Some issuers choose a URL on
							their website as a promotional page that explains this badge opportunity and how to earn it.
							<strong>At least one field is required.</strong>
						</p>
						<a class="button button-tertiaryghost"
						   href="https://support.badgr.io/pages/viewpage.action?pageId=327768"
						   aria-labelledby="heading-whatscriteria"
						   target="_blank"
						>Learn More</a>
					</div>
					<div class="l-formsection-x-inputs">
						<p
							[hidden]="!alignmentFieldDirty || !badgeClassForm.hasError('criteriaRequired')"
							class="text text-is-error">Either text or URL is required.</p>

						<bg-formfield-markdown
							[control]="badgeClassForm.controls.badge_criteria_text"
							label="How is this Badge Earned?"
							class="l-formsection-x-inputoffset"
							[errorMessage]="''"
						></bg-formfield-markdown>

						<bg-formfield-text
							[control]="badgeClassForm.controls.badge_criteria_url"
							label="URL"
							[urlField]="true"
							errorMessage="URL to the Badge Criteria Page"
						></bg-formfield-text>
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
						   href="https://support.badgr.io/pages/viewpage.action?pageId=327768"
						   aria-labelledby="heading-whatsalignment"
						   target="_blank"
						>Learn More</a>
					</div>
					<div class="l-formsection-x-inputs">
						<div class="l-formsectionnested wrap wrap-welldark" *ngFor="let alignment of alignments.controls; let i = index">
							<h5 class="visuallyhidden" id="heading-alignmentsubsection">{{ alignment.controls.target_name.value }}</h5>

							<bg-formfield-text
								[control]="alignment.controls.target_name"
								label="Name"
								[errorMessage]="{required:'Please enter an alignment name'}"
							></bg-formfield-text>

							<bg-formfield-text
								[control]="alignment.controls.target_url"
								label="URL"
								[errorMessage]="{required:'Please enter an alignment URL'}"
								[urlField]="true"
							></bg-formfield-text>

							<bg-formfield-text
								[control]="alignment.controls.target_description"
								label="Short Description"
								[multiline]="true"
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
									></bg-formfield-text>
									<bg-formfield-text
										[control]="alignment.controls.target_code"
										label="Code"
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

			<!-- Tags Panel -->
			<div class="l-formsection wrap wrap-well" role="group" aria-labelledby="heading-tags" *ngIf="tagsEnabled">
				<h3 class="l-formsection-x-legend title title-ruled" id="heading-tags">Tags</h3>
				<div class="l-formsection-x-container">
					<div class="l-formsection-x-help">
						<h4 class="title title-bordered" id="heading-whataretags">What are Tags?</h4>
						<p class="text text-small">
							Tags are optional ways to describe a type of achievement. When you use tags, you help people who are
							interested in your topic find your Badge.
						</p>
						<a class="button button-tertiaryghost"
						   href="https://support.badgr.io/pages/viewpage.action?pageId=327768"
						   aria-labelledby="heading-whataretags"
						   target="_blank"
						>Learn More</a>
					</div>
					<div class="l-formsection-x-inputs">
						<ul class="l-tags">
							<li *ngFor="let tag of tags">
								<div class="tag">
									<span class="tag-x-text">{{ tag }}</span>
									<button type="button" (click)="removeTag(tag)">Remove {{ tag }} tag</button>
								</div>
							</li>
						</ul>
						<div class="l-formsection-x-maxwidthinput formfield">
							<label for="formfield">Add a Tag</label>
							<div class="formaddinput">
								<label class="visuallyhidden" for="addtag" id="formaddinput-addtag">Tag</label>
								<input type="text" name="addtag" id="addtag" (keypress)="handleTagInputKeyPress($event)" #newTagInput>
								<button aria-labelledby="formaddinput-addtag"
								        type="button"
								        (click)="addTag()"
								>Add</button>
							</div>
						</div>
					</div>
				</div>
				<button class="l-formsection-x-remove formsectionremove"
				        aria-labelledby="heading-tags"
				        type="button"
				        (click)="disableTags()"
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
							<button class="squareiconcard squareiconcard-tags"
											type="button"
											(click)="enableTags()"
											[disabled]="tagsEnabled"
							>
								<span class="squareiconcard-x-container">Tags</span>
							</button>
						</div>
					</div>
				</div>

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
						<div class="l-formsectionnested wrap wrap-welldark" *ngFor="let extension of badgeclassExtensions.controls">

							<div *ngIf="extension.controls.LanguageExtension">
								<div>
									<span id=selectLangHeader class="l-formsection-x-legend title title-ruled"> Selected Language:</span>
									<div *ngIf="currentLangList[0].label != '' ">
											<div id="selected_langbox" class= "formfield-x-label"> {{ currentLangList[0].label }} </div>
									</div>
									<div *ngIf="currentLangList[0].label == '' ">
											<div id="selected_langbox"> No Language Selected </div>
									</div>
								</div><br>
								<bg-formfield-text (change)="autoFillLanguage()" [control]="extension.controls.LanguageExtension.controls.typedLanguage" label="Please Type in the Language" ></bg-formfield-text>
								<button class="l-formsectionnested-x-remove formsectionremove"
								        (click)="removeExtension(extension)"
								        type="button"
								>Remove</button>
							</div>

							<div *ngIf="extension.controls.ECTSExtension">
								<bg-formfield-text [control]="extension.controls.ECTSExtension.controls.ECTS" label="Please Type in the ECTS" ></bg-formfield-text>
								<button class="l-formsectionnested-x-remove formsectionremove"
								        (click)="removeExtension(extension)"
								        type="button"
								>Remove</button>
							</div>

							<div *ngIf="extension.controls.NiveauExtension">
								<bg-formfield-text [control]="extension.controls.NiveauExtension.controls.EQF" label="Please Type in the EQF" ></bg-formfield-text>
								<button class="l-formsectionnested-x-remove formsectionremove"
												(click)="removeExtension(extension)"
												type="button"
								>Remove</button>
							</div>

							<div *ngIf="extension.controls.LearningOutcomeExtension">
								<bg-formfield-text [multiline]="true" [control]="extension.controls.LearningOutcomeExtension.controls.learningOutcome" label="Please Type in the learning Outcome" ></bg-formfield-text>
								<button class="l-formsectionnested-x-remove formsectionremove"
												(click)="removeExtension(extension)"
												type="button"
								>Remove</button>
							</div>

							<div *ngIf="extension.controls.EducationProgramIdentifierExtension">
								<bg-formfield-select
									label="Education Program Identifier"
									[control]="extension.controls.EducationProgramIdentifierExtension.controls.identifierType"
									[options]="educationProgramIdentifierOptions"
									[placeholder]="'No type selected'"
								></bg-formfield-select>

								<bg-formfield-text
									[control]="extension.controls.EducationProgramIdentifierExtension.controls.identifierValue"
								></bg-formfield-text>

								<button class="l-formsectionnested-x-remove formsectionremove"
												(click)="removeExtension(extension)"
												type="button"
								>Remove</button>
							</div>

						</div>
					</div>

				</div>
			</div>

			<!-- Extensions Adder Buttons -->

			<div class="l-formsection l-formsection-span wrap wrap-well" role="group" aria-labelledby="heading-addoptionaldetails">
				<h3 class="l-formsection-x-legend title title-ruled title-ruledadd" id="heading-addoptionaldetails">Add Extensions</h3>
					<div class="l-formsection-x-container">
						<div class="l-formsection-x-inputs">
							<div class="l-squareiconcards">

								<button class="squareiconcard squareiconcard-extension"
								        type="button"
								        (click)="addExtension('LanguageExtension')"
								        [disabled]="LanguageExtensionEnabled"
								>
									<span class="squareiconcard-x-container">Language</span>
								</button>

								<button class="squareiconcard squareiconcard-extension"
								        type="button"
								        (click)="addExtension('ECTSExtension')"
								        [disabled]="ECTSExtensionEnabled"
								>
									<span class="squareiconcard-x-container">ECTS</span>
								</button>

								<button class="squareiconcard squareiconcard-extension"
								        type="button"
								        (click)="addExtension('NiveauExtension')"
								        [disabled]="NiveauExtensionEnabled"
								>
									<span class="squareiconcard-x-container">EQF</span>
								</button>

								<button class="squareiconcard squareiconcard-extension"
								        type="button"
								        (click)="addExtension('LearningOutcomeExtension')"
								        [disabled]="LearningOutcomeExtensionEnabled"
								>
									<span class="squareiconcard-x-container">learning outcome</span>
								</button>

								<button class="squareiconcard squareiconcard-extension"
								        type="button"
								        (click)="addExtension('EducationProgramIdentifierExtension')"
								        [disabled]="EducationProgramIdentifierExtensionEnabled"
								>
									<span class="squareiconcard-x-container">edu program identifier</span>
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

	@ViewChild("newTagInput")
	newTagInput: ElementRef;

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

		this.badgeClassForm = fb.group({
			badge_name: [
				'',
				Validators.compose([
					Validators.required,
					Validators.maxLength(255)
				])
			],
			badge_image: [ '', Validators.required ],
			badge_description: [ '', Validators.required ],
			badge_criteria_url: [ '' , UrlValidator.validUrl],
			badge_criteria_text: [ '' ],
			alignments: fb.array([]),
			extensions: fb.array([])
		} as BasicBadgeForm<any[], FormArray, FormArray> , {
			validator: this.criteriaRequired
		});

		let langs = RFC5646LanguageTags.langs
		this.languageOptions = langs.map((l) => {
			return {
				label: l.label,
				value: l.value
			};
		});

		let program_ids = [{'type': 'ISAT'}]
		this.educationProgramIdentifierOptions = program_ids.map((i) => {
			return {
				label: i.type,
				value: i.type
			};
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
			extensions: this.fb.array(Object.keys(this.badgeClass.extensions).map(extension => this.initExtensionFromExisting(extension))),
			alignments: this.fb.array(this.badgeClass.alignments.map(alignment => this.fb.group({
				target_name: [ alignment.target_name, Validators.required ],
				target_url: [ alignment.target_url, Validators.compose([Validators.required, UrlValidator.validUrl]) ],
				target_description: [ alignment.target_description ],
				target_framework: [ alignment.target_framework ],
				target_code: [ alignment.target_code ],
			} as AlignmentFormGroup<any[]>)))
		} as BasicBadgeForm<any[], FormArray, FormArray> , {
			validator: this.criteriaRequired
		});

		this.tags = new Set();
		this.badgeClass.tags.forEach(t => this.tags.add(t));

		this.tagsEnabled = this.tags.size > 0;
		this.alignmentsEnabled = this.badgeClass.alignments.length > 0;
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

	//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
	// Tags
	tagsEnabled = false;
	tags = new Set<string>();

	enableTags() {
		this.tagsEnabled = true;
	}

	disableTags() {
		this.tagsEnabled = false;
	}

	addTag() {
		const newTag = ((this.newTagInput.nativeElement as HTMLInputElement).value || "").trim().toLowerCase();

		if (newTag.length > 0) {
			this.tags.add(newTag);
			(this.newTagInput.nativeElement as HTMLInputElement).value = "";
		}
	}

	handleTagInputKeyPress(event: KeyboardEvent) {
		if (event.keyCode == 13 /* Enter */) {
			this.addTag();
			(this.newTagInput.nativeElement as HTMLInputElement).focus();
			event.preventDefault();
		}
	}

	removeTag(tag: string) {
		this.tags.delete(tag);
	}


	//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
	// Extensions

	extensionsEnabled = false;
	LanguageExtensionEnabled = false;
	ECTSExtensionEnabled = false
	NiveauExtensionEnabled = false
	LearningOutcomeExtensionEnabled = false
	EducationProgramIdentifierExtensionEnabled = false
	educationProgramIdentifierOptions: FormFieldSelectOption[];

	autoFillLanguage(){
		for (let extension of this.badgeClassForm.controls['extensions']['controls']){
			if (extension.controls.LanguageExtension) {
				let currentLanguage = this.currentLangList[0].label
				extension.controls.LanguageExtension.controls.typedLanguage.patchValue(currentLanguage)
			}
		}
	}

	get extensions() {
		return this.badgeClassForm.controls["extensions"] as FormArray;
	}

	initExtensionFromExisting(extensionName: string){
		let extension = this.makeFormGroup(extensionName)
		this.enableExtension(extension)
		return extension
	}

	disableExtension(extension: FormGroup){
		let extensionName = Object.keys(extension.controls)[0]
		this[extensionName+'Enabled']=false
	}

	enableExtension(extension: FormGroup){
		let extensionName = Object.keys(extension.controls)[0]
		this.extensionsEnabled = true
		this.enableFormListener()
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
		if (extensionName=='LanguageExtension'){
			let typedLanguage = ''
			let language = (this.badgeClass && this.badgeClass.extensions['LanguageExtension']) ? this.badgeClass.extensions['LanguageExtension']['language'] : ''
			if (language) { // if language is already there, fill typedLanguage with corresponding label
				let langForPreset = this.languageOptions.filter(lang => lang.value == language)
				typedLanguage = langForPreset[0]['label']
			}
			return this.fb.group({
					LanguageExtension: this.fb.group({
						language: [language],
						typedLanguage: [typedLanguage, Validators.required],
					})
				})
		}
		if (extensionName=='ECTSExtension'){
			let ects = (this.badgeClass && this.badgeClass.extensions['ECTSExtension']) ? this.badgeClass.extensions['ECTSExtension']['ECTS'] : ''
			return this.fb.group({
				ECTSExtension: this.fb.group({
					ECTS: [ects, Validators.compose([Validators.required, NumericValidator.validNumber])]
				})
			})
		}
		if (extensionName=='NiveauExtension'){
			let eqf = (this.badgeClass && this.badgeClass.extensions['NiveauExtension']) ? this.badgeClass.extensions['NiveauExtension']['EQF'] : ''
			return this.fb.group({
				NiveauExtension: this.fb.group({
					EQF: [eqf, Validators.required]
				})
			})
		}
		if (extensionName=='LearningOutcomeExtension'){
			let learningOutcome = (this.badgeClass && this.badgeClass.extensions['LearningOutcomeExtension']) ? this.badgeClass.extensions['LearningOutcomeExtension']['learningOutcome'] : ''
			return this.fb.group({
				LearningOutcomeExtension: this.fb.group({
					learningOutcome: [learningOutcome, Validators.required]
				})
			})
		}
		if (extensionName=='EducationProgramIdentifierExtension'){
			let identifierType = (this.badgeClass && this.badgeClass.extensions['EducationProgramIdentifierExtension']) ? this.badgeClass.extensions['EducationProgramIdentifierExtension']['identifierType'] : ''
			let identifierValue = (this.badgeClass && this.badgeClass.extensions['EducationProgramIdentifierExtension']) ? this.badgeClass.extensions['EducationProgramIdentifierExtension']['identifierValue'] : ''
			return this.fb.group({
				EducationProgramIdentifierExtension: this.fb.group({
					identifierType: [identifierType, Validators.required],
					identifierValue: [identifierValue, Validators.required]
				})
			})
		}
	}


	addExtension(extensionName: string){
	 let extension = this.makeFormGroup(extensionName)
	 this.extensions.push(extension);
	 this.enableExtension(extension)
	}
	////// language dropdown ///////////////
	languageOptions : Array<any>;
	currentLangList = [{label: '', value: ''}];

	getCurrentTypedLanguage(extensions){
		for (let extension of extensions){
			if (Object.keys(extension)[0]=='LanguageExtension'){
				if (extension['LanguageExtension']['typedLanguage']){
					return extension['LanguageExtension']['typedLanguage']
				}
			}
		}
		return ''
	}

	setLanguage(language) {
		for (let extension of this.badgeClassForm.controls['extensions']['controls']){
			if (extension.controls.LanguageExtension) {
				let currentLanguage = extension.controls.LanguageExtension.controls.language.value
				if (currentLanguage!=language){
					extension.controls.LanguageExtension.controls.language.patchValue(language)
				}
			}
		}
	}

	onLangChange(extensions) {
		if (extensions) {
			let currentValue = this.getCurrentTypedLanguage(extensions)
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

	async onSubmit(formState: BasicBadgeForm<string, ApiBadgeClassAlignment[], Object[]>) {
		if (this.existingBadgeClass) {
			this.existingBadgeClass.name = formState.badge_name;
			this.existingBadgeClass.description = formState.badge_description;
			this.existingBadgeClass.image = formState.badge_image;
			this.existingBadgeClass.criteria_text = formState.badge_criteria_text;
			this.existingBadgeClass.criteria_url = formState.badge_criteria_url;
			this.existingBadgeClass.alignments = this.alignmentsEnabled ? formState.alignments : [];
			this.existingBadgeClass.extensions = this.extensionsEnabled ? formState.extensions : [];
			this.existingBadgeClass.tags = this.tagsEnabled ? Array.from(this.tags) : [];
			this.savePromise = this.existingBadgeClass.save();
		} else {
			const badgeClassData = {
				name: formState.badge_name,
				description: formState.badge_description,
				image: formState.badge_image,
				criteria_text: formState.badge_criteria_text,
				criteria_url: formState.badge_criteria_url,
				tags: this.tagsEnabled ? Array.from(this.tags) : [],
				alignment: this.alignmentsEnabled ? formState.alignments : [],
				extensions:this.extensionsEnabled ? formState.extensions : []
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
