import { Component, OnInit, ViewChild } from "@angular/core";
import { ActivatedRoute, Router } from "@angular/router";
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { Title } from "@angular/platform-browser";

import { BaseAuthenticatedRoutableComponent } from "../common/pages/base-authenticated-routable.component";

import { SessionService } from "../common/services/session.service";
import { MessageService } from "../common/services/message.service";
import { Issuer } from "./models/issuer.model";

import { BadgeClassManager } from "./services/badgeclass-manager.service";
import { IssuerManager } from "./services/issuer-manager.service";
import { markControlsDirty } from "../common/util/form-util";
import { BadgeClass } from "./models/badgeclass.model";
import { BadgrApiFailure } from "../common/services/api-failure";
import { BadgeStudioComponent } from "./badge-studio.component";
import { BgFormFieldImageComponent } from "../common/components/formfield-image";
import { BadgeInstanceManager } from "./services/badgeinstance-manager.service";
import { BadgeClassInstances, BadgeInstance } from "./models/badgeinstance.model";
import { EventsService } from "../common/services/events.service";

@Component({
	selector: 'badgeclass-edit',
	template: `
		<main *bgAwaitPromises="[issuerLoaded]">

			<form-message></form-message>

			<header class="wrap wrap-light l-containerhorizontal l-heading">

				<nav>
					<h1 class="visuallyhidden">Breadcrumbs</h1>
					<ul class="breadcrumb">
						<li><a [routerLink]="['/issuer']">Issuers</a></li>
						<li><a [routerLink]="['/issuer/issuers/', issuerSlug]">{{issuer.name}}</a></li>
						<li class="breadcrumb-x-current">Edit Badge Class</li>
					</ul>
				</nav>

				<div class="heading">
					<div class="heading-x-text">
						<h1>Edit Badge Class</h1>
						<p>Edit the information about this achievement.</p>
					</div>
				</div>

			</header>

			<badgeclass-edit-form (save)="badgeClassSaved($event)"
			                      (cancel)="editingCanceled($event)"
			                      [issuerSlug]="issuerSlug"
			                      [badgeClass]="badgeClass"
			                      submitText="Save Changes"
			                      submittingText="Saving..."
			></badgeclass-edit-form>
		</main>
	`,

})
export class BadgeClassEditComponent extends BaseAuthenticatedRoutableComponent implements OnInit {
	readonly badgeClassPlaceholderImageUrl = require('../../breakdown/static/images/placeholderavatar.svg');

	issuer: Issuer;
	badgeClassEditForm: FormGroup;

	submitted: boolean = false;

	badgeClass: BadgeClass;
	editBadgeClassFinished: Promise<any>;
	badgeClassLoaded: Promise<any>;
	issuerLoaded: Promise<any>;

	private allBadgeInstances: BadgeClassInstances;
	private instanceResults: BadgeInstance[] = [];


	get issuerSlug() {
		return this.route.snapshot.params[ 'issuerSlug' ];
	}

	get badgeSlug() {
		return this.route.snapshot.params[ 'badgeSlug' ];
	}

	@ViewChild("badgeStudio")
	badgeStudio: BadgeStudioComponent;

	@ViewChild("imageField")
	imageField: BgFormFieldImageComponent;

	constructor(
		sessionService: SessionService,
		router: Router,
		route: ActivatedRoute,
		protected formBuilder: FormBuilder,
		protected title: Title,
		protected messageService: MessageService,
		protected eventsService: EventsService,
		protected badgeManager: BadgeClassManager,
		protected issuerManager: IssuerManager,
		protected badgeInstanceManager: BadgeInstanceManager,
		protected badgeClassManager: BadgeClassManager
	) {
		super(router, route, sessionService);
		title.setTitle("Edit Badge Class - Badgr");

		this.badgeClassLoaded = badgeManager.badgeByIssuerSlugAndSlug(
			this.issuerSlug,
			this.badgeSlug
		).then(
			badge => this.badgeClass = badge,
			error => this.messageService.reportLoadingError(
				`Cannot find badge ${this.issuerSlug} / ${this.badgeSlug}`,
				error
			)
		);

		this.issuerLoaded = issuerManager.issuerBySlug(this.issuerSlug).then(
			issuer => this.issuer = issuer,
			error => this.messageService.reportLoadingError(`Cannot find issuer ${this.issuerSlug}`, error)
		);
	}

	badgeClassSaved(promise: Promise<BadgeClass>) {
		promise.then(
			badgeClass => {
					this.eventsService.recipientBadgesStale.next([]);
					this.router.navigate([
						'issuer/issuers', this.issuerSlug, 'badges', badgeClass.slug
					])
			},
			error => this.messageService.reportAndThrowError(
				`Unable to create Badge Class: ${BadgrApiFailure.from(error).firstMessage}`,
				error
			)
		);
	}

	editingCanceled() {
		this.router.navigate(['issuer/issuers', this.issuerSlug, 'badges', this.badgeClass.slug ])
	}
}

interface badgeClassEditForm<T> {
	badge_name: T;
	badge_description: T;
	badge_criteria_text: T;
	badge_criteria_url: T;
	badge_image: T;
}
