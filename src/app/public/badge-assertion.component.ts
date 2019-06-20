import { Component, Injector } from "@angular/core";
import { ActivatedRoute } from "@angular/router";

import { preloadImageURL } from "../common/util/file-util";
import { PublicApiService } from "./services/public-api.service";
import { LoadedRouteParam } from "../common/util/loaded-route-param";
import {
	PublicApiBadgeAssertionWithBadgeClass, PublicApiBadgeClass,
	PublicApiBadgeClassWithIssuer,
	PublicApiIssuer
} from "./models/public-api.model";
import { EmbedService } from "../common/services/embed.service";
import { addQueryParamsToUrl, stripQueryParamsFromUrl } from "../common/util/url-util";
import { routerLinkForUrl } from "./public.component";
import { QueryParametersService } from "../common/services/query-parameters.service";
import { MessageService } from "../common/services/message.service";
import { SystemConfigService } from "../common/services/config.service";
import { saveAs } from "file-saver";


@Component({
	template: `
		<ng-template [bgAwaitPromises]="assertionIdParam">
			<!-- Embedded View -->
			<div class="l-cardembedded" *ngIf="embedService.isEmbedded">
				<div class="card card-largeimage">
					<a class="card-x-main" [href]="assertion.id" target="_blank">
						<div class="card-x-image">
							<img [loaded-src]="assertion.image"
							     [loading-src]="badgeLoadingImageUrl"
							     [error-src]="badgeFailedImageUrl"
							     width="60" height="60" />
						</div>
						<div class="card-x-text">
							<h1 [truncatedText]="badgeClass.name"></h1>
							<small [truncatedText]="issuer.name"></small>
							<p [truncatedText]="badgeClass.description" [maxLength]="40"></p>
						</div>
					</a>
					<div class="card-x-actions">
						<span><small>Awarded</small> <time [date]="assertion.issuedOn" format="mediumDate"></time></span>
						<a class="button button-secondaryghost"
						   type="button"
						   target="_blank"
						   [href]="verifyUrl"
						>Verify Badge</a>
					</div>
				</div>
			</div>
	
			<!-- Regular View -->
			<main *ngIf="! embedService.isEmbedded">
				<form-message></form-message>
	
				<header class="wrap wrap-light l-containerhorizontal l-heading">
					<div class="heading">
						<!-- Badge Assertion Image -->
						<div class="heading-x-imageLarge">
							<div class="badge badge-flat">
								<img [loaded-src]="assertion.image"
								     [loading-src]="badgeLoadingImageUrl"
								     [error-src]="badgeFailedImageUrl"
								     width="200" />
							</div>
						</div>
	
						<div class="heading-x-text">
							<!-- Badge Name -->
							<h1><a [routerLink]="routerLinkForUrl(badgeClass.id)">{{ badgeClass.name }}</a></h1>
	
							<!-- Issuer Information -->
							<a class="stack" [routerLink]="routerLinkForUrl(issuer.id)">
								<div class="stack-x-image">
									<img [loaded-src]="issuer.image"
									     [loading-src]="issuerImagePlacholderUrl"
									     [error-src]="issuerImagePlacholderUrl"
									     width="80" />
								</div>
								<div class="stack-x-text">
									<h2>{{ issuer.name }}</h2>
								</div>
							</a>
							<p *ngIf="assertion.expires && isExpired" class="heading-x-meta-callout">
								Expired on <time [date]="assertion.expires" format="mediumDate"></time>
							</p>
							<p class="heading-x-meta">
								Awarded on <time [date]="assertion.issuedOn" format="mediumDate"></time>
							</p>
							<p *ngIf="assertion.expires && !isExpired" class="heading-x-meta">
								Expires on <time [date]="assertion.expires" format="mediumDate"></time>
							</p>
	
							<p style="font-size: 16px">{{ badgeClass.description }}</p>
	
							<!-- criteria -->
							<section *ngIf="badgeClass.criteria">
								<h1>Criteria</h1>
								<show-more *ngIf="badgeClass.criteria.narrative">
									<markdown-display [value]="badgeClass.criteria.narrative"></markdown-display>
								</show-more>
								<div class="l-childrenhorizontal l-childrenhorizontal-small l-childrenhorizontal-right"
								     *ngIf="assertion.criteriaUrl"
								>
									<a class="button button-primaryghost"
									   [href]="assertion.criteriaUrl"
									   target="_blank">View external Criteria URL</a>
								</div>
							</section>
	
							<!-- tags -->
							<section>
								<h1 *ngIf="badgeClass.tags && badgeClass.tags.length">Tags</h1>
								<div class="l-childrenhorizontal l-childrenhorizontal-small l-childrenhorizontal-left">
									<span
										*ngFor="let tag of badgeClass.tags; last as last">
										{{tag}}<span *ngIf="!last">,</span> 
									</span>
								</div>
							</section>
	
							<!-- alignment -->
							<section>
								<h1 *ngIf="badgeClass.alignment && badgeClass?.alignment.length>0">Alignment</h1>
								<div class="bordered l-padding-2x l-marginBottom-2x"
								     *ngFor="let alignment of badgeClass.alignment; let i=index">
									<div class="l-childrenhorizontal l-childrenhorizontal-small l-childrenhorizontal-spacebetween">
										<h1>{{alignment.targetName}}</h1>
										<small>{{alignment.targetCode}}</small>
									</div>
									
									<ng-template [ngIf]="alignment.targetDescription">
										{{ alignment.targetDescription }}
									</ng-template>
									
									<div *ngIf="alignment.frameworkName">
										<h1>Framework</h1>
										{{alignment.frameworkName}}
									</div>
									<div class="l-childrenhorizontal l-childrenhorizontal-small l-childrenhorizontal-right"
									     *ngIf="alignment.targetUrl"
									>
										<a class="button button-primaryghost"
										   [href]="alignment.targetUrl"
										   target="_blank">View alignment URL</a>
									</div>
								</div>
							</section>
	
							<!-- evidence -->
							<section>
								<h1 *ngIf="assertion.evidence?.length>0 || assertion.narrative">Evidence</h1>
								<show-more *ngIf="assertion.narrative">
									<markdown-display [value]="assertion.narrative"></markdown-display>
								</show-more>
								<div class="bordered l-padding-2x l-marginBottom-2x"
								     *ngFor="let evidence of assertion.evidence; let i=index">
									<show-more *ngIf="evidence.narrative">
										<markdown-display [value]="evidence.narrative"></markdown-display>
									</show-more>
									<div class="l-childrenhorizontal l-childrenhorizontal-small l-childrenhorizontal-right">
										<a
											*ngIf="evidence.id"
											class="button button-primaryghost"
											[href]="evidence.id"
											target="_blank">VIEW EVIDENCE URL</a>
									</div>
								</div>
							</section>
							
							<!-- URLs -->
							<section>
								<h1>v2.0</h1>
								<a [href]="v2JsonUrl" class="button button-primaryghost">JSON</a>
								<a [href]="v2BakedUrl" class="button button-primaryghost" download=true target="_blank">Baked Image</a>
							</section>
							<section>
								<a *ngIf="assertion.sourceUrl" [href]="assertion.sourceUrl" class="button button-primaryghost"
								>View Original</a>
							</section>
						</div>
						
						<div class="heading-x-actions" *ngIf="!showDownload">
							<a class="button button-major button-large" 
							   target="_blank"
							   [href]="verifyUrl"
							>Verify Badge</a>
						</div>
						
						<div class="heading-x-actions" *ngIf="showDownload">
							<a class="button button-major button-large" 
							   (click)="openSaveDialog(assertion)"
							>Download</a>
						</div>
						
					</div>
				</header>
				<div class="l-containerhorizontal l-headeredsection">
					<endorsements-badge [badge]="assertion"></endorsements-badge>
				</div>
			</main>
		</ng-template>
	`
})
export class PublicBadgeAssertionComponent {
	readonly issuerImagePlacholderUrl = preloadImageURL(require(
		'../../breakdown/static/images/placeholderavatar-issuer.svg'));
	readonly badgeLoadingImageUrl = require('../../breakdown/static/images/badge-loading.svg');
	readonly badgeFailedImageUrl = require('../../breakdown/static/images/badge-failed.svg');

	assertionIdParam: LoadedRouteParam<PublicApiBadgeAssertionWithBadgeClass>;
	assertionId: string;

	routerLinkForUrl = routerLinkForUrl;

	constructor(
		private injector: Injector,
		public embedService: EmbedService,
		public messageService: MessageService,
		public configService: SystemConfigService,
		public queryParametersService: QueryParametersService
	) {
		this.assertionIdParam = new LoadedRouteParam(
			injector.get(ActivatedRoute),
			"assertionId",
			paramValue => {
				this.assertionId = paramValue;
				const service: PublicApiService = injector.get(PublicApiService);
				return service.getBadgeAssertion(paramValue).then(assertion => {
					if (assertion.revoked) {
						if (assertion.revocationReason) {
							messageService.reportFatalError("Assertion has been revoked:", assertion.revocationReason)
						} else {
							messageService.reportFatalError("Assertion has been revoked.", "");
						}
					}
					else if (this.showDownload) {
						this.openSaveDialog(assertion);
					}
					return assertion;
				})
			}
		);
	}

	get showDownload() {
		return this.queryParametersService.queryStringValue("action") == "download"
	}

	get assertion(): PublicApiBadgeAssertionWithBadgeClass { return this.assertionIdParam.value }

	get badgeClass(): PublicApiBadgeClass { return this.assertion.badge }

	get issuer(): PublicApiIssuer { return this.assertion.badge.issuer }

	get isExpired(): boolean {
		return !this.assertion.expires || new Date(this.assertion.expires) < new Date();
	}

	private get rawJsonUrl() {
		return `${this.configService.apiConfig.baseUrl}/public/assertions/${this.assertionId}.json`;
	}

	private get noJsonUrl() {
		return `${this.configService.apiConfig.baseUrl}/public/assertions/${this.assertionId}`;
	}

	get v1JsonUrl() {
		return addQueryParamsToUrl(this.rawJsonUrl, { v: "1_1" });
	}

	get v2JsonUrl() {
		return addQueryParamsToUrl(this.rawJsonUrl, { v: "2_0" });
	}

	get rawBakedUrl() {
		return `${this.configService.apiConfig.baseUrl}/public/assertions/${this.assertionId}/baked`;
	}

	get v1BakedUrl() {
		return addQueryParamsToUrl(this.rawBakedUrl, { v: "1_1" })
	}

	get v2BakedUrl() {
		return addQueryParamsToUrl(this.rawBakedUrl, { v: "2_0" })
	}

	get verifyUrl() {
		// const v = this.queryParametersService.queryStringValue("v") || "2_0";
		// const assertion_url = v == "2_0" ? this.v2JsonUrl : this.v1JsonUrl;
		const assertion_url = this.noJsonUrl
		let url = `${this.configService.assertionVerifyUrl}?url=${assertion_url}`;
		for (let identity_type of ['identity__email', 'identity__url', 'identity__telephone', 'identity__id']) {
			let identity = this.queryParametersService.queryStringValue(identity_type)
			if (identity) {
				url = `${url}&${identity_type}=${identity}`;
			}
		}
		return url;
	}

	generateFileName(assertion) {
		return `${assertion.badge.name} - ${assertion.recipient.identity}`
	}

	openSaveDialog(assertion) {
		const xhr = new XMLHttpRequest();
		xhr.open("GET", assertion.image, true);
		xhr.responseType = "blob";
		xhr.onload = (e) => {
			if (xhr.status == 200) {
				let name = this.generateFileName(assertion);
				saveAs(xhr.response, name);
			}
		};
		xhr.send();
	}
}
