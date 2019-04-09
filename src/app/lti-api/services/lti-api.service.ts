import {Injectable} from '@angular/core';
import { SessionService } from "../../common/services/session.service";
import { Http } from "@angular/http";
import { SystemConfigService } from "../../common/services/config.service";
import { MessageService } from "../../common/services/message.service"
import { BaseHttpApiService } from "../../common/services/base-http-api.service";


@Injectable()
export class LtiApiService extends BaseHttpApiService{

	constructor(
		//protected sessionService: LoginService,
		protected sessionService: SessionService,
		protected http: Http,
		protected configService: SystemConfigService,
		protected messageService: MessageService
	) {
		super(sessionService, http, configService, messageService);
	}


	get currentContextId(){

		let url = '/lti_edu/lticontext'
		this.get(url).then(r => this.setCurrentContextId(r));
		return window[ "current_context" ];
	}

	private setCurrentContextId(response){
		let current_context = response.json();
		window['current_context'] = current_context

	}

}