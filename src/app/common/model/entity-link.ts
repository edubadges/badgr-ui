import { ManagedEntity } from "./managed-entity";
import { UpdatableSubject } from "../util/updatable-subject";
import { ApiEntityRef } from "./entity-ref";

/**
 * Represents a many-to-one connection between entities. Wraps an EntityRef from API data and handles loading and
 * maintaining the reference to the linked entity.
 */
export class EntityLink<
	EntityType extends ManagedEntity<any, RefType>,
	RefType extends ApiEntityRef
> {
	protected _requested = false;
	protected _entity: EntityType;

	protected changedSubject = new UpdatableSubject<EntityType>();
	protected loadedSubject = new UpdatableSubject<EntityType>(
		() => this.updateLink()
	);

	public get loaded$() {
		return this.loadedSubject.asObservable();
	}

	public get changed$() {
		return this.changedSubject.asObservable();
	}

	public get entity() {
		// Calling this.promise will ensure that we load the entity
		return this.loadedPromise && this._entity;
	}

	public get isPresent(): boolean {
		return !! this.entityRef;
	}

	public get loadedPromise() { return this.loaded$.first().toPromise(); }

	public get entityRef(): RefType { return this.getRef(); }

	constructor(
		protected owningEntity: ManagedEntity<any, any>,
		protected fetchEntity: (RefType) => Promise<EntityType>,
		protected getRef: () => RefType
	) {
		this.changedSubject.subscribe(this.loadedSubject);
	}

	protected updateLink() {
		if (! this._requested) {
			this._requested = true;
			this.owningEntity.changed$.subscribe(() => this.updateLink());
		}

		const entityRef = this.entityRef;

		if (entityRef) {
			this.fetchEntity(entityRef).then(
				entity => {
					this._entity = entity;
					this.changedSubject.safeNext(entity);
				},
				error => {
					console.error(`Failed to fetch entity using ${this.fetchEntity}`, error);
					this.changedSubject.error(error);
				}
			);
		} else {
			this._entity = null;
			this.changedSubject.safeNext(null);
		}
	}
}

/**
 * An EntityLink that supports mutation of the link.
 */
export class MutableEntityLink<
	EntityType extends ManagedEntity<any, RefType>,
	RefType extends ApiEntityRef
> extends EntityLink<EntityType, RefType> {
	constructor(
		owningEntity: ManagedEntity<any, any>,
		fetchEntity: (RefType) => Promise<EntityType>,
		getRef: () => RefType,
		protected setRef: (RefType) => void
	) {
		super(owningEntity, fetchEntity, getRef);
	}

	// NOTE: We must duplicate the getters for entity and entityRef, otherwise they will be missing due to
	// TypeScript issue: https://github.com/Microsoft/TypeScript/issues/338
	public get entity() {
		return this.loadedPromise && this._entity;
	}
	public set entity(entity: EntityType) {
		this.entityRef = entity.ref.apiRef
	}

	public get entityRef(): RefType { return this.getRef(); }
	public set entityRef(newRef: RefType) {
		this.setRef(newRef);
		this.updateLink();
	}
}