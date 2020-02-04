import { FormControl, FormGroup, FormBuilder, Validators } from '@angular/forms';
import isDecimal from 'validator/lib/isDecimal';

export type ValidationResult = null | {
	[errorName: string]: boolean;
}


function isInteger(value){
	return Number(value) % 1 == 0  
}

function validNumber(value){
	return typeof (value) !== "string" || value.trim().length == 0 || isDecimal(value)
}

export class NumericValidator {

	static validNumber(control: FormControl): ValidationResult {
		return validNumber(control.value)
			? null
			: { 'invalidNumber': true };
	}

	static validEQF(control: FormControl): ValidationResult {
		if (control.value) {
			return validNumber(control.value) && +Number(control.value) < 9 && Number(control.value) > 0 && isInteger(control.value)
				? null
				: { 'invalidNumber': true };
		} else {
			return null
		}
	}

	static validECTS(control: FormControl): ValidationResult {
		if (control.value) {
			return validNumber(control.value) && +Number(control.value) >= 3
				? null
				: { 'invalidNumber': true };
			} else {
				return null
			}
		}
}