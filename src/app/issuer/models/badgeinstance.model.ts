import {
	BadgeInstanceUrl,
	ApiBadgeInstance,
	BadgeInstanceRef,
	ApiBadgeInstanceForCreation, ApiBadgeInstanceForBatchCreation, ApiBadgeInstanceEvidenceItem
} from "./badgeinstance-api.model";
import { BadgeClassUrl } from "./badgeclass-api.model";
import { IssuerUrl } from "./issuer-api.model";
import { ManagedEntity } from "../../common/model/managed-entity";
import { ApiEntityRef } from "../../common/model/entity-ref";
import { StandaloneEntitySet } from "../../common/model/managed-entity-set";
import { BadgeInstanceManager } from "../services/badgeinstance-manager.service";
import {PaginationResults} from "../services/badgeinstance-api.service";


export class BadgeClassInstances extends StandaloneEntitySet<BadgeInstance, ApiBadgeInstance> {
	public lastPaginationResult:PaginationResults = null;

	constructor(
		public badgeInstanceManager: BadgeInstanceManager,
		public issuerSlug: string,
		public badgeClassSlug: string,
		public recipientQuery?: string
	) {
		super(
			apiModel => new BadgeInstance(this),
			apiModel => apiModel.json.id,
			() => {
				return this.badgeInstanceManager.badgeInstanceApiService.listBadgeInstances(issuerSlug, badgeClassSlug, recipientQuery).then(resultset => {
					if (resultset.links) {
						this.lastPaginationResult = resultset.links;
					}
					return resultset.instances;
				});
			}
		);
	}

	// createBadgeInstance(
	// 	initialBadgeInstance: ApiBadgeInstanceForCreation
	// ): Promise<BadgeInstance>
	// {
	// 	return this.badgeInstanceManager.badgeInstanceApiService
	// 		.createBadgeInstance(this.issuerSlug, this.badgeClassSlug, initialBadgeInstance)
	// 		.then((newApiInstance) => {
	// 			this.addOrUpdate(newApiInstance);
	// 			return this.entityForSlug(newApiInstance.slug)
	// 		});
	// }

	createBadgeInstanceBatched(
		badgeInstanceBatch: ApiBadgeInstanceForBatchCreation
	): Promise<BadgeInstance[]>
	{
		let badgeInstances:BadgeInstance[] = [];
		return this.badgeInstanceManager.badgeInstanceApiService
			.createBadgeInstanceBatched(this.issuerSlug, this.badgeClassSlug, badgeInstanceBatch)
			.then((newApiInstance) => {
				newApiInstance.forEach(apiInstance => {
					this.addOrUpdate(apiInstance);
					badgeInstances.push(
						this.entityForSlug(apiInstance.slug)
					)
				})
				return badgeInstances;
			});
	}

	loadNextPage() {
		if (this.lastPaginationResult && this.lastPaginationResult.hasNext) {
			return this.loadPage(this.lastPaginationResult.nextUrl)
		}
	}

	loadPrevPage() {
		if (this.lastPaginationResult && this.lastPaginationResult.hasPrev) {
			return this.loadPage(this.lastPaginationResult.prevUrl)
		}
	}

	private loadPage(url) {
			return this.badgeInstanceManager.badgeInstanceApiService.getBadgeInstancePage(url).then(resultset => {
				if (resultset.links) {
					this.lastPaginationResult = resultset.links;
				}
				this.updateSetUsingApiModels(resultset.instances);
			})
	}
}

/**
 * Managed class for an issued Badge Instance.
 */
export class BadgeInstance extends ManagedEntity<ApiBadgeInstance, BadgeInstanceRef> {

	constructor(
		public badgeClassInstances: BadgeClassInstances,
		initialEntity: ApiBadgeInstance = null
	) {
		super(badgeClassInstances.badgeInstanceManager.commonManager);

		if (initialEntity != null) {
			this.applyApiModel(initialEntity);
		}
	}

	protected buildApiRef(): ApiEntityRef {
		return {
			"@id": this.instanceUrl,
			slug: this.apiModel.slug,
		};
	}

	get instanceUrl(): BadgeInstanceUrl { return this.apiModel.json.id }

	get issuerUrl(): IssuerUrl { return this.apiModel.issuer }

	get issuerSlug(): string { return this.badgeClassInstances.issuerSlug; }

	get badgeClassUrl(): BadgeClassUrl { return this.apiModel.badge_class }

	get badgeClassSlug(): string { return this.badgeClassInstances.badgeClassSlug; }

	get recipientIdentifier(): string { return this.apiModel.recipient_identifier }

	get recipientEmail(): string { return this.apiModel.recipient_email }

	get recipientName(): string { return this.apiModel.recipient_name }

	get recipientType(): string { return this.apiModel.recipient_type }

	get image(): string { return this.apiModel.image }
	get imagePreview(): string { return `${this.apiModel.json.image}?type=png` }

	get issuedOn(): Date { return new Date(this.apiModel.json.issuedOn) }

	get createdAt(): Date { return new Date(this.apiModel.created_at) }

	get createdBy(): string { return this.apiModel.created_by }

	get isRevoked(): boolean { return this.apiModel.revoked }

	get revocationReason(): string { return this.apiModel.revocation_reason }

	get evidenceItems(): ApiBadgeInstanceEvidenceItem[] { return this.apiModel.evidence_items }

	revokeBadgeInstance(revocationReason:string): Promise<BadgeClassInstances> {
		return this.badgeInstanceManager.badgeInstanceApiService.revokeBadgeInstance(
			this.issuerSlug,
			this.badgeClassSlug,
			this.slug,
			revocationReason
		).then(() => {
			this.badgeClassInstances.remove(this);
			return this.badgeClassInstances;
		});
	}

	hasExtension(extensionName:string) {
		return (this.apiModel.extensions && extensionName in this.apiModel.extensions);
	}
	getExtension(extensionName:string, defaultValue) {
		return this.hasExtension(extensionName) ? this.apiModel.extensions[extensionName] : defaultValue;
	}
}