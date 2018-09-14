import { FormControl, FormGroup, FormBuilder, Validators } from '@angular/forms';
import isDecimal from 'validator/lib/isDecimal';

export type ValidationResult = null | {
	[errorName: string]: boolean;
}

export class NumericValidator {
	static validNumber(control: FormControl): ValidationResult {
		return typeof(control.value) !== "string" || control.value.trim().length == 0 || isDecimal(control.value)
			? null
			: { 'invalidNumber': true };
	}
}