
import { Http } from "@angular/http";
import { BaseHttpApiService } from "../../common/services/base-http-api.service";
import { Injectable } from "@angular/core";
import { SystemConfigService } from "../../common/services/config.service";
import { SessionService } from "../../common/services/session.service";
import { ApiIssuerForCreation, ApiIssuer, ApiIssuerStaffOperation } from "../models/issuer-api.model";
import { IssuerSlug } from "../models/issuer-api.model";
import { MessageService } from "../../common/services/message.service";

@Injectable()
export class IssuerApiService extends BaseHttpApiService {
	constructor(
		protected loginService: SessionService,
		protected http: Http,
		protected configService: SystemConfigService,
		protected messageService: MessageService
	) {
		super(loginService, http, configService, messageService);
	}

	createIssuer(
		creationIssuer: ApiIssuerForCreation
	): Promise<ApiIssuer> {

		return this.post(`/v1/issuer/issuers`, creationIssuer)
			.then(r => r.json() as ApiIssuer)

	}

	editIssuer(
		issuerSlug: IssuerSlug,
		editingIssuer: ApiIssuerForCreation
	): Promise<ApiIssuer> {
		return this.put(`/v1/issuer/issuers/${issuerSlug}`, editingIssuer)
			.then(r => r.json() as ApiIssuer)

	}

	listIssuers(): Promise<ApiIssuer[]> {
		return this
			.get(`/v1/issuer/issuers`)
			.then(r => r.json());
	}

	getIssuer(issuerSlug: string): Promise<ApiIssuer> {
		return this
			.get(`/v1/issuer/issuers/${issuerSlug}`)
			.then(r => r.json());
	}

	updateStaff(
		issuerSlug: IssuerSlug,
		updateOp: ApiIssuerStaffOperation
	) {
		return this
			.post(`/v1/issuer/issuers/${issuerSlug}/staff`, updateOp)
			.then(r => r.json() as ApiIssuer)
	}
}
