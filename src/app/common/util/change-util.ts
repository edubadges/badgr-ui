import { SimpleChange } from "@angular/core";

export class ChangeDetectionUtil {
	static typedChangesFor<T>(
		changes: { [propName: string]: SimpleChange }
	): T {
		let result: T = {} as T;

		Object.keys(changes)
			.forEach(key => result[ key ] = changes[ key ].currentValue);

		return result;
	}

	static watchProperty<T1, T2 extends T1>(
		object: any,
		propName: string,
		watcher: (T1, T2) => any
	) {
		var dataPropName = "_" + propName;

		Object.defineProperties(
			object,
			{
				dataPropName: {
					enumerable: false,
					configurable: true,
					value: object[ propName ]
				},
				propName: {
					configurable: true,
					get: function () { return object[ dataPropName ]; },
					set: function (newValue) {
						var oldValue = object[ dataPropName ];
						if (newValue !== oldValue) {
							object[ dataPropName ] = newValue;
							watcher(newValue, oldValue);
						}
					}
				}
			}
		)
	}

	static watchProperties<T1, T2 extends T1>(
		object: any,
		propNames: string[],
		watcher: (T1, T2) => any
	) {
		propNames.forEach(
			name => ChangeDetectionUtil.watchProperty(object, name, watcher)
		);
	}

}