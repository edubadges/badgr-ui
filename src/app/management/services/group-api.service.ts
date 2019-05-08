import { Injectable } from "@angular/core";
import { Http, Response } from "@angular/http";
import { BaseHttpApiService } from "../../common/services/base-http-api.service";
import { SessionService } from "../../common/services/session.service";
import { SystemConfigService } from "../../common/services/config.service";
import { MessageService } from "../../common/services/message.service";


@Injectable()
export class GroupApiService extends BaseHttpApiService {
	constructor(
		protected loginService: SessionService,
		protected http: Http,
		protected configService: SystemConfigService,
		protected messageService: MessageService,
	) {
		super(loginService, http, configService, messageService);
	}

	getAllGroupsWithinScope(): Promise<any[]> {
		return this.get(`/management/groups`)
		.then(r => r.json())
	}


}