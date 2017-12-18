import { Component } from "@angular/core";
import { MessageService } from "../services/message.service";
import { OAuthManager } from "../services/oauth-manager.service";


@Component({
	selector: 'oauth-banner',
	host: {
		"[class]": "'authlink'"
	},
	template: `
		<ng-template [ngIf]="isAuthorizing">
			<div><img [src]="appInfo.image"
			          alt="{{ appInfo.name }} Logo"
			          height="72"></div>
			<div><img [src]="authLinkBadgrLogoSrc" height="72" alt="Badgr Logo"></div>
		</ng-template>
	`
})
export class OAuthBannerComponent {
	readonly authLinkBadgrLogoSrc = require("../../../breakdown/static/images/logo.svg");

	public get authInfo() {
		return this.oAuthManager.currentAuthorization;
	}

	public get appInfo() {
		return this.oAuthManager.currentAuthorization.application;
	}

	public get isAuthorizing() {
		return this.oAuthManager.isAuthorizationInProgress;
	}

	constructor(
		private messageService: MessageService,
		public oAuthManager: OAuthManager,
	) { }
}
