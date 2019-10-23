import {Injectable} from '@angular/core';
import { SessionService } from "../../common/services/session.service";
import { Http } from "@angular/http";
import { SystemConfigService } from "../../common/services/config.service";
import { MessageService } from "../../common/services/message.service"
import { BaseHttpApiService } from "../../common/services/base-http-api.service";
import { ApiBadgeClass, ApiBadgeClassContextId } from "../../issuer/models/badgeclass-api.model";
import { EmbedService } from "../../common/services/embed.service";


@Injectable()
export class LtiApiService extends BaseHttpApiService{

	constructor(
		protected sessionService: SessionService,
		protected http: Http,
		protected configService: SystemConfigService,
		protected messageService: MessageService,
		private embedService: EmbedService
	) {
		super(sessionService, http, configService, messageService);
	}


	get currentContextId(): Promise<any>{
		if(this.embedService.isEmbedded) {
			let url = '/lti_edu/lticontext';
			return this.get(url).then(r => this.setCurrentContextId(r));
		}
		return null;

	}

	private setCurrentContextId(response){
		return response.json();
	}



	getAllContextIdBadgeClasses(
		contextId:string
	): Promise<ApiBadgeClassContextId[]> {
		return this.get('/lti_edu/badgeclasslticontext/'+contextId+'/')
			.then(r => r.json());

	}

	getAllContextIdStudentBadgeClasses(
		contextId:string
	): Promise<ApiBadgeClassContextId[]> {
		return this.get('/lti_edu/badgeclasslticontextstudent/'+contextId+'/')
			.then(r => r.json());

	}


	addBadgeClassToLMS(
		badgeClassContextId : ApiBadgeClassContextId
	):Promise<string>{
		console.log('in function addBadgeClassToLMS');
		return this.post(`/lti_edu/addbadgeclasslticontext`, badgeClassContextId)
			.then(r => r.json() as string);
	}

	removeBadgeClassFromLMS(
		badgeClassContextId : ApiBadgeClassContextId
	):Promise<string>{
		console.log('in function removeBadgeClassFromLMS');
		return this.delete(`/lti_edu/addbadgeclasslticontext`, badgeClassContextId)
			.then(r => r.json() as string);
	}

}
