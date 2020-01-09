import { BadgeClassCreateComponent } from './badgeclass-create.component';
import { Component } from "@angular/core";
import { ActivatedRoute, Router } from "@angular/router";
import { FormBuilder } from "@angular/forms";
import { Title } from "@angular/platform-browser";

import { SessionService } from "../common/services/session.service";
import { MessageService } from "../common/services/message.service";
import { BadgeClassManager } from "./services/badgeclass-manager.service";
import { IssuerManager } from "./services/issuer-manager.service";
import { CommonDialogsService } from "../common/services/common-dialogs.service";

@Component({
	selector: 'badgeclass-create-formal',
	template: `
			<main *bgAwaitPromises="[issuerLoaded]">

			<form-message></form-message>

			<header class="wrap wrap-light l-containerhorizontal l-heading ">
				<nav>
					<h2 class="visuallyhidden">Breadcrumbs</h2>
					<ul class="breadcrumb">
						<li><a [routerLink]="['/issuer']">Issuers</a></li>
						<li><a [routerLink]="['/issuer/issuers/', issuerSlug]">{{issuer.name}}</a></li>
						<li class="breadcrumb-x-current">Create new Badge Class Non-Formal</li>
					</ul>
				</nav>

				<header class="heading">
					<div class="heading-x-text">
						<h1 id="heading" id="heading-addbadgeclass">Create new Badge Class Non-Formal</h1>
					</div>
				</header>
			</header>
			
			<badgeclass-edit-form (save)="badgeClassCreated($event)"
			                      (cancel)="creationCanceled($event)"
			                      [issuerSlug]="issuerSlug"
			                      submitText="Create Badge"
														submittingText="Creating Badge..."
														[badgeClassCategory]="'non-formal'"
			></badgeclass-edit-form>
		</main>
	`,
})
export class BadgeClassCreateNonFormalComponent extends BadgeClassCreateComponent {

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
		super(sessionService, router, route, fb, title, messageService, issuerManager, badgeClassManager, dialogService);
	}
}

