import {Http} from "@angular/http";
import {Injectable} from "@angular/core";
import {BaseHttpApiService} from "../../common/services/base-http-api.service";
import {SessionService} from "../../common/services/session.service";
import {SystemConfigService} from "../../common/services/config.service";
import {MessageService} from "../../common/services/message.service";
import {
	ApiExternalTool, ApiExternalToolLaunchInfo,
	ApiExternalToolLaunchpoint
} from "../models/externaltools-api.model";


@Injectable()
export class ExternalToolsApiService extends BaseHttpApiService {
	constructor(
		protected loginService: SessionService,
		protected http: Http,
		protected configService: SystemConfigService,
		protected messageService: MessageService
	) {
		super(loginService, http, configService, messageService)
	}

	listTools(): Promise<ApiExternalTool[]> {
		return this.get(`/v1/externaltools/`).then(r => r.json())
	}

	getLaunchToolInfo(launchpoint: ApiExternalToolLaunchpoint): Promise<ApiExternalToolLaunchInfo> {
		return this.get(launchpoint.url).then(r => r.json())
	}
}