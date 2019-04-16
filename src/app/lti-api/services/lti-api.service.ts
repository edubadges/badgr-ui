import { Injectable } from '@angular/core';
import { SessionService } from "../../common/services/session.service";
import { Http } from "@angular/http";
import { SystemConfigService } from "../../common/services/config.service";
import { MessageService } from "../../common/services/message.service"
import { BaseHttpApiService } from "../../common/services/base-http-api.service";


@Injectable()
export class LtiApiService extends BaseHttpApiService{

	constructor(
		protected sessionService: SessionService,
		protected http: Http,
		protected configService: SystemConfigService,
		protected messageService: MessageService
	) {
		super(sessionService, http, configService, messageService);
	}


	get currentContextId(): Promise<any>{
		let url = '/lti_edu/lticontext'
		return this.get(url).then(r => this.setCurrentContextId(r));

	}

	private setCurrentContextId(response){
		return response.json();
	}

}