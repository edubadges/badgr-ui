import { Injectable } from "@angular/core";
import { SessionService } from "./session.service";
import { Http } from "@angular/http";
import { SystemConfigService } from "./config.service";
import { MessageService } from "./message.service";
import { BaseHttpApiService } from "./base-http-api.service";
import {
	ApiOAuth2AppAuthorization, ApiOAuth2ClientAuthorized, ApiOAuthResponse,
	OAuth2RequestParams
} from "../model/oauth-api.model";
import {SocialAccountProviderInfo} from "../model/user-profile-api.model";

@Injectable()
export class OAuthApiService extends BaseHttpApiService {
	constructor(
		protected loginService: SessionService,
		protected http: Http,
		protected configService: SystemConfigService,
		protected messageService: MessageService
	) {
		super(loginService, http, configService, messageService);
	}

	listAuthorizations(): Promise<ApiOAuth2AppAuthorization[]> {
		const now = new Date;

		return this.get(`/v2/auth/tokens`)
			.then(r => r.json() as ApiOAuth2AppAuthorization[]);
			//.then(list => list.filter(token => new Date(token.expires) > now));
	}

	deleteAuthorization(entityId: string) {
		return this.delete(`/v2/auth/tokens/${entityId}`);
	}

	startAuthorization(
		request: OAuth2RequestParams
	): Promise<ApiOAuthResponse> {
		return this.get(
			`/o/authorize`,
			{
				"response_type": "code",
				"approval_prompt": "auto", // Allows skipping the approval prompt if the app was already approved
				"client_id": request.clientId,
				"redirect_uri": request.redirectUrl,
				... (request.scopeString ? { "scope": request.scopeString } : {}),
				... (request.stateString ? { "state": request.stateString } : {})
			},
			false
		).then(r => r.json());
	}

	authorizeApp(
		request: OAuth2RequestParams,
		authorizedScopes: string[]
	): Promise<ApiOAuth2ClientAuthorized> {
		return this.post(
			`/o/authorize`,
			{
				"allow": true,
				"response_type": "code",
				"client_id": request.clientId,
				"redirect_uri": request.redirectUrl,
				"scopes": authorizedScopes,
				... (request.stateString ? { "state": request.stateString } : {})
			}
		).then(r => r.json());
	}

	connectProvider(provider: SocialAccountProviderInfo) {
		return this.get(`/v1/user/socialaccounts/connect?provider=${provider.slug}`).then(r => r.json())
	}
}