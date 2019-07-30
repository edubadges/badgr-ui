import { MarkdownDisplay } from './../common/components/markdown-display';
import { Component, OnInit } from "@angular/core";

import { ActivatedRoute, Router } from "@angular/router";
import { SessionService } from "../common/services/session.service";
import { MessageService } from "../common/services/message.service";
import { BaseRoutableComponent } from "../common/pages/base-routable.component";
import { Title } from "@angular/platform-browser";

import { SystemConfigService } from "../common/services/config.service";
import { QueryParametersService } from "../common/services/query-parameters.service";
import { OAuthManager } from "../common/services/oauth-manager.service";
import {ExternalToolsManager} from "../externaltools/services/externaltools-manager.service";
import { CommonDialogsService } from "../common/services/common-dialogs.service";

@Component({
	selector: 'login',
	template: `
	<main *bgAwaitPromises="[ initFinished ]">

		<form-message></form-message>
		<header class="wrap wrap-light l-containerhorizontal l-heading" style="text-align:center;">
			<div class="heading" style="display:inline-block;">
				<div class="heading-x-text">
					<h1 style="font-size:24px;">{{ currentTheme.welcomeMessage }}</h1>
				</div>
			</div>
		</header>

		<div class="l-headeredsection">
			<div class="l-containerhorizontal wrap">
				<div class="l-gridtwo">

					<!-- Student Login -->
					<div class="card-large" style="width:300px;">
						<div class="l-auth">
							<p class="l-formsection-x-legend title title-ruled">
								Login for students
							</p>
							<br>
							<div class="formfield">
								<p class="formfield-x-label">Sign In With</p>
								<div class="l-authbuttons">
										<button type="button"
										class="buttonauth buttonauth-{{ providerEduid.slug }}"
										(click)="sessionService.initiateUnauthenticatedExternalAuth(providerEduid)"
										>{{ providerEduid.name }}
										</button>
								</div>
							</div>
							<br>
							<span class="l-auth-x-text text text-quiet">
								No eduID account yet? </span>
							<div style = "display:inline-block; width:100px; text-align:center;">
								<ul class="menuitem" ><a href= "{{eduidRegistrationUrl}}">Sign Up</a></ul>
							</div>
						</div>
					</div>

					<!-- Staff Login -->
					<div class="card-large" style="width:300px;">
						<div class="l-auth">
							<p class="l-formsection-x-legend title title-ruled">
								Login for staff
							</p>
							<br>
							<div class="formfield">
								<p class="formfield-x-label">Sign In With</p>
								<div class="l-authbuttons">
										<button type="button"
										class="buttonauth buttonauth-{{ providerSurfconext.slug }}"
										(click)="sessionService.initiateUnauthenticatedExternalAuth(providerSurfconext)"
										>{{ providerSurfconext.name }}
										</button>
								</div>
							</div>
						</div>
					</div>
					
				</div>
			</div>
		</div>
		
	</main>
	`
})
export class LoginComponent extends BaseRoutableComponent implements OnInit {
	providerEduid: object;
	eduidRegistrationUrl: String;
	providerSurfconext: object;
  providerName: string;
	initFinished: Promise<any> = new Promise(() => {});
	loginFinished: Promise<any>;

	get currentTheme() { return this.configService.currentTheme }

	constructor(
		private title: Title,
		protected sessionService: SessionService,
		protected externalToolsManager: ExternalToolsManager,
		protected configService: SystemConfigService,
		private messageService: MessageService,
		private commonDialogsService: CommonDialogsService,
		private queryParams: QueryParametersService,
		public oAuthManager: OAuthManager,
		router: Router,
		route: ActivatedRoute
	) {
		super(router, route);
		let serviceName: string;
		serviceName = this.configService.currentTheme.serviceName;
		title.setTitle("Login - " + serviceName);
		this.handleQueryParamCases();
	}

	ngOnInit() {
		super.ngOnInit();
				
		for (let provider of this.sessionService.enabledExternalAuthProviders){
			for (let provider of this.sessionService.enabledExternalAuthProviders){
				if (provider.name == 'EduID') {
					this.providerEduid = provider
					let eduIDUrl = this.configService.featuresConfig["socialAccountProviderUrls"]['edu_id']
					this.eduidRegistrationUrl = eduIDUrl+"/portal/register"
				}
				if (provider.name == 'SURFconext') {
					this.providerSurfconext = provider
				}
			}  
		}
		
	}

	private handleQueryParamCases() {
		try {
			// Handle authcode exchange
			const authCode = this.queryParams.queryStringValue("authCode", true);
			if (authCode) {
				this.sessionService.exchangeCodeForToken(authCode).then(token => {
					this.sessionService.storeToken(token);
					this.externalToolsManager.externaltoolsList.updateIfLoaded();
					this.initFinished = this.router.navigate([ 'recipient' ]);
				});
				return;
			}

			// legacy authToken support
			else if (this.queryParams.queryStringValue("authToken", true)) {
				this.sessionService.storeToken({
					access_token: this.queryParams.queryStringValue("authToken", true)
				});
				if (this.queryParams.queryStringValue("public", true)) {
					let badgeClassSlug = this.queryParams.queryStringValue("badgeclassSlug", true)
					let enrollmentStatus = this.queryParams.queryStringValue("enrollmentStatus", true)
					this.initFinished = this.router.navigate(['public/badges/'+badgeClassSlug], {'queryParams':{'enrollmentStatus': enrollmentStatus}})
					return;
				}
				this.externalToolsManager.externaltoolsList.updateIfLoaded();
				this.initFinished = this.router.navigate([ 'recipient' ]);
				return;
			}

			// Handle external auth failure case
			else if (this.queryParams.queryStringValue("authError", true)) {
				this.sessionService.logout();
				let authErrorMessage = this.queryParams.queryStringValue("authError", true)
				if (authErrorMessage.indexOf('EduID account') >= 0){
					this.commonDialogsService.eduIDFailureDialog.openFailureDialog()
				}
				this.messageService.reportHandledError(authErrorMessage, null, true);
			}

			// Handle already logged-in case
			else if (this.sessionService.isLoggedIn) {
				this.externalToolsManager.externaltoolsList.updateIfLoaded();
				this.initFinished = this.router.navigate([ 'recipient' ]);
				return;
			}

			this.initFinished = Promise.resolve(true);
		} finally {
			this.queryParams.clearInitialQueryParams();
		}
	}

}
