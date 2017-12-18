import { Component, Input } from "@angular/core";

import { FormControl, FormGroup, FormBuilder, Validators } from '@angular/forms';
import { UrlValidator } from "../common/validators/url.validator";
import { LearningPathwayElement } from "./models/pathway.model";
import { MessageService } from "../common/services/message.service";

import { BadgeClassManager } from "./services/badgeclass-manager.service";
import { markControlsDirty } from "../common/util/form-util";

@Component({
	selector: 'pathway-element-edit-form',
	template: `
		<div *ngIf="isEditing">
			<form [formGroup]="elementEditForm"
			      (ngSubmit)="submitEdit(elementEditForm.getRawValue())"
			      class="l-form"
			      [class.l-form-span]="formSpan"
			      novalidate
			>
				<fieldset>
					<bg-formfield-text [control]="elementEditForm.controls.element_name"
					                   [label]="'Element Name'"
					                   [errorMessage]="'Please enter an element name'"
					></bg-formfield-text>
		
					<bg-formfield-text [control]="elementEditForm.controls.element_description"
					                   [label]="'Element Description'"
					                   [errorMessage]="'Please enter an element description'"
					                   [multiline]="true"
					></bg-formfield-text>
		
					<bg-formfield-text [control]="elementEditForm.controls.alignment_url"
					                   [label]="'Alignment URL'"
					                   [errorMessage]="'Please enter a valid URL'"
					                   [locked]="true"
					                   [urlField]="true"
					></bg-formfield-text>
				</fieldset>
		
				<div class="l-childrenhorizontal l-childrenhorizontal-small l-childrenhorizontal-right">
						<a class="button button-primaryghost"
						   (click)="cancelEditing()"
						   [disabled-when-requesting]="true"
						>Cancel</a>
						<button type="submit"
						        class="button"
						        (click)="validateEditForm($event)"
						        [disabled-when-requesting]="true"
						>Save</button>
				</div>
			</form>
		</div>
	`
})
export class PathwayElementEditForm {
	@Input() pathwayElement: LearningPathwayElement;
	@Input() formSpan: boolean = false;
	isEditing: boolean;

	constructor(
		protected formBuilder: FormBuilder,
		protected messageService: MessageService,
		protected badgeManager: BadgeClassManager
	) {
		this.elementEditForm = this.formBuilder.group({
			element_name: [ '', Validators.required ],
			element_description: [ '', Validators.required ],
			alignment_url: [ '', Validators.compose([ UrlValidator.validUrl ]) ]
		} as PathwayElementForm<any[]>);
	}

	////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
	// Element Editing
	elementEditForm: FormGroup;

	get editControls(): PathwayElementForm<FormControl> {
		return this.elementEditForm.controls as any;
	}

	startEditing() {
		this.isEditing = true;

		this.editControls.element_name.setValue(this.pathwayElement.name, { emitEvent: false });
		this.editControls.element_description.setValue(this.pathwayElement.description, { emitEvent: false });
		this.editControls.alignment_url.setValue(this.pathwayElement.alignmentUrl, { emitEvent: false });
	}

	cancelEditing() {
		this.isEditing = false;
	}

	submitEdit(formState: PathwayElementForm<string>) {
		this.isEditing = false;

		this.pathwayElement.name = formState.element_name;
		this.pathwayElement.description = formState.element_description;
		this.pathwayElement.alignmentUrl = formState.alignment_url;

		this.saveElement(this.pathwayElement);
	}

	validateEditForm(ev) {
		if (!this.elementEditForm.valid) {
			ev.preventDefault();
			markControlsDirty(this.elementEditForm);
		}
	}

	postProcessEditUrl() {
		UrlValidator.addMissingHttpToControl(this.editControls.alignment_url);
	}

	private saveElement(element: LearningPathwayElement = this.pathwayElement) {
		element.save().then(
			success => this.messageService.reportMinorSuccess(
				`Saved changes to '${element.name}'`
			),
			failure => this.messageService.reportAndThrowError(
				`Failed to update element '${element.name}'`, failure
			)
		)
	}
}

interface PathwayElementForm<T> {
	element_name: T;
	element_description: T;
	alignment_url: T;
}
