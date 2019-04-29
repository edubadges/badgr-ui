import { Injectable } from "@angular/core";
import { Http, Response } from "@angular/http";
import { BaseHttpApiService } from "../../common/services/base-http-api.service";
import { SessionService } from "../../common/services/session.service";
import { SystemConfigService } from "../../common/services/config.service";
import { IssuerSlug } from "../models/issuer-api.model";
import {
	ApiBadgeClass,
	BadgeClassSlug,
	ApiBadgeClassForCreation,
	ApiBadgeClassContextId
} from "../models/badgeclass-api.model";
import { MessageService } from "../../common/services/message.service";


@Injectable()
export class BadgeClassApiService extends BaseHttpApiService {
	constructor(
		protected loginService: SessionService,
		protected http: Http,
		protected configService: SystemConfigService,
		protected messageService: MessageService
	) {
		super(loginService, http, configService, messageService);
	}

	getAllUserBadgeClasses(): Promise<ApiBadgeClass[]> {
		return this.get('/v1/issuer/all-badges')
			.then(r => r.json());
	}



	getBadgesForIssuer(
		issuerSlug?: IssuerSlug
	): Promise<ApiBadgeClass[]> {
		return this.get('/v1/issuer/issuers/' + issuerSlug + '/badges')
			.then(r => r.json());
	}


	getBadgeForIssuerSlugAndBadgeSlug(
		issuerSlug: IssuerSlug,
		badgeSlug: BadgeClassSlug
	): Promise<ApiBadgeClass> {
		return this.get('/v1/issuer/issuers/' + issuerSlug + '/badges/' + badgeSlug)
			.then(r => r.json());
	}

	deleteBadgeClass(
		issuerSlug: IssuerSlug,
		badgeSlug: BadgeClassSlug
	): Promise<Response> {
		return this.delete(`/v1/issuer/issuers/${issuerSlug}/badges/${badgeSlug}`);
	}

	createBadgeClass(
		issuerSlug: IssuerSlug,
		badgeClass: ApiBadgeClassForCreation
	): Promise<ApiBadgeClass> {
		return this.post(`/v1/issuer/issuers/${issuerSlug}/badges`, badgeClass)
			.then(r => r.json() as ApiBadgeClass);
	}

	updateBadgeClass(
		issuerSlug: IssuerSlug,
		badgeClass: ApiBadgeClass
	): Promise<ApiBadgeClass> {
		return this.put(`/v1/issuer/issuers/${issuerSlug}/badges/${badgeClass.slug}`, badgeClass)
			.then(r => r.json() as ApiBadgeClass);
	}


}