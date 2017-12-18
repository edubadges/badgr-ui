import { PathwayManager } from "../services/pathway-manager.service";
import { ManagedEntitySet, StandaloneEntitySet } from "../../common/model/managed-entity-set";
import {
	ApiPathwaySummary,
	ApiPathwayDetail,
	ApiPathwayElement,
	ApiPathwayElementForCreation,
	ApiElementElementJunctionRequirement,
	ApiElementRequirementType,
	ApiElementBadgeJunctionRequirement,
	ApiElementRequirementJunctionType,
	ApiElementRequirementDisjunctionConfig,
	ApiElementJunctionRequirement,
	ApiElementRequirementConjunctionConfig,
	ApiPathwaySummaryForCreation, PathwayRef, PathwayElementRef
} from "./pathway-api.model";
import { BadgeClassUrl, BadgeClassSlug, BadgeClassRef } from "./badgeclass-api.model";
import { ManagedEntity } from "../../common/model/managed-entity";
import { BidirectionallyLinkedEntitySet } from "../../common/model/linked-entity-set";
import { RecipientGroup } from "./recipientgroup.model";
import { ApiEntityRef, EntityRef } from "../../common/model/entity-ref";
import { RecipientGroupRef } from "./recipientgroup-api.model";
import { EntityLink, MutableEntityLink } from "../../common/model/entity-link";
import { BadgeClass } from "./badgeclass.model";
import { flatten } from "../../common/util/array-reducers";

/**
 * Managed model class holding the pathways owned by an issuer. Does not load pathway structure unless requested for
 * a particular structure.
 */
export class IssuerPathways extends StandaloneEntitySet<LearningPathway, ApiPathwaySummary> {
	constructor(
		public pathwayManager: PathwayManager,
		public issuerSlug: string
	) {
		super(
			apiModel => new LearningPathway(this),
			apiModel => apiModel[ "@id" ],
			() => this.pathwayManager.pathwayApiService
				.listIssuerPathways(this.issuerSlug)
				.then(a => a.pathways)
		);
	}

	createPathway(
		initialPathway: ApiPathwaySummaryForCreation
	): Promise<LearningPathway> {
		return this.pathwayManager.pathwayApiService
			.createPathway(
				this.issuerSlug,
				initialPathway
			)
			.then(newPathway => {
				this.addOrUpdate(newPathway);
				return this.entityForSlug(newPathway.slug);
			});
	}
}

/**
 * Managed class for a learning pathway summary / metadata. Does not include structure data unless requested.
 */
export class LearningPathway extends ManagedEntity<ApiPathwaySummary, PathwayRef> {
	private ourStructure: LearningPathwayStructure;

	public subscribedGroups = new BidirectionallyLinkedEntitySet<LearningPathway, RecipientGroup, RecipientGroupRef>(
		this,
		() => (this.apiModel.groups = this.apiModel.groups || []),
		ref => this.recipientGroupManager.loadRecipientGroupsForIssuer(this.issuerSlug).then(g => g.entityForUrl(ref)),
		group => group.subscribedPathways
	);

	constructor(
		public issuerPathways: IssuerPathways,
		initialEntity: ApiPathwaySummary = null
	) {
		super(
			issuerPathways.pathwayManager.commonManager
		);

		if (initialEntity) {
			this.applyApiModel(initialEntity);
		}
	}

	buildApiRef(): PathwayRef {
		return {
			"@id": this.apiModel[ "@id" ],
			slug: this.apiModel.slug
		};
	}

	get issuerSlug(): string { return this.issuerPathways.issuerSlug; }

	get issuerUrl(): string { return EntityRef.urlForRef(this.apiModel.issuer) }
	
	get pathwaySlug(): string { return this.slug }

	get id(): string { return this.url; }

	get type(): string { return this[ "@type" ]; }

	get name(): string { return this.apiModel.name; }

	get description(): string { return this.apiModel.description; }

	get alignmentUrl(): string { return this.apiModel.alignmentUrl; }

	get totalSubscribedMembers(): number {
		return this.subscribedGroups.entities
			.map(g => g.memberCount)
			.reduce((a, b) => a + b, 0);
	}

	get isStructureLoaded(): boolean {
		return this.ourStructure && this.ourStructure.loaded;
	}
	
	private _completionBadge = new EntityLink<BadgeClass, BadgeClassRef>(
		this,
		ref => this.badgeManager.badgeByRef(ref),
		() => this.apiModel.completionBadge
	);

	get completionBadge() {
		return this.isStructureLoaded
			? this.structure.rootElement.completionBadge
			: this._completionBadge;
	}

	get rootChildCount(): number {
		return this.isStructureLoaded
			? this.ourStructure.rootElement.children.length
			: this.apiModel.rootChildCount;
	}

	get elementCount(): number {
		// Subtract 1 so we don't count the root element, which isn't an element from the users' perspective.
		return this.isStructureLoaded
			? (this.ourStructure.entities.length - 1)
			: (this.apiModel.elementCount - 1);
	}

	set name(name: string) { this.apiModel.name = name; }

	set description(description: string) { this.apiModel.description = description; }

	set alignmentUrl(alignmentUrl: string) { this.apiModel.alignmentUrl = alignmentUrl; }

	update(): Promise<this> {
		return this.issuerPathways.updateList().then(_ => this);
	}

	save(): Promise<this> {
		return this.pathwayManager.pathwayApiService.putPathwaySummary(
			this.issuerSlug,
			this.pathwaySlug,
			this.apiModel
		).then(
			newModel => this.applyApiModel(newModel)
		)
	}

	deletePathway(): Promise<void> {
		return this.pathwayManager.pathwayApiService.deletePathway(
			this.issuerSlug,
			this.pathwaySlug
		).then(
			() => {
				this.pathwayManager.loadPathwaysForIssuer(this.issuerSlug)
					.then(pathways => pathways.remove(this));

				return void 0;
			}
		);
	}

	get structure(): LearningPathwayStructure {
		if (this.ourStructure) {
			return this.ourStructure;
		} else {
			this.ourStructure = new LearningPathwayStructure(this);
			this.ourStructure.loaded$.subscribe(
				_ => true,
				err => this.pathwayManager.messageService.reportAndThrowError(`Failed to load structure for pathway ${this.name}`,
					err)
			);
			return this.ourStructure;
		}
	}

	static issuerSlugForApiPathwaySummary(
		summary: ApiPathwaySummary
	): string {
		return LearningPathway.issuerSlugFromPathwayUrl(summary[ "@id" ]);
	}

	private static issuerSlugFromPathwayUrl(pathwayUrl: string) {
		return (pathwayUrl.match(/\/v2\/issuers\/([^\/]+)/) || [])[ 1 ] || null;
	}
}

/**
 * Managed model class for the structure of a learning pathway.
 */
export class LearningPathwayStructure extends StandaloneEntitySet<LearningPathwayElement, ApiPathwayElement> {
	private _apiDetail: ApiPathwayDetail;
	get apiDetail() { return this._apiDetail }

	constructor(
		public pathway: LearningPathway
	) {
		super(
			apiModel => new LearningPathwayElement(this),
			apiModel => apiModel[ "@id" ],
			() => this.pathwayManager.pathwayApiService
				.getPathwayDetail(
					this.pathway.issuerSlug,
					this.pathway.slug
				).then(detail => {
					this._apiDetail = detail;
					return detail.elements;
				})
		);
	}

	get pathwayManager() { return this.pathway.pathwayManager; }

	get rootElement(): LearningPathwayElement {
		return this._apiDetail ? this.entityForUrl(this._apiDetail.rootElement) : null;
	}

	public updateTreeReferences() {
		if (this.rootElement) {
			this.rootElement.updateTree(null);
		}
	}

	protected onChanged() {
		this.updateTreeReferences();
	}
}

/**
 * Managed model class for Learning Pathway elements.
 */
export class LearningPathwayElement extends ManagedEntity<ApiPathwayElement, PathwayElementRef> {
	public parentElement: LearningPathwayElement;

	public children: LearningPathwayElement[] = [];

	public requirements = new PathwayElementRequirements(this, () => this.apiModel);
	
	public completionBadge = new MutableEntityLink<BadgeClass, BadgeClassRef>(
		this,
		ref => this.badgeManager.badgeByRef(ref),
		() => this.apiModel.completionBadge,
		ref => this.apiModel.completionBadge = ref
	);

	constructor(
		private structure: LearningPathwayStructure
	) {
		super(structure.pathway.commonManager);
	}


	buildApiRef(): ApiEntityRef {
		return {
			"@id": this.apiModel[ "@id" ],
			slug: this.apiModel.slug
		};
	}

	get id() { return this.url }

	get pathway() { return this.structure.pathway }

	get issuerPathways() { return this.pathway.issuerPathways }

	get pathwayApi() { return this.pathwayManager.pathwayApiService; }

	get isRoot(): boolean { return !this.parentElement; }

	get type(): string { return this.apiModel[ "@type" ]; }

	get name(): string { return this.apiModel.name; }

	get shortCode() {
		const code = this.name
			.replace(/(\w)[\w0-9.]*([^\w0-9.]+|$)/gi, "$1")
			.replace(/[^\w0-9]/gi, "")
			.replace(/(\w)(\d)/, "$1 $2")
			.toUpperCase();
		
		return code.substr(0, Math.min(8, code.length));
	}
	set shortCode(value: string) {
		// TODO When shortCode is implemented in the API
	}

	get description(): string { return this.apiModel.description; }

	get alignmentUrl(): string { return this.apiModel.alignmentUrl; }

	get requiredForParentCompletion(): boolean {
		return this.parentElement && this.parentElement.requirements.isElementRequired(this);
	}

	set requiredForParentCompletion(required: boolean) {
		if (this.parentElement) {
			this.parentElement.requirements.updateElementRequirement(this, required);
		}
	}

	get hasCompletionBadge(): boolean {
		return this.completionBadge.isPresent;
	}

	set name(name: string) { this.apiModel.name = name; }

	set description(description: string) { this.apiModel.description = description; }

	set alignmentUrl(alignmentUrl: string) { this.apiModel.alignmentUrl = alignmentUrl; }

	get prevSibling() {
		return (this.parentElement && this.parentElement.children[ this.parentElement.children.indexOf(this) - 1 ]) || null;
	}

	get nextSibling() {
		return (this.parentElement && this.parentElement.children[ this.parentElement.children.indexOf(this) + 1 ]) || null;
	}

	get hasValidMoveTargets() {
		// The only element that can't move is a singular child of the root. All other elements can be moved to the root
		// since it is always an element holder (not a badge holder).
		return this.parentElement && (!this.parentElement.isRoot || this.parentElement.children.length > 1);
	}

	get isDeleted() {
		return this.structure.entities.indexOf(this) < 0;
	}

	collectDescendants(): LearningPathwayElement[] {
		return this.children.map(c => [c, ... c.collectDescendants()]).reduce(flatten<LearningPathwayElement>(), []);
	}

	isChildOf(potentialParent: LearningPathwayElement) {
		if (potentialParent === this.parentElement) {
			return true;
		}
		if (this.parentElement) {
			return this.parentElement.isChildOf(potentialParent);
		}
		return false;
	}

	/**
	 * Checks if this element is a sibling of the given element.
	 *
	 * @param sibling The sibling to check for. Null inputs will always return false.
	 * @returns {boolean}
	 */
	isSiblingOf(sibling: LearningPathwayElement) {
		return sibling != null && (sibling == this.prevSibling || sibling == this.nextSibling);
	}

	//get completionBadge(): string { return this.apiModel.completionBadge; }
	//get children(): string[] { return this.apiModel.children; }
	//get badges(): string[] { return this.apiModel.badges; }

	/**
	 * Deletes this pathway element
	 *
	 * @returns {Observable<LearningPathwayElement>} An observable for the parent element.
	 */
	deleteElement(): Promise<LearningPathwayElement> {
		return this.pathwayManager.pathwayApiService
			.deletePathwayElement(
				this.pathway.issuerSlug,
				this.pathway.pathwaySlug,
				this.slug
			)
			.then(
				result => {
					this.structure.removeAll([this, ... this.collectDescendants()]);
					return this.parentElement.update();
				}
			);
	}

	/**
	 * PROTECTED - DO NOT USE OUTSIDE PATHWAY MODEL.
	 *
	 * Updates all children and parent references from this element down the tree.
	 *
	 * @param parent The parent of this element.
	 */
	updateTree(
		parent?: LearningPathwayElement,
		parents: LearningPathwayElement[] = []
	) {
		if (parents.indexOf(this) >= 0) {
			parents.push(this);
			console.info(
				"Pathway Cycle Detected. From ROOT:",
				parents.map(n => ({name: n.name, id: n.id, children: n.children.map(n => ({name: n.name, id: n.id})), element: n}))
			);
			throw new Error("Pathway cycle detected!");
		}

		this.parentElement = parent;

		// Build child then
		this.children.length = 0;
		this.children.push(
			... (this.apiModel.children || [])
				.map(childId => this.structure.entityForUrl(childId))
				.filter(child => !!child)
		);

		this.children.forEach(c => c.updateTree(this, parents.concat([this])));
	}

	public checkMoveTargetValidity(
		newParent: LearningPathwayElement,
		prevSibling: LearningPathwayElement
	): boolean {
		return newParent !== this
			&& prevSibling != this
			&& !newParent.isChildOf(this)
			&& !(newParent == this.parentElement && prevSibling == this.prevSibling);
	}


	protected onApiModelChanged() {
		if (this.structure) {
			this.structure.updateTreeReferences();
		}
	}

	/**
	 * Saves any changes made to this element to the server.
	 *
	 * @returns {Observable<R>}
	 */
	save(): Promise<this> {
		const updatePathwayElement = this.pathwayManager.pathwayApiService
			.updatePathwayElement(
				this.structure.pathway.issuerSlug,
				this.structure.pathway.slug,
				this.slug,
				this.apiModel
			);

		const update: Promise<ApiPathwayElement> = this.isRoot
			? updatePathwayElement.then(e => this.pathway.update().then(_=>e))
			: updatePathwayElement;

		return update
			.then(newElement => {
				this.structure.addOrUpdate(newElement);
				return this;
			}, failure => {
				this.revertChanges();
				throw failure;
			});
	}

	/**
	 * Moves this element to another location in the tree and updates all necessary related nodes. May be slow.
	 *
	 * @param newParent The new parent element for this node
	 * @param newPrevSibling The sibling after which this element should be placed. null represents the beginning
	 *                       of the child list.
	 * @returns {Observable<LearningPathwayElement>}
	 */
	moveAfterSibling(
		newParent: LearningPathwayElement,
		newPrevSibling: LearningPathwayElement = null
	): Promise<this> {
		if (this.parentElement == null) {
			return Promise.reject<this>(new Error("Cannot move the root element"));
		}

		// TODO Pathways: Update parent requirement updating when moving to the new requirements system.
		const oldRequired = this.requiredForParentCompletion;
		this.requiredForParentCompletion = false;

		const oldParent = this.parentElement;
		this.parentElement = newParent;

		try {
			oldParent.removeChild(this);
			newParent.insertChildAfter(this, newPrevSibling);
		} catch (e) {
			return Promise.reject<this>(e);
		}

		this.requiredForParentCompletion = oldRequired;

		return this.parentElement.save()
			.then(_ => this);
	}

	/**
	 * Adds a new child to this element.
	 *
	 * @param childData
	 * @returns {Observable<R>}
	 */
	addChild(
		childData: ApiPathwayElementForCreation
	): Promise<LearningPathwayElement> {
		return this.pathwayApi
			.createPathwayElement(
				this.issuerPathways.issuerSlug,
				this.pathway.slug,
				Object.assign(
					{},
					childData,
					{ parent: this.slug }
				)
			)
			.then(newElem => {
				var newChild: LearningPathwayElement = this.structure.addOrUpdate(newElem);
				this.structure.updateTreeReferences();

				this.requirements.requiredElementIds = (this.requirements.requiredElementIds||[]).concat([newChild.url]);

				return this.save()
					.then(_ => newChild);
			})

	}

	/**
	 * Updates the state of this element from the server
	 *
	 * @returns {Promise<this>}
	 */
	public update(): Promise<this> {
		return this.pathwayManager.pathwayApiService
			.getPathwayElement(
				this.structure.pathway.issuerSlug,
				this.structure.pathway.slug,
				this.slug
			)
			.then(newData => {
				this.applyApiModel(newData);
				return this;
			})
	}

	/**
	 * Inserts a child into this element after the given child. Does NOT save any changes to the server.
	 *
	 * @param newChild The child to add
	 * @param prevSibling The existing child after which the new child should be added. A falsy value indicates
	 *                    the new element should be added as the first child.
	 */
	private insertChildAfter(
		newChild: LearningPathwayElement,
		prevSibling: LearningPathwayElement = null
	) {
		var indexBefore = this.children.indexOf(prevSibling);
		if (indexBefore < 0 && prevSibling) {
			throw new Error(`Previous sibling ${prevSibling.slug} does not exist in this element (${this.slug})`);
		}

		this.apiModel.children.splice(indexBefore + 1, 0, newChild.id);
		this.applyApiModel(this.apiModel);
	}

	/**
	 * Removes a child from this element. Does NOT save any changes to the server.
	 *
	 * @param childToRemove The child element to remove.
	 */
	private removeChild(childToRemove: LearningPathwayElement) {
		const index = this.children.indexOf(childToRemove);
		if (index < 0) {
			throw new Error(`Child ${childToRemove.slug} does not exist in parent ${this.slug}.`);
		}

		this.apiModel.children.splice(index, 1);
		this.applyApiModel(this.apiModel);
	}

	toString() {
		return `PathwayElement(name=${this.name}, url=${this.url}, children.length=${this.children.length})`;
	}

	toTreeString(indent = "") {
		let str = indent + "- " + this.name;
		if (this.children.length) {
			str += "\n" + this.children.map(c => c.toTreeString(indent + (this.nextSibling ? "| " : "  "))).join("\n");
		}
		return str;
	}
}

export class PathwayElementRequirements {
	constructor(
		private element: LearningPathwayElement,
		private apiModelGetter: () => ApiPathwayElement
	) {}

	private get apiModel() { return this.apiModelGetter(); }

	private get toElementJunction(): ApiElementElementJunctionRequirement {
		if (this.isElementJunction()) {
			return this.apiModel.requirements as ApiElementElementJunctionRequirement;
		} else {
			return this.apiModel.requirements = {
				"@type": "ElementJunction",
				"junctionConfig": {
					"@type": "Conjunction"
				},
				elements: []
			} as ApiElementElementJunctionRequirement;
		}
	}

	private get toBadgeJunction(): ApiElementBadgeJunctionRequirement {
		if (this.isBadgeJunction()) {
			return this.apiModel.requirements as ApiElementBadgeJunctionRequirement;
		} else {
			return this.apiModel.requirements = {
				"@type": "BadgeJunction",
				"junctionConfig": {
					"@type": "Disjunction",
					"requiredNumber": 1
				} as ApiElementRequirementDisjunctionConfig,
				badges: []
			} as ApiElementBadgeJunctionRequirement;
		}
	}

	isElementRequired(
		element: LearningPathwayElement
	) {
		return this.isElementJunction() && this.toElementJunction.elements && this.toElementJunction.elements.indexOf(
				element.id) >= 0;
	}

	updateElementRequirement(
		element: LearningPathwayElement,
		elementRequired: boolean
	) {
		var elemJunction = this.toElementJunction;
		if (!elemJunction.elements) {
			elemJunction.elements = [];
		}

		var elementIndex = elemJunction.elements.indexOf(element.id);
		if (elementRequired) {
			if (elementIndex < 0) {
				elemJunction.elements.push(element.id);
			}
		} else {
			if (elementIndex >= 0) {
				elemJunction.elements.splice(elementIndex, 1);
			}
		}
	}

	isElementJunction() {
		return this.apiModel.requirements && this.apiModel.requirements[ "@type" ] == ApiElementRequirementType.ElementJunction;
	}

	isBadgeJunction() {
		return this.apiModel.requirements && this.apiModel.requirements[ "@type" ] == ApiElementRequirementType.BadgeJunction;
	}

	private get asJunctionRequirement() {
		return this.apiModel.requirements as ApiElementJunctionRequirement;
	}

	get junctionType(): ApiElementRequirementJunctionType {
		if (this.isElementJunction() || this.isBadgeJunction()) {
			return this.asJunctionRequirement.junctionConfig[ "@type" ];
		} else {
			return null;
		}
	}

	set junctionType(type: ApiElementRequirementJunctionType) {
		if (type != this.junctionType && this.apiModel.requirements) {
			if (type == ApiElementRequirementJunctionType.Disjunction) {
				this.asJunctionRequirement.junctionConfig = {
					"@type": "Disjunction",
					"requiredNumber": 1
				} as ApiElementRequirementDisjunctionConfig;
			} else if (type == ApiElementRequirementJunctionType.Conjunction) {
				this.asJunctionRequirement.junctionConfig = {
					"@type": "Conjunction"
				} as ApiElementRequirementConjunctionConfig;
			}
		}
	}

	get requiredBadgeIds(): BadgeClassUrl[] {
		return this.isBadgeJunction() ? this.toBadgeJunction.badges : null;
	}

	get requiredElementIds(): string[] {
		return this.isElementJunction() ? this.toElementJunction.elements : null;
	}

	set requiredElementIds(ids: string[]) {
		this.toElementJunction.elements = ids;
	}

	set requiredBadgeIds(ids: BadgeClassUrl[]) {
		this.toBadgeJunction.badges = ids;
		this.apiModel.badges = ids;
	}
}

