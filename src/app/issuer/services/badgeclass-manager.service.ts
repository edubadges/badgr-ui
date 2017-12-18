import { Injectable, forwardRef, Inject } from "@angular/core";
import { Http, Response } from "@angular/http";
import { Observable } from "rxjs/Observable";
import { BaseHttpApiService } from "../../common/services/base-http-api.service";
import { SessionService } from "../../common/services/session.service";
import { SystemConfigService } from "../../common/services/config.service";
import { BadgeClass } from "../models/badgeclass.model";
import { StandaloneEntitySet } from "../../common/model/managed-entity-set";
import {
	ApiBadgeClass,
	ApiBadgeClassForCreation,
	BadgeClassSlug,
	BadgeClassRef,
	BadgeClassUrl
} from "../models/badgeclass-api.model";
import { CommonEntityManager } from "../../entity-manager/common-entity-manager.service";
import { BadgeClassApiService } from "./badgeclass-api.service";
import { IssuerSlug, IssuerUrl } from "../models/issuer-api.model";
import { AnyRefType, EntityRef } from "../../common/model/entity-ref";
import { ManagedEntityGrouping } from "../../common/model/entity-set";
import { MessageService } from "../../common/services/message.service";

@Injectable()
export class BadgeClassManager extends BaseHttpApiService {
	badgesList = new StandaloneEntitySet<BadgeClass, ApiBadgeClass>(
		apiModel => new BadgeClass(this.commonEntityManager),
		apiModel => apiModel.json.id,
		() =>
			this.badgeClassApi.getAllUserBadgeClasses()
	);
	badgesByIssuerUrl = new ManagedEntityGrouping<BadgeClass>(
		this.badgesList,
		badgeClass => badgeClass.issuerUrl
	);

	get badgeClasses() { return this.badgesList.entities }

	get badgeClassesByIssuerUrl(): { [issuerUrl: string]: BadgeClass[] } {
		return this.badgesByIssuerUrl.grouped;
	}

	get badgesByIssuerUrl$(): Observable<{ [issuerUrl: string]: BadgeClass[] }> {
		return this.badgesByIssuerUrl.loaded$;
	}

	get allBadges$(): Observable<BadgeClass[]> {
		return this.badgesList.loaded$.map(l => l.entities);
	}

	get loadedBadges$(): Observable<BadgeClass[]> {
		return this.badgesList.loaded$.map(l => l.entities);
	}

	constructor(
		protected loginService: SessionService,
		protected http: Http,
		protected configService: SystemConfigService,
		@Inject(forwardRef(() => CommonEntityManager))
		protected commonEntityManager: CommonEntityManager,
		public badgeClassApi: BadgeClassApiService,
		protected messageService: MessageService
	) {
		super(loginService, http, configService, messageService);
	}

	removeBadgeClass(badge: BadgeClass): Promise<Response> {
		return this.badgeClassApi.deleteBadgeClass(badge.issuerSlug, badge.slug)
			.then(response => {
				this.badgesList.remove(badge);
				return response;
			});
	}

	createBadgeClass(issuerSlug: string, newBadge: ApiBadgeClassForCreation): Promise<BadgeClass> {
		return this.badgeClassApi.createBadgeClass(issuerSlug, newBadge)
			.then(newBadge => this.badgesList.addOrUpdate(newBadge));
	}

	badgeByIssuerUrlAndSlug(issuer_id: IssuerUrl, badgeSlug: BadgeClassSlug): Promise<BadgeClass> {
		return this.allBadges$
			.first()
			.toPromise()
			.then(badges =>
				badges.find(b => b.issuerUrl == issuer_id && b.slug == badgeSlug)
				|| this.throwError(`Issuer ID '${issuer_id}' has no badge with slug '${badgeSlug}'`)
			);
	}

	badgeByIssuerSlugAndSlug(issuerSlug: IssuerSlug, badgeSlug: BadgeClassSlug): Promise<BadgeClass> {
		return this.allBadges$
			.first()
			.toPromise()
			.then(badges =>
				badges.find(b => b.issuerSlug == issuerSlug && b.slug == badgeSlug)
				|| this.throwError(`Issuer Slug '${issuerSlug}' has no badge with slug '${badgeSlug}'`)
			);
	}

	loadedBadgeByRef(badgeRef: BadgeClassRef | BadgeClassUrl): BadgeClass {
		const badgeUrl = EntityRef.urlForRef(badgeRef);

		return this.badgeClasses.find(b => b.badgeUrl == badgeUrl);
	}

	loadedBadgeByIssuerIdAndSlug(issuer_id: string, badgeSlug: string): BadgeClass {
		return this.badgeClasses.find(b => b.issuerUrl == issuer_id && b.slug == badgeSlug);
	}

	badgeByRef(badgeRef: AnyRefType): Promise<BadgeClass> {
		// TODO: How do we load a particular badge by ID... potentially one not local to this system?
		const badgeUrl = EntityRef.urlForRef(badgeRef);

		return this.allBadges$
			.map(badges =>
				badges.find(b => b.badgeUrl == badgeUrl)
				|| this.throwError(`No badge with URL ${badgeUrl}`)
			)
			.first()
			.toPromise();
	}

	badgesByUrls(badgeUrls: string[]): Promise<BadgeClass[]> {
		if (!badgeUrls || badgeUrls.length == 0) {
			return Promise.resolve([]);
		}

		return this.allBadges$
			.map(badges => badges.filter(b => badgeUrls.indexOf(b.badgeUrl) >= 0))
			.first()
			.toPromise();
	}

	private throwError(message: string): never {
		throw new Error(message);
	}
}