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
	template: ``
})
export class BaseLoginComponent extends BaseRoutableComponent implements OnInit {
	provider: object;
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
			if (provider.name ==  this.providerName) {
				this.provider = provider
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
