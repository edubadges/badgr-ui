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


					<div style="display: inline-block; width:65%;">
						<!-- expiry -->
						<div style="display: inline-block; width:50%;">
							<div class="formcheckbox">
								<label>
									<input 
											name="form-checkbox1" 
											id="form-checkbox1" 
											type="checkbox" 
											[formControl]="issueForm.controls.does_expire.untypedControl">
									<span class="formcheckbox-x-text formcheckbox-x-text-sharebadge" style="color:green;">Set an Expiration Date per Badge</span>
								</label>
								<span class="formcheckbox-x-subtext" >The expiration date will only be set for the badges that you will award. The Issued Badge will only be valid until this expiration date.</span>
							</div>
						</div>
						<div style="display: inline-block;" *ngIf="issueForm.controls.does_expire.untypedControl.value">
							<br><br>
							<dp-date-picker
								[formControl]="issueForm.controls.expires_at.untypedControl"
							></dp-date-picker>
							<span *ngIf="hasDateError" class="formcheckbox-x-text formcheckbox-x-text-sharebadge" style="color:red;">Date must be set in the future.</span>
						</div>
						<!-- personal note -->
						<div style="width:50%;">
							<div class="formcheckbox">
								<label>
									<input 
											name="form-checkbox2" 
											id="form-checkbox2" 
											type="checkbox" 
											[formControl]="issueForm.controls.narrative_enabled.untypedControl">
									<span class="formcheckbox-x-text formcheckbox-x-text-sharebadge" style="color:green;">Enable Personal Note per Badge</span>
								</label>
								<span class="formcheckbox-x-subtext" >You can add a personal note for the badges you will award.</span>
							</div>
						</div>
						<!-- evidence -->
						<div style="width:50%;">
							<div class="formcheckbox">
								<label>
									<input 
											name="form-checkbox3" 
											id="form-checkbox3" 
											type="checkbox" 
											[formControl]="issueForm.controls.evidence_enabled.untypedControl">
									<span class="formcheckbox-x-text formcheckbox-x-text-sharebadge" style="color:green;">Enable Evidence per Badge</span>
								</label>
								<span class="formcheckbox-x-subtext" >You can add evidence for the badges that you will award. Evidence is submitted proof that an earner meets the criteria for a badge they are applying for.</span>
							</div>
						</div>
					</div>
					<div style="display: inline-block; width:32%;">
						<h4 class="title title-bordered" id="heading-badgeawarding">Badge Awarding</h4>
						<p class="text text-small">You can award badges by selecting students and clicking on award below. Double check your selection before awarding, canceling them can only be done through revokation of a badge.</p>
					</div>

					<div class="l-formsection-x-container">

					<!-- Enrollments -->
						<div *ngIf="issueForm.controls.recipients.controls.length" class="l-formsection-x-inputs">


							<div *ngIf="issueForm.controls.recipients.controls.length">
								<hr class="rule l-rule">
								<br>
								<button type="button"
									class="button button-right"
									(click)="denyAllEnrollments()"
								>Deny All</button>
							</div><br>
							<label [style.display]="issueForm.controls.recipients.controls.length?'inline-block':'none'" class="formcheckbox">
								<input name="form-checkbox4" id="form-checkbox4" type="checkbox" (change)="selectAllStudents()">
								<span class="formcheckbox-x-text formcheckbox-x-text-sharebadge" style="color:green;">Select All for Awarding</span>
							</label>
							<div *ngIf="issueForm.controls.recipients.controls.length">
								<div class="l-formsectionnested wrap wrap-welldark"
									*ngFor="let recipient of issueForm.controls.recipients.controls; let i=index"
								>
									<div>
										<label class="formcheckbox" style="display:inline-block;">
											<input name="form-checkbox5" type="checkbox" [formControl]="recipient.untypedControls.selected">
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
									<!-- personal note aka narrative -->
									<div class="l-formsection wrap wrap-well"
											role="group"
											aria-labelledby="heading-narrative"
											*ngIf="narrativeEnabled"
									>
										<div class="l-formsection-x-container">
											<div class="l-formsection-x-help">
												<h4 class="title title-bordered" id="heading-narrativehelp">A Personal note?</h4>
												<p class="text text-small">
													A personal note can be added to the eraner of this badge.
												</p>
												<a class="button button-tertiaryghost"
													href="https://wiki.surfnet.nl/display/OB/FAQ"
													aria-labelledby="heading-narrativehelp"
													target="_blank"
												>Learn More</a>
											</div>
											<div class="l-formsection-x-inputs">
												<bg-formfield-markdown
													class="l-formsection-x-inputoffset"
													[control]="recipient.untypedControls.narrative"
													label="personal note"
												></bg-formfield-markdown>
											</div>
										</div>
									</div>
									<!-- evidence -->
									<div class="l-formsection wrap wrap-well"
											role="group"
											aria-labelledby="heading-evidence"
											*ngIf="evidenceEnabled"
									>
										<div>
											<div>
												<h4 class="title title-bordered" id="heading-whatsevidence">What's Evidence?</h4>
												<p class="text text-small">
													Evidence is submitted proof that an earner meets the criteria for a badge they are applying for. This
													can be in the form of a narrative that describes the evidence and process of achievement, and/or a URL
													of a web page presenting the evidence of achievement.
												</p>
												<a class="button button-tertiaryghost"
													href="https://wiki.surfnet.nl/display/OB/FAQ"
													aria-labelledby="heading-whatsevidence"
													target="_blank"
												>Learn More</a>
											</div><br>
											<!-- evidence array -->
											<div class="l-formsectionnested wrap wrap-welldark" *ngFor="let evidence of recipient.untypedControls.evidence_items.controls; let i = index">
												<h5 class="visuallyhidden" id="heading-nestedevidence"></h5>
												<bg-formfield-markdown
													[control]="evidence.controls.narrative"
													label="evidence"
													placeholder="Which proof of meeting the badge criteria was submitted by the badge applicant?"
												></bg-formfield-markdown>
												<bg-formfield-text
													class="l-marginTop-4x"
													[control]="evidence.controls.evidence_url"
													label="URL to Evidence Page"
													fieldType="url"
													[urlField]="true"
													errorMessage="Please enter a valid URL"
												></bg-formfield-text>
												<button class="l-formsectionnested-x-remove formsectionremove"
																type="button"
																aria-labelledby="heading-nestedevidence"
																(click)="removeEvidence(recipient, i)"
													>Remove
												</button>
											</div><br>
										</div><br>
										<button class="buttonicon buttonicon-add"
														type="button"
														(click)="addEvidence(recipient)"
												>
												Add Additional Evidence
										</button>
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

				<hr class="rule l-rule" />

				<!-- Buttons -->
				<div class="l-childrenhorizontal l-childrenhorizontal-right">
					<a [routerLink]="['/issuer/issuers', issuer.slug, 'badges', badge_class.slug]"
					   type="submit"
					   class="button button-primaryghost"
					   [disabled-when-requesting]="true"
					>Cancel</a>
					<ng-container *ngIf="badge_class.category=='formal'">
					
					
						<button *ngIf="awardButtonEnabled" type="submit"
										class="button button-green"
										[disabled]="!! issueBadgeFinished"
										(click)="clickSubmit($event, false)"
										[loading-promises]="[ issueBadgeFinished ]"
										loading-message="Issuing"
						>Award</button>

						<button *ngIf="!awardButtonEnabled"
										class="button button-disabled"
										[disabled]="true"
						>Award</button>
					</ng-container>
					
					
					<ng-container *ngIf="badge_class.category=='non-formal' && signingEnabled">
						<ng-container  *bgAwaitPromises='[permissionsLoaded]'>
							<button
											*ngIf="awardButtonEnabled && userMaySignBadges && currentUserIsSigner"
											class="button button-green"
											[disabled]="!! issueBadgeFinished"
											(click)="clickSubmit($event, true)"
											[loading-promises]="[ issueBadgeFinished ]"
											loading-message="Issuing"
							>Award Signed</button>
							<button *ngIf="!awardButtonEnabled && userMaySignBadges && currentUserIsSigner"
										class="button button-disabled"
										[disabled]="true"
							>Award Signed</button>
						</ng-container>
					</ng-container>	
					<ng-container *ngIf="badge_class.category=='non-formal' && (!userMaySignBadges || !currentUserIsSigner || !signingEnabled)">	
							<button
									class="button button-disabled"
									[disabled]="true"
							>Cannot Award Signed</button>
					</ng-container>	
				</div>
			</form>
		</main>
	`
})
export class BadgeClassIssueComponent extends BaseAuthenticatedRoutableComponent implements OnInit {

	issuer: Issuer;
	issueForm = typedGroup()
		.addControl("notify_earner", true)
		.addControl("expires_at", undefined)
		.addControl("does_expire", false)
		.addControl("narrative_enabled", false)
		.addControl("evidence_enabled", false)
		.addControl("issue_signed", false)
		.addArray("recipients", typedGroup()
			.addControl("recipient_name", "")
			.addControl("enrollment_slug", "")
			.addControl("recipient_email", "")
			.addControl("recipient_type", "id")
			.addControl("recipient_identifier", "", [ Validators.required ])
			.addControl("selected", false)
			.addControl("denied", false)
		)
		.addArray("deniedRecipients", typedGroup()
			.addControl("recipient_name", "")
			.addControl("enrollment_slug", "")
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
	evidenceAlreadyEnabledOnce: boolean = false;

	hasDateError = false
	enrolledStudents = [];
	showDeniedEnrollments = false;

	get signingEnabled() { return this.configService.signingEnabled }
	get narrativeEnabled() { return this.issueForm.controls.narrative_enabled.value }
	get evidenceEnabled() { return this.issueForm.controls.evidence_enabled.value }

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
		if (this.issueForm.controls.evidence_enabled.value){
			if (!this.evidenceAlreadyEnabledOnce) {
				this.evidenceAlreadyEnabledOnce = true
			let emptyEvidence = typedGroup()
				.addControl("narrative", '')
				.addControl("evidence_url", '')
				for (let recipient of this.issueForm.controls.recipients.controls){
					this.addEvidence(recipient)
				}
			}
		}
	}	
	
	enableFormListener(){
		if (!this.listener_is_on){
			this.issueForm.untypedControl.valueChanges.subscribe(values => this.onFormChange())
			this.issueForm.controls.does_expire.untypedControl.valueChanges.subscribe(checked => {
				if (checked) {
					this.issueForm.controls.expires_at.untypedControl.enable()
					this.issueForm.controls.expires_at.untypedControl.setValidators([Validators.required, DateValidator.validDate])
				} else {
					this.issueForm.controls.expires_at.untypedControl.disable()
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

	addRecipient(enrollment) {
		let enrollment_slug = enrollment['slug']
		let first_name = enrollment['first_name'] ? enrollment['first_name']: ''
		let last_name = enrollment['last_name'] ? enrollment['last_name']: ''
		let name = first_name+' '+last_name
		let email = enrollment['email']
		let recipientFormGroup = typedGroup()
		.addControl("enrollment_slug", enrollment_slug)
		.addControl("recipient_name", name)
		.addControl("recipient_email", email)
		.addControl("recipient_type", 'id')
		.addControl("recipient_identifier", enrollment['edu_id'], [ Validators.required ])
		.addControl("narrative", '')
		.addArray("evidence_items", typedGroup()
			.addControl("narrative", '')
			.addControl("evidence_url", '')
		)
		.addControl("selected", false)
			.addControl("denied", enrollment['denied'])
		if (this.badge_class.category == 'non-formal'){
			const recipientProfileContextUrl = "https://openbadgespec.org/extensions/recipientProfile/context.json";
			recipientFormGroup.addControl("extensions", typedGroup()
			.addControl("extensions:recipientProfile", typedGroup()
				.addControl("@context", recipientProfileContextUrl)
				.addControl("type", ["Extension", "extensions:RecipientProfile"])
				.addControl("name", name)
			)
		)
		}
		if (!enrollment['denied']) {
			this.issueForm.controls.recipients.push(recipientFormGroup);
		} else if (enrollment['denied']) {
			this.issueForm.controls.deniedRecipients.push(recipientFormGroup);
		}
	}


	awardBadges(formState){
		this.issueBadgeFinished = this.badgeInstanceManager.createBadgeInstanceBatched(
				this.issuerSlug,
				this.badgeSlug,
				{
					issuer: this.issuerSlug,
					badge_class: this.badgeSlug,
					create_notification: formState.notify_earner,
					recipients: this.filterRecipients(),
					expires_at: formState.does_expire ? formState.expires_at : "",
					issue_signed: formState.issue_signed,
					signing_password: formState.password,
				}
			).then(() => {
				this.badge_class.update()
			})
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

	filterNarrativeFromRecipient(recipient){
		if (recipient['narrative'] != undefined) {
			if (!this.narrativeEnabled){
				delete recipient['narrative']
			} else {
				!recipient['narrative'] ? delete recipient['narrative']: {}
			}
		}
	}

	filterEvidenceFromRecipient(recipient){
		if (recipient['evidence_items']) {
			if (!this.evidenceEnabled){
				delete recipient['evidence_items']
			} else {
				for (let index of recipient['evidence_items'].keys()){
					let evidence = recipient['evidence_items'][index]
					if (evidence.narrative.length == 0 && evidence.evidence_url.length == 0){
						recipient['evidence_items'].splice(index, 1)
					}
				}
			}
		}
	}

	filterRecipients(){
		// extract recipients manually, because issueForm.value is not updated properly when calling controls.push
		let result = []
		let recipients = this.issueForm.controls.recipients.controls
		for (let recipient of recipients){
			let recipientObject = {}
			for (let controlKey of Object.keys(recipient.controls)){
				recipientObject[controlKey] = recipient.controls[controlKey]['value']
			}
		if (recipientObject['selected'] === true){
				delete recipientObject['selected']
				this.filterEvidenceFromRecipient(recipientObject)
				this.filterNarrativeFromRecipient(recipientObject)
				result.push(recipientObject)
			}
		}
		return result
	}

	onSubmit() {
		const formState = this.issueForm.value;
		formState.expires_at = formState.expires_at ? formState.expires_at.format('DD/MM/YYYY') : null  // force remove timezone
		this.awardBadges(formState)
	}

	addEvidence(recipient) {
		let emptyEvidence = typedGroup()
			.addControl("narrative", '')
			.addControl("evidence_url", '')
		recipient.controls.evidence_items.push(emptyEvidence)
	}

	removeEvidence(recipient, index) {
		recipient.controls.evidence_items.removeAt(index)
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
