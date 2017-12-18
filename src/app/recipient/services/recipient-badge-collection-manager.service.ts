import { Injectable, forwardRef, Inject } from "@angular/core";
import { StandaloneEntitySet } from "../../common/model/managed-entity-set";
import { CommonEntityManager } from "../../entity-manager/common-entity-manager.service";
import {
	ApiRecipientBadgeCollectionForCreation,
	ApiRecipientBadgeCollection
} from "../models/recipient-badge-collection-api.model";
import { RecipientBadgeCollection } from "../models/recipient-badge-collection.model";
import { RecipientBadgeCollectionApiService } from "./recipient-badge-collection-api.service";
import { RecipientBadgeInstance } from "../models/recipient-badge.model";
import { EventsService } from "../../common/services/events.service";

@Injectable()
export class RecipientBadgeCollectionManager {
	recipientBadgeCollectionList = new StandaloneEntitySet<RecipientBadgeCollection, ApiRecipientBadgeCollection>(
		apiModel => new RecipientBadgeCollection(this.commonEntityManager, apiModel),
		apiModel => RecipientBadgeCollection.urlForApiModel(apiModel),
		() => this.recipientBadgeCollectionApiService.listRecipientBadgeCollections()
	);

	constructor(
		public recipientBadgeCollectionApiService: RecipientBadgeCollectionApiService,
		public eventsService: EventsService,
		@Inject(forwardRef(() => CommonEntityManager))
		public commonEntityManager: CommonEntityManager
	) {
		eventsService.profileEmailsChanged.subscribe(() => {
			this.updateIfLoaded();
		});
	}

	createRecipientBadgeCollection(
		collectionIngo: ApiRecipientBadgeCollectionForCreation
	): Promise<RecipientBadgeCollection> {
		return this.recipientBadgeCollectionApiService
			.addRecipientBadgeCollection(collectionIngo)
			.then(newBadge => this.recipientBadgeCollectionList.addOrUpdate(newBadge))
			;
	}

	deleteRecipientBadgeCollection(collection: RecipientBadgeCollection) {
		return this.recipientBadgeCollectionApiService
			.removeRecipientBadgeCollection(collection.slug)
			.then(() => this.recipientBadgeCollectionList.remove(collection))
			;
	}

	updateIfLoaded() {
		this.recipientBadgeCollectionList.updateIfLoaded();
	}
}