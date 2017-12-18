import { Component, Input, ElementRef } from "@angular/core";
import { FormControl } from "@angular/forms";
import { readFileAsDataURL, loadImageURL, preloadImageURL, base64ByteSize } from "../util/file-util";
import { DomSanitizer } from '@angular/platform-browser';
import { throwExpr } from "../util/throw-expr";

@Component({
	selector: 'bg-formfield-image',
	host: {
		"[class.formimage]": "! newDropZone",
		"[class.formfield]": "newDropZone",
		"[class.formfield-inlinelabel]": "newDropZone",

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
		<ng-template [ngIf]="newDropZone">
			<label [attr.for]="'image_field' + uniqueIdSuffix">
				{{ label }}
				<ng-content select="[label-additions]"></ng-content>
			</label>

			<div class="l-dropzoneinput">
				<div class="l-dropzoneinput-x-container">
					<input type="file"
					       accept="image/*"
					       name="image_field{{ uniqueIdSuffix }}"
					       id="image_field{{ uniqueIdSuffix }}"
					       (change)="fileInputChanged($event)"
					       class="visuallyhidden"
					/>
					
					<label class="dropzone dropzone-alt1"
					       [class.dropzone-is-error]="fileErrorMessage || (control.dirty && !control.valid)"
					       [class.dropzone-is-dropped]="imageProvided"
					       [class.dropzone-is-dragging]="isDragging"
					       attr.aria-labelledby="image_field{{ uniqueIdSuffix }}" 
					       for="image_field{{ uniqueIdSuffix }}"
					>
						<span class="dropzone-x-text" *ngIf="!imageLoading && !imageDataUrl && !imageErrorMessage">Upload Image</span>
						
						<img [src]="imageFailedSrc" width="142" alt="Invalid image" *ngIf="imageErrorMessage">
						<img [src]="imageLoadingSrc" width="142" alt="Image preview" *ngIf="imageLoading">
						<img [src]="unsafeImageDataUrl" width="142" alt="Image preview" *ngIf="imageDataUrl">
					</label>
					<label class="button button-tertiary"
					       type="button"
					       for="image_field{{ uniqueIdSuffix }}"
					>Upload</label>
					<p class="formfield-x-error" *ngIf="control.dirty && !control.valid">{{ errorMessage }}</p>
				</div>
			</div>
		</ng-template>
		
		<ng-template [ngIf]="! newDropZone">
			<p class="formimage-x-title">
				{{ label }}
				<ng-content select="[label-additions]"></ng-content>
			</p>
			
			<input type="file"
			       accept="image/*"
			       name="image_field{{ uniqueIdSuffix }}"
			       id="image_field{{ uniqueIdSuffix }}"
			       (change)="fileInputChanged($event)"
			       class="visuallyhidden"
			/>
			
			<label [attr.for]="'image_field' + uniqueIdSuffix" (click)="clearFileInput()">
				<span class="formimage-x-image">
					<img [src]="placeholderImage" alt="Placeholder image" *ngIf="!imageLoading && !imageDataUrl && !imageErrorMessage">
					<img [src]="imageFailedSrc" alt="Invalid image" *ngIf="imageErrorMessage">
					<img [src]="imageLoadingSrc" alt="Image preview" *ngIf="imageLoading">
					<img [src]="unsafeImageDataUrl" alt="Image preview" *ngIf="imageDataUrl">
				</span>
				<span class="formimage-x-text">
					<span *ngIf="!imageLoading && !imageDataUrl" class="formimage-x-label">Drag or <span>Upload Image</span>.</span>
					<span *ngIf="imageLoading" class="formimage-x-label">Loading Image...</span> 
					<span *ngIf="imageDataUrl" class="formimage-x-label">{{ imageName }}</span>
					<span *ngIf="imageDataUrl" class="formimage-x-button button button-primaryghost l-offsetleft l-offsetbottom">Change</span>
					
					<span *ngIf="imageErrorMessage" class="formimage-x-error">{{ imageErrorMessage }}</span>
				</span>
			</label>
			
			<p class="formimage-x-error" *ngIf="control.dirty && !control.valid">{{ errorMessage }}</p>
		</ng-template>
	`,

})
export class BgFormFieldImageComponent {
	readonly imageLoadingSrc = preloadImageURL(require("../../../breakdown/static/images/placeholderavatar-loading.svg"));
	readonly imageFailedSrc = preloadImageURL(require("../../../breakdown/static/images/placeholderavatar-failed.svg"));

	static uniqueNameCounter = 0;

	@Input() control: FormControl;
	@Input() label: string;
	@Input() errorMessage: string = "Please provide a valid image file";
	@Input() placeholderImage: string;
	@Input() imageLoader: (file: File) => Promise<string> = basicImageLoader;

	@Input() newDropZone: boolean = false;

	@Input() set imageLoaderName(name: string) {
		this.imageLoader = namedImageLoaders[name] || throwExpr(new Error(`Invalid image loader name ${name}`));
	}

	uniqueIdSuffix = BgFormFieldImageComponent.uniqueNameCounter++;

	isDragging: boolean = false;

	imageLoading: boolean = false;
	imageProvided: boolean = false;
	imageErrorMessage: string = null;

	get imageDataUrl() {
		return this.control.value;
	}
	set imageDataUrl(url: string) {
		this.control.setValue(url);
	}
	get unsafeImageDataUrl() {
		return this.domSanitizer.bypassSecurityTrustUrl(this.imageDataUrl);
	}

	imageName: string;

	get imageSize() { return base64ByteSize(this.imageDataUrl) }

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
		const self = this;

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

	useDataUrl(dataUrl: string, name: string = "Unknown") {
		// From https://stackoverflow.com/questions/4998908/convert-data-uri-to-file-then-append-to-formdata
		function dataURItoBlob(dataURI): Blob {
			// convert base64/URLEncoded data component to raw binary data held in a string
			var byteString;
			if (dataURI.split(',')[0].indexOf('base64') >= 0)
				byteString = atob(dataURI.split(',')[1]);
			else
				byteString = decodeURIComponent(dataURI.split(',')[1]);

			// separate out the mime component
			var mimeString = dataURI.split(',')[0].split(':')[1].split(';')[0];

			// write the bytes of the string to a typed array
			var ia = new Uint8Array(byteString.length);
			for (var i = 0; i < byteString.length; i++) {
				ia[i] = byteString.charCodeAt(i);
			}

			return new Blob([ia], {type:mimeString});
		}

		const file: File = Object.assign(
			dataURItoBlob(dataUrl),
			{
				name: name,
				lastModifiedDate: new Date()
			}
		) as any;

		this.updateFile(file);
	}

	private updateFiles(files: FileList) {
		this.updateFile(files[0]);
	}

	private updateFile(file: File) {
		this.imageName = file.name;
		this.imageDataUrl = null;
		this.imageProvided = false;
		this.imageErrorMessage = null;
		this.imageLoading = true;

		this.imageLoader(file)
			.then(
				dataUrl => {
					this.imageDataUrl = dataUrl;
					this.imageProvided = true;
					this.imageLoading = false;
				},
				(error: Error) => {
					this.imageErrorMessage = error.message;
					this.imageLoading = false;
				}
			)
	}
}

export function basicImageLoader(file: File): Promise<string> {
	return readFileAsDataURL(file)
		.then(url => loadImageURL(url).then(() => url))
		.catch(e => { throw new Error(`${file.name} is not a valid image file`) });
}

export function badgeImageLoader(file: File): Promise<string> {
	// Max file size from https://github.com/mozilla/openbadges-backpack/blob/1193c04847c5fb9eb105c8fb508e1b7f6a39052c/controllers/backpack.js#L397
	const maxFileSize = 1024*256;
	const startingMaxDimension = 512;

	if (file.type === 'image/svg+xml' && file.size <= maxFileSize) {
		return basicImageLoader(file);
	} else {
		return readFileAsDataURL(file)
			.then(loadImageURL)
			.then(image => {
				const canvas = document.createElement("canvas");
				let maxDimension = Math.min(Math.max(image.width, image.height), startingMaxDimension);
				let dataURL: string;

				do {
					canvas.width = canvas.height = maxDimension;

					const context = canvas.getContext("2d");

					// Inspired by https://stackoverflow.com/questions/26705803/image-object-crop-and-draw-in-center-of-canvas
					var scaleFactor = Math.min(canvas.width / image.width, canvas.height / image.height);
					var scaledWidth = image.width * scaleFactor;
					var scaledHeight = image.height * scaleFactor;

					context.drawImage(image,
						0,
						0,
						image.width,
						image.height,
						(canvas.width - scaledWidth) / 2,
						(canvas.height - scaledHeight) / 2,
						scaledWidth,
						scaledHeight
					);

					dataURL = canvas.toDataURL("image/png");

					// On the first try, guess a dimension based on the ratio of max pixel count to file size
					if (maxDimension == startingMaxDimension) {
						maxDimension = Math.sqrt(maxFileSize * (Math.pow(maxDimension, 2) / base64ByteSize(dataURL)));
					}

					// The guesses tend to be a little large, so shrink it down, and continue to shrink the size until it fits
					maxDimension *= .95;
				} while (base64ByteSize(dataURL) > maxFileSize);

				return dataURL;
			})
			.catch(e => { throw new Error(`${file.name} is not a valid image file`) });
	}
}


export function issuerImageLoader(file: File): Promise<string> {
	// Max file size from https://github.com/mozilla/openbadges-backpack/blob/1193c04847c5fb9eb105c8fb508e1b7f6a39052c/controllers/backpack.js#L397
	const maxFileSize = 1024*256;
	const startingMaxDimension = 512;

	if (file.type === 'image/svg+xml' && file.size <= maxFileSize) {
		return basicImageLoader(file);
	} else {
		return readFileAsDataURL(file)
			.then(loadImageURL)
			.then(image => {
				const canvas = document.createElement("canvas");
				let dataURL: string;

				let maxDimension = startingMaxDimension;

				do {
					var scaleFactor = Math.min(
						1,
						maxDimension / image.width,
						maxDimension / image.height
					);

					var scaledWidth = image.width * scaleFactor;
					var scaledHeight = image.height * scaleFactor;

					canvas.width = scaledWidth;
					canvas.height = scaledHeight;

					const context = canvas.getContext("2d");

					context.drawImage(image,
						0,
						0,
						image.width,
						image.height,
						0,
						0,
						scaledWidth,
						scaledHeight
					);

					dataURL =  canvas.toDataURL("image/png");

					// On the first try, guess a dimension based on the ratio of max pixel count to file size
					if (maxDimension == startingMaxDimension) {
						maxDimension = Math.sqrt(maxFileSize * (Math.pow(maxDimension, 2) / base64ByteSize(dataURL)));
					}

					// The guesses tend to be a little large, so shrink it down, and continue to shrink the size until it fits
					maxDimension *= .95;
				} while (base64ByteSize(dataURL) > maxFileSize);

				return dataURL;
			})
			.catch(e => { throw new Error(`${file.name} is not a valid image file`) });
			;
	}
}

export const namedImageLoaders = {
	"badge": badgeImageLoader,
	"issuer": issuerImageLoader,
	"basic": basicImageLoader
};