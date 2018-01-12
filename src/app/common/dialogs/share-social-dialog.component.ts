import { Component, ViewChild, AfterViewInit, ElementRef, Renderer, Renderer2 } from "@angular/core";
import { registerDialog } from "dialog-polyfill/dialog-polyfill";

import { SharingService, SharedObjectType, ShareEndPoint } from "../services/sharing.service";
import { BaseDialog } from "./base-dialog";
import { DomSanitizer, SafeHtml } from "@angular/platform-browser";
import { addQueryParamsToUrl } from "../util/url-util";

@Component({
	selector: 'share-social-dialog',
	template: `
		<dialog class="dialog dialog-titled wrap wrap-light">
			<!-- Header -->
			<header class="dialog-x-titlebar">
				<h1>{{ options.title }}</h1>
				<button class="dialog-x-close" (click)="closeDialog()">
					<span class="icon icon-notext icon-close">Close</span>
				</button>
			</header>

			<!-- Tab Navigation Bar -->
			<nav class="l-tabs" aria-labelledby="nav-tabs" role="navigation">
				<h3 class="visuallyhidden" id="nav-tabs"> Tabs</h3>
				<button class="tab"
				        [class.tab-is-active]="currentTabId == 'link'"
				        (click)="openTab('link')"
				>
					<span class="visuallyhidden">Open </span>Link<span class="visuallyhidden"> tab</span>
				</button>
				<button class="tab"
				        [class.tab-is-active]="currentTabId == 'social'"
				        (click)="openTab('social')"
				>
					<span class="visuallyhidden">Open </span>Social<span class="visuallyhidden"> tab</span>
				</button>
				<button class="tab"
				        [class.tab-is-active]="currentTabId == 'embed'"
				        (click)="openTab('embed')"
				        *ngIf="hasEmbedSupport"
				>
					<span class="visuallyhidden">Open </span>Embed<span class="visuallyhidden"> tab</span>
				</button>
			</nav>

			<!-- Link Tab -->
			<div class="l-sharepane" tabindex="-1" id="sharelink" *ngIf="currentTabId == 'link'">
				<div class="formfield formfield-link">
					<label class=" " for="link-input">Copy this private URL to share:</label>
					<input id="link-input" 
					       name="link-input" 
					       type="text" 
					       [value]="currentShareUrl" 
					       (click)="$event.target.select()"
					       readonly
					       #urlInput
					>
				</div>
				<div class="l-childrenhorizontal l-childrenhorizontal-spacebetween">
					<div class="l-childrenhorizontal l-childrenhorizontal-small" *ngIf="options.versionOptions">
						<div class="formradiobutton" *ngFor="let version of options.versionOptions; let i = index">
							<input type="radio"
							       [value]="version"
							       [(ngModel)]="selectedVersion"
							       name="version-{{ i }}"
							       id="version-{{ i }}"
							       #urlInput
							/>
							<label for="version-{{ i }}">
								<span><span></span></span>
								<span class="formradiobutton-x-text">{{ version.label }}</span>
							</label>
						</div>
					</div>

					<button type="button"
					        class="button"
					        (click)="copyToClipboard(urlInput)"
					        [hidden]="! copySupported"
					>Copy</button>
				</div>
				<div class="l-sharepane-x-preview wrap wrap-light4 wrap-rounded" *ngIf="options.versionInfoTitle">
					<p class="text text-small"><strong>{{ options.versionInfoTitle }}</strong></p>
					<p class="text text-small">{{ options.versionInfoBody }}</p>
				</div>
				<div class="l-childrenhorizontal l-childrenhorizontal-right">
					<a class="standaloneanchor" [href]="currentShareUrl" target="_blank">Open in New Window</a>
				</div>
			</div>

			<!-- Social Tab -->
			<div class="l-sharepane l-sharepane-social" tabindex="-1" id="sharelinksocial" *ngIf="currentTabId == 'social'">
				<div class="l-authbuttons">
					<div>
						<button class="buttonauth buttonauth-facebook"
						        type="button"
						        (click)="openFacebookWindow()"
						>Facebook
						</button>
					</div>
					<div>
						<button class="buttonauth buttonauth-linkedin_oauth2"
						        type="button"
						        (click)="openLinkedInWindow()"
						>LinkedIn
						</button>
					</div>
					<div>
						<button class="buttonauth buttonauth-twitter"
						        type="button"
						        (click)="openTwitterWindow()"
						>Twitter
						</button>
					</div>
					<div>
						<button class="buttonauth buttonauth-portfolium"
						        type="button"
						        (click)="openPortfoliumWindow()"
						>Twitter
						</button>
					</div>
				</div>
			</div>

			<!-- Embed Tab -->
			<div class="l-sharepane" tabindex="-1" id="sharelinkembed" *ngIf="currentTabId == 'embed'">
				<div class="formfield formfield-limitedtextarea formfield-monospaced">
					<label class=" " for="emebed-code-box">Embed Code</label>
					<textarea id="emebed-code-box"
					          name="emebed-code-box"
					          readonly
					          [value]="currentEmbedHtml"
					          (click)="$event.target.select()"
					          #embedHtmlInput
					></textarea>
				</div>
				<div class="l-childrenhorizontal l-childrenhorizontal-spacebetween" >
					<div class="l-childrenhorizontal l-childrenhorizontal-small">
						<div class="formradiobutton" *ngFor="let embedOption of options.embedOptions; let i = index">
							<input type="radio"
							       name="embed-type-{{i}}"
							       id="embed-type-{{i}}"
							       [value]="embedOption"
							       [(ngModel)]="selectedEmbedOption"
							/>
							<label for="embed-type-{{i}}">
								<span><span></span></span>
								<span class="formradiobutton-x-text">{{ embedOption.label }}</span>
							</label>
						</div>
					</div>
					<button class="button"
					        type="button"
					        [hidden]="! copySupported"
					        (click)="copyToClipboard(embedHtmlInput)"
					>Copy</button>
				</div>
				<h3 class="title title-small title-uppercase">Preview</h3>
				<div class="l-sharepane-x-preview wrap wrap-light4 wrap-rounded l-childrencentered"
				     [innerHTML]="currentSafeEmbedHtml"
				></div>
			</div>
		</dialog>
	`
})
export class ShareSocialDialog extends BaseDialog {
	options: ShareSocialDialogOptions = {} as any;
	resolveFunc: () => void;
	rejectFunc: () => void;

	selectedVersion: ShareSocialDialogVersionOption | null = null;
	currentTabId: ShareSocialDialogTabId = "link";

	selectedEmbedOption: ShareSocialDialogEmbedOption | null = null;

	constructor(
		componentElem: ElementRef,
		renderer: Renderer2,
		private domSanitizer: DomSanitizer,
		private sharingService: SharingService
	) {
		super(componentElem, renderer);
	}

	//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
	// Public Dialog API

	openDialog(
		customOptions: ShareSocialDialogOptions
	): Promise<void> {
		this.options = Object.assign({}, customOptions);
		this.showModal();

		this.currentTabId = "link";
		this.selectedEmbedOption = this.options.embedOptions && this.options.embedOptions[0] || null;
		this.selectedVersion = this.options.versionOptions && this.options.versionOptions[0] || null;
		this.cachedEmbedOption = null;
		this.cachedEmbedHtml = null;
		this.currentSafeEmbedHtml = null;

		return new Promise<void>((resolve, reject) => {
			this.resolveFunc = resolve;
			this.rejectFunc = reject;
		});
	}

	closeDialog() {
		this.closeModal();
		this.resolveFunc();
	}

	//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
	// Share Window API

	openFacebookWindow() {
		this.sharingService.shareWithFacebook(
			this.options.shareObjectType,
			this.options.shareIdUrl,
			this.currentShareUrl
		);
	}

	openLinkedInWindow() {
		this.sharingService.shareWithLinkedIn(
			this.options.shareObjectType,
			this.options.shareIdUrl,
			this.currentShareUrl,
			this.options.shareTitle,
			this.options.shareSummary,
			this.options.shareEndpoint
		);
	}

	openTwitterWindow() {
		this.sharingService.shareWithTwitter(
			this.options.shareObjectType,
			this.options.shareIdUrl,
			this.currentShareUrl
		);
	}

	openPortfoliumWindow() {
		this.sharingService.shareWithPortfolium(
			this.options.shareObjectType,
			this.options.shareIdUrl,
			this.currentShareUrl
		);
	}

	//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
	// Internal API

	get currentShareUrl() {
		return this.selectedVersion
			? this.selectedVersion.shareUrl
			: this.options.shareUrl;
	}

	private cachedEmbedOption: ShareSocialDialogEmbedOption | null = null;
	private cachedEmbedHtml: string | null = null;
	currentSafeEmbedHtml: SafeHtml | null = null;

	get currentEmbedHtml(): string | null {
		if (! this.selectedEmbedOption) return null;

		// Cache the generated html because it involves DOM operations and could be slow, as it will be called on every
		// angular update at least twice.
		if (this.selectedEmbedOption == this.cachedEmbedOption)
			return this.cachedEmbedHtml;

		const option = this.selectedEmbedOption;

		// Include information about this embed in the query string so we know about the context later, especially if we
		// need to change how things are displayed, and want old version embeds to work correctly.
		// See [[ EmbedService ]] for the consumption of these parameters
		const embedUrlWithParams = addQueryParamsToUrl(
			option.embedUrl,
			{
				embedVersion: option.embedVersion,
				embedWidth: option.embedSize.width,
				embedHeight: option.embedSize.height,
			}
		);

		const outerContainer = document.createElement("div");
		let containerElem: HTMLElement = outerContainer;

		if (option.embedLinkUrl) {
			const anchor = document.createElement("a");
			anchor.href = option.embedLinkUrl;
			anchor.target = "_blank";
			outerContainer.appendChild(anchor);
			containerElem = anchor;
		}

		// Create the embedded HTML fragment by generating an element and grabbing innerHTML. This avoids us having to
		// deal with any HTML-escape issues, which are hard to get right, and for which there aren't any built-in functions.
		switch (option.embedType) {
			case "iframe": {
				const iframe = document.createElement("iframe");
				iframe.src = embedUrlWithParams;
				iframe.style.width = option.embedSize.width + "px";
				iframe.style.height = option.embedSize.height + "px";
				iframe.style.border = "0";

				if (option.embedTitle) {
					iframe.title = option.embedTitle;
				}

				containerElem.appendChild(iframe);
			} break;

			case "image": {
				const img = document.createElement("img");
				img.src = embedUrlWithParams;
				img.width = option.embedSize.width;
				img.height = option.embedSize.height;

				if (option.embedTitle) {
					img.alt = option.embedTitle;
				}

				containerElem.appendChild(img);
			} break;
		}

		this.cachedEmbedOption = this.selectedEmbedOption;
		this.cachedEmbedHtml = outerContainer.innerHTML;
		this.currentSafeEmbedHtml = this.domSanitizer.bypassSecurityTrustHtml(this.cachedEmbedHtml);

		return this.cachedEmbedHtml;
	}

	get hasEmbedSupport() {
		return this.options.embedOptions && this.options.embedOptions.length;
	}

	openTab(tabId: ShareSocialDialogTabId) {
		this.currentTabId = tabId;
	}

	copySupported(): boolean {
		try {
			return document.queryCommandSupported('copy');
		} catch(e) {
			return false;
		}
	}

	copyToClipboard(input: HTMLInputElement) {
		// Inspired by https://stackoverflow.com/questions/400212/how-do-i-copy-to-the-clipboard-in-javascript

		const inputWasDisabled = input.disabled;
		input.disabled = false;
		input.select();

		// Invoke browser support
		try {
			if (document.execCommand('copy')) {
				return;
			}
		} catch (err) {

		} finally {
			input.disabled = inputWasDisabled;
		}
	}
}

export interface ShareSocialDialogOptions {
	title: string;
	shareObjectType: SharedObjectType;
	shareUrl: string;
	shareIdUrl: string;
	shareTitle: string;
	shareSummary: string;
	shareEndpoint: ShareEndPoint;

	versionOptions?: ShareSocialDialogVersionOption[];
	versionInfoTitle?: string;
	versionInfoBody?: string;

	embedOptions: ShareSocialDialogEmbedOption[];
}

/**
 * Defines a "version" for a sharable link which will be displayed on the link page.
 */
export interface ShareSocialDialogVersionOption {
	label: string;
	shareUrl: string;
}

/**
 * Defines an embedding option for the share dialog.
 */
export interface ShareSocialDialogEmbedOption {
	/**
	 * Human-readable label for the radio button
	 */
	label: string;

	/**
	 * Human-readable alt/title text for the embedded object.
	 */
	embedTitle: string;

	/**
	 * URL to be displayed in the embed
	 */
	embedUrl: string;

	/**
	 * URL to link the embedded object to.
	 */
	embedLinkUrl: string;

	/**
	 * How the embed URL should be referenced.
	 * iframe - embeds the `embedUrl` as an iframe
	 * image - embeds the `embedUrl` as an image
	 */
	embedType: "iframe" | "image";

	/**
	 * Version of the embedded view. This is used so that future changes to embedded views won't break old versions
	 * that may be expecting a different `embedSize` or `embedType` than the old version.
	 */
	embedVersion: number;

	/**
	 * Size of the embedded content. Measured in logical pixels.
	 */
	embedSize: { width: number; height: number }
}

type ShareSocialDialogTabId = "link" | "social" | "embed";