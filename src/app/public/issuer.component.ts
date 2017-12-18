import { Component, Injector } from "@angular/core";
import { ActivatedRoute } from "@angular/router";

import { preloadImageURL } from "../common/util/file-util";
import { PublicApiService } from "./services/public-api.service";
import { LoadedRouteParam } from "../common/util/loaded-route-param";
import { PublicApiBadgeClass, PublicApiIssuer } from "./models/public-api.model";
import { EmbedService } from "../common/services/embed.service";
import { addQueryParamsToUrl, stripQueryParamsFromUrl } from "../common/util/url-util";
import { routerLinkForUrl } from "./public.component";

@Component({
	template: `
		<ng-template [bgAwaitPromises]="issuerIdParam">
			<!-- Embedded View -->
			<div class="l-cardembedded" *ngIf="embedService.isEmbedded">
				<div class="card card-largeimage">
					<a class="card-x-main" [href]="issuer.id" target="_blank">
						<div class="card-x-image">
							<img [loaded-src]="issuer.image || issuerImagePlaceholderUrl"
							     [loading-src]="badgeLoadingImageUrl"
							     [error-src]="badgeFailedImageUrl"
							     alt="Logo for issuer {{ issuer.name }}"
							     width="60" height="60" />
						</div>
						<div class="card-x-text">
							<h1>{{ issuer.name }}</h1>
							<small *ngIf="issuer.url"><a [href]="issuer.url">{{ issuer.url }}</a></small>
						</div>
					</a>
				</div>
			</div>

			<!-- Regular View -->
			<main *ngIf="! embedService.isEmbedded">
				<form-message></form-message>

				<header class="wrap wrap-light l-containerhorizontal l-heading ">

					<div class="heading">
						<div class="heading-x-image">
							<img [loaded-src]="issuer.image || issuerImagePlaceholderUrl"
							     [loading-src]="badgeLoadingImageUrl"
							     [error-src]="badgeFailedImageUrl"
							     alt="Logo for issuer {{ issuer.name }}"
							     width="60" height="60" />
						</div>
						<div class="heading-x-text">
							<h1>{{ issuer.name }}</h1>
							<p>{{ issuer.description }}</p>
							<div class="l-childrenhorizontal">
								<a class="button button-primaryghost l-offsetleft" [href]="issuer.url" target="_blank">Visit Website</a>
								<a class="button button-primaryghost l-offsetleft" href="mailto:{{ issuer.email }}">Contact Issuer</a>
								<a class="button button-primaryghost" [href]="v1JsonUrl" target="_blank">View v1.1 JSON</a>
								<a class="button button-primaryghost" [href]="v2JsonUrl" target="_blank">View v2.0 JSON</a>

								<a class="button button-primaryghost"
								   [href]="issuer.sourceUrl"
								   target="_blank"
								   *ngIf="issuer.sourceUrl"
								>View Original</a>
							</div>
						</div>
					</div>

				</header>

				<div class="wrap l-containerhorizontal l-headeredsection" *ngIf="badgeClasses && badgeClasses.length > 0">
					<header class="l-childrenhorizontal l-childrenhorizontal-spacebetween l-childrenhorizontal-spacebetween">
						<h2 class="title title-is-smallmobile">Badge Classes</h2>
					</header>

					<div class="l-overflowhorizontal">
						<table class="table">
							<thead>
								<tr>
									<th scope="col">Badge</th>
									<!-- BGR-1044: Hiding this until and if we decide to include creation dates in the public badge api -->
									<!--<th class="hidden hidden-is-desktop" scope="col">Created</th>-->
								</tr>
							</thead>
							<tbody>
								<tr *ngFor="let badgeClass of badgeClasses">
									<th scope="row">
										<div class="l-childrenhorizontal l-childrenhorizontal-small">
											<img class="l-childrenhorizontal-x-offset"
											     [src]="badgeClass.image"
											     [alt]="badgeClass.name"
											     width="40">
											<a [routerLink]="routerLinkForUrl(badgeClass.id)">{{ badgeClass.name }}</a>
										</div>
									</th>
									<!--<td class="hidden hidden-is-desktop">-->
										<!--<time [date]="badgeClass.created_at" format="mediumDate"></time>-->
									<!--</td>-->
								</tr>
							</tbody>
						</table>
					</div>
				</div>
			</main>
		</ng-template>
	`
})
export class PublicIssuerComponent {
	readonly issuerImagePlaceholderUrl = preloadImageURL(require(
		'../../breakdown/static/images/placeholderavatar-issuer.svg'));
	readonly badgeLoadingImageUrl = require('../../breakdown/static/images/badge-loading.svg');
	readonly badgeFailedImageUrl = require('../../breakdown/static/images/badge-failed.svg');

	issuerIdParam: LoadedRouteParam<{ issuer: PublicApiIssuer, badges: PublicApiBadgeClass[] }>;
	routerLinkForUrl = routerLinkForUrl;

	constructor(
		private injector: Injector,
		public embedService: EmbedService
	) {
		this.issuerIdParam = new LoadedRouteParam(
			injector.get(ActivatedRoute),
			"issuerId",
			paramValue => {
				const service: PublicApiService = injector.get(PublicApiService);
				return service.getIssuerWithBadges(paramValue)
			}
		);
	}

	get issuer(): PublicApiIssuer { return this.issuerIdParam.value.issuer }
	get badgeClasses(): PublicApiBadgeClass[] { return this.issuerIdParam.value.badges }

	private get rawJsonUrl() {
		return stripQueryParamsFromUrl(this.issuer.id) + ".json";
	}

	get v1JsonUrl() {
		return addQueryParamsToUrl(this.rawJsonUrl, {v: "1_1"});
	}

	get v2JsonUrl() {
		return addQueryParamsToUrl(this.rawJsonUrl, {v: "2_0"});
	}
}