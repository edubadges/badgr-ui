import { Component, OnInit } from "@angular/core";
import { ActivatedRoute, Router } from "@angular/router";
import { FormBuilder } from "@angular/forms";
import { Title } from "@angular/platform-browser";

import { BaseAuthenticatedRoutableComponent } from "../common/pages/base-authenticated-routable.component";

import { SessionService } from "../common/services/session.service";
import { MessageService } from "../common/services/message.service";
import { Issuer } from "./models/issuer.model";
import { BadgeClassManager } from "./services/badgeclass-manager.service";
import { IssuerManager } from "./services/issuer-manager.service";
import { BadgrApiFailure } from "../common/services/api-failure";
import { CommonDialogsService } from "../common/services/common-dialogs.service";
import { BadgeClass } from "./models/badgeclass.model";
import { ValidanaBlockchainService } from 'app/endorsement-api/validana/validanaBlockchain.service';


@Component({
	template: `
		<main *bgAwaitPromises="[issuerLoaded]">

			<form-message></form-message>

			<header class="wrap wrap-light l-containerhorizontal l-heading ">
				<nav>
					<h2 class="visuallyhidden">Breadcrumbs</h2>
					<ul class="breadcrumb">
						<li><a [routerLink]="['/issuer']">Issuers</a></li>
						<li><a [routerLink]="['/issuer/issuers/', issuerSlug]">{{issuer.name}}</a></li>
						<li class="breadcrumb-x-current">Add Badge Class</li>
					</ul>
				</nav>

				<header class="heading">
					<div class="heading-x-text">
						<h1 id="heading" id="heading-addbadgeclass">Add Badge Class</h1>
					</div>
				</header>
			</header>
			
			<badgeclass-edit-form (save)="badgeClassCreated($event)"
			                      (cancel)="creationCanceled($event)"
			                      [issuerSlug]="issuerSlug"
			                      submitText="Create Badge"
			                      submittingText="Creating Badge..."
			></badgeclass-edit-form>
		</main>
	`
})
export class BadgeClassCreateComponent extends BaseAuthenticatedRoutableComponent implements OnInit {
	issuerSlug: string;
	issuer: Issuer;
	issuerLoaded: Promise<any>;

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
		this.issuerSlug = this.route.snapshot.params[ 'issuerSlug' ];

		this.issuerLoaded = this.issuerManager.issuerBySlug(this.issuerSlug).then((issuer) => {
			this.issuer = issuer;
		});
	}

	ngOnInit() {
		super.ngOnInit();
	}

	badgeClassCreated(promise: Promise<BadgeClass>) {
		promise.then(
			badgeClass => {
				
				// Route the user to the issuer page
				this.router.navigate([
					'issuer/issuers', this.issuerSlug, 'badges', badgeClass.slug
				]);

			},
			error => this.messageService.reportAndThrowError(
				`Unable to create Badge Class: ${BadgrApiFailure.from(error).firstMessage}`,
				error
			)
		);
	}
	creationCanceled() {
		this.router.navigate(['issuer/issuers', this.issuerSlug ])
	}
}
