import { Injectable } from "@angular/core";
import { Http } from "@angular/http";
import { BaseHttpApiService } from "../../common/services/base-http-api.service";
import { SessionService } from "../../common/services/session.service";
import { SystemConfigService } from "../../common/services/config.service";
import { MessageService } from "../../common/services/message.service";
import {
	PublicApiBadgeAssertionWithBadgeClass, PublicApiBadgeClass,
	PublicApiBadgeClassWithIssuer, PublicApiBadgeCollectionWithBadgeClassAndIssuer,
	PublicApiIssuer
} from "../models/public-api.model";
import { stripQueryParamsFromUrl } from "../../common/util/url-util";


@Injectable()
export class PublicApiService extends BaseHttpApiService {
	constructor(
		protected loginService: SessionService,
		protected http: Http,
		protected configService: SystemConfigService,
		protected messageService: MessageService
	) {
		super(loginService, http, configService, messageService);
	}

	getBadgeAssertion(
		assertionId: string
	): Promise<PublicApiBadgeAssertionWithBadgeClass> {
		const url = assertionId.startsWith("http")
			? assertionId
			: `/public/assertions/${assertionId}.json?v=2_0&expand=badge&expand=badge.issuer`;

		return this.get(url, null, false, false)
			.then(r => r.json() as PublicApiBadgeAssertionWithBadgeClass)
			.then(
				assertion => typeof(assertion.badge) == "string"
					? this.getBadgeClass(assertion.badge).then(badge=>({... assertion, badge }))
					: assertion
			);
	}

	getBadgeClass(
		badgeId: string
	): Promise<PublicApiBadgeClassWithIssuer> {
		const url = badgeId.startsWith("http")
			? badgeId
			: `/public/badges/${badgeId}?v=2_0&expand=issuer`;

		return this.get(url, null, false, false)
			.then(r => r.json() as PublicApiBadgeClassWithIssuer)
			.then(
				badge => typeof(badge.issuer) == "string"
					? this.getIssuer(badge.issuer).then(issuer=>({... badge, issuer }))
					: badge
			);
	}

	getIssuer(
		issuerId: string
	): Promise<PublicApiIssuer> {
		const url = issuerId.startsWith("http")
			? issuerId
			: `/public/issuers/${issuerId}`;

		return this.get(url, null, false, false)
			.then(r => r.json() as PublicApiIssuer);
	}

	getIssuerBadges(
		issuerId: string
	): Promise<PublicApiBadgeClass[]> {
		const url = issuerId.startsWith("http")
			? stripQueryParamsFromUrl(issuerId) + "/badges"
			: `/public/issuers/${issuerId}/badges`;

		return this.get(url, null, false, false)
			.then(r => r.json() as PublicApiBadgeClass[]);
	}

	getIssuerWithBadges(
		issuerId: string
	): Promise<{issuer: PublicApiIssuer; badges: PublicApiBadgeClass[]}> {
		return Promise.all([
			this.getIssuer(issuerId),
			this.getIssuerBadges(issuerId)
		]).then(([issuer, badges]) => ({ issuer, badges }))
	}

	getBadgeCollection(
		shareHash: string
	): Promise<PublicApiBadgeCollectionWithBadgeClassAndIssuer> {
		return this.get(`/public/collections/${shareHash}.json?v=2_0&expand=badges.badge&expand=badges.badge.issuer`, null,false, false)
			.then(r => r.json() as PublicApiBadgeCollectionWithBadgeClassAndIssuer);
	}

	acceptStaffMemberShip(code: string): Promise<any> {
		console.log(code)
		return this.get(`/v1/issuer/issuers-staff-confirm/${code}`, null, false, false)
			.then(r => {
				return r.json()
			})
	}

}
