import {Injectable} from '@angular/core';
import { SessionService } from "../../app/common/services/session.service";
import { Http } from "@angular/http";
import { SystemConfigService } from "../../app/common/services/config.service";
import { MessageService } from "../../app/common/services/message.service"
import { BaseHttpApiService } from "../../app/common/services/base-http-api.service";


@Injectable()
export class ThemeApiService extends BaseHttpApiService{

	constructor(
		//protected sessionService: LoginService,
		protected sessionService: SessionService,
		protected http: Http,
		protected configService: SystemConfigService,
		protected messageService: MessageService
	) {
		super(sessionService, http, configService, messageService);
		this.setNoLogin();
	}


	get currentTheme(){
		let domain = window.location.hostname;

		if(window.hasOwnProperty('current_theme_set')){
			return window[ "badgrTheme" ]
		}

		let url = '/v1/theme/'+domain;
		this.get(url).then(r => this.updateTheme(r));
		window['current_theme_set'] = true;
		return window[ "badgrTheme" ];
	}

	private updateTheme(response){
		let theme = response.json();
		if ('welcomeMessage' in theme) {
			let base_url = this.configService.apiConfig.baseUrl
			window['badgrTheme'].logoImg.small = base_url + theme.logoImg.small;
			window['badgrTheme'].logoImg.desktop = base_url + theme.logoImg.desktop;
			// window['badgrTheme'].termsOfServiceLink = theme.termsOfServiceLink;
			window['badgrTheme'].welcomeMessage = theme.welcomeMessage;
			// window['badgrTheme'].privacyPolicyLink = theme.privacyPolicyLink;
			window['badgrTheme'].showPoweredByBadgr = theme.showPoweredByBadgr;
			window['badgrTheme'].showApiDocsLink = theme.showApiDocsLink;
			window['badgrTheme'].consent_apply_badge= theme.consent_apply_badge;
			window['badgrTheme'].consent_apply_badge_en = theme.consent_apply_badge_en;
			window['badgrTheme'].privacy_statement = theme.privacy_statement;
			window['badgrTheme'].privacy_statement_en = theme.privacy_statement_en;
			window['badgrTheme'].language_detected = theme.language_detected;
			window['badgrTheme'].dutch_language_codes = theme.dutch_language_codes;

		}
	}
}