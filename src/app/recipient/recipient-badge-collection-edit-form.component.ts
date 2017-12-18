import { Component, Input } from "@angular/core";
import { FormBuilder, FormGroup, Validators, FormControl } from "@angular/forms";
import { MessageService } from "../common/services/message.service";
import { BaseRoutableComponent } from "../common/pages/base-routable.component";
import { markControlsDirty } from "../common/util/form-util";
import { RecipientBadgeCollection } from "./models/recipient-badge-collection.model";

@Component({
	selector: 'recipient-badge-collection-edit-form',
	template: `
		<div *ngIf="isEditing">
			<form class="l-form l-form-image"
			      [formGroup]="badgeCollectionForm"
			      (ngSubmit)="submitForm(badgeCollectionForm.value)"
			      novalidate>
				<fieldset>
					<bg-formfield-text [control]="badgeCollectionForm.controls.collectionName"
					                   [label]="'Name'"
					                   [errorMessage]="{required: 'Please enter a collection name'}"
					                   [autofocus]="true">			                
                       <span label-additions>Max 128 characters</span> 
					</bg-formfield-text>
	
					<bg-formfield-text [control]="badgeCollectionForm.controls.collectionDescription"
					                   [label]="'Description'"
					                   [errorMessage]="{required: 'Please enter a description'}"
					                   [multiline]="true"
					><span label-additions>Max 255 characters</span></bg-formfield-text>
					
					<div class="l-form-x-offset l-childrenhorizontal l-childrenhorizontal-small l-childrenhorizontal-right">
						<a class="button button-primaryghost"
						   [disabled-when-requesting]="true"
						   (click)="cancelEditing()"
						>Cancel</a>
						<button type="submit"
						        class="button"
						        [disabled]="!! savePromise"
						        (click)="validateForm($event)"
						        [loading-promises]="[ savePromise ]"
						        loading-message="Saving"
						>Save</button>
					</div>
				</fieldset>
			</form>
			</div>
		`
})
export class RecipientBadgeCollectionEditFormComponent {
	@Input() badgeCollection: RecipientBadgeCollection;

	badgeCollectionForm: FormGroup;
	savePromise: Promise<any>;

	isEditing: boolean = false;

	constructor(
		formBuilder: FormBuilder,
		private messageService: MessageService
	) {
		this.badgeCollectionForm = formBuilder.group({
			collectionName: [
				'',
				Validators.compose([
					Validators.required,
					Validators.maxLength(128)
				])
			],
			collectionDescription: [
				'',
				Validators.compose([
					Validators.required,
					Validators.maxLength(255)
				])
			]
		} as EditBadgeCollectionForm<any[]>);
	}

	startEditing() {
		this.isEditing = true;

		this.controls.collectionName.setValue(this.badgeCollection.name, { emitEvent: false });
		this.controls.collectionDescription.setValue(this.badgeCollection.description, { emitEvent: false });
	}

	cancelEditing() {
		this.isEditing = false;
	}

	protected get controls(): EditBadgeCollectionForm<FormControl> {
		return this.badgeCollectionForm.controls as any;
	}

	protected submitForm(formState: EditBadgeCollectionForm<string>) {
		if (this.badgeCollectionForm.valid) {
			this.badgeCollection.name = formState.collectionName;
			this.badgeCollection.description = formState.collectionDescription;

			this.savePromise = this.badgeCollection.save()
				.then(
					success => {
						this.isEditing = false;
						this.messageService.reportMinorSuccess(`Saved changes to collection ${this.badgeCollection.name}`)
					},
					failure => this.messageService.reportHandledError(`Failed to save changes to collection ${this.badgeCollection.name}`)
				).then(
					() => this.savePromise = null
				)
		}
	}

	protected validateForm(ev) {
		if (!this.badgeCollectionForm.valid) {
			ev.preventDefault();
			markControlsDirty(this.badgeCollectionForm);
		}
	}
}

interface EditBadgeCollectionForm<T> {
	collectionName: T;
	collectionDescription: T;
}