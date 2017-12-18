import { Component, Output, EventEmitter, Input, OnChanges, ElementRef } from "@angular/core";


import { Issuer } from "../../issuer/models/issuer.model";
import { preloadImageURL } from "../util/file-util";


@Component({
	selector: '[bgIssuerLink]',
	host: {
		"target": "_blank"
	},
	template: `
			<img [loaded-src]="bgIssuerLink?.image"
			     [loading-src]="issuerPlaceholderImageSrc"
			     [error-src]="issuerPlaceholderImageSrc"
			     [alt]="bgIssuerLink ? (bgIssuerLink.name + ' avatar') : 'Unknown issuer avatar'" />
			{{ bgIssuerLink?.name || 'Unknown Issuer' }}
    `,

})
export class BgIssuerLinkComponent implements OnChanges {
	readonly issuerPlaceholderImageSrc = preloadImageURL(require("../../../breakdown/static/images/placeholderavatar-issuer.svg"));

	@Input('bgIssuerLink')
	bgIssuerLink: Issuer;

	constructor(
		private elemRef: ElementRef
	) {}

	ngOnChanges(changes: {}): any {
		if (! this.bgIssuerLink || !this.bgIssuerLink.websiteUrl) {
			this.elem.removeAttribute("href");
		} else {
			this.elem.setAttribute("href", this.bgIssuerLink.websiteUrl);
		}
	}

	get elem(): Element {
		return this.elemRef.nativeElement as Element;
	}
}
