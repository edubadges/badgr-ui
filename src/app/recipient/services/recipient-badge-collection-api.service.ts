import { Injectable } from "@angular/core";
import { Http } from "@angular/http";
import { SessionService } from "../../common/services/session.service";
import { SystemConfigService } from "../../common/services/config.service";
import { BaseHttpApiService } from "../../common/services/base-http-api.service";
import {
	ApiRecipientBadgeCollection,
	ApiRecipientBadgeCollectionForCreation
} from "../models/recipient-badge-collection-api.model";
import { MessageService } from "../../common/services/message.service";

@Injectable()
export class RecipientBadgeCollectionApiService extends BaseHttpApiService {
	constructor(
		protected loginService: SessionService,
		protected http: Http,
		protected configService: SystemConfigService,
		protected messageService: MessageService
	) {
		super(loginService, http, configService, messageService);
	}

	listRecipientBadgeCollections(): Promise<ApiRecipientBadgeCollection[]> {
		return this
			.get(`/v1/earner/collections?json_format=plain`)
			.then(r => r.json());
	}

	removeRecipientBadgeCollection(collectionSlug: string): Promise<void> {
		return this
			.delete(`/v1/earner/collections/${collectionSlug}`)
			.then(r => void 0);
	}

	addRecipientBadgeCollection(
		badgeInfo: ApiRecipientBadgeCollectionForCreation
	): Promise<ApiRecipientBadgeCollection>{
		return this
			.post('/v1/earner/collections?json_format=plain', badgeInfo)
			.then(r => r.json())
	}

	saveRecipientBadgeCollection(
		apiModel: ApiRecipientBadgeCollection
	): Promise<ApiRecipientBadgeCollection>{
		return this
			.put(`/v1/earner/collections/${apiModel.slug}?json_format=plain`, apiModel)
			.then(r => r.json())
	}
}

