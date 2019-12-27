import { Injectable } from "@angular/core";
import { Http, Response } from "@angular/http";
import { BaseHttpApiService } from "../../common/services/base-http-api.service";
import { SessionService } from "../../common/services/session.service";
import { SystemConfigService } from "../../common/services/config.service";
import { IssuerSlug } from "../models/issuer-api.model";
import { BadgeClassSlug } from "../models/badgeclass-api.model";
import { ApiBadgeInstance, ApiBadgeInstanceForCreation, ApiBadgeInstanceForBatchCreation } from "../models/badgeinstance-api.model";
import { MessageService } from "../../common/services/message.service";


export class PaginationResults {
	private _links = {};

	constructor(link_header?: string) {
		if (link_header) {
			this.parseLinkHeader(link_header)
		}
	}
	public parseLinkHeader(link_header: string) {
		const re = /<([^>]+)>; rel="([^"]+)"/g;
		let match;
		do {
			match = re.exec(link_header);
			if (match) {
				this._links[match[2]] = match[1];
			}
		} while (match);
	}

	get hasNext(): boolean {
		return 'next' in this._links;
	}
	get hasPrev(): boolean {
		return 'prev' in this._links;
	}
	get nextUrl() { return this._links['next']; }
	get prevUrl() { return this._links['prev']; }
}
export class BadgeInstanceResultSet {
	public instances: ApiBadgeInstance[];
	public links: PaginationResults;
}

@Injectable()
export class BadgeInstanceApiService extends BaseHttpApiService {
	constructor(
		protected loginService: SessionService,
		protected http: Http,
		protected configService: SystemConfigService,
		protected messageService: MessageService
	) {
		super(loginService, http, configService, messageService);
	}

	createBadgeInstanceBatched(
		issuerSlug: IssuerSlug,
		badgeSlug: BadgeClassSlug,
		batchCreationInstance: ApiBadgeInstanceForBatchCreation
	): Promise<ApiBadgeInstance[]>{
		return this.post(`/v1/issuer/issuers/${issuerSlug}/badges/${badgeSlug}/batchAssertions`, batchCreationInstance)
			.then(r => r.json());
	}


	signBadgeInstanceBatched(batchSignInstances, password): Promise<any[]> {
		return this.post(`/v1/issuer/batchSign`, {badge_instances: batchSignInstances, password: password})
			.then(r => r.json());
	}

	private handleAssertionResult = (r) => {
			let resultset = new BadgeInstanceResultSet();
			if (r.headers && r.headers.has('link')) {
				let link = r.headers.get('link');
				resultset.links = new PaginationResults(link);
			}
			resultset.instances = r.json();
			return resultset;
	};

	listBadgeInstances(issuerSlug: string, badgeSlug: string, query?: string, num: number = 100): Promise<BadgeInstanceResultSet> {
		let url = `/v1/issuer/issuers/${issuerSlug}/badges/${badgeSlug}/assertions?num=${num}`;
		if (query) {
			url += `&recipient=${query}`
		}
		return this.get(url).then(this.handleAssertionResult);
	}


	listBadgeInstancesForSigning(): Promise<BadgeInstanceResultSet> {
		let url = `/v1/issuer/timestamped-assertions`;
		// return this.get(url).then(r => r.json());
		return this.get(url).then(this.handleAssertionResult);
	}

	denyBadgeInstancesForSigning(badgeInstanceSlug: string): Promise<any> {
		return this.delete(`/v1/issuer/timestamped-assertions`, { badge_instance_slug: badgeInstanceSlug })
			.then(r => r.json());
	}

	getBadgeInstancePage(paginationUrl: string):Promise<BadgeInstanceResultSet> {
		return this.get(paginationUrl).then(this.handleAssertionResult);
	}



	revokeBadgeInstance(
		issuerSlug: string,
		badgeSlug: string,
		badgeInstanceSlug: string,
		revocationReason: string
	): Promise<Response> {
		return this.delete(
			`/v1/issuer/issuers/${issuerSlug}/badges/${badgeSlug}/assertions/${badgeInstanceSlug}`,
			{
				"revocation_reason": revocationReason
			}
		);
	}


}
