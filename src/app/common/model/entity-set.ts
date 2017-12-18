import { ManagedEntity, AnyManagedEntity } from "./managed-entity";
import { Observable } from "rxjs/Observable";
import { UpdatableSubject } from "../util/updatable-subject";

/**
 * Interface for asynchronous sets of managed entities of various types.
 */
export interface EntitySet<T extends ManagedEntity<any, any>> {
	/**
	 * Length of the set
	 */
	length: number;

	/**
	 * The entities in the set
	 */
	entities: T[];

	/**
	 * Indicates that the set is fully populated
	 */
	loaded: boolean;

	/**
	 * Promise for the first load of the set
	 */
	loadedPromise: Promise<this>;

	/**
	 * Subject for loading the set. Triggers an initial load of the set if it is not loaded and updates whenever the
	 * list changes.
	 */
	loaded$: Observable<this>;

	/**
	 * Subject for changes to the set, does not cause the list to be loaded it if it hasn't yet been requested.
	 */
	changed$: Observable<EntitySetUpdate<T, this>>;

	/**
	 * Iterates the set of entities in this set. If the set has not yet been loaded, iterating it will cause
	 * an asynchronous loading of it if possible.
	 */
	[Symbol.iterator](): Iterator<T>
}

/**
 * Holds information about a change made to an `EntitySet`.
 */
export class EntitySetUpdate<
	EntityType extends ManagedEntity<any, any>,
	SetType extends EntitySet<EntityType>
> {
	constructor(
		public entitySet: SetType,
		public added: EntityType[] = [],
		public removed: EntityType[] = []
	) {}

	get hasChanges() {
		return this.added.length || this.removed.length;
	}

	get entities(): EntityType[] {
		return this.entitySet.entities;
	}
}


/**
 * Maintains a grouping of entities from a {@type EntitySet} into buckets based on a function to
 * support managers.
 *
 * This class expects each group to potentially contain several entities. If the mapping is one to one, use
 * ManagedEntityMapping instead.
 */
export class ManagedEntityGrouping<EntityType extends AnyManagedEntity> {
	grouped: { [groupId: string]: EntityType[] } = {};

	private entireListSubject = new UpdatableSubject<{ [groupId: string]: EntityType[] }>(
		() => this.entityList.loadedPromise
	);

	get loaded$(): Observable<{ [groupId: string]: EntityType[] }> { return this.entireListSubject; }
	get loadedPromise(): Promise<{ [groupId: string]: EntityType[] }> { return this.entireListSubject.first().toPromise(); }

	constructor(
		private entityList: EntitySet<EntityType>,
		private groupIdForEntity: (entity: EntityType) => string
	) {
		entityList.changed$.subscribe(
			updates => this.updateGrouping()
		)
	}

	private updateGrouping() {
		this.grouped = {};
		this.entityList.entities.forEach(entity => {
			var key = this.groupIdForEntity(entity);

			if (key in this.grouped) {
				this.grouped[ key ].push(entity);
			} else {
				this.grouped[ key ] = [ entity ];
			}
		});
		this.entireListSubject.safeNext(this.grouped);
	}

	lookup(groupId: string) {
		return this.grouped[ groupId ];
	}
}

/**
 * Maintains a map of entities from a {@type EntitySet} into buckets based on a function to support managers.
 *
 * This class expects a one to one mapping from entity to map identifier. If multiple entities will be sharing the same
 * key, use ManagedEntityGrouping instead.
 */
export class ManagedEntityMapping<EntityType extends AnyManagedEntity> {
	mapped: { [mapId: string]: EntityType } = {};

	private entireListSubject = new UpdatableSubject<{ [mapId: string]: EntityType }>(
		() => this.entityList.loadedPromise
	);

	get loaded$(): Observable<{ [mapId: string]: EntityType }> { return this.entireListSubject; }
	get loadedPromise(): Promise<{ [mapId: string]: EntityType }> { return this.entireListSubject.first().toPromise(); }

	constructor(
		private entityList: EntitySet<EntityType>,
		private mapIdForEntity: (entity: EntityType) => string
	) {
		entityList.changed$.subscribe(
			updates => this.updateMapping()
		)
	}

	private updateMapping() {
		this.mapped = {};
		this.entityList.entities.forEach(
			entity => this.mapped[ this.mapIdForEntity(entity) ] = entity
		);
		this.entireListSubject.safeNext(this.mapped);
	}

	lookup(mapId: string) {
		return this.mapped[ mapId ];
	}
}