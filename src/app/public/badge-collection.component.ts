import { Component, Injector } from "@angular/core";
import { ActivatedRoute } from "@angular/router";

import { preloadImageURL } from "../common/util/file-util";
import { PublicApiService } from "./services/public-api.service";
import { LoadedRouteParam } from "../common/util/loaded-route-param";
import { PublicApiBadgeCollectionWithBadgeClassAndIssuer } from "./models/public-api.model";
import { EmbedService } from "../common/services/embed.service";
import { routerLinkForUrl } from "./public.component";

@Component({
	template: `
		<ng-template [bgAwaitPromises]="collectionHashParam">
			<!-- Embedded View -->
			<div class="l-cardembedded" *ngIf="embedService.isEmbedded">
				<div class="card card-largeimage">
					<a class="card-x-main" [href]="collection.id" target="_blank">
						<span class="card-x-text">
							<h1>{{ collection.name }}</h1>
							<small>{{ collection.badges.length == 1 ? '1 Badge' : (collection.badges.length + ' Badges') }}</small>
							<ul>
								<li *ngFor="let badge of collection.badges | slice:0:(collection.badges.length > 12 ? 11 : 12)">
									<div class="badge badge-flat">
										<img [loaded-src]="badge.image"
										     [loading-src]="badgeLoadingImageUrl"
										     [error-src]="badgeFailedImageUrl"
										     width="40" />
									</div>
								</li>

								<li *ngIf="collection.badges.length > 12">
								  <span class="card-x-more">{{ collection.badges.length - 11 }}<span> More</span></span>
								</li>
							</ul>
						</span>
					</a>
				</div>
			</div>
	
			<!-- Regular View -->
			<main *ngIf="! embedService.isEmbedded">
				<form-message></form-message>
				
				<header class="wrap wrap-light l-containerhorizontal l-heading ">
					<div class="heading">
						<div class="heading-x-text">
							<h1>{{ collection.name }} <span> {{ collection.badges.length == 1 ? "1 Badge" : collection.badges.length + " Badges" }}</span></h1>
							<p><small>Badges earned by {{ collection.owner.firstName }} {{ collection.owner.lastName }}</small></p>
							<p>{{ collection.description }}</p>
						</div>
					</div>
				</header>

				<div class="wrap l-containerhorizontal l-headeredsection">
					<div class="l-gridthree">
						<div *ngFor="let badge of collection.badges">
							<article class="card card-largeimage">
								<a class="card-x-main" [routerLink]="routerLinkForUrl(badge.id)">
									<div class="card-x-image">
										<div class="badge badge-flat">
											<img [alt]="badge.badge.name + 'Badge'" [src]="badge.image" width="80">
										</div>
									</div>
									<div class="card-x-text">
										<h1>{{ badge.badge.name }}</h1>
										<small>{{ badge.badge.issuer.name }}</small>
										<p [truncatedText]="badge.badge.description" [maxLength]="100"></p>
									</div>
								</a>
							</article>
						</div>
					</div>
				</div>
			</main>
		</ng-template>
	`
})
export class PublicBadgeCollectionComponent {
	readonly issuerImagePlacholderUrl = preloadImageURL(require(
		'../../breakdown/static/images/placeholderavatar-issuer.svg'));
	readonly badgeLoadingImageUrl = require('../../breakdown/static/images/badge-loading.svg');
	readonly badgeFailedImageUrl = require('../../breakdown/static/images/badge-failed.svg');

	routerLinkForUrl = routerLinkForUrl;

	collectionHashParam: LoadedRouteParam<PublicApiBadgeCollectionWithBadgeClassAndIssuer>;

	constructor(
		private injector: Injector,
		public embedService: EmbedService
	) {
		this.collectionHashParam = new LoadedRouteParam(
			injector.get(ActivatedRoute),
			"collectionShareHash",
			paramValue => {
				const service: PublicApiService = injector.get(PublicApiService);
				return service.getBadgeCollection(paramValue)
			}
		);
	}

	get collection(): PublicApiBadgeCollectionWithBadgeClassAndIssuer { return this.collectionHashParam.value }
}