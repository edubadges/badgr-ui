import { Injectable } from "@angular/core";
import { Http, Response } from "@angular/http";
import { BaseHttpApiService } from "../../common/services/base-http-api.service";
import { SessionService } from "../../common/services/session.service";
import { SystemConfigService } from "../../common/services/config.service";
import {
	ApiPathwaySummary,
	ApiPathwayDetail,
	ApiPathwayElement,
	ApiIssuerPathwayList,
	ApiPathwayElementForCreation,
	ApiPathwaySummaryForCreation
} from "../models/pathway-api.model";
import { BadgeClass } from "../models/badgeclass.model";
import { MessageService } from "../../common/services/message.service";


@Injectable()
export class PathwayApiService extends BaseHttpApiService {
	constructor(
		protected loginService: SessionService,
		protected http: Http,
		protected configService: SystemConfigService,
		protected messageService: MessageService
	) {
		super(loginService, http, configService, messageService);
	}

	listIssuerPathways(
		issuerSlug: string
	): Promise<ApiIssuerPathwayList> {
		return this
			.get(`/v2/issuers/${issuerSlug}/pathways`)
			.then(r => r.json());
	}

	/**
	 * Define a new pathway to be owned by an issuer
	 */
	createPathway(
		issuerSlug: string,
		pathwayPayload: ApiPathwaySummaryForCreation
	): Promise<ApiPathwaySummary> {
		return this
			.post(`/v2/issuers/${issuerSlug}/pathways`, pathwayPayload)
			.then(r => r.json());
	}

	/**
	 * Delete a Pathway Element
	 */
	deletePathway(
		issuerSlug: string,
		pathwaySlug: string
	): Promise<void> {
		return this
			.delete(`/v2/issuers/${issuerSlug}/pathways/${pathwaySlug}`)
			.then(() => void 0);
	}

	/**
	 * GET detail on a pathway
	 */
	getPathwayDetail(
		issuerSlug: string,
		pathwaySlug: string
	): Promise<ApiPathwayDetail> {
		return this
			.get(`/v2/issuers/${issuerSlug}/pathways/${pathwaySlug}`)
			.then(r => r.json());
	}

	/**
	 * PUT new pathway properties
	 */
	putPathwaySummary(
		issuerSlug: string,
		pathwaySlug: string,
		pathway: ApiPathwaySummary
	): Promise<ApiPathwaySummary> {
		return this
			.put(`/v2/issuers/${issuerSlug}/pathways/${pathwaySlug}`, pathway)
			.then(r => r.json());
	}

	/**
	 * GET a flat list of Pathway Elements defined on a pathway
	 */
	getPathwayElements(
		issuerSlug: string,
		pathwaySlug: string
	): Promise<ApiPathwayElement[]> {
		return this
			.get(`/v2/issuers/${issuerSlug}/pathways/${pathwaySlug}/elements`)
			.then(r => r.json());
	}

	/**
	 * Add a new Pathway Element
	 */
	createPathwayElement(
		issuerSlug: string,
		pathwaySlug: string,
		elementPayload: ApiPathwayElementForCreation
	): Promise<ApiPathwayElement> {
		return this
			.post(`/v2/issuers/${issuerSlug}/pathways/${pathwaySlug}/elements`, elementPayload)
			.then(r => r.json())
			;
	}

	/**
	 * GET detail on a pathway, starting at a particular Pathway Element
	 */
	getPathwayElement(
		issuerSlug: string,
		pathwaySlug: string,
		elementSlug: string
	): Promise<ApiPathwayElement> {
		return this
			.get(`/v2/issuers/${issuerSlug}/pathways/${pathwaySlug}/elements/${elementSlug}`)
			.then(r => r.json());
	}

	/**
	 * Update a Pathway Element
	 */
	updatePathwayElement(
		issuerSlug: string,
		pathwaySlug: string,
		elementSlug: string,
		elementPayload: ApiPathwayElement
	): Promise<ApiPathwayElement> {
		return this
			.put(
				`/v2/issuers/${issuerSlug}/pathways/${pathwaySlug}/elements/${elementSlug}`,
				elementPayload
			)
			.then(r => r.json());
	}

	/**
	 * Delete a Pathway Element
	 */
	deletePathwayElement(
		issuerSlug: string,
		pathwaySlug: string,
		elementSlug: string
	): Promise<Response> {
		return this
			.delete(`/v2/issuers/${issuerSlug}/pathways/${pathwaySlug}/elements/${elementSlug}`);
	}

	/**
	 * GET list of Badge Classes aligned to a Pathway Element
	 */
	getPathwayElementBadgeAssociations(
		issuerSlug: string,
		pathwaySlug: string,
		elementSlug: string
	): Promise<BadgeClass[]> {
		return this
			.get(`/v2/issuers/${issuerSlug}/pathways/${pathwaySlug}/elements/${elementSlug}/badges`)
			.then(r => r.json());
	}

	/**
	 * Add a Badge Class to a Pathway Element
	 */
	addPathwayElementBadgeAssociation(
		issuerSlug: string,
		pathwaySlug: string,
		elementSlug: string,
		badgeClassSlug: string
	): Promise<Response> {
		return this
			.post(
				`/v2/issuers/${issuerSlug}/pathways/${pathwaySlug}/elements/${elementSlug}/badges`,
				{ badge: badgeClassSlug }
			);
	}

	/**
	 * Delete a badge association from a pathway element
	 */
	deletePathwayElementBadgeAssociation(
		issuerSlug: string,
		pathwaySlug: string,
		elementSlug: string,
		badgeSlug: string
	): Promise<Response> {
		return this
			.delete(`/v2/issuers/${issuerSlug}/pathways/${pathwaySlug}/elements/${elementSlug}/badges/${badgeSlug}`)
	}
}