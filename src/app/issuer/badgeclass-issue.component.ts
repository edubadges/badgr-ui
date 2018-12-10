import { Component, OnInit } from "@angular/core";
import {
	FormBuilder, FormControl, Validators
} from "@angular/forms";
import {  ActivatedRoute , Router} from "@angular/router";
import { Title } from "@angular/platform-browser";
import { SessionService } from "../common/services/session.service";
import { MessageService } from "../common/services/message.service";
import { BaseAuthenticatedRoutableComponent } from "../common/pages/base-authenticated-routable.component";
import { EmailValidator, ValidationResult } from "../common/validators/email.validator";
import { UrlValidator } from "../common/validators/url.validator";
import { MdImgValidator } from "../common/validators/md-img.validator";

import {BadgeInstanceManager} from "./services/badgeinstance-manager.service";
import {BadgeClassManager} from "./services/badgeclass-manager.service";
import {IssuerManager} from "./services/issuer-manager.service";

import {Issuer} from "./models/issuer.model";
import {BadgeClass} from "./models/badgeclass.model";
import { CommonDialogsService } from "../common/services/common-dialogs.service";
import { BadgrApiFailure } from "../common/services/api-failure";
// import { RecipientIdentifierType } from "./models/badgeinstance-api.model";
import { typedGroup } from "../common/util/typed-forms";
import { TelephoneValidator } from "../common/validators/telephone.validator";
import {EventsService} from "../common/services/events.service";
import { StudentsEnrolledApiService } from "../issuer/services/studentsenrolled-api.service";
import { FormFieldTextInputType } from '../common/components/formfield-text';
import * as sanitizeHtml from "sanitize-html";

@Component({
	selector: 'badgeclass-issue',
	template: `
		<main *bgAwaitPromises="[ issuerLoaded, badgeClassLoaded ]">
			<form-message></form-message>

			<header class="wrap wrap-light l-containerhorizontal l-heading">
				<nav>
					<h1 class="visuallyhidden">Breadcrumbs</h1>
					<ul class="breadcrumb">
						<li><a [routerLink]="['/issuer']">Issuers</a></li>
						<li><a [routerLink]="['/issuer/issuers', issuerSlug]">{{issuer.name}}</a></li>
						<li><a [routerLink]="['/issuer/issuers', issuerSlug, 'badges', badge_class.slug]" [truncatedText]="badge_class.name" [maxLength]="64"></a></li>
						<li class="breadcrumb-x-current">Award Badge</li>
					</ul>
				</nav>

				<header class="heading">
					<div class="heading-x-text">
						<h1 id="heading-awardbadge">Award Badge</h1>
						<p>
							Award badges to individuals below, or <a [routerLink]="['/issuer/issuers', issuerSlug, 'badges', badgeSlug, 'bulk-import']"
							>click here to bulk award</a> to multiple recipients at once.
						</p>
					</div>
				</header>
			</header>

			<form class="l-containerhorizontal l-containervertical"
			      [formGroup]="issueForm.untypedControl"
			      (ngSubmit)="onSubmit()"
			      novalidate
			>
				<!-- Recipient Information -->

				<div class="l-formsection wrap wrap-well" role="group" aria-labelledby="heading-recipientinformation">
					<h3 class="l-formsection-x-legend title title-ruled" id="heading-recipientinformation">Enrolled Students</h3>
					<div class="l-formsection-x-container">
						<div class="l-formsection-x-help">
							<h4 class="title title-bordered" id="heading-badgeawarding">Badge Awarding</h4>
							<p class="text text-small">You can award badges by selecting students and clicking on award below. Double check your selection before awarding, cancelling them can only be done through revokation.</p>
						</div>
						<div *ngIf="!issueForm.controls.recipients.controls.length" class="l-formsection-x-inputs">
							<p class="text text-small">No students are enrolled.</p>
						</div>
						<div *ngIf="issueForm.controls.recipients.controls.length" class="l-formsection-x-inputs">
							<label class="formcheckbox">
								<input name="form-checkbox2" id="form-checkbox2" type="checkbox" (change)="selectAllStudents()">
								<span class="formcheckbox-x-text formcheckbox-x-text-sharebadge">Select All Students</span>
							</label>

							<div class="l-formsectionnested wrap wrap-welldark"
								*ngFor="let recipient of issueForm.controls.recipients.controls; let i=index"
							>
								<label class="formcheckbox">
									<input name="form-checkbox2" id="form-checkbox2" type="checkbox" [formControl]="recipient.untypedControls.selected">
									<span class="formcheckbox-x-text formcheckbox-x-text-sharebadge">Award Badge to this Student</span>
								</label>
								<div class="heading">
									<div class="heading-x-text">
										<section><h1>{{recipient.untypedControls.recipient_name.value}}</h1></section>
									</div>
								</div>
								<div class="formfield ">
									<label>EduID: {{recipient.untypedControls.recipient_identifier.value}}</label>
								</div>
							</div>

						</div>
					</div>
				</div>

				<!-- Narrative -->
				<div class="l-formsection wrap wrap-well"
				     role="group"
				     aria-labelledby="heading-narrative"
				     *ngIf="narrativeEnabled"
				>
					<h3 class="l-formsection-x-legend title title-ruled" id="heading-narrative">Narrative</h3>
					<div class="l-formsection-x-container">
						<div class="l-formsection-x-help">
							<h4 class="title title-bordered" id="heading-narrativehelp">Narrative</h4>
							<p class="text text-small">
								The narrative is an overall description of the achievement related to the badge.
							</p>
							<a class="button button-tertiaryghost"
							   href="https://support.badgr.io/pages/viewpage.action?pageId=2981918"
							   aria-labelledby="heading-narrativehelp"
							   target="_blank"
							>Learn More</a>
						</div>
						<div class="l-formsection-x-inputs">
							<bg-formfield-markdown
								class="l-formsection-x-inputoffset"
								[control]="issueForm.untypedControls.narrative"
								label="How did the recipients earn this badge?"
							></bg-formfield-markdown>
						</div>
					</div>
					<button class="l-formsection-x-remove formsectionremove"
					        type="button"
					        aria-labelledby="formsection"
					        (click)="narrativeEnabled = false"
					>Remove</button>
				</div>

				<!-- Evidence -->
				<div class="l-formsection wrap wrap-well"
				     role="group"
				     aria-labelledby="heading-evidence"
				     *ngIf="evidenceEnabled"
				>
					<h3 class="l-formsection-x-legend title title-ruled" id="heading-evidence">Evidence</h3>
					<div class="l-formsection-x-container">
						<div class="l-formsection-x-help">
							<h4 class="title title-bordered" id="heading-whatsevidence">What's Evidence?</h4>
							<p class="text text-small">
								Evidence is submitted proof that an earner meets the criteria for a badge they are applying for. This
								can be in the form of a narrative that describes the evidence and process of achievement, and/or a URL
								of a web page presenting the evidence of achievement.
							</p>
							<a class="button button-tertiaryghost"
							   href="https://support.badgr.io/pages/viewpage.action?pageId=2981918"
							   aria-labelledby="heading-whatsevidence"
							   target="_blank"
							>Learn More</a>
						</div>
						<div class="l-formsection-x-inputs">
							<div class="l-formsectionnested wrap wrap-welldark"
							     *ngFor="let evidence of issueForm.controls.evidence_items.controls; let i=index"
							>
								<h5 class="visuallyhidden" id="heading-nestedevidence"></h5>
								<bg-formfield-markdown
									[control]="evidence.untypedControls.narrative"
									label="How is this badge earned?"
								></bg-formfield-markdown>

								<bg-formfield-text
									class="l-marginTop-4x"
									[control]="evidence.untypedControls.evidence_url"
									label="URL to Evidence Page"
									fieldType="url"
									[urlField]="true"
									errorMessage="Please enter a valid URL"
								></bg-formfield-text>

								<button class="l-formsectionnested-x-remove formsectionremove"
								        type="button"
								        aria-labelledby="heading-nestedevidence"
								        *ngIf="issueForm.controls.evidence_items.length > 1"
								        (click)="removeEvidence(i)"
								>Remove</button>
							</div>
							<button class="buttonicon buttonicon-add"
							        type="button"
							        (click)="addEvidence()"
							>
								Add Additional Evidence
							</button>
						</div>
					</div>
					<button class="l-formsection-x-remove formsectionremove"
					        type="button"
					        aria-labelledby="heading-evidence"
					        (click)="evidenceEnabled = false"
					>Remove</button>
				</div>

				<!-- Add Optional Details -->
				<div class="l-formsection l-formsection-span wrap wrap-well" role="group" aria-labelledby="heading-addoptionaldetails">
					<h3 class="l-formsection-x-legend title title-ruled title-ruledadd" id="heading-addoptionaldetails">Add Optional Details</h3>
					<div class="l-formsection-x-container">
						<div class="l-formsection-x-inputs">
							<div class="l-squareiconcards">
								<button class="squareiconcard squareiconcard-narrative"
								        type="button"
								        [disabled]="narrativeEnabled"
								        (click)="narrativeEnabled = true">
									<span class="squareiconcard-x-container">Narrative</span>
								</button>
								<button class="squareiconcard squareiconcard-evidence"
								        type="button"
								        [disabled]="evidenceEnabled"
								        (click)="enableEvidence()">
									<span class="squareiconcard-x-container">Evidence</span>
								</button>
							</div>
						</div>
					</div>
				</div>

				<hr class="rule l-rule" />

				<!-- Buttons -->
				<div class="l-childrenhorizontal l-childrenhorizontal-right">
					<a [routerLink]="['/issuer/issuers', issuer.slug, 'badges', badge_class.slug]"
					   type="submit"
					   class="button button-primaryghost"
					   [disabled-when-requesting]="true"
					>Cancel</a>
					
					<button *ngIf="awardButtonEnabled" type="submit"
					        class="button"
					        [disabled]="!! issueBadgeFinished"
					        (click)="clickSubmit($event)"
					        [loading-promises]="[ issueBadgeFinished ]"
					        loading-message="Issuing"
					>Award</button>
					
					<button *ngIf="!awardButtonEnabled"
									class="button"
					        [disabled]="true"
									style = 'background:#A09EAF;'
					>Award</button>
					
				</div>
			</form>
		</main>
	`
})
export class BadgeClassIssueComponent extends BaseAuthenticatedRoutableComponent implements OnInit {



	issuer: Issuer;
	issueForm = typedGroup()
		.addControl("narrative", "", MdImgValidator.imageTest)
		.addControl("notify_earner", true)
		.addArray("evidence_items", typedGroup()
			.addControl("narrative", "")
			.addControl("evidence_url", "")
		)
		.addArray("recipients", typedGroup()
			.addControl("recipient_name", "")
			.addControl("recipient_type", "id")
			.addControl("recipient_identifier", "", [ Validators.required ])
			.addControl("selected", false)
			.addControl("selected_for_removal", false)
		)

	badge_class: BadgeClass;

	issueBadgeFinished: Promise<any>;
	issuerLoaded: Promise<any>;
	badgeClassLoaded: Promise<any>;

	evidenceEnabled = false;
	narrativeEnabled = false;
	enrolledStudents = [];

	constructor(
		protected title: Title,
		protected messageService: MessageService,
		protected eventsService: EventsService,
		protected issuerManager: IssuerManager,
		protected badgeClassManager: BadgeClassManager,
		protected badgeInstanceManager: BadgeInstanceManager,
		protected dialogService: CommonDialogsService,
		protected studentsEnrolledApiService: StudentsEnrolledApiService,
		sessionService: SessionService,
		router: Router,
		route: ActivatedRoute
	) {
		super(router, route, sessionService);
		title.setTitle("Award Badge - Badgr");

		this.issuerLoaded = this.issuerManager.issuerBySlug(this.issuerSlug).then((issuer) => {
			this.issuer = issuer;

			this.badgeClassLoaded = this.badgeClassManager.badgeByIssuerUrlAndSlug(
				issuer.issuerUrl,
				this.badgeSlug
			).then((badge_class) => {
				this.badge_class = badge_class;
				this.title.setTitle("Award Badge - " + badge_class.name + " - Badgr");
				this.studentsEnrolledApiService.getEnrolledStudents(this.badgeSlug)
					.then(r => this.addRecipientsFromStudents(r))
			});
		});
	}

	get issuerSlug() {
		return this.route.snapshot.params[ 'issuerSlug' ]
	}

	get badgeSlug() {
		return this.route.snapshot.params[ 'badgeSlug' ]
	}

	ngOnInit() {
		super.ngOnInit();
		this.enableFormListener()
	}

	enableEvidence() {
		this.evidenceEnabled = true;

		if (this.issueForm.controls.evidence_items.length < 1) {
			this.addEvidence();
		}
	}

	allStudentsSelected = false
	selectAllStudents(){
		this.allStudentsSelected = this.allStudentsSelected? false: true
		for (let recipient of this.issueForm.controls.recipients.controls){
			recipient.untypedControl.patchValue({'selected': this.allStudentsSelected? true: false})
		}
	}

	listener_is_on = false
	awardButtonEnabled = false
	onFormChange(formValues){
		console.log(formValues)
		if (formValues['recipients']){
			let aRecipientIsSelected = false
			for (let recipient of formValues['recipients']){
					if (recipient['selected']){
						aRecipientIsSelected = true
					}
			}
			this.awardButtonEnabled = aRecipientIsSelected
		} else {
			this.awardButtonEnabled = false
		}
		
	}
	enableFormListener(){
		if (!this.listener_is_on){
			this.issueForm.untypedControl.valueChanges.subscribe(values => this.onFormChange(values))
		}
	}

	addRecipientsFromStudents(enrolledStudents){
			for (let index in enrolledStudents){
				let student=enrolledStudents[index]
				this.addRecipient(student)
			}
		}

	addRecipient(recipient) {
		if (!recipient['assertion_slug']){
			let first_name = recipient['first_name']? recipient['first_name']: ''
			let last_name = recipient['last_name']? recipient['last_name']: ''
			let name = first_name+' '+last_name
			const recipientProfileContextUrl = "https://openbadgespec.org/extensions/recipientProfile/context.json";
			let recipientFormGroup = typedGroup()
			.addControl("recipient_name", name)
			.addControl("recipient_type", 'id')
			.addControl("recipient_identifier", recipient['edu_id'], [ Validators.required ])
			.addControl("selected", false)
			.addControl("selected_for_removal", false)
			.addControl("extensions", typedGroup()
				.addControl("extensions:recipientProfile", typedGroup()
					.addControl("@context", recipientProfileContextUrl)
					.addControl("type", ["Extension", "extensions:RecipientProfile"])
					.addControl("name", name)
				)
			)
			this.issueForm.controls.recipients.push(recipientFormGroup);
		}
	}

	addEvidence() {
		this.issueForm.controls.evidence_items.addFromTemplate();
	}

	onSubmit() {
		const formState = this.issueForm.value;
		let cleanedEvidence = formState.evidence_items.filter(e => e.narrative != "" || e.evidence_url != "");
		this.issueBadgeFinished = this.badgeInstanceManager.createBadgeInstance(
			this.issuerSlug,
			this.badgeSlug,
			{
				issuer: this.issuerSlug,
				badge_class: this.badgeSlug,
				narrative: this.narrativeEnabled ? formState.narrative : "",
				create_notification: formState.notify_earner,
				evidence_items: this.evidenceEnabled ? cleanedEvidence : [],
				recipients: formState.recipients,
				// extensions: extensions
			}
		).then(() => this.badge_class.update())
			.then(() => {
			this.eventsService.recipientBadgesStale.next([]);
			this.router.navigate(
				['issuer/issuers', this.issuerSlug, 'badges', this.badge_class.slug]
			);
			this.messageService.setMessage("Badge(s) succesfully awarded");
		}, error => {
			this.messageService.setMessage("Unable to award badge: " + BadgrApiFailure.from(error).firstMessage, "error");
		}).then(() => this.issueBadgeFinished = null)
	}

	async removeEvidence(i: number) {
		const evidence = this.issueForm.controls.evidence_items.value[i];

		if ((evidence.narrative.length == 0 && evidence.evidence_url.length == 0)
			|| await this.dialogService.confirmDialog.openTrueFalseDialog({
				dialogTitle: `Delete Evidence?`,
				dialogBody: `Are you sure you want to delete this evidence?`,
				resolveButtonLabel: `Delete Evidence`,
				rejectButtonLabel: "Cancel"
			})) {
			this.issueForm.controls.evidence_items.removeAt(i);
		}
	}

	clickSubmit(ev: Event) {
		if (!this.issueForm.valid) {
			ev.preventDefault();
			this.issueForm.markTreeDirty();
		}
	}
}
