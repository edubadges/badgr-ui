import { Component, OnInit } from "@angular/core";
import { Title } from "@angular/platform-browser";

import { Router, ActivatedRoute, } from "@angular/router";
import { MessageService } from "../common/services/message.service";
import { SessionService } from "../common/services/session.service";
import { BaseRoutableComponent } from "../common/pages/base-routable.component";
import { BaseAuthenticatedRoutableComponent } from "../common/pages/base-authenticated-routable.component";
import { AppIntegrationManager } from "./services/app-integration-manager.service";
import { OAuthManager } from "../common/services/oauth-manager.service";
import { CommonDialogsService } from "../common/services/common-dialogs.service";
import { OAuth2AppAuthorization } from "../common/model/oauth.model";
import { groupIntoObject } from "../common/util/array-reducers";



@Component({
	selector: 'app-integration-detail',
	template: `
		<main>
			<form-message></form-message>
		
			<header class="wrap wrap-light l-containerhorizontal l-heading">
				<nav>
					<h1 class="visuallyhidden">Breadcrumbs</h1>
					<ul class="breadcrumb">
						<li class="breadcrumb-x-current">App Integrations</li>
					</ul>
				</nav>
		
		    <div class="heading">
		        <div class="heading-x-text">
		            <h1>App Integrations</h1>
		        </div>
		    </div>
		  </header>

			<div class="l-containerhorizontal l-containervertical l-containervertical-small l-childrenvertical wrap"
			     *bgAwaitPromises="[ appIntegrationsSet.loadedPromise ]">
				<p class="text text-quiet">You've authorized access to your Badgr account for the apps and sites listed below.</p>

				<div class="l-gridthree">
					<!-- Custom Integrations -->
					<div *ngFor="let integration of appIntegrationsSet">
						<div class="card card-largeimage">
							<a class="card-x-main"
							   [routerLink]="integration.integrationUid 
						       ? ['/profile/app-integrations/app/', integration.integrationType, integration.integrationUid] 
						       : ['/profile/app-integrations/app/', integration.integrationType]
						  ">
								<div class="card-x-image">
									<img [src]="integration.image" width="80" alt="Canvas Logo">
								</div>
								<div class="card-x-text">
									<h1 id="heading-card-01">{{ integration.name }}</h1>
									<p>{{ integration.description }}</p>
								</div>
							</a>
							<div class="card-x-actions">
								<span>{{ integration.active ? 'Active' : 'Inactive' }}</span>
							</div>
						</div>
					</div>
	
					<!-- OAuth Integrations -->
					<div *ngFor="let app of oAuthApps">
						<div class="card card-largeimage">
							<a class="card-x-main"
							   [routerLink]="['/profile/app-integrations/oauth-app/', app.entityId] ">
								<div class="card-x-image">
									<img [src]="app.imageUrl" width="80" alt="{{ app.name }} Logo">
								</div>
								<div class="card-x-text">
									<h1 id="appCardTitle-{{ app.entityId }}">{{ app.name }}</h1>
									<p>This application has been granted permission to sign you in using your Badgr account.</p>
								</div>
							</a>
							<div class="card-x-actions">
								<span>Authorized: <strong><time [date]="app.createdDate" format="mediumDate"></time></strong></span>
								<button class="button button-secondaryghost" 
								        type="button" 
								        attr.aria-labelledby="appCardTitle-{{ app.entityId }}"
								        (click)="revokeApp(app)"
								>Revoke</button>
							</div>
						</div>
					</div>
				</div>
			</div>
		</main>
		`
})
export class AppIntegrationListComponent extends BaseAuthenticatedRoutableComponent implements OnInit {
	constructor(
		loginService: SessionService,
		router: Router,
		route: ActivatedRoute,
		private title: Title,
		private messageService: MessageService,
		private appIntegrationManager: AppIntegrationManager,
		private oAuthManager: OAuthManager,
		private dialogService: CommonDialogsService
	) {
		super(router, route, loginService);

		title.setTitle("App Integrations - Badgr");
	}

	get appIntegrationsSet() {
		return this.appIntegrationManager.appIntegrations;
	}

	get oAuthApps() {
		// omit tokens with clientId='public' and only return first token per application
		const omittedClientIds = ['public'];
		let groupedByApplication = this.oAuthManager.authorizedApps.entities
			.filter(a => omittedClientIds.indexOf(a.clientId) == -1)
			.reduce(groupIntoObject(a => a.clientId), {})
		return Object.values(groupedByApplication).map(a => a[0])
	}

	ngOnInit() {
		super.ngOnInit();
	}

	async revokeApp(app: OAuth2AppAuthorization) {
		if (await this.dialogService.confirmDialog.openTrueFalseDialog({
			dialogTitle: "Revoke Access?",
			dialogBody: `Are you sure you want to revoke access to ${app.name}?`,
			resolveButtonLabel: "Revoke Access",
			rejectButtonLabel: "Cancel",
		})) {
			// revoke all tokens for the app
			Promise.all(this.oAuthManager.authorizedApps.entities.filter(t => t.clientId == app.clientId).map(t => t.revokeAccess()))
				.then(
					() => this.messageService.reportMinorSuccess(`Revoked access ${app.name}`),
					error => this.messageService.reportAndThrowError(`Failed to revoke access to ${app.name}`, error)
				)
		}
	}
}
