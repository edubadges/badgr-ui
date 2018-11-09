import { OnInit, Component } from "@angular/core";
import { Router, ActivatedRoute } from "@angular/router";
import { MessageService } from "../common/services/message.service";
import { SessionService } from "../common/services/session.service";
import { Title } from "@angular/platform-browser";
import { BaseAuthenticatedRoutableComponent } from "../common/pages/base-authenticated-routable.component";
import { OAuthManager } from "../common/services/oauth-manager.service";
import { OAuth2AppAuthorization } from "../common/model/oauth.model";
import { CommonDialogsService } from "../common/services/common-dialogs.service";
import { flatten } from "../common/util/array-reducers";


@Component({
	selector: 'oauth-app-detail-component',
	template: `
		<main *bgAwaitPromises="[ appPromise ]">
			<form-message></form-message>

			<header class="wrap wrap-light l-containerhorizontal l-heading">
				<nav>
					<h1 class="visuallyhidden">Breadcrumbs</h1>
					<ul class="breadcrumb">
						<li>
							<a [routerLink]="['/profile/app-integrations']">App Integrations</a>
						</li>
						<li class="breadcrumb-x-current">{{ app.name }}</li>
					</ul>
				</nav>

				<header class="heading">
					<div *ngIf="app.imageUrl">
						<div class="heading-x-image">
							<img [src]="app.imageUrl" alt="{{ app.name }} Logo">
						</div>
					</div>
					<div class="heading-x-text">
						<h1 id="heading">{{ app.name }}</h1>
						<p class="heading-x-meta">Authorized: <strong><time [date]="app.createdDate" format="mediumDate"></time></strong></p>
						<p>This application has been granted permission to sign you in using your Badgr account.</p>
						<p *ngIf="app.websiteUrl">
							<a class="button button-primaryghost l-offsetleft" 
							   [href]="app.websiteUrl"
							   attr.aria-labelledby="heading"
							   target="_blank"
							>Visit Website</a>
						</p>
					</div>
					<div class="heading-x-actions">
						<a class="button button-major" 
						   href="javascript: void(0)"
						   attr.aria-labelledby="heading"
						   (click)="revokeAccess()"
						>Revoke</a>
					</div>
				</header>
		  </header>

			<div class="l-containerhorizontal l-containervertical l-containervertical-small l-childrenvertical wrap">
				<table class="l-ssoauth-x-permissions table">
					<thead>
						<tr>
							<th scope="col">{{ app.name }} has permission to:</th>
						</tr>
					</thead>
					<tbody>
						<tr>
							<td class="table-x-wrap">
								<p class="permission permission-personal">Know who you are on Badgr</p>
							</td>
						</tr>
						<tr *ngFor="let scope of presentationScopes">
							<td class="table-x-wrap">
								<p class="permission {{ scope.cssName }}">{{ scope.label }}</p>
							</td>
						</tr>
					</tbody>
				</table>
			</div>
		
		</main>
`
})
export class OAuthAppDetailComponent extends BaseAuthenticatedRoutableComponent implements OnInit {
	app: OAuth2AppAuthorization;
	appTokens: OAuth2AppAuthorization[];
	appPromise: Promise<any>;

	constructor(
		loginService: SessionService,
		route: ActivatedRoute,
		router: Router,

		private title: Title,
		private messageService: MessageService,
		private oAuthManager: OAuthManager,
		private dialogService: CommonDialogsService
	) {
		super(router, route, loginService);
		title.setTitle("App Integrations - Badgr");

		this.appPromise = oAuthManager.authorizedApps.loadedPromise.then(
			list => {
				this.app = list.entityForUrl(this.appId);
				this.appTokens = list.entities.filter(t => t.clientId == this.app.clientId);
				title.setTitle(`App - ${this.app.name} - Badgr`);
			}
		);
	}

	get appId() {
		return this.route.snapshot.params["appId"];
	}

	get presentationScopes() {
		let allScopes = new Set(this.appTokens.map(t => t.scopes).reduce(flatten(), []));
		return this.app && this.oAuthManager.presentationScopesForScopes(Array.from(allScopes.values()));
	}

	ngOnInit() {
		super.ngOnInit();
	}

	async revokeAccess() {
		if (await this.dialogService.confirmDialog.openTrueFalseDialog({
				dialogTitle: "Revoke Access?",
				dialogBody: `Are you sure you want to revoke access to ${this.app.name}?`,
				resolveButtonLabel: "Revoke Access",
				rejectButtonLabel: "Cancel",
			})) {
			Promise.all(this.appTokens.map(app => app.revokeAccess()))
				.then(
					() => this.messageService.reportMajorSuccess(`Revoked access to ${this.app.name}`, true),
					error => this.messageService.reportAndThrowError(
						`Failed to revoke access to ${this.app.name}`,
						error
					)
				).then(
					() => this.router.navigate(['/profile/app-integrations'])
				)
		}
	}
}
