import { AnyManagedEntity } from "./managed-entity";
import { UpdatableSubject } from "../util/updatable-subject";
import { AnyRefType, EntityRef, ApiEntityRef } from "./entity-ref";
import { EntitySet, EntitySetUpdate } from "./entity-set";
import { Observable } from "rxjs/Observable";

export class LinkedEntitySet<
	OwnerType extends AnyManagedEntity,
	EntityType extends AnyManagedEntity,
	ChildRefType extends ApiEntityRef
	> implements EntitySet<EntityType> {
	private _requested = false;

	private _entities: EntityType[] = [];

	private changedSubject = new UpdatableSubject<EntitySetUpdate<EntityType, this>>();
	private loadedSubject = new UpdatableSubject<this>(
		() => this.updateLinkedSet()
	);

	public get loaded$(): Observable<this> { return this.loadedSubject.asObservable() }
	public get changed$(): Observable<EntitySetUpdate<EntityType, this>> { return this.changedSubject.asObservable() }

	get loadedPromise(): Promise<this> { return this.loaded$.first().toPromise() }
	get loaded(): boolean { return this.loadedSubject.isLoaded }

	constructor(
		protected owner: OwnerType,
		protected fetchEntities: () => Promise<EntityType[]>,
		protected attachEntity: (entity: EntityType) => void,
		protected detachEntity: (entity: EntityType) => void
	) {
		this.changedSubject.map(u => u.entitySet).subscribe(this.loadedSubject);
	}

	get length() {
		this.ensureLoaded();
		return this._entities.length;
	}

	/**
	 * Returns an iterable set of the entities managed by this set.
	 */
	public get entities(): EntityType[] {
		this.ensureLoaded();
		return this._entities;
	}

	private mostRecentRefUpdatePromise: Promise<EntityType[]>;

	protected ensureLoaded() {
		if (! this._requested) {
			this.updateLinkedSet();
		}
	}

	public updateLinkedSet(): Promise<this> {
		if (! this._requested) {
			this._requested = true;
			this.owner.changed$.subscribe(() => this.updateLinkedSet());
		}

		let ourFetchPromise: Promise<EntityType[]> = this.fetchEntities();

		// Additional updates may show up while we're updating. Only the most recent one should take effect.
		this.mostRecentRefUpdatePromise = ourFetchPromise;

		return ourFetchPromise.then(
			(updatedEntities: EntityType[]) => {
				// Defer to the most recent update request if another one has come in
				if (ourFetchPromise != this.mostRecentRefUpdatePromise) {
					return this.mostRecentRefUpdatePromise.then(() => this);
				}

				const updateInfo = new EntitySetUpdate<EntityType, this>(this);

				// Add any new entities to our internal list
				updatedEntities.forEach(updateEntity => {
					if (this.entities.indexOf(updateEntity) === -1) {
						this._entities.push(updateEntity);
						updateInfo.added.push(updateEntity);
					}
				});

				// Removed any old entities from our internal list
				this._entities
					.filter(e => updatedEntities.indexOf(e) === -1)
					.forEach(removedEntity => {
						this._entities.splice(this._entities.indexOf(removedEntity), 1);
						updateInfo.removed.push(removedEntity);
					});

				// Notify about changes if there are any, or if the list hadn't been loaded
				if (updateInfo.hasChanges || !this.loaded) {
					this.changedSubject.safeNext(updateInfo);
				}
				return this;
			},
			error => { console.error(`Error occurred while updating entity list: `, error, "Owner:", this.owner); throw error; }
		)
	}

	public remove(entity: EntityType, notify: boolean = true): boolean {
		if (this.has(entity)) {
			this.entities.splice(this.entities.indexOf(entity), 1);
			this.detachEntity(entity);

			if (notify) {
				this.changedSubject.safeNext(new EntitySetUpdate(this, [], [ entity ]));
			}
			return true;
		} else {
			return false;
		}
	}

	public has(entity: EntityType): boolean {
		return this._entities.indexOf(entity) >= 0;
	}

	public add(entity: EntityType, notify: boolean = true): boolean {
		if (!this.has(entity)) {
			this._entities.push(entity);
			this.attachEntity(entity);

			if (notify) {
				this.changedSubject.safeNext(new EntitySetUpdate(this, [ entity ], []));
			}
			return true;
		} else {
			return false;
		}
	}

	public addAll(newEntities: EntityType[] | Iterable<EntityType>) {
		for (const newEntity of newEntities as any) {
			this.add(newEntity);
		}
	}

	public setTo(newEntities: EntityType[] | Iterable<EntityType>) {
		const entitiesToRemove = new Set<EntityType>(this._entities);
		const updateInfo = new EntitySetUpdate<EntityType, this>(this);

		for (const newEntity of newEntities as any) {
			if (entitiesToRemove.has(newEntity)) {
				entitiesToRemove.delete(newEntity);
			} else {
				if (this.add(newEntity, false)) {
					updateInfo.added.push(newEntity);
				}
			}
		}

		// Can't iterate over iterables yet. https://github.com/Microsoft/TypeScript/issues/3164
		for (const entity of Array.from(entitiesToRemove.values())) {
			if (this.remove(entity, false)) {
				updateInfo.removed.push(entity);
			}
		}

		if (updateInfo.hasChanges) {
			this.changedSubject.safeNext(updateInfo);
		}
	}

	public entityForRef(ref: AnyRefType): EntityType {
		let url = EntityRef.urlForRef(ref);

		return this._entities.find(e => e.url == url);
	}

	public [Symbol.iterator](): Iterator<EntityType> {
		return this.entities[Symbol.iterator]()
	}
}

export class ListBackedLinkedEntitySet<
	OwnerType extends AnyManagedEntity,
	EntityType extends AnyManagedEntity,
	ChildRefType extends ApiEntityRef
> extends LinkedEntitySet<OwnerType, EntityType, ChildRefType> {
	constructor(
		protected owner: OwnerType,
		public getEntityRefs: () => ChildRefType[],
		protected entityForUrl: (ChildRefType) => (EntityType | Promise<EntityType>)
	) {
		super(
			owner,
			() => Promise.all(getEntityRefs().map(ref => Promise.resolve(entityForUrl(EntityRef.urlForRef(ref))))),
			newEntity => this.entityRefs.push(newEntity.ref),
			removeEntity => this.entityRefs.splice(this.entityRefs.findIndex(r => EntityRef.urlForRef(r) === removeEntity.url), 1)
		);
	}

	public get entityRefs(): AnyRefType[] {
		return this.getEntityRefs();
	}

	public has(entity: EntityType): boolean {
		return !! this.entityRefs.find(r => EntityRef.urlForRef(r) === entity.url);
	}
}

export class BidirectionallyLinkedEntitySet<
	OwnerType extends AnyManagedEntity,
	ChildType extends AnyManagedEntity,
	ChildRefType extends ApiEntityRef
	> extends ListBackedLinkedEntitySet<OwnerType, ChildType, ChildRefType> {

	constructor(
		owner: OwnerType,
		getEntityUrls: () => ChildRefType[],
		entityForRef: (ChildRefType) => (ChildType | Promise<ChildType>),
		private listForEntity: (ChildType) => ListBackedLinkedEntitySet<any, OwnerType, any>
	) {
		super(owner, getEntityUrls, entityForRef);

		this.changed$.subscribe(update => {
			update.removed.forEach(entity => this.listForEntity(entity).remove(this.owner));
			update.added.forEach(entity => this.listForEntity(entity).add(this.owner));
		});
	}
}
