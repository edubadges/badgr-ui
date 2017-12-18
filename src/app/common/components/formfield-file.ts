import { Component, ElementRef, EventEmitter, Input, Output } from "@angular/core";
import { FormControl } from "@angular/forms";
import { preloadImageURL, readFileAsText } from "../util/file-util";
import { DomSanitizer } from "@angular/platform-browser";

@Component({
	selector: 'bg-formfield-file',
	host: {
		"class": "formimage",
		"[class.formimage-is-dragging]": "isDragging",
		"[class.formimage-is-error]": "fileErrorMessage || (control.dirty && !control.valid)",
		"(drag)": "stopEvent($event)",
		"(dragstart)": "stopEvent($event)",
		"(dragover)": "dragStart($event)",
		"(dragenter)": "dragStart($event)",
		"(dragleave)": "dragStop($event)",
		"(dragend)": "dragStop($event)",
		"(drop)": "drop($event)",
	},
	template: `
		<p class="formimage-x-title">
			{{ label }}
			<ng-content select="[label-additions]"></ng-content>
		</p>
		<input type="file"
		       accept="{{validFileTypes}}"
		       name="image_field{{ uniqueIdSuffix }}"
		       id="image_field{{ uniqueIdSuffix }}"
		       (change)="fileInputChanged($event)"
		/>
		<label [attr.for]="'image_field' + uniqueIdSuffix" (click)="clearFileInput()">
			<span class="formimage-x-image">
				<img [src]="placeholderImage"
				     alt="Placeholder image"
				     *ngIf="!fileLoading && !fileErrorMessage">
				<img [src]="imageFailedSrc" alt="Invalid image" *ngIf="fileErrorMessage">
				<img [src]="imageLoadingSrc" alt="Image preview" *ngIf="fileLoading">
				<!--<img [src]="unsafeImageDataUrl" alt="Image preview" *ngIf="imageDataUrl">-->
			</span>
			
			<span class="formimage-x-text" *ngIf="! fileErrorMessage">
				<span *ngIf="! fileProvided && ! fileLoading" class="formimage-x-label">Drop file or <span>browse</span>.</span>
				<span *ngIf="fileLoading" class="formimage-x-label">Loading File...</span> 
					
				<span *ngIf="fileName" class="formimage-x-label">{{ fileName }}</span>
				<span *ngIf="fileName" class="formimage-x-button button button-primaryghost l-offsetleft l-offsetbottom">Change</span>
			</span>
			
			<span *ngIf="fileErrorMessage" class="formimage-x-error">{{ fileErrorMessage }}</span>
			<!--</span>-->
		</label>
		<p class="formimage-x-error" *ngIf="control.dirty && !control.valid">{{ errorMessage }}</p>
	`,

})
export class BgFormFieldFileComponent {
	readonly imageLoadingSrc = preloadImageURL(require("../../../breakdown/static/images/placeholderavatar-loading.svg"));
	readonly imageFailedSrc = preloadImageURL(require("../../../breakdown/static/images/placeholderavatar-failed.svg"));

	static uniqueNameCounter = 0;

	@Input() control: FormControl;
	@Input() label: string;
	@Input() errorMessage: string = "Please provide a valid file";
	@Input() placeholderImage: string;
	@Input() fileLoader: (file: File) => Promise<string> = basicFileLoader;
	@Input() validFileTypes: string = "";

	@Output() fileData: EventEmitter<string> = new EventEmitter<string>();

	uniqueIdSuffix = BgFormFieldFileComponent.uniqueNameCounter++;

	isDragging: boolean = false;

	fileLoading: boolean = false;
	fileProvided: boolean = false;
	fileErrorMessage: string = null;

	//new
	fileName: string = "";

	constructor(
		private elemRef: ElementRef,
		private domSanitizer: DomSanitizer
	) {}

	private get element(): HTMLElement {
		return this.elemRef.nativeElement as any;
	}

	clearFileInput() {
		(this.element.querySelector("input[type='file']") as HTMLInputElement).value = null;
	}

	fileInputChanged(ev: Event) {
		const input: HTMLInputElement = ev.target as HTMLInputElement;

		if (input.files && input.files[ 0 ]) {
			this.updateFiles(input.files);
		}
	}

	stopEvent(ev: DragEvent) {
		ev.preventDefault();
		ev.stopPropagation();
	}

	dragStart(ev: DragEvent) {
		this.stopEvent(ev);
		this.isDragging = true;
	}

	dragStop(ev: DragEvent) {
		this.stopEvent(ev);
		this.isDragging = false;
	}

	drop(ev: DragEvent) {
		this.dragStop(ev);
		if (ev.dataTransfer && ev.dataTransfer.files) {
			this.updateFiles(ev.dataTransfer.files);
		}
	}

	private updateFiles(files: FileList) {
		this.updateFile(files[ 0 ]);
	}

	private updateFile(file: File) {
		this.fileProvided = false;
		this.fileErrorMessage = null;
		this.fileName = file.name;
		this.fileLoading = true;

		this.fileLoader(file)
			.then(
				fileData => {
					// file manipulation here
					this.fileLoading = false;
					this.fileProvided = true;
					this.fileName = file.name;
					this.emitFileData(fileData);
				}
			)
			.catch(
				(error: Error) => {
					this.fileErrorMessage = error.message;
					this.fileProvided = false;
					this.fileLoading = false;
				}
			)
	}

	private emitFileData(fileData: string) {
		this.fileData.emit(fileData);
	}
}

export function basicFileLoader(file: File): Promise<string> {
	return readFileAsText(file)
		.then(text => text) // Placeholder for more file manipulation - just returning text passed in for now.
		.catch(e => {throw new Error(e) })
}
