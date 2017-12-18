import { AbstractControl, Form, FormArray, FormControl, FormGroup, ValidatorFn, Validators } from "@angular/forms";
import { markControlsDirty } from "./form-util";

/**
 * A function that exercises the typed forms to ensure they compile correctly.
 */
function typedFormExample() {
	const group = new TypedFormGroup()
		.add("firstName", typedControl("", Validators.required))
		.add("lastName", typedControl("", Validators.required))
		.add(
			"address",
			typedGroup()
				.add("street", typedControl("2557 Kincaid"))
				.add("city", typedControl("Eugene"))
				.add("zip", typedControl("97405"))
		);

	group.value.address.street.trim();
	group.controls.firstName.value;
	group.untypedControls.firstName.value;
}

/**
 * Creates a typed [[FormControl]] wrapper with the given starting value, validator (or conjunctive validator array),
 * and configurator function (to do additional configuration of the control).
 *
 * @param {ValueType} value
 * @param {ValidatorFn | ValidatorFn[]} validator
 * @param {(control: TypedFormControl<ValueType>) => void} configurator
 * @returns {TypedFormControl<ValueType>}
 */
export function typedControl<ValueType>(
	value: ValueType,
	validator?: ValidatorFn | ValidatorFn[],
	configurator?: (control: TypedFormControl<ValueType>) => void
): TypedFormControl<ValueType> {
	const control = new TypedFormControl(value, validator);
	if (configurator) configurator(control);
	return control;
}

/**
 * Creates an empty typed form group. Used for starting out a typed form
 *
 * @returns {TypedFormGroup<{}, {}>}
 */
export function typedGroup(): TypedFormGroup<{}, {}> {
	return new TypedFormGroup();
}

/**
 * Creates a typed form array for the given template item.
 *
 * @param {ItemType & TypedFormItem<ItemValueType>} templateItem
 * @returns {TypedFormArray<ItemValueType, ItemType extends TypedFormItem<ItemValueType>>}
 */
export function typedArray<
	ItemValueType,
	ItemType extends TypedFormItem<ItemValueType>
>(
	templateItem: ItemType & TypedFormItem<ItemValueType>
): TypedFormArray<ItemValueType, ItemType> {
	return new TypedFormArray<ItemValueType, ItemType>(templateItem);
}

/**
 * Base class for typed form items. Knows what it's own value type is.
 */
export abstract class TypedFormItem<ValueType> {
	abstract readonly untypedControl: AbstractControl;

	get value(): ValueType { return this.untypedControl.value }
	get status() { return this.untypedControl.status }
	get valid() { return this.untypedControl.valid }
	get invalid() { return this.untypedControl.invalid }
	get pending() { return this.untypedControl.pending }
	get disabled() { return this.untypedControl.disabled }
	get enabled() { return this.untypedControl.enabled }
	get errors() { return this.untypedControl.errors }
	get pristine() { return this.untypedControl.pristine }
	get dirty() { return this.untypedControl.dirty }
	get touched() { return this.untypedControl.touched }
	get untouched() { return this.untypedControl.untouched }

	public markTreeDirty() {
		markControlsDirty(this.untypedControl);
	}

	abstract clone(): this
}

/**
 * Typed control, wraps a [[FormControl]] and holds the type of the control.
 */
export class TypedFormControl<ValueType> extends TypedFormItem<ValueType> {
	readonly untypedControl: FormControl;

	constructor(value: ValueType, validator?: ValidatorFn | ValidatorFn[]) {
		super();

		this.untypedControl = new FormControl(value, Array.isArray(validator) ? Validators.compose(validator) : validator);
	}

	clone(): this {
		return new TypedFormControl(
			this.value,
			this.untypedControl.validator
		) as this
	}
}

type UntypedGroupOf<T> = {
	[F in keyof T]: AbstractControl
}

/**
 * Typed group of control. Wraps a [[FormGroup]] and keeps track of the type of the value object and controls object.
 *
 * Use the `add*` methods to add items to this group and the type of the controls and the resulting value will be
 * maintained.
 */
export class TypedFormGroup<
	ValueType = {},
	ControlsType = {}
> extends TypedFormItem<ValueType> {
	readonly untypedControl = new FormGroup({});
	controls = {} as ControlsType;

	get untypedControls(): UntypedGroupOf<ControlsType> {
		return this.untypedControl.controls as any;
	}

	addControl<
		NameType extends string,
		ItemValueType
	>(
		name: NameType,
		value: ItemValueType,
		validator?: ValidatorFn | ValidatorFn[],
		configurator?: (control: TypedFormControl<ItemValueType>) => void
	): TypedFormGroup<
		ValueType & Record<NameType, ItemValueType>,
		ControlsType & Record<NameType, TypedFormControl<ItemValueType>>
	> {
		return this.add(name, typedControl<ItemValueType>(value, validator, configurator));
	}

	addArray<
		NameType extends string,
		ItemType extends TypedFormItem<ItemValueType>,
		ItemValueType
	>(
		name: NameType,
		templateItem: ItemType & TypedFormItem<ItemValueType>
	): TypedFormGroup<
		ValueType & Record<NameType, ItemValueType[]>,
		ControlsType & Record<NameType, TypedFormArray<ItemValueType, ItemType>>
	> {
		return this.add(name, typedArray(templateItem));
	}

	add<
		NameType extends string,
		ItemType extends TypedFormItem<ItemValueType>,
		ItemValueType
	>(
		name: NameType,
		typedItem: ItemType & TypedFormItem<ItemValueType>
	): TypedFormGroup<
		ValueType & Record<NameType, ItemValueType>,
		ControlsType & Record<NameType, ItemType>
	> {
		(this.controls as any)[name] = typedItem;
		this.untypedControl.addControl(name, typedItem.untypedControl);
		return this as any;
	}

	clone(): this {
		const group = new TypedFormGroup();
		Object.entries(this.controls).forEach(([name, value]) => group.add(name, value.clone()));
		return group as this;
	}
}

/**
 * Typed template-based form array. Wraps a [[FormArray]] and holds a template of the type of item that will be added
 * to the array. Can only be used to hold the same type of form item, but automates creating new instances of it.
 */
export class TypedFormArray<
	ItemValueType,
	ItemType extends TypedFormItem<ItemValueType>
> extends TypedFormItem<ItemValueType[]> {
	readonly untypedControl = new FormArray([]);

	controls: ItemType[] = [];

	constructor(
		public templateItem: ItemType & TypedFormItem<ItemValueType>
	) {
		super();
	}

	get untypedControls(): AbstractControl[] {
		return this.untypedControl.controls;
	}

	get length() {
		return this.untypedControls.length;
	}

	push(item: ItemType): this {
		this.controls.push(item);
		this.untypedControl.push(item.untypedControl);
		return this;
	}

	public addFromTemplate() {
		this.push(this.templateItem.clone());
	}

	clone(): this {
		const array = new TypedFormArray(this.templateItem);
		this.controls.forEach(item => array.push(item.clone()));
		return array as this;
	}

	removeAt(i: number): ItemType {
		const control = this.controls[i];
		this.controls.splice(i, 1);
		this.untypedControl.removeAt(i);
		return control;
	}
}