import { SystemConfigService } from './../common/services/config.service';
import { UserProfileManager } from './../common/services/user-profile-manager.service';
import { Component, OnInit } from "@angular/core";
import { Validators } from "@angular/forms";
import {  ActivatedRoute , Router} from "@angular/router";
import { Title } from "@angular/platform-browser";
import { SessionService } from "../common/services/session.service";
import { MessageService } from "../common/services/message.service";
import { BaseAuthenticatedRoutableComponent } from "../common/pages/base-authenticated-routable.component";
import { DateValidator } from "../common/validators/date.validator";
import { MdImgValidator } from "../common/validators/md-img.validator";

import {BadgeInstanceManager} from "./services/badgeinstance-manager.service";
import {BadgeClassManager} from "./services/badgeclass-manager.service";
import {IssuerManager} from "./services/issuer-manager.service";

import {Issuer, IssuerStaffMember} from "./models/issuer.model";
import {BadgeClass} from "./models/badgeclass.model";
import { CommonDialogsService } from "../common/services/common-dialogs.service";
import { BadgrApiFailure } from "../common/services/api-failure";
import { typedGroup } from "../common/util/typed-forms";
import {EventsService} from "../common/services/events.service";
import { StudentsEnrolledApiService } from "../issuer/services/studentsenrolled-api.service";

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
					<h3 *ngIf="!issueForm.controls.recipients.controls.length" 
						class="l-formsection-x-legend title title-ruled" id="heading-recipientinformation">No Badge Requests</h3>
					<h3 *ngIf="issueForm.controls.recipients.controls.length == 1" 
						class="l-formsection-x-legend title title-ruled" id="heading-recipientinformation">1 Badge Request</h3>
					<h3 *ngIf="issueForm.controls.recipients.controls.length > 1" 
						class="l-formsection-x-legend title title-ruled" id="heading-recipientinformation">{{issueForm.controls.recipients.controls.length}} Badge Requests</h3>
					<br>
					<h4 class="title title-bordered" id="heading-badgeawarding">Badge Awarding</h4>
					<p class="text text-small">You can award badges by selecting students and clicking on award below. Double check your selection before awarding, canceling them can only be done through revokation of a badge.</p>
					
					<div class="l-formsection-x-container">

					<!-- Enrollments -->
						<div *ngIf="issueForm.controls.recipients.controls.length" class="l-formsection-x-inputs">
							<label class="formcheckbox">
								<input 
										name="form-checkbox2" 
										id="form-checkbox2" 
										type="checkbox" 
										[formControl]="issueForm.controls.does_expire.untypedControl">
								<span class="formcheckbox-x-text formcheckbox-x-text-sharebadge" style="color:green;">Set an expiration date.</span>
							</label>
							<div *ngIf="issueForm.controls.does_expire.untypedControl.value">
								<span class="formcheckbox-x-text formcheckbox-x-text-sharebadge">The expiration date will only be set for the badges that you will award next.</span>
								<br><br>
								<dp-date-picker
									[formControl]="issueForm.controls.expires_at.untypedControl"
								></dp-date-picker>
								<span *ngIf="hasDateError" class="formcheckbox-x-text formcheckbox-x-text-sharebadge" style="color:red;">Date must be set in the future.</span>
							</div>

							<div *ngIf="issueForm.controls.recipients.controls.length">
								<hr class="rule l-rule">
								<br>
								<button type="button"
									class="button button-right"
									(click)="denyAllEnrollments()"
								>Deny All</button>
							</div><br>
							<label [style.display]="issueForm.controls.recipients.controls.length?'inline-block':'none'" class="formcheckbox">
								<input name="form-checkbox2" id="form-checkbox2" type="checkbox" (change)="selectAllStudents()">
								<span class="formcheckbox-x-text formcheckbox-x-text-sharebadge" style="color:green;">Select All for Awarding</span>
							</label>
							<div *ngIf="issueForm.controls.recipients.controls.length">
								<div class="l-formsectionnested wrap wrap-welldark"
									*ngFor="let recipient of issueForm.controls.recipients.controls; let i=index"
								>
									<div>
										<label class="formcheckbox" style="display:inline-block;">
											<input name="form-checkbox2" id="form-checkbox2" type="checkbox" [formControl]="recipient.untypedControls.selected">
											<span class="formcheckbox-x-text formcheckbox-x-text-sharebadge" style="color:green;">Award Badge to this Student</span>
										</label>
										<button type="button"
											class="button button-right"
											(click)="denyEnrollment(i)"
										>Deny Badge Request</button>
									</div>
									<div class="heading">
										<div class="heading-x-text">
											<section><h1>{{recipient.untypedControls.recipient_name.value}}</h1></section>
										</div>
									</div>
									<div class="formfield">
										<label>Email: {{recipient.untypedControls.recipient_email.value}}</label>
									</div>
									<div class="formfield">
										<label>EduID: {{recipient.untypedControls.recipient_identifier.value}}</label>
									</div>
								</div>
							</div>
						</div>
					</div>

					<!-- Denied Enrollments -->
					<div class="l-formsection-x-container">
						<div *ngIf="issueForm.controls.deniedRecipients.controls.length" class="l-formsection-x-inputs">
						<hr class="rule l-rule">
							<button 
								*ngIf="!showDeniedEnrollments"
								type="button"
								class="button-secondaryghost"
								(click)="toggleDeniedEnrollments()"
							>Show denied badge requests</button>
							<button 
								*ngIf="showDeniedEnrollments"
								type="button"
								class="button-secondaryghost"
								(click)="toggleDeniedEnrollments()"
							>Hide denied badge requests</button>


							<div *ngIf="showDeniedEnrollments">
								<div>
									<h4 class="title title-bordered" id="heading-badgeawarding">Denied Badge Requests</h4>
								</div>
								<br>
								<div class="l-formsectionnested wrap wrap-welldark" *ngFor="let recipient of issueForm.controls.deniedRecipients.controls; let i=index">
									
									<label class="formcheckbox" style="display:inline-block;">
										<input name="form-checkbox2" id="form-checkbox2" type="checkbox" [formControl]="recipient.untypedControls.denied">
									</label>
									<button type="button"
										class="button button-right"
										(click)="undoDenyEnrollment(i)"
									>Undo Denial</button>
									<div class="heading">
										<div class="heading-x-text">
											<section><h1>{{recipient.untypedControls.recipient_name.value}}</h1></section>
										</div>
									</div>
									<div class="formfield">
										<label>Email: {{recipient.untypedControls.recipient_email.value}}</label>
									</div>
									<div class="formfield ">
										<label>EduID: {{recipient.untypedControls.recipient_identifier.value}}</label>
									</div>
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
					        (click)="clickSubmit($event, false)"
					        [loading-promises]="[ issueBadgeFinished ]"
					        loading-message="Issuing"
					>Award</button>

					<button *ngIf="!awardButtonEnabled"
									class="button"
					        [disabled]="true"
									style = 'background:#A09EAF;'
					>Award</button>

					<ng-container *ngIf="signingEnabled">
						<ng-container  *bgAwaitPromises='[permissionsLoaded]'>
							<button
											*ngIf="awardButtonEnabled && userMaySignBadges && currentUserIsSigner"
											class="button"
											[disabled]="!! issueBadgeFinished"
											(click)="clickSubmit($event, true)"
											[loading-promises]="[ issueBadgeFinished ]"
											loading-message="Issuing"
							>Award Signed</button>
							<button *ngIf="!awardButtonEnabled && userMaySignBadges && currentUserIsSigner"
										class="button"
										[disabled]="true"
										style = 'background:#A09EAF;'
							>Award Signed</button>
						</ng-container>
					</ng-container>	
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
		.addControl("expires_at", undefined)
		.addControl("does_expire", false)
		.addControl("issue_signed", false)
		.addArray("evidence_items", typedGroup()
			.addControl("narrative", "")
			.addControl("evidence_url", "",[UrlValidator.validUrl])
		)
		.addArray("recipients", typedGroup()
			.addControl("recipient_name", "")
			.addControl("recipient_email", "")
			.addControl("recipient_type", "id")
			.addControl("recipient_identifier", "", [ Validators.required ])
			.addControl("selected", false)
			.addControl("denied", false)
		)
		.addArray("deniedRecipients", typedGroup()
			.addControl("recipient_name", "")
			.addControl("recipient_email", "")
			.addControl("recipient_type", "id")
			.addControl("recipient_identifier", "", [ Validators.required ])
			.addControl("selected", false)
			.addControl("denied", false)
		)

	badge_class: BadgeClass;

	issueBadgeFinished: Promise<any>;
	issuerLoaded: Promise<any>;
	badgeClassLoaded: Promise<any>;
	permissionsLoaded: Promise<any>;

	userMaySignBadges: boolean = false;
	currentUserIsSigner: boolean = false;

	hasDateError = false
	evidenceEnabled = false;
	narrativeEnabled = false;
	enrolledStudents = [];
	showDeniedEnrollments = false;

	get signingEnabled() { return this.configService.signingEnabled }

	constructor(
		private configService: SystemConfigService,
		protected title: Title,
		protected messageService: MessageService,
		protected eventsService: EventsService,
		protected issuerManager: IssuerManager,
		protected badgeClassManager: BadgeClassManager,
		protected badgeInstanceManager: BadgeInstanceManager,
		protected dialogService: CommonDialogsService,
		protected studentsEnrolledApiService: StudentsEnrolledApiService,
		protected userProfileManager: UserProfileManager,
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

			this.permissionsLoaded = this.userProfileManager.userProfilePromise
			.then(profile => {
				var current_user_permissions = JSON.parse(profile.apiModel['user_permissions'])
				this.userMaySignBadges = current_user_permissions.includes('may_sign_assertions');
				
				for (let index in issuer.staff.entities) {
					let member = issuer.staff.entities[index] as IssuerStaffMember
					if (member.isSigner && profile.email == member.email) {
						this.currentUserIsSigner = true
					} 
				}
			})

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
			let b = this.allStudentsSelected? true: false
			recipient.untypedControl.patchValue({'selected': this.allStudentsSelected? true: false})
		}
	}

	listener_is_on = false
	awardButtonEnabled = false
	onFormChange(){
		if (this.issueForm.controls.expires_at.invalid) {
			this.hasDateError = true
		} else {
			this.hasDateError = false
		}
		if (this.issueForm.controls.recipients){
			let oneIsSelected = false
			for (let recipient of this.issueForm.controls.recipients.controls){
				if (recipient.controls.selected.value){
					oneIsSelected = true 
				}
			}
				this.awardButtonEnabled = oneIsSelected
			} else {
				this.awardButtonEnabled = false
			}
	}	
	
	enableFormListener(){
		if (!this.listener_is_on){
			this.issueForm.untypedControl.valueChanges.subscribe(values => this.onFormChange())
			this.issueForm.controls.does_expire.untypedControl.valueChanges.subscribe(checked => {
				if (checked) {
					this.issueForm.controls.expires_at.untypedControl.setValidators([Validators.required, DateValidator.validDate])
				} else {
					this.issueForm.controls.expires_at.untypedControl.setValidators(null)
				}
			})
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
			let email = recipient['email']
			// const recipientProfileContextUrl = "https://openbadgespec.org/extensions/recipientProfile/context.json";
			let recipientFormGroup = typedGroup()
			.addControl("recipient_name", name)
			.addControl("recipient_email", email)
			.addControl("recipient_type", 'id')
			.addControl("recipient_identifier", recipient['edu_id'], [ Validators.required ])
			.addControl("selected", false)
			.addControl("denied", recipient['denied'])
			// .addControl("extensions", typedGroup()
			// 	.addControl("extensions:recipientProfile", typedGroup()
			// 		.addControl("@context", recipientProfileContextUrl)
			// 		.addControl("type", ["Extension", "extensions:RecipientProfile"])
			// 		.addControl("name", name)
			// 	)
			// )
			if (!recipient['denied']) {
				this.issueForm.controls.recipients.push(recipientFormGroup);
			} else if (recipient['denied']) {
				this.issueForm.controls.deniedRecipients.push(recipientFormGroup);
			}
		}
	}

	addEvidence() {
		this.issueForm.controls.evidence_items.addFromTemplate();
	}

	awardBadges(formState){
		let cleanedEvidence = formState.evidence_items.filter(e => e.narrative != "" || e.evidence_url != "");
			this.issueBadgeFinished = this.badgeInstanceManager.createBadgeInstance(
				this.issuerSlug,
				this.badgeSlug,
				{
					issuer: this.issuerSlug,
					badge_class: this.badgeSlug,
					narrative: this.narrativeEnabled ? formState.narrative : "",
					issue_signed: formState.issue_signed,
					signing_password: formState.password,
					create_notification: formState.notify_earner,
					evidence_items: this.evidenceEnabled ? cleanedEvidence : [],
					recipients: this.extractRecipients(),
					expires_at: formState.does_expire ? formState.expires_at : ""
				}
			).then(() => this.badge_class.update())
				.then(() => {
				this.eventsService.recipientBadgesStale.next([]);
				this.router.navigate(
					['issuer/issuers', this.issuerSlug, 'badges', this.badge_class.slug]
				);
				this.messageService.setMessage("Badge(s) succesfully awarded");
			}, error => {
				this.messageService.setMessage("Unable to award badge: " + BadgrApiFailure.from(error).verboseError, "error");
			}).then(() => this.issueBadgeFinished = null)
	}

	toggleDeniedEnrollments(){
		this.showDeniedEnrollments = this.showDeniedEnrollments? false: true
	}

	denyAllEnrollments(){
		let enrollmentMap = {}
		while (this.issueForm.controls.recipients.controls.length> 0){ // cannot loop through .length, creates infinite loop
			let enrollment = this.issueForm.controls.recipients.removeAt(0);
			let id = enrollment.controls.recipient_identifier.value
			enrollmentMap[id] = enrollment
		}
		for (let key of Object.keys(enrollmentMap)) {
			let enrollment = enrollmentMap[key]
			enrollment.untypedControl.patchValue({'denied': true})
			this.studentsEnrolledApiService.updateEnrollments(this.badgeSlug, enrollment.value)
			.then(() => {
				this.messageService.setMessage("Badge request succesfully updated");
				this.issueForm.controls.deniedRecipients.controls.push(enrollment)
			}, error => {
				this.messageService.setMessage("Unable to deny badge request: " + BadgrApiFailure.from(error).firstMessage, "error");
				this.issueForm.controls.recipients.controls.push(enrollment)
			})
		}
	}

	denyEnrollment(index){
		let enrollment = this.issueForm.controls.recipients.controls[index]
		enrollment.untypedControl.patchValue({'denied': true})
		enrollment.untypedControl.patchValue({'selected': false})
		this.studentsEnrolledApiService.updateEnrollments(this.badgeSlug, enrollment.value)
		.then(() => {
			this.messageService.setMessage("Badge request succesfully updated");
			this.issueForm.controls.recipients.removeAt(index);
			this.issueForm.controls.deniedRecipients.controls.push(enrollment)

		}, error => {
			this.messageService.setMessage("Unable to deny badge request: " + BadgrApiFailure.from(error).firstMessage, "error");
		})
	}
	
	
	undoDenyEnrollment(index){
		let enrollment = this.issueForm.controls.deniedRecipients.controls[index]
		enrollment.untypedControl.patchValue({'denied': false})
		this.studentsEnrolledApiService.updateEnrollments(this.badgeSlug, enrollment.value)
		.then(() => {
			this.messageService.setMessage("Badge requests succesfully updated");
			this.issueForm.controls.deniedRecipients.removeAt(index);
			this.issueForm.controls.recipients.controls.push(enrollment)
		}, error => {
			this.messageService.setMessage("Unable to undo badge request denial: " + BadgrApiFailure.from(error).firstMessage, "error");
		})
	}

	extractRecipients(){
		// extract recipients manually, because issueForm.value is not updated properly when calling controls.push
		let result = []
		let recipients = this.issueForm.controls.recipients.controls
		for (let recipient of recipients){
			let recipientObject = {}
			for (let controlKey of Object.keys(recipient.controls)){
				recipientObject[controlKey] = recipient.controls[controlKey]['value']
			}
			result.push(recipientObject)
		}
		return result
	}

	onSubmit(){
		const formState = this.issueForm.value;
		formState.expires_at = formState.expires_at? formState.expires_at.format('DD/MM/YYYY'): null  // force remove timezone
		if (this.issueForm.controls.issue_signed.value){
			this.dialogService.enterPasswordDialog.openDialog(formState)
			.then( () => {
				this.awardBadges(formState)
			})
			.catch( error => error)
		} else {
			this.awardBadges(formState)
		}
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

	clickSubmit(ev: Event, signed:boolean) {
		this.issueForm.untypedControl.patchValue({'issue_signed': signed})
		if (!this.issueForm.valid) {
			ev.preventDefault();
			this.issueForm.markTreeDirty();
			setTimeout(() => {
				window.scrollTo(0,0);
				this.messageService.reportHandledError("There were errors in your submission. Please review and try again.")
			});
		}
	}
}
