import { Directive, ElementRef, Renderer, OnChanges, Input } from "@angular/core";
import { Router } from "@angular/router";
import Timer = NodeJS.Timer;

const defaultLoadingImage = require("../../../breakdown/static/images/image-placeholder.svg");
const defaultErrorImage = require("../../../breakdown/static/images/image-failed.svg");

@Directive({
	// Note that to have webpack process these sources, we must add the attributes to webpack.common.js in the html loader section.
	selector: '[loading-src],[loaded-src],[error-src]',
	exportAs: "image-status-placeholder",
})
export class BgImageStatusPlaceholderDirective implements OnChanges {
	@Input("loading-src")
	private loadingSrcAttr: string;

	@Input("loaded-src")
	private loadedSrcAttr: string;

	@Input("error-src")
	private errorSrcAttr: string;
	
	isOpen: boolean = false;
	
	image: HTMLImageElement = new Image();
	/**
	 * Keep the last value we set the image src to because the image.src property is modified after settings, and we
	 * need to be able to tell if it's changed.
	 */
	lastImageSource: string = null;
	
	loading = true;
	failed = false;

	constructor(
		private elemRef: ElementRef
	) {
		this.image.onload = () => this.imageLoaded();
		this.image.onerror = () => this.imageErrored();
	}
	
	ngOnChanges(changes: {}) {
		this.updateState();
	}
	
	private imageLoaded() {
		this.loading = false;
		this.failed = false;
		this.updateState();
	}
	
	private imageErrored() {
		this.loading = false;
		this.failed = true;
		this.updateState();
	}

	loadingTimeout: number;

	private updateState() {
		if (this.loadedSrc != this.lastImageSource) {
			this.image.src = this.lastImageSource = this.loadedSrc;

			this.loading = true;
			this.failed = false;
		}

		if (this.loading) {
			// First use the actual image, in case it is already loaded, to avoid flashing the loading image
			this.elem.src = this.loadedSrc;

			// If the image is not loaded within a frame or so, swap out for the loading image.
			if (this.loadingTimeout) {
				window.clearTimeout(this.loadingTimeout);
				this.loadingTimeout = null;
			}
			this.loadingTimeout = window.setTimeout(
				() => {
					if (this.loading) {
						this.elem.src = this.loadingSrc;
					}
					this.loadingTimeout = null;
				}, 30
			);
		} else if (this.failed) {
			this.elem.src = this.errorSrc;
		} else {
			this.elem.src = this.image.src;
		}
	}

	protected get loadingSrc(): string {
		return this.loadingSrcAttr || defaultLoadingImage;
	}

	protected get loadedSrc(): string {
		return this.loadedSrcAttr || this.loadingSrc;
	}

	protected get errorSrc(): string {
		return this.errorSrcAttr || defaultErrorImage;
	}

	protected get elem(): HTMLImageElement {
		return this.elemRef.nativeElement;
	}
}