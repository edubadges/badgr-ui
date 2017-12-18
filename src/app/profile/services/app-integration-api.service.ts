import { Injectable } from "@angular/core";
import { Http } from "@angular/http";
import { SessionService } from "../../common/services/session.service";
import { SystemConfigService } from "../../common/services/config.service";
import { BaseHttpApiService } from "../../common/services/base-http-api.service";
import { ApiAppIntegration } from "../models/app-integration-api.model";
import { flatten } from "../../common/util/array-reducers";
import { MessageService } from "../../common/services/message.service";

@Injectable()
export class AppIntegrationApiService extends BaseHttpApiService {
	constructor(
		protected loginService: SessionService,
		protected http: Http,
		protected configService: SystemConfigService,
		protected messageService: MessageService
	) {
		super(loginService, http, configService, messageService);
	}

	listIntegratedApps(): Promise<ApiAppIntegration[]> {
		return Promise.all((this.configService.apiConfig.integrationEndpoints || [])
			.map(endpoint =>
				this.get(endpoint)
					.then(response => response.json() as ApiAppIntegration[])
			)
		).then(
			lists => lists.reduce(flatten<ApiAppIntegration>(), [])
		)
	}
}

