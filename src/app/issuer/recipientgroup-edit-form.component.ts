import { Component, Input } from "@angular/core";

import { FormControl, FormGroup, FormBuilder, Validators } from '@angular/forms';
import { MessageService } from "../common/services/message.service";

import { BadgeClassManager } from "./services/badgeclass-manager.service";
import { BadgeImageComponent } from "../common/components/badge-image.component";
import { FormFieldText } from "../common/components/formfield-text";
import { RecipientGroup } from "./models/recipientgroup.model";
import { markControlsDirty } from "../common/util/form-util";

@Component({
	selector: 'recipientgroup-edit-form',
	template: `
		<div *ngIf="isEditing">
			<form [formGroup]="recipientGroupEditForm" (ngSubmit)="submitEdit(recipientGroupEditForm.value)" class="l-form" novalidate>
				<fieldset>
					<bg-formfield-text [control]="recipientGroupEditForm.controls.group_name"
					                   [label]="'Name'"
					                   [errorMessage]="{required:'Please enter a group name'}"
					></bg-formfield-text>
		
					<bg-formfield-text [control]="recipientGroupEditForm.controls.group_description"
					                   [label]="'Description'"
					                   [errorMessage]="'Please enter a group description'"
					                   [multiline]="true"
					></bg-formfield-text>
				</fieldset>
		
				<div class="l-childrenhorizontal l-childrenhorizontal-small l-childrenhorizontal-right">
						<a class="button button-primaryghost"
						   (click)="cancelEditing()"
						>Cancel</a>
						<button type="submit"
						        class="button"
						        (click)="validateEditForm($event)"
						        [disabled-when-requesting]="true"
						>Save</button>
				</div>
			</form>
		</div>
	`,

})
export class RecipientGroupEditForm {
	@Input() recipientGroup: RecipientGroup;
	@Input() formSpan: boolean = true;
	isEditing: boolean;

	constructor(
		protected formBuilder: FormBuilder,
		protected messageService: MessageService,
		protected badgeManager: BadgeClassManager
	) {
		this.recipientGroupEditForm = this.formBuilder.group({
			group_name:  [ '',
               Validators.compose([
	               Validators.required,
	               Validators.maxLength(254)
               ])
			],
			group_description: [ '', Validators.required ]
		} as RecipientGroupForm<any[]>);
	}

	////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
	// Element Editing
	recipientGroupEditForm: FormGroup;

	get editControls(): RecipientGroupForm<FormControl> {
		return this.recipientGroupEditForm.controls as any;
	}

	startEditing() {
		this.isEditing = true;

		this.editControls.group_name.setValue(this.recipientGroup.name, { emitEvent: false });
		this.editControls.group_description.setValue(this.recipientGroup.description, { emitEvent: false });
	}

	cancelEditing() {
		this.isEditing = false;
	}

	submitEdit(formState: RecipientGroupForm<string>) {
		this.isEditing = false;

		this.recipientGroup.name = formState.group_name;
		this.recipientGroup.description = formState.group_description;

		this.recipientGroup.save().then(
			success => this.messageService.reportMinorSuccess(
				`Saved changes to '${this.recipientGroup.name}'`
			),
			failure => this.messageService.reportAndThrowError(
				`Failed to update recipientGroup '${this.recipientGroup.name}'`, failure
			)
		)
	}

	validateEditForm(ev) {
		if (!this.recipientGroupEditForm.valid) {
			ev.preventDefault();
			markControlsDirty(this.recipientGroupEditForm);
		}
	}
}

interface RecipientGroupForm<T> {
	group_name: T;
	group_description: T;
}
