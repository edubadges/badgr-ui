
import { TestBed, inject } from "@angular/core/testing";
import { SessionService } from "../../common/services/session.service";
import { SystemConfigService } from "../../common/services/config.service";
import { BadgeClassManager } from "./badgeclass-manager.service";
import { MockBackend } from "@angular/http/testing";
import { BaseRequestOptions, Http, RequestMethod } from "@angular/http";
import { CommonEntityManager } from "../../entity-manager/common-entity-manager.service";
import { BadgeClassApiService } from "./badgeclass-api.service";
import { expectRequestAndRespondWith } from "../../common/util/mock-response-util";
import { verifyEntitySetWhenLoaded, verifyManagedEntitySet } from "../../common/model/managed-entity-set.spec";
import { apiBadgeClass1, apiBadgeClass2, apiBadgeClass3 } from "../models/badgeclass.model.spec";
import { BadgeClass } from "../models/badgeclass.model";
import { ApiBadgeClass } from "../models/badgeclass-api.model";
import { testIssuerRefForSlug } from "./issuer-manager.service.spec";
import { MessageService } from "../../common/services/message.service";

describe('badgeManager', () => {
	beforeEach(() => TestBed.configureTestingModule({
		declarations: [  ],
		providers: [
			SystemConfigService,
			MockBackend,
			BaseRequestOptions,
			MessageService,
			{ provide: 'config', useValue: { api: { baseUrl: '' }, features: {} } },
			{
				provide: Http,
				useFactory: (backend, options) => new Http(backend, options),
				deps: [ MockBackend, BaseRequestOptions ]
			},

			SessionService,
			CommonEntityManager,
			BadgeClassApiService,
			BadgeClassManager,
		],
		imports: [ ]
	}));

	beforeEach(inject([ SessionService ], (loginService: SessionService) => {
		loginService.storeToken({ token: "MOCKTOKEN" });
	}));

	it('should retrieve all badge classes',
		inject([ BadgeClassManager, SessionService, MockBackend ],
			(badgeManager: BadgeClassManager, loginService: SessionService, mockBackend: MockBackend) => {
				return Promise.all([
					expectAllBadgesRequest(mockBackend),
					verifyEntitySetWhenLoaded(badgeManager.badgesList, allApiBadgesClasses)
				]);
			}
		));

	it('should retrieve badges on subscription of allBadges$',
		inject([ BadgeClassManager, SessionService, MockBackend ],
			(badgeManager: BadgeClassManager, loginService: SessionService, mockBackend: MockBackend) => {
				return Promise.all([
					expectAllBadgesRequest(mockBackend),
					badgeManager.allBadges$.first().toPromise().then(
						() => verifyManagedEntitySet(badgeManager.badgesList, allApiBadgesClasses)
					)
				]);
			})
	);

	it('should retrieve badges on subscription of badgesByIssuerUrl$',
		inject([ BadgeClassManager, SessionService, MockBackend ],
			(badgeManager: BadgeClassManager, loginService: SessionService, mockBackend: MockBackend) => {
				return Promise.all([
					expectAllBadgesRequest(mockBackend),
					badgeManager.badgesByIssuerUrl$.first().toPromise().then(
						() => verifyManagedEntitySet(badgeManager.badgesList, allApiBadgesClasses)
					)
				]);
			})
	);

	it('should remove a badge class',
		inject([ BadgeClassManager, SessionService, MockBackend ],
			(badgeManager: BadgeClassManager, loginService: SessionService, mockBackend: MockBackend) => {
				let badgeToKeep = apiBadgeClass1;
				let badgeToRemove = apiBadgeClass2;

				return Promise.all([
					expectAllBadgesRequest(mockBackend, [ badgeToRemove, badgeToKeep ]),
					expectRequestAndRespondWith(
						mockBackend,
						RequestMethod.Delete,
						`/v1/issuer/issuers/${BadgeClass.issuerSlugForApiBadge(badgeToRemove)}/badges/${badgeToRemove.slug}`,
						`Badge ${badgeToRemove.slug} has been deleted.`
					),
					verifyEntitySetWhenLoaded(badgeManager.badgesList, [ badgeToRemove, badgeToKeep ])
						.then(badgeList => badgeManager.removeBadgeClass(badgeList.entityForApiEntity(badgeToRemove)))
						.then(() => verifyManagedEntitySet(badgeManager.badgesList, [ badgeToKeep ]))
				]);
			})
	);

	it('should add a new badge class',
		inject([ BadgeClassManager, SessionService, MockBackend ],
			(badgeManager: BadgeClassManager, loginService: SessionService, mockBackend: MockBackend) => {
				let existingBadge = apiBadgeClass1;
				let newBadge = apiBadgeClass2;

				return Promise.all([
					expectAllBadgesRequest(mockBackend, [ existingBadge ]),
					expectRequestAndRespondWith(
						mockBackend,
						RequestMethod.Post,
						`/v1/issuer/issuers/${BadgeClass.issuerSlugForApiBadge(newBadge)}/badges`,
						newBadge,
						201
					),
					verifyEntitySetWhenLoaded(badgeManager.badgesList, [ existingBadge ])
						.then(badgeList => badgeManager.createBadgeClass(
							BadgeClass.issuerSlugForApiBadge(newBadge),
							newBadge
						))
						.then(() => verifyManagedEntitySet(badgeManager.badgesList, [ newBadge, existingBadge ]))
				]);
			})
	);
});

let allApiBadgesClasses = [ apiBadgeClass1, apiBadgeClass2, apiBadgeClass3 ];

function expectAllBadgesRequest(
	mockBackend: MockBackend,
	badgeClasses: ApiBadgeClass[] = allApiBadgesClasses
) {
	return expectRequestAndRespondWith(
		mockBackend,
		RequestMethod.Get,
		'/v1/issuer/all-badges',
		badgeClasses
	);
}

export function testBadgeClassRefForSlugs(issuerSlug: string, badgeClassSlug: string) {
	return {
		"@id": `http://localhost:8000/public/badges/${badgeClassSlug}`,
		"slug": badgeClassSlug,
		"issuer": testIssuerRefForSlug(issuerSlug)
	};
}
