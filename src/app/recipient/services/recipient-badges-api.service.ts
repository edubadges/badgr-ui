import { Injectable } from "@angular/core";
import { Http } from "@angular/http";
import { SessionService } from "../../common/services/session.service";
import { SystemConfigService } from "../../common/services/config.service";
import { BaseHttpApiService } from "../../common/services/base-http-api.service";
import {
	ApiRecipientBadgeInstance, RecipientBadgeInstanceCreationInfo
} from "../models/recipient-badge-api.model";
import { MessageService } from "../../common/services/message.service";

@Injectable()
export class RecipientBadgeApiService extends BaseHttpApiService {

	constructor(
		protected loginService: SessionService,
		protected http: Http,
		protected configService: SystemConfigService,
		protected messageService: MessageService
	) {
		super(loginService, http, configService, messageService);
	}

	listRecipientBadges(): Promise<ApiRecipientBadgeInstance[]> {
		return this
			.get(`/v1/earner/badges?json_format=plain`)
			.then(r => r.json());
	}

	removeRecipientBadge(instanceSlug: string): Promise<void> {
		return this
			.delete(`/v1/earner/badges/${instanceSlug}`)
			.then(r => void 0);
	}

	addRecipientBadge(
		badgeInfo: RecipientBadgeInstanceCreationInfo
	): Promise<ApiRecipientBadgeInstance> {
		return this
			.post('/v1/earner/badges?json_format=plain', badgeInfo)
			.then(r => r.json())
	}

	saveInstance(apiModel: ApiRecipientBadgeInstance): Promise<ApiRecipientBadgeInstance> {
		return this
			.put(`/v1/earner/badges/${apiModel.id}?json_format=plain`, apiModel)
			.then(r => r.json());
	}

	getBadgeShareUrlForProvider(objectIdUrl, shareServiceType): Promise<string> {
		return this
			.get(`/v1/earner/share/badge/${objectIdUrl}?provider=${shareServiceType}&source=badgr-ui&redirect=0`)
			.then(r => r.json())
	}

	getCollectionShareUrlForProvider(objectIdUrl, shareServiceType): Promise<string> {
		let id_url = objectIdUrl.replace('badgr:badge-collection/','');
		return this
			.get(`/v1/earner/share/collection/${id_url}?provider=${shareServiceType}&source=badgr-ui&redirect=0`)
			.then(r => r.json())
	}
}

