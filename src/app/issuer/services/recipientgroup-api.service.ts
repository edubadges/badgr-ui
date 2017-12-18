import { Injectable } from "@angular/core";
import { Http, Response } from "@angular/http";
import { BaseHttpApiService } from "../../common/services/base-http-api.service";
import { SessionService } from "../../common/services/session.service";
import { SystemConfigService } from "../../common/services/config.service";
import {
	ApiRecipientGroup,
	ApiIssuerRecipientGroupList,
	ApiRecipientGroupForCreation, ApiIssuerRecipientGroupDetailList
} from "../models/recipientgroup-api.model";
import { MessageService } from "../../common/services/message.service";


@Injectable()
export class RecipientGroupApiService extends BaseHttpApiService {
	constructor(
		protected loginService: SessionService,
		protected http: Http,
		protected configService: SystemConfigService,
		protected messageService: MessageService
	) {
		super(loginService, http, configService, messageService);
	}

	listIssuerRecipientGroups(
		issuerSlug: string
	): Promise<ApiIssuerRecipientGroupList> {
		return this
			.get(`/v2/issuers/${issuerSlug}/recipient-groups`)
			.then(r => r.json());
	}

	listIssuerRecipientGroupDetail(
		issuerSlug: string
	): Promise<ApiIssuerRecipientGroupDetailList> {
		return this
			.get(`/v2/issuers/${issuerSlug}/recipient-groups?embedRecipients=true`)
			.then(r => r.json());
	}

	/**
	 * Define a new recipientGroup to be owned by an issuer
	 */
	createRecipientGroup(
		issuerSlug: string,
		recipientGroupPayload: ApiRecipientGroupForCreation
	): Promise<ApiRecipientGroup> {
		return this
			.post(`/v2/issuers/${issuerSlug}/recipient-groups`, recipientGroupPayload)
			.then(r => r.json());
	}

	/**
	 * GET detail on a recipientGroup
	 */
	getRecipientGroupDetail(
		issuerSlug: string,
		recipientGroupSlug: string
	): Promise<ApiRecipientGroup> {
		return this
			.get(`/v2/issuers/${issuerSlug}/recipient-groups/${recipientGroupSlug}?embedRecipients=true`)
			.then(r => r.json());
	}

	/**
	 * PUT (update) detail on a recipientGroup
	 */
	putRecipientGroup(
		issuerSlug: string,
		recipientGroupSlug: string,
		recipientGroup: ApiRecipientGroup
	): Promise<ApiRecipientGroup> {
		return this
			.put(`/v2/issuers/${issuerSlug}/recipient-groups/${recipientGroupSlug}?embedRecipients=true`, recipientGroup)
			.then(r => r.json());
	}

	/**
	 * DELETE a recipientGroup
	 */
	deleteRecipientGroup(
		issuerSlug: string,
		recipientGroupSlug: string
	): Promise<Response> {
		return this
			.delete(`/v2/issuers/${issuerSlug}/recipient-groups/${recipientGroupSlug}`);
	}

	/**
	 * GET detail on a recipientGroup
	 */
	updateRecipientGroup(
		issuerSlug: string,
		recipientGroupSlug: string,
		recipientGroupPayload: ApiRecipientGroup
	): Promise<ApiRecipientGroup> {
		return this
			.put(`/v2/issuers/${issuerSlug}/recipient-groups/${recipientGroupSlug}`, recipientGroupPayload)
			.then(r => r.json());
	}
}