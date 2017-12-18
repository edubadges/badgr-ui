import { TestBed, inject } from "@angular/core/testing";
import { randomNames } from "./test-data-util";


describe('test-data-util', () => {
	it(
		'should not generate duplicate random names',
		() => {
			let seed = 0;
			let names = randomNames(
				10,
				// By taking the floor and only adding .5, we ensure every other generated name is a duplicate
				() => "Name" + Math.floor(seed += .5)
			);

			let nameSet = new Set(names);

			expect(nameSet.size).toEqual(10);
		}
	);

	it(
		'should error if it cannot generate enough unique names',
		() => {
			let seed = 0;
			expect(() => randomNames(10, () => "Same")).toThrow();
		}
	);
});
