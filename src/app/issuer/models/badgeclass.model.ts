import { BadgeClassUrl, ApiBadgeClass, BadgeClassRef, ApiBadgeClassAlignment, BadgeClassCategory} from "./badgeclass-api.model"; //, ApiBadgeClassExtension
import { IssuerUrl } from "./issuer-api.model";
import { ManagedEntity } from "../../common/model/managed-entity";
import { ApiEntityRef } from "../../common/model/entity-ref";
import { CommonEntityManager } from "../../entity-manager/common-entity-manager.service";
import { ifTrue } from "codelyzer/util/function";

export class BadgeClass extends ManagedEntity<ApiBadgeClass, BadgeClassRef> {
	constructor(
		commonManager: CommonEntityManager,
		initialEntity: ApiBadgeClass = null,
		onUpdateSubscribed: () =>void = undefined
	) {
		super(commonManager, onUpdateSubscribed);

		if (initialEntity != null) {
			this.applyApiModel(initialEntity);
		}
	}

	protected buildApiRef(): ApiEntityRef {
		return {
			"@id": this.badgeUrl,
			slug: this.apiModel.slug
		};
	}

	get badgeUrl(): BadgeClassUrl { return this.apiModel.json.id }

	get issuerUrl(): IssuerUrl { return this.apiModel.issuer }

	get name(): string { return this.apiModel.name }
	set name(name: string) { this.apiModel.name = name }

	get description(): string { return this.apiModel.description }
	set description(description: string) {
		this.apiModel.json.description = description;
		this.apiModel.description = description;
	}

	get image(): string { return this.apiModel.image }
	set image(image: string) { this.apiModel.image = image}

	get createdAt(): Date { return new Date(this.apiModel.created_at) }

	get createdBy(): string { return this.apiModel.created_by }

	get recipientCount(): number { return this.apiModel.recipient_count }

	get enrollmentCount(): number { return this.apiModel.enrollment_count }

	get criteria_text(): string { return this.apiModel.criteria_text }
	set criteria_text(criteria_text: string) {
		this.apiModel.json.criteria_text = criteria_text;
		this.apiModel.criteria_text = criteria_text;
	}

	get criteria_url(): string { return this.apiModel.criteria_url }
	set criteria_url(criteria_url: string) {
		this.apiModel.json.criteria_url = criteria_url;
		this.apiModel.criteria_url = criteria_url;
	}

	get tags(): string[] {
		return this.apiModel.tags;
	}
	set tags(tags: string[]) {
		this.apiModel.tags = tags;
	}

	get category(): BadgeClassCategory {
		return this.apiModel.category
	}

	set category(category: BadgeClassCategory) {
		this.apiModel.category = category;
	}

	get issuerSlug(): string {
		return BadgeClass.issuerSlugFromUrl(this.issuerUrl);
	}

	get alignments() {
		return this.apiModel.alignment;
	}
	set alignments(alignments: ApiBadgeClassAlignment[]) {
		this.apiModel.alignment = alignments;
	}

	get extensions() {
		return this.apiModel['extensions'];
	}

	set extensions(extensions: Object) {
		this.apiModel.extensions = extensions;
	}

	get hasExtensions(){
		return Object.keys(this.apiModel['extensions']).length > 0;
	}
	// TODO: The API should give us the issuer slug for a badge, and we should not need to parse the URL.
	static issuerSlugForApiBadge(apiBadge: ApiBadgeClass) {
		return BadgeClass.issuerSlugFromUrl(apiBadge.issuer);
	}

	public update(): Promise<this> {
		return this.badgeManager.badgeClassApi.getBadgeForIssuerSlugAndBadgeSlug(this.issuerSlug, this.slug).then(
			apiBadge => this.applyApiModel(apiBadge)
		);
	}

	public save(): Promise<this> {
		return this.badgeManager.badgeClassApi.updateBadgeClass(this.issuerSlug, this.apiModel)
			.catch(e => {
				this.revertChanges();
				throw e;
			})
			.then(apiBadge => this.applyApiModel(apiBadge));
	}

	private static issuerSlugFromUrl(issuerUrl: string) {
		return (issuerUrl.match(/\/public\/issuers\/([^\/]+)/) || [])[ 1 ] || null;
	}
}
