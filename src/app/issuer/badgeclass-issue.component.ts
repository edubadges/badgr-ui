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
import { RecipientIdentifierType } from "./models/badgeinstance-api.model";
import { typedGroup } from "../common/util/typed-forms";
import { TelephoneValidator } from "../common/validators/telephone.validator";
import {EventsService} from "../common/services/events.service";

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
					<h3 class="l-formsection-x-legend title title-ruled" id="heading-recipientinformation">Recipient Information</h3>
					<div class="l-formsection-x-container">
						<div class="l-formsection-x-help">
							<h4 class="title title-bordered" id="heading-badgeawarding">Badge Awarding</h4>
							<p class="text text-small">You can award a badge via a recipients email address, url, or telephone number.</p>
							<a class="button button-tertiaryghost"
							   href="https://support.badgr.io/pages/viewpage.action?pageId=2981918"
							   aria-labelledby="heading-badgeawarding"
							   target="_blank"
							>Learn More</a>
						</div>
						<div class="l-formsection-x-inputs">
							<div class="formfield">
								<label>Recipient Name (optional)</label>
								<bg-formfield-text
									[control]="issueForm.untypedControls.recipientprofile_name"
									ariaLabel="Recipient Name (optional)"
								></bg-formfield-text>
								<p class="text text-small2"><strong>Note</strong>: The Recipient Name will appear in the awarded badge in plain text.</p>
							</div>
							<div class="formfield">
								<label>Identifier</label>
								<div class="l-formtwoup">
									<bg-formfield-select ariaLabel="Select Options"
									                     [control]="issueForm.untypedControls.recipient_type"
									                     [optionMap]="identifierOptionMap"
									></bg-formfield-select>

									<bg-formfield-text
										[control]="issueForm.untypedControls.recipient_identifier"
										ariaLabel="Recipient Identifier"
										[autofocus]="true"
									></bg-formfield-text>
								</div>
							</div>
							<div class="l-formsection-x-checkbox" *ngIf="issueForm.controls.recipient_type.value == 'email'">
								<label class="formcheckbox" for="notifybyemail">
									<input name="notifybyemail" id="notifybyemail" type="checkbox" [formControl]="issueForm.untypedControls.notify_earner">
									<span class="formcheckbox-x-text">Notify Recipient by Email</span>
								</label>
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
								label="How did the recipient earn this badge?"
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
					<button type="submit"
					        class="button"
					        [disabled]="!! issueBadgeFinished"
					        (click)="clickSubmit($event)"
					        [loading-promises]="[ issueBadgeFinished ]"
					        loading-message="Issuing"
					>Award Badge</button>
				</div>
			</form>
		</main>
	`
})
export class BadgeClassIssueComponent extends BaseAuthenticatedRoutableComponent implements OnInit {
	idValidator: (control: FormControl) => ValidationResult = control => {
		if (this.issueForm) {
			switch (this.issueForm.controls.recipient_type.value) {
				case 'email': return EmailValidator.validEmail(control);
				case 'openBadgeId': return null;
				case 'telephone': return TelephoneValidator.validTelephone(control);
				case 'url': return UrlValidator.validUrl(control);
				default: return null;
			}
		} else {
			return null;
		}
	};

	issuer: Issuer;
	issueForm = typedGroup()
		.addControl("recipient_type", "email" as RecipientIdentifierType, [ Validators.required ], control => {
			control.untypedControl.valueChanges.subscribe(() => {
				this.issueForm.controls.recipient_identifier.untypedControl.updateValueAndValidity()
			})
		})
		.addControl("recipient_identifier", "", [ Validators.required, this.idValidator ])
		.addControl("recipientprofile_name", "")
		.addControl("narrative", "", MdImgValidator.imageTest)
		.addControl("notify_earner", true)
		.addArray("evidence_items", typedGroup()
			.addControl("narrative", "")
			.addControl("evidence_url", "")
		);

	badge_class: BadgeClass;

	issueBadgeFinished: Promise<any>;
	issuerLoaded: Promise<any>;
	badgeClassLoaded: Promise<any>;

	identifierOptionMap = {
		email: 'Email Address',
		eduID: 'Edu ID',
	};

	evidenceEnabled = false;
	narrativeEnabled = false;

	constructor(
		protected title: Title,
		protected messageService: MessageService,
		protected eventsService: EventsService,
		protected issuerManager: IssuerManager,
		protected badgeClassManager: BadgeClassManager,
		protected badgeInstanceManager: BadgeInstanceManager,
		protected dialogService: CommonDialogsService,
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
	}

	enableEvidence() {
		this.evidenceEnabled = true;

		if (this.issueForm.controls.evidence_items.length < 1) {
			this.addEvidence();
		}
	}

	addEvidence() {
		this.issueForm.controls.evidence_items.addFromTemplate();
	}

	onSubmit() {
		const formState = this.issueForm.value;
		let cleanedEvidence = formState.evidence_items.filter(e => e.narrative != "" || e.evidence_url != "");

		const recipientProfileContextUrl = "https://openbadgespec.org/extensions/recipientProfile/context.json";
		let extensions = formState.recipientprofile_name ? {
			"extensions:recipientProfile": {
				"@context": recipientProfileContextUrl,
				"type": ["Extension", "extensions:RecipientProfile"],
				"name": formState.recipientprofile_name
			}
		} : undefined;

		this.issueBadgeFinished = this.badgeInstanceManager.createBadgeInstance(
			this.issuerSlug,
			this.badgeSlug,
			{
				issuer: this.issuerSlug,
				badge_class: this.badgeSlug,
				recipient_type: formState.recipient_type,
				recipient_identifier: formState.recipient_identifier,
				narrative: this.narrativeEnabled ? formState.narrative : "",
				create_notification: formState.notify_earner,
				evidence_items: this.evidenceEnabled ? cleanedEvidence : [],
				extensions: extensions
			}
		).then(() => this.badge_class.update())
			.then(() => {
			this.eventsService.recipientBadgesStale.next([]);
			this.router.navigate(
				['issuer/issuers', this.issuerSlug, 'badges', this.badge_class.slug]
			);
			this.messageService.setMessage("Badge awarded to " + formState.recipient_identifier, "success");
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
