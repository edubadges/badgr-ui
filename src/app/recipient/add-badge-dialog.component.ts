import { Component, ViewChild, AfterViewInit, ElementRef, Renderer, Renderer2 } from "@angular/core";
import { RecipientBadgeManager } from "./services/recipient-badge-manager.service";
import { FormControl, FormGroup, FormBuilder } from "@angular/forms";
import { UrlValidator } from "../common/validators/url.validator";
import { JsonValidator } from "../common/validators/json.validator";
import { MessageService } from "../common/services/message.service";
import { BadgrApiFailure } from "../common/services/api-failure";
import { BaseDialog } from "../common/dialogs/base-dialog";
import { preloadImageURL } from "../common/util/file-util";
import { FormFieldText } from "../common/components/formfield-text";


type dialog_view_states = "upload" | "url" | "json";


@Component({
	selector: 'add-badge-dialog',
	template: `
		<dialog class="dialog dialog-large">

			<form class="table-x-tr table-x-active"
			      [formGroup]="addRecipientBadgeForm"
			      (ngSubmit)="submitBadgeRecipientForm(addRecipientBadgeForm.value)">

				<div class="dialog-x-content">

					<h1 class="title">Add Badge</h1>

					<p class="text">Add a badge you’ve already received by utilizing one of the options below.</p>

					<!---------- Drag or upload Badge ------------>

					<div *ngIf="currentDialogViewState === 'upload'">
						<bg-formfield-image
								imageLoaderName="basic"
								[placeholderImage]="uploadBadgeImageUrl"
								[control]="addRecipientBadgeForm.controls.image"
								(mouseup)="controlUpdated('image')"
								(drop)="controlUpdated('image' )"
								class="formimage-badgeUpload">

						</bg-formfield-image>
					</div>

					<!---------- Paste badge URL ---------->

					<div *ngIf="currentDialogViewState === 'url'">
						<div class="formfield formfield-image">
							<bg-formfield-text
									urlField="true"
									[control]="addRecipientBadgeForm.controls.url"
									errorMessage="Please enter valid URL"
									(keyup)="controlUpdated('url')"
									includeLabelAsWrapper="true"
									placeholder="Enter URL"
									#urlField
							>

								<img label-additions [loaded-src]="pasteBadgeImageUrl" />
							</bg-formfield-text>
						</div>
					</div>

					<!---------- Paste badge JSON ---------->

					<div *ngIf="currentDialogViewState === 'json'">
						<div class="formfield">
							<bg-formfield-text
									[control]="addRecipientBadgeForm.controls.assertion"
									errorMessage="Please enter valid JSON"
									placeholder="Enter JSON"
									(keyup)="controlUpdated('assertion')"
									[multiline]="true"
									[monospaced]="true"
									class="formfield-x-badgePasteJson-text-height"
									#jsonField
							>
							</bg-formfield-text>
						</div>
					</div>

					<!---------- State controls ---------->

					<div class="l-uploadBadgeButtons">
						<button class="badgeButton badgeButton-icon-badgeUpload"
						        [class.badgeButton-is-selected]="currentDialogViewState === 'upload'"
						        (click)="currentDialogViewState = 'upload'"
						        type="button">
							Upload Badge Image
						</button>

						<button class="badgeButton badgeButton-icon-pasteUrl"
						        [class.badgeButton-is-selected]="currentDialogViewState === 'url'"
						        (click)="openUrlTab()"
						        type="button">
							Paste Badge URL
						</button>

						<button class="badgeButton badgeButton-icon-pasteJson"
						        [class.badgeButton-is-selected]="currentDialogViewState === 'json'"
						        (click)="openJsonTab()"
						        type="button">
							Paste Badge JSON
						</button>

					</div>

					<!---------- Dialog controls---------->

					<div class="l-childrenhorizontal l-childrenhorizontal-small l-childrenhorizontal-right">
						<button class="button button-primaryghost"
						        type="button"
						        (click)="closeDialog()"
						        [disabled-when-requesting]="true">Cancel
						</button>
						<button class="button button-green" type="submit" [loading-promises]="[ badgeUploadPromise ]" loading-message="Adding">
							Add Badge
						</button>
					</div>

					<div *ngIf="formError" class="formmessage formmessage-is-active formmessage-is-error">
						<p>{{formError}}</p>
						<button class="icon icon-close-light icon-right" type="button" (click)="clearFormError()">Dismiss</button>
					</div>

				</div>

			</form>

		</dialog>
	`
})
export class AddBadgeDialogComponent extends BaseDialog {
	readonly uploadBadgeImageUrl = require('../../breakdown/static/images/image-uplodBadge.svg');
	readonly pasteBadgeImageUrl = preloadImageURL(require('../../breakdown/static/images/image-uplodBadgeUrl.svg'));

	static defaultOptions = {} as AddBadgeDialogOptions;

	EMPTY_FORM_ERROR = "At least one input is required to add a badge.";

	addRecipientBadgeForm: FormGroup;
	showAdvance:boolean = false;
	formError:string;

	currentDialogViewState: dialog_view_states = "upload";

	options: AddBadgeDialogOptions = AddBadgeDialogComponent.defaultOptions;
	resolveFunc: () => void;
	rejectFunc: (err?: any) => void;

	badgeUploadPromise: Promise<any>;

	@ViewChild("jsonField")
	private jsonField: FormFieldText;

	@ViewChild("urlField")
	private urlField: FormFieldText;

	constructor(
		componentElem: ElementRef,
		renderer: Renderer2,
		protected recipientBadgeManager: RecipientBadgeManager,
		protected formBuilder: FormBuilder,
		protected messageService: MessageService
	){
		super(componentElem, renderer);
		this.initAddRecipientBadgeForm()
	}

	protected initAddRecipientBadgeForm(){
		this.addRecipientBadgeForm = this.formBuilder.group({
			image: [],
			url: ['',UrlValidator.validUrl],
			assertion: ['',JsonValidator.validJson]
		} as AddBadgeDialogForm<any[]>)
	}

	protected get controls(): AddBadgeDialogForm<FormControl> {
		return this.addRecipientBadgeForm.controls as any;
	}

	/**
	 * Opens the confirm dialog with the given options. If the user clicks the "true" button, the promise will be
	 * resolved, otherwise, it will be rejected.
	 *
	 * @param customOptions Options for the dialog
	 * @returns {Promise<void>}
	 */
	openDialog(
		customOptions: AddBadgeDialogOptions
	): Promise<void> {
		this.options = Object.assign({}, AddBadgeDialogComponent.defaultOptions, customOptions);
		this.addRecipientBadgeForm.reset();
		this.showModal();

		return new Promise<void>((resolve, reject) => {
			this.resolveFunc = resolve;
			this.rejectFunc = reject;
		});
	}

	closeDialog() {
		this.closeModal();
		this.resolveFunc();
	}

	submitBadgeRecipientForm(formState: AddBadgeDialogForm<string | null>) {
		if (this.formHasValue(formState) && this.addRecipientBadgeForm.valid) {
			this.badgeUploadPromise = this.recipientBadgeManager
				.createRecipientBadge(formState)
				.then(instance => {
					this.messageService.reportMajorSuccess("Badge successfully imported.")
					this.closeDialog();
				})
				.catch(err => {
					let message = BadgrApiFailure.from(err).firstMessage;

					// display human readable description of first error if provided by server
					if (err.response && err.response._body) {
							const body = JSON.parse(err.response._body);
							if (body && body.length > 0 && body[0].description) {
								message = body[0].description;
							}
					}

					this.messageService.reportAndThrowError(
						message
							? `Failed to upload badge: ${message}`
							: `Badge upload failed due to an unknown error`,
						err
					);
				})
				.catch(e => {
					this.closeModal();
					this.rejectFunc(e);
				})
		} else {
			this.formError = "At least one badge input is required";
		}
	}

	controlUpdated(formControlName:string) {
		this.clearAllButMe(formControlName);
	}

	private formHasValue(formState):boolean{
		let formHasValue = false;
		Object.getOwnPropertyNames(formState)
			.forEach(formItem => {
				if (formState[formItem]){
					formHasValue = true;
				}
			}
			);
		return formHasValue;
	}

	clearAllButMe(formControlName: string) {
		const controls = this.addRecipientBadgeForm.controls;

		Object.getOwnPropertyNames(controls)
			.forEach(formItem => {
				if (controls[formItem] !== controls[formControlName]) {
					(controls[formItem] as FormControl).setValue("");
				}
			})
	}

	openUrlTab() {
		this.currentDialogViewState = 'url';
		// Wait for angular to render the field
		setTimeout(() => this.urlField.select());
	}
	openJsonTab() {
		this.currentDialogViewState = 'json';
		// Wait for angular to render the field
		setTimeout(() => this.jsonField.select());
	}

	clearFormError() {
		this.formError = undefined;
	}
}

export interface AddBadgeDialogOptions {};

interface AddBadgeDialogForm<T> {
	image: T;
	url: T;
	assertion: T;
}
