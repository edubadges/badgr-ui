import { Component, Input, OnChanges, ViewChild, ElementRef, AfterViewInit, SimpleChanges } from "@angular/core";

import { FormControl, FormGroup } from '@angular/forms';

import { UrlValidator } from "../validators/url.validator";
import { CommonDialogsService } from "../services/common-dialogs.service";

@Component({
	selector: 'bg-formfield-text',

	host: {
		'class': "formfield",
		'[class.formfield-is-error]': "isErrorState",
		'[class.formfield-locked]': "isLockedState",
		'[class.formfield-monospaced]': "monospaced",
	},
	template: `
        <label [attr.for]="inputName" *ngIf="label || includeLabelAsWrapper">
	        {{ label }}  <span *ngIf="optional" >(OPTIONAL)</span>
            <span *ngIf="formFieldAside">{{ formFieldAside }}</span>
            <button type="button" *ngIf="isLockedState" (click)="unlock()">(unlock)</button>
            <ng-content select="[label-additions]"></ng-content>
        </label>

        <label class="visuallyhidden" [attr.for]="inputName" *ngIf="ariaLabel">{{ ariaLabel }}</label>

        <p class="formfield-x-description" *ngIf="description">{{ description }}</p>

        <input [type]="fieldType"
               *ngIf="! multiline && autofill"
               [name]="inputName"
               [id]="inputId"
               [formControl]="control"
               [placeholder]="placeholder || ''"
               (change)="postProcessInput()"
               (focus)="cacheControlState()"
               (keypress)="handleKeyPress($event)"
							 #textInput
							 disabled
							 />
				<input [type]="fieldType"
               *ngIf="! multiline && ! autofill"
               [name]="inputName"
               [id]="inputId"
               [formControl]="control"
               [placeholder]="placeholder || ''"
               (change)="postProcessInput()"
               (focus)="cacheControlState()"
               (keypress)="handleKeyPress($event)"
               #textInput
               />
        <textarea *ngIf="multiline"
                  [name]="inputName"
                  [id]="inputId"
                  [formControl]="control"
                  [placeholder]="placeholder || ''"
                  (change)="postProcessInput()"
                  (focus)="cacheControlState()"
                  (keypress)="handleKeyPress($event)"
                  #textareaInput
                  ></textarea>

				<p class="formfield-x-error" *ngIf="isErrorState">{{ errorMessageForDisplay }}</p>
    `
})
export class FormFieldText implements OnChanges, AfterViewInit {
	@Input() control: FormControl;
	@Input() initialValue: string;
	@Input() id: string;
	@Input() label: string;
	@Input() ariaLabel: string;
	@Input() includeLabelAsWrapper:boolean = false; //includes label for layout purposes even if label text wasn't passed in.
	@Input() formFieldAside:string; //Displays additional text above the field. I.E (optional)
	@Input() errorMessage: CustomValidatorMessages;
	@Input() multiline: boolean = false;
	@Input() autofill: boolean = false;
	@Input() monospaced: boolean = false;
	@Input() description: string;
	@Input() placeholder: string;
	@Input() fieldType: FormFieldTextInputType = "text";
	@Input() optional: boolean = false;

	@Input() errorGroup: FormGroup;
	@Input() errorGroupMessage: CustomValidatorMessages;

	@Input() unlockConfirmText: string = "Unlocking this field may have unintended consequences. Are you sure you want to continue?";
	@Input() urlField: boolean = false;

	@Input() autofocus: boolean = false;

	@ViewChild("textInput") textInput: ElementRef;
	@ViewChild("textareaInput") textareaInput: ElementRef;

	private _unlocked = false;
	@Input()
	set unlocked(unlocked: boolean) { this._unlocked = unlocked; this.updateDisabled(); }
	get unlocked() { return this._unlocked }

	private _locked = false;
	@Input()
	set locked(locked: boolean) { this._locked = locked; this.updateDisabled(); }
	get locked() { return this._locked }

	get inputElement(): HTMLInputElement | HTMLTextAreaElement {
		if (this.textInput && this.textInput.nativeElement) {
			return this.textInput.nativeElement;
		}
		if (this.textareaInput && this.textareaInput.nativeElement) {
			return this.textareaInput.nativeElement;
		}
		return null;
	}

	get hasFocus(): boolean {
		return document.activeElement === this.inputElement;
	}

	get errorMessageForDisplay(): string {
		return this.hasFocus ? this.cachedErrorMessage : this.uncachedErrorMessage;
	}

	get uncachedErrorMessage(): string {
		return messagesForValidationError(
			this.label || this.ariaLabel,
			this.control && this.control.errors,
			this.errorMessage
		).concat(messagesForValidationError(
			this.label,
			this.errorGroup && this.errorGroup.errors,
			this.errorGroupMessage
		))[0]; // Only display the first error
	}

	get value() {
		return this.control.value;
	}

	private cachedErrorMessage = null;
	private cachedErrorState = null;
	private cachedDirtyState = null;
	get controlErrorState() { return this.control.dirty && (!this.control.valid || (this.errorGroup && !this.errorGroup.valid)) }
	get isErrorState() {
		if (this.hasFocus && this.cachedErrorState !== null) {
			return this.cachedErrorState;
		} else {
			return this.controlErrorState;
		}
	}
	get isLockedState() { return this.locked && !this.unlocked }

	private randomName = "field" + Math.random();
	get inputName() { return (this.label||this.placeholder||this.randomName).replace(/[^\w]+/g, "_").toLowerCase() }
	get inputId() { return this.id || (this.label||this.placeholder||this.randomName).toLowerCase() }


	constructor(
		private dialogService: CommonDialogsService,
		private elemRef: ElementRef
	) { }

	ngAfterViewInit() {
		if (this.autofocus) {
			this.focus();
		}
	}

	ngOnChanges(changes: SimpleChanges): any {
		// Unlocked by default when there is no value
		if (!this.control.value) {
			this.unlocked = true;
		}

		if ("initialValue" in changes) {
			const initialValue = changes["initialValue"].currentValue;
			if ((this.value === null || this.value === undefined || this.value === '') &&
					(initialValue !== null && initialValue !== undefined && initialValue !== '')
			) {
				this.control.setValue(initialValue);
			}
		}

		this.updateDisabled();
	}

	updateDisabled() {
		if (! this.control) return;

		if (this.isLockedState) {
			this.control.disable();
		} else {
			this.control.enable();
		}
	}

	unlock() {
		this.dialogService.confirmDialog.openResolveRejectDialog({
			dialogTitle: "Are you sure?",
			dialogBody: this.unlockConfirmText,
			resolveButtonLabel: "Continue",
			rejectButtonLabel: "Cancel",
		}).then(
			() => this.unlocked = true,
			() => void 0
		);
	}

	cacheControlState() {
		this.cachedErrorMessage = this.uncachedErrorMessage;
		this.cachedDirtyState = this.control.dirty;
		this.cachedErrorState = this.controlErrorState;
	}

	focus() {
		this.inputElement.focus();
	}

	select() {
		this.inputElement.select();
	}

	private postProcessInput() {
		if (this.urlField) {
			UrlValidator.addMissingHttpToControl(this.control);
		}
	}

	handleKeyPress(event: KeyboardEvent) {
		// This handles revalidating when hitting enter from within an input element. Ideally, we'd catch _all_ form submission
		// events, but since the form supresses those if things aren't valid, that doesn't really work. So we do this hack.
		if (event.keyCode == 13) {
			this.control.markAsDirty();
			this.cacheControlState();
		}
	}
}

/**
 * Allowable HTML input type for text based inputs.
 */
export type FormFieldTextInputType = "text" | "email" | "url" | "tel" | "password" | "search";

export type ValidatorKey = "required" | "maxlength" | "validUrl";

export type CustomValidatorMessages = string | {[validatorKey: string]: string};

/**
 * Default validation message generators for input fields.
 */
export const defaultValidatorMessages: {
	[validatorKey: string]: (label: string, result?: any) => string
} = {
	"required": (label: string) => `${label} is required`,
	"validUrl": () => `Please enter a valid URL`,
	"invalidTelephone": () => `Please enter a valid phone number`,
	"invalidEmail": () => `Please enter a valid email address`,
	"invalidNumber": () => `Please enter a valid number`,
	"maxlength": (
		label: string,
		{actualLength, requiredLength}: {actualLength: number; requiredLength: number}
	) => (actualLength && requiredLength)
		? `${label} exceeds maximum length of ${requiredLength} by ${actualLength - requiredLength} characters`
		: `${label} exceeds maximum length.`
};

export function messagesForValidationError(
	label: string,
	validatorResult: {[key: string]: string},
	customMessages: CustomValidatorMessages
): string[] {
	if (validatorResult && typeof(validatorResult) === "object" && Object.keys(validatorResult).length > 0) {
		if (typeof(customMessages) === "string") {
			return [ customMessages ];
		}

		const messages: string[] = [];

		Object.keys(validatorResult).forEach(validatorKey => {
			const validatorValue = validatorResult[validatorKey];

			messages.push(
				(customMessages && typeof(customMessages) === "object" && customMessages[validatorKey]) ||
				(validatorValue && typeof(validatorValue) === "string" && validatorValue) ||
				(defaultValidatorMessages[validatorKey] && defaultValidatorMessages[validatorKey](label, validatorValue)) ||
				`Field failed ${validatorKey} validation.`
			);
		});

		return messages;
	} else {
		return []
	}
}
