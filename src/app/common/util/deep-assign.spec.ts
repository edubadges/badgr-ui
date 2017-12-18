import { TestBed, inject } from "@angular/core/testing";
import { deepAssign, isPositiveInteger, toJsonInclArrayProps, jsonCopy } from "./deep-assign";

const assign = Object.assign;

export function toObject(array: any[]): any {
	return Object.assign({}, array);
}

export function toArray(obj: any): any[] {
	return Object.assign([], obj);
}

describe('deepAssign', () => {
	function testPair(
		dest: any,
		source: any
	) {
		const origDestStr = toJsonInclArrayProps(dest);
		const sourceStr = toJsonInclArrayProps(source);

		deepAssign(dest, source);

		const destStr = toJsonInclArrayProps(dest);

		if (Array.isArray(source) != Array.isArray(dest)) {
			expect(Object.keys(dest)).toEqual(Object.keys(source));
			Object.keys(source).forEach(key => {
				const destKeyStr = toJsonInclArrayProps(dest[key]);
				const sourceKeyStr = toJsonInclArrayProps(source[key]);

				if (destKeyStr !== sourceKeyStr) {
					fail(`Applying ${sourceStr} to ${origDestStr} resulted in dest[${key}] equaling ${destKeyStr} instead of ${sourceKeyStr}`);
				}
			})
		} else {
			if (sourceStr !== destStr) {
				fail(`Applying ${sourceStr} to ${origDestStr} resulted in ${destStr}`);
			}
		}
		return [source, dest];
	}

	it("should handle primitives", () => {
		testPair([], ["string", -1, 0, 1, .1, NaN, Infinity]);
		testPair({}, { a: "string", b: -1, c: 0, d: 1, e: .1, f: NaN, g: Infinity });
	});

	it("should handle removing and adding values to arrays", () => {
		var cases = [
			[],
			[1],
			[1,2],
			[1,2,3]
		];

		cases.forEach(left => {
			cases.forEach(right => {
				[
					[left, right],
					[ toObject(left), right],
					[ left, toObject(right)],
					[ toObject(left), toObject(right)]
				].forEach(([actual, expected]) => {
					testPair(jsonCopy(actual), jsonCopy(expected));
					testPair([ jsonCopy(actual) ], jsonCopy(expected));
					testPair(jsonCopy(actual), [ jsonCopy(expected) ]);
					testPair([ jsonCopy(actual) ] , [ jsonCopy(expected) ]);

					testPair({ a: jsonCopy(actual) }, jsonCopy(expected));
					testPair(jsonCopy(actual), { a: jsonCopy(expected) });
					testPair({ a: jsonCopy(actual) }, { a: jsonCopy(expected) });
				});
			})
		});
	});

	it("should handle objects where arrays should be", () => {
		testPair([{}], [ [ 1, 2 ]]);
	});

	it("should handle changed nested properties without changing references", () => {
		const a = { b : 20 };

		const [source, dest] = testPair({a : a}, { a: { b: 10 }});
		expect(dest.a).toBe(a);
	});

	it("should handle changed object types without changing references", () => {
		const b = { c : 20 };
		Object.defineProperty(b, "id", { value: 1, enumerable: false });

		const [source, dest] = testPair({a : { b: b }}, { a: toArray({ b: { c: 20 } })});
		expect(dest.a.b).toBe(b);
	});

	it("should handle adding properties", () => {
		testPair({a : { b : 20 }}, { a: { b: 10, c: 20 }});
	});

	it("should handle removing properties", () => {
		testPair({a : { b : 20 }}, { a: { }});
	});

	it("should handle mixed object arrays", () => {
		testPair({a : [1,2,3,4]}, { a: Object.assign([1,2,3], {a:10})});
	});

	it("should error on new recursive trees", () => {
		const source = { a : { b : 10 }} as any;
		source.a.b = source;

		expect(() => testPair({ }, source)).toThrow();
	});

	it("should error on existing recursive trees", () => {
		const source = { a : { b : 10 } } as any;
		source.a.b = source;

		expect(() => testPair({ a : { b : 10 } }, source)).toThrow();
	});
});
