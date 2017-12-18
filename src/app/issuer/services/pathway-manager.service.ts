import { Injectable, Inject, forwardRef } from "@angular/core";
import { LearningPathway, IssuerPathways } from "../models/pathway.model";
import { ApiPathwaySummaryForCreation } from "../models/pathway-api.model";
import { PathwayApiService } from "./pathway-api.service";
import { MessageService } from "../../common/services/message.service";
import { CommonEntityManager } from "../../entity-manager/common-entity-manager.service";
import "../../entity-manager/common-entity-manager.service";
import { IssuerUrl, IssuerSlug } from "../models/issuer-api.model";

@Injectable()
export class PathwayManager {
	private pathwaysByIssuer: {[issuerSlug: string]: IssuerPathways} = {};

	constructor(
		public pathwayApiService: PathwayApiService,
		@Inject(forwardRef(() => CommonEntityManager))
		public commonManager: CommonEntityManager,
		public messageService: MessageService
	) {}

	pathwaysForIssuer(issuerSlug: IssuerSlug): IssuerPathways {
		if (issuerSlug in this.pathwaysByIssuer) {
			return this.pathwaysByIssuer[ issuerSlug ];
		} else {
			return this.pathwaysByIssuer[ issuerSlug ] = new IssuerPathways(this, issuerSlug);
		}
	}

	loadPathwaysForIssuer(issuerSlug: IssuerSlug): Promise<IssuerPathways> {
		return this.pathwaysForIssuer(issuerSlug).loadedPromise;
	}

	createPathway(
		issuerSlug: string,
		initialPathway: ApiPathwaySummaryForCreation
	): Promise<LearningPathway> {
		return this
			.loadPathwaysForIssuer(issuerSlug)
			.then(pathways => pathways.createPathway(initialPathway))
	}

	pathwaySummaryFor(
		issuerSlug: string,
		pathwaySlug: string
	): Promise<LearningPathway> {
		return this.loadPathwaysForIssuer(issuerSlug)
			.then(issuerPathways => {
				var existing = issuerPathways.entityForSlug(pathwaySlug);

				if (!existing) {
					return Promise.reject<LearningPathway>(`Issuer ${issuerSlug} has no pathway ${pathwaySlug}`);
				}

				return Promise.resolve<LearningPathway>(existing);
			})
	}
}