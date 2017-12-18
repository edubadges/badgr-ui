import { RecipientGroupManager } from "../services/recipientgroup-manager.service";
import { StandaloneEntitySet, LazyEmbeddedEntitySet } from "../../common/model/managed-entity-set";
import {
	ApiRecipientGroup,
	ApiRecipientGroupMember,
	ApiRecipientGroupForCreation,
	RecipientGroupRef, ApiRecipientGroupMemberForCreation
} from "./recipientgroup-api.model";
import { ManagedEntity } from "../../common/model/managed-entity";
import { LearningPathway } from "./pathway.model";
import { PathwayRef } from "./pathway-api.model";
import { BidirectionallyLinkedEntitySet } from "../../common/model/linked-entity-set";
import { ApiEntityRef } from "../../common/model/entity-ref";

/**
 * Managed model class holding the recipientGroups owned by an issuer. Does not load recipientGroup detail unless requested for
 * a particular detail.
 */
export class IssuerRecipientGroups extends StandaloneEntitySet<RecipientGroup, ApiRecipientGroup> {
	constructor(
		public recipientGroupManager: RecipientGroupManager,
		public issuerSlug: string
	) {
		super(
			apiModel => new RecipientGroup(this),
			apiModel => apiModel[ "@id" ],
			() =>
				this.recipientGroupManager.recipientGroupApiService
					.listIssuerRecipientGroups(this.issuerSlug)
					.then(a => a.recipientGroups)
		);
	}

	createRecipientGroup(
		initialRecipientGroup: ApiRecipientGroupForCreation
	): Promise<RecipientGroup> {
		return this.recipientGroupManager.recipientGroupApiService
			.createRecipientGroup(
				this.issuerSlug,
				initialRecipientGroup
			)
			.then(newRecipientGroup => {
				this.addOrUpdate(newRecipientGroup);
				return this.entityForSlug(newRecipientGroup.slug);
			});
	}

	get allDetailsLoaded() {
		return this.loaded && ! this.entities.find(g => ! g.isDetailLoaded);
	}

	private ensureAllDetailsPromise: Promise<this>;
	get allDetailsLoadedPromise(): Promise<this> {
		if (this.ensureAllDetailsPromise) return this.ensureAllDetailsPromise;
		else {
			if (this.allDetailsLoaded) {
				return Promise.resolve(this);
			} else {
				return this.ensureAllDetailsPromise = this.recipientGroupManager.recipientGroupApiService
					.listIssuerRecipientGroupDetail(this.issuerSlug)
					.then(
						list => {
							this.applyApiData(list.recipientGroups);
							this.ensureAllDetailsPromise = null;
							return this;
						},
						error => {
							this.ensureAllDetailsPromise = null;
							return error;
						}
					)
			}
		}
	}
}

/**
 * Managed class for a learning recipientGroup summary / metadata. Does not include detail data unless requested.
 */
export class RecipientGroup extends ManagedEntity<ApiRecipientGroup, RecipientGroupRef> {
	public subscribedPathways = new BidirectionallyLinkedEntitySet<RecipientGroup, LearningPathway, PathwayRef>(
		this,
		() => this.apiModel.pathways,
		ref => this.pathwayManager.loadPathwaysForIssuer(this.issuerSlug)
			.then(p => p.entityForUrl(ref)),
		pathway => pathway.subscribedGroups
	);

	members = new LazyEmbeddedEntitySet<RecipientGroup, RecipientGroupMember, ApiRecipientGroupMember>(
		this,
		() => this.apiModel && this.apiModel.members,
		() => this.detailLoadedPromise.then(t => t.apiModel.members),
		() => new RecipientGroupMember(this),
		apiModel => apiModel[ "@id" ]
	);
	
	constructor(
		public issuerRecipientGroups: IssuerRecipientGroups,
		initialEntity: ApiRecipientGroup = null
	) {
		super(
			issuerRecipientGroups.recipientGroupManager.commonManager
		);

		if (initialEntity) {
			this.applyApiModel(initialEntity);
		}
	}
	
	get isDetailLoaded(): boolean {
		return !! (this.loaded && this.apiModel.members);
	}

	private _detailLoadedPromise;

	get detailLoadedPromise(): Promise<this> {
		if (this._detailLoadedPromise)
			return this._detailLoadedPromise;
		else if (this.isDetailLoaded) {
			return Promise.resolve(this);
		} else {
			return this._detailLoadedPromise = this.update()
				.then(
					() => (this._detailLoadedPromise = null, this),
					(error => {
						this._detailLoadedPromise = null;
						this.messageService.reportAndThrowError(`Failed to load recipient group detail for ${this.name}`, error);
					}) as () => never
				);
		}
	}

	buildApiRef(): RecipientGroupRef {
		return {
			"@id": this.apiModel[ "@id" ],
			slug: this.apiModel.slug
		};
	}

	get issuerSlug(): string { return this.issuerRecipientGroups.issuerSlug; }

	get recipientGroupSlug(): string { return this.slug }

	get id(): string { return this.url; }

	get "@type"(): string { return this.apiModel["@type"] }
	get type(): string { return this[ "@type" ]; }

	get name(): string { return this.apiModel.name; }
	set name(name: string) { this.apiModel.name = name; }

	get description(): string { return this.apiModel.description; }
	set description(description: string) { this.apiModel.description = description; }

	get memberCount(): number {
		return (this.members.loaded ? this.members.length : this.apiModel.member_count) || 0;
	}

	get active(): boolean { return this.apiModel.active }
	set active(active: boolean) {
		this.apiModel.active = active
	}
	
	save(): Promise<RecipientGroup> {
		return this.recipientGroupManager.recipientGroupApiService.putRecipientGroup(
			this.issuerSlug,
			this.recipientGroupSlug,
			this.apiModel
		).then(
			newModel => (this.applyApiModel(newModel), this)
		)
	}

	update(): Promise<this> {
		return this.recipientGroupManager.recipientGroupApiService.getRecipientGroupDetail(
			this.issuerSlug,
			this.slug
		).then(
			model => this.applyApiModel(model)
		)
	}

	get subscribedPathwayRefs(): PathwayRef[] {
		return this.apiModel.pathways || [];
	}

	deleteRecipientGroup(): Promise<IssuerRecipientGroups> {
		return this.recipientGroupManager.recipientGroupApiService.deleteRecipientGroup(
			this.issuerSlug,
			this.recipientGroupSlug
		).then(
			newModel => (this.issuerRecipientGroups.remove(this), this.issuerRecipientGroups)
		);
	}

	addMember(member: ApiRecipientGroupMemberForCreation): RecipientGroupMember {
		return this.members.addOrUpdate({
			"@id": "mailto:" + member.email,
			"slug": member.email.replace(/[^\w\d]/gi, ""),
			email: member.email,
			name: member.name
		});
	}
}

/**
 * Managed model class for Learning RecipientGroup members.
 */
export class RecipientGroupMember extends ManagedEntity<ApiRecipientGroupMember, ApiEntityRef> {
	constructor(
		public group: RecipientGroup
	) {
		super(group.commonManager);
	}

	buildApiRef(): ApiEntityRef {
		return {
			"@id": this.apiModel[ "@id" ],
			slug: this.apiModel.slug
		};
	}

	get recipientGroupUrl() { return this.group.url }

	get id() { return this.url }

	get memberName(): string { return this.apiModel.name; }

	get memberEmail(): string { return this.apiModel.email; }

	set memberName(value: string) { this.apiModel.name = value; }

	set memberEmail(value: string) { this.apiModel.email = value; }
}
