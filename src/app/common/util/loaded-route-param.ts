import { ActivatedRoute } from "@angular/router";

/**
 * Helper class for controllers whose route parameters specify entities that need to be loaded.
 */
export class LoadedRouteParam<Type> {
	public loadedPromise: Promise<Type>;
	public value: Type | null = null;
	public loaded: boolean = false;
	public failed: boolean = false;

	constructor(
		route: ActivatedRoute,
		paramName: string,
		loader: (entityId: string) => Promise<Type>
	) {
		const paramValue = route.snapshot.params[paramName].replace(/\?.*$/, "");

		this.loadedPromise = loader(paramValue).then(
			value => {
				this.value = value;
				this.loaded = true;
				return value;
			},
			error => {
				this.failed = true;
				throw error;
			}
		);
	}
}
