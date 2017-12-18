import { Injectable, Inject, forwardRef } from "@angular/core";
import { RecipientGroup, IssuerRecipientGroups } from "../models/recipientgroup.model";
import { ApiRecipientGroupForCreation } from "../models/recipientgroup-api.model";
import { RecipientGroupApiService } from "./recipientgroup-api.service";
import { MessageService } from "../../common/services/message.service";
import { CommonEntityManager } from "../../entity-manager/common-entity-manager.service";
import "../../entity-manager/common-entity-manager.service";

@Injectable()
export class RecipientGroupManager {
	private recipientGroupsByIssuer: {[issuerSlug: string]: IssuerRecipientGroups} = {};

	constructor(
		public recipientGroupApiService: RecipientGroupApiService,
		@Inject(forwardRef(() => CommonEntityManager))
		public commonManager: CommonEntityManager,
		public messageService: MessageService
	) {}

	recipientGroupsForIssuer(issuerSlug: string): IssuerRecipientGroups {
		if (issuerSlug in this.recipientGroupsByIssuer) {
			return this.recipientGroupsByIssuer[ issuerSlug ];
		} else {
			return this.recipientGroupsByIssuer[ issuerSlug ] = new IssuerRecipientGroups(this, issuerSlug);
		}
	}

	loadRecipientGroupsForIssuer(issuerSlug: string): Promise<IssuerRecipientGroups> {
		return this.recipientGroupsForIssuer(issuerSlug).loadedPromise;
	}

	createRecipientGroup(
		issuerSlug: string,
		initialRecipientGroup: ApiRecipientGroupForCreation
	): Promise<RecipientGroup> {
		return this
			.loadRecipientGroupsForIssuer(issuerSlug)
			.then(recipientGroups => recipientGroups.createRecipientGroup(initialRecipientGroup))
	}

	recipientGroupSummaryFor(
		issuerSlug: string,
		recipientGroupSlug: string
	): Promise<RecipientGroup> {
		return this.loadRecipientGroupsForIssuer(issuerSlug)
			.then(issuerRecipientGroups => {
				var existing = issuerRecipientGroups.entityForSlug(recipientGroupSlug);

				if (!existing) {
					return Promise.reject<RecipientGroup>(`Issuer ${issuerSlug} has no recipientGroup ${recipientGroupSlug}`);
				}

				return Promise.resolve<RecipientGroup>(existing);
			})
	}
}