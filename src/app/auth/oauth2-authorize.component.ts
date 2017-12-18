import { Component, OnInit } from "@angular/core";
import { Router, ActivatedRoute } from "@angular/router";
import { SessionService } from "../common/services/session.service";
import { BaseRoutableComponent } from "../common/pages/base-routable.component";
import { AuthAttemptResult, OAuthManager, ScopeGroupRule } from "../common/services/oauth-manager.service";
import { QueryParametersService } from "../common/services/query-parameters.service";
import { MessageService } from "../common/services/message.service";
import { ApiOAuth2AppInfo, OAuth2RequestParams } from "../common/model/oauth-api.model";
import { throwExpr } from "../common/util/throw-expr";
import { flatten } from "../common/util/array-reducers";
import { Title } from "@angular/platform-browser";
import { InitialLoadingIndicatorService } from "../common/services/initial-loading-indicator.service";


@Component({
	selector: 'logout',
	template: `
		<main *bgAwaitPromises="[loadingPromise]">
			<form-message></form-message>

			<div class="l-auth" *ngIf="authorizingApp">
				<div class="authlink">
					<div><img [src]="oAuthManager.currentAuthorization.application.image"
					          alt="{{ authorizingApp.application.name }} Logo"
					          height="72" /></div>
					<div><img [src]="authLinkBadgrLogoSrc" height="72" alt="Badgr Logo" /></div>
				</div>
				<table class="l-auth-x-permissions table">
					<thead>
						<tr>
							<th scope="col">{{ authorizingApp.application.name }} would like to</th>
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
				<p class="l-auth-x-textconfirm text text-quiet">
					By clicking Authorize, you are allowing this application and Badgr to use your information in accordance with
					their respective terms of service and privacy policies. You can change this and other account permissions
					at any time from the Profile menu.
				</p>
				<form class="l-auth-x-buttons l-childrenhorizontal l-childrenhorizontal-right">
					<button class="button button-secondary" type="button" (click)="cancelAuthorization()">Cancel</button>
					<button class="button" type="submit" (click)="authorizeApp()">Authorize</button>
				</form>
			</div>
		</main>
	`
})
export class OAuth2AuthorizeComponent extends BaseRoutableComponent {
	readonly authLinkBadgrLogoSrc = require("../../breakdown/static/images/logo.svg");

	_loadingPromise: Promise<any> | null = null;
	set loadingPromise(promise: Promise<any> | null) {
		this._loadingPromise = promise;
		this.initialLoadingIndicatorService.initialLoadedPromise = promise || Promise.resolve();
	}

	get loadingPromise() {
		return this._loadingPromise;
	}

	constructor(
		router: Router,
		route: ActivatedRoute,
		private title: Title,
		protected messageService: MessageService,
		protected loginService: SessionService,
		protected oAuthManager: OAuthManager,
		protected queryParams: QueryParametersService,
		protected initialLoadingIndicatorService: InitialLoadingIndicatorService
	) {
		super(router, route);

		title.setTitle("Authorize - Badgr");
	}

	get authorizingApp() {
		return this.oAuthManager.currentAuthorization;
	}

	get presentationScopes() {
		return this.authorizingApp && this.oAuthManager.presentationScopesForScopes(this.authorizingApp.scopes);
	}

	cancelAuthorization() {
		this.oAuthManager.cancelCurrentAuthorization();
	}

	authorizeApp() {
		this.oAuthManager.authorizeCurrentApp().catch(
			error => this.messageService.reportAndThrowError("Failed to Authorize " + this.authorizingApp.application.name, error)
		)
	}

	ngOnInit() {
		super.ngOnInit();

		const clientIdParam = this.queryParams.queryStringValue("client_id");

		if (clientIdParam) {
			this.loadingPromise = Promise.resolve()
				.then(() => {
					if (this.queryParams.queryStringValue("response_type") != "code") {
						new Error("Only response_type='code' is supported")
					}

					const request: OAuth2RequestParams = {
						clientId: clientIdParam || throwExpr("client_id param missing"),
						redirectUrl: this.queryParams.queryStringValue("redirect_uri") || throwExpr("redirect_uri param missing"),
						scopeString: this.queryParams.queryStringValue("scope") || null,
						stateString: this.queryParams.queryStringValue("state") || null,
					};

					return this.oAuthManager.startOAuth2Authorization(request)
						.then(
							state => {
								if (state == AuthAttemptResult.AUTHORIZATION_REQUIRED) {
									this.title.setTitle(`Authorize ${this.authorizingApp.application.name} - Badgr`);
									// We'll stay on this page to perform the authorization
								} else if (state == AuthAttemptResult.LOGIN_REQUIRED) {
									return this.router.navigate([ '/auth/login' ]);
								} else if (state == AuthAttemptResult.SUCCESS) {
									// Do nothing. The service will have navigated us to the OAuth2 consumer
									// Prevent the initial loading indicator from disappearing so there isn't strange flashing of the UI
									this.initialLoadingIndicatorService.initialLoadedPromise = new Promise(() => {});
								}
							}
						);
				})
				.catch(error => this.messageService.reportAndThrowError(
					"Invalid OAuth2 Request. Please contact technical support.",
					error
				))
		} else if (this.oAuthManager.isAuthorizationInProgress) {
			// We're already performing an authorization... nothing to do
		} else {
			// We aren't in an authorization and we weren't given params. Error.
			this.loadingPromise = Promise.resolve().then(() => this.messageService.reportAndThrowError(
				"Invalid OAuth2 Request. Please contact technical support.",
				new Error("No client_id parameter present and no ongoing authentication")
			));
		}
	}
}