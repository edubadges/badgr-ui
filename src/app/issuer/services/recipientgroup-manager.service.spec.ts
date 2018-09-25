import { TestBed, inject } from "@angular/core/testing";
import { CommonEntityManager } from "../../entity-manager/common-entity-manager.service";
import { MessageService } from "../../common/services/message.service";
import { MockBackend } from "@angular/http/testing";
import { BaseRequestOptions, Http, RequestMethod } from "@angular/http";
import { SystemConfigService } from "../../common/services/config.service";

import { expectRequestAndRespondWith, setupMockResponseReporting } from "../../common/util/mock-response-util";
import { verifyManagedEntitySet, verifyEntitySetWhenLoaded } from "../../common/model/managed-entity-set.spec";
import { RecipientGroupManager } from "./recipientgroup-manager.service";
import {
	ApiRecipientGroup, ApiIssuerRecipientGroupList, ApiRecipientGroupMember
} from "../models/recipientgroup-api.model";
import {
	randomNames,
	descriptionFromName,
	testSlugForName,
	randomSlugs,
	randomPathwayName,
	randomPersonName,
	randomIssuerName,
	randomRecipientGroupName
} from "../../common/util/test/test-data-util";
import { testIssuerRefForSlug } from "./issuer-manager.service.spec";
import { testPathwayRefForSlugs, generateTestPathways, expectPathwaysRequests } from "./pathway-manager.service.spec";
import { RecipientGroup, RecipientGroupMember } from "../models/recipientgroup.model";
import { RecipientGroupApiService } from "./recipientgroup-api.service";
import { verifyLinkedEntitySet } from "../../common/model/linked-entity-set.spec";
import { PathwayApiService } from "./pathway-api.service";
import { PathwayManager } from "./pathway-manager.service";
import { SessionService } from "../../common/services/session.service";

describe('RecipientGroupManager', () => {
	const defaultIssuerSlug = testSlugForName(randomIssuerName());

	it(
		'should load groups summaries for an issuer',
		inject([ RecipientGroupManager, MockBackend ], (groupManager: RecipientGroupManager, mockBackend: MockBackend) => {
			const apiGroups = [
				generateTestGroupSummary({ issuerSlug: defaultIssuerSlug }),
				generateTestGroupSummary({ issuerSlug: defaultIssuerSlug }),
				generateTestGroupSummary({ issuerSlug: defaultIssuerSlug }),
			];

			return Promise.all([
				expectGroupListRequest(mockBackend, apiGroups, false),
				groupManager.loadRecipientGroupsForIssuer(defaultIssuerSlug)
					.then(list => {
						verifyManagedEntitySet(list, apiGroups, verifyRecipientGroupSummary)
					})
			]);
		})
	);

	it(
		'should load all group details for an issuer once the summaries are loaded',
		inject([ RecipientGroupManager, MockBackend ], (groupManager: RecipientGroupManager, mockBackend: MockBackend) => {

			const apiGroupDetails = [
				generateTestGroupDetail({ issuerSlug: defaultIssuerSlug }),
				generateTestGroupDetail({ issuerSlug: defaultIssuerSlug }),
				generateTestGroupDetail({ issuerSlug: defaultIssuerSlug }),
			];

			const apiGroupSummaries = apiGroupDetails.map(
				detail => {
					let summary = Object.assign({}, detail);
					delete summary.members;
					return summary;
				}
			);

			return Promise.all([
				expectGroupListRequest(mockBackend, apiGroupSummaries, false),
				expectGroupListRequest(mockBackend, apiGroupDetails, true),
				groupManager.loadRecipientGroupsForIssuer(defaultIssuerSlug)
					.then(list => list.allDetailsLoadedPromise)
					.then(list => {
						verifyManagedEntitySet(list, apiGroupDetails, verifyRecipientGroupWithDetail)
					})
			]);
		})
	);

	it(
		'should load detail for a single group when requested',
		inject([ RecipientGroupManager, MockBackend ], (groupManager: RecipientGroupManager, mockBackend: MockBackend) => {
			const apiGroups = [
				generateTestGroupDetail({ issuerSlug: defaultIssuerSlug }),
				generateTestGroupDetail({ issuerSlug: defaultIssuerSlug })
			];

			return Promise.all([
				expectGroupListRequest(mockBackend, apiGroups, false),
				groupManager.loadRecipientGroupsForIssuer(defaultIssuerSlug)
					.then(list => {
						const group = list.entityForApiEntity(apiGroups[0]);

						expect(group.isDetailLoaded).toEqual(false);
						expect(group.members.loaded).toEqual(false);

						return Promise.all([
							expectGroupDetailRequest(mockBackend, apiGroups[0]),
							group.detailLoadedPromise.then(
								() => {
									expect(group.isDetailLoaded).toEqual(true);
									expect(group.members.loaded).toEqual(true);

									verifyRecipientGroupWithDetail(group, apiGroups[0]);
								}
							)
						]);
					})
			]);
		})
	);

	it(
		'should handle creating a new group',
		inject([ RecipientGroupManager, MockBackend ], (groupManager: RecipientGroupManager, mockBackend: MockBackend) => {
			const apiGroups = [
				generateTestGroupDetail({ issuerSlug: defaultIssuerSlug }),
				generateTestGroupDetail({ issuerSlug: defaultIssuerSlug })
			];

			return Promise.all([
				expectGroupListRequest(mockBackend, apiGroups, false),
				groupManager.loadRecipientGroupsForIssuer(defaultIssuerSlug)
					.then(list => {
						const newApiGroup = generateTestGroupDetail({ issuerSlug: defaultIssuerSlug });

						return Promise.all([
							expectRequestAndRespondWith(
								mockBackend,
								RequestMethod.Post,
								`/v2/issuers/${defaultIssuerSlug}/recipient-groups`,
								newApiGroup
							),
							groupManager.createRecipientGroup(
								defaultIssuerSlug,
								{
									name: newApiGroup.name,
									description: newApiGroup.description,
									pathways: newApiGroup.pathways,
									members: newApiGroup.members
								}
							).then(group => {
								verifyRecipientGroupSummary(group, newApiGroup);
							})
						])
					})
			]);
		})
	);

	it(
		'should handle deleting a group',
		inject([ RecipientGroupManager, MockBackend ], (groupManager: RecipientGroupManager, mockBackend: MockBackend) => {
			const apiGroups = [
				generateTestGroupSummary({ issuerSlug: defaultIssuerSlug }),
				generateTestGroupSummary({ issuerSlug: defaultIssuerSlug })
			];

			return Promise.all([
				expectGroupListRequest(mockBackend, apiGroups, false),
				groupManager.loadRecipientGroupsForIssuer(defaultIssuerSlug)
					.then(list => {
						const groupToDelete = list.entityForApiEntity(apiGroups[0]);

						return Promise.all([
							expectRequestAndRespondWith(
								mockBackend,
								RequestMethod.Delete,
								`/v2/issuers/${defaultIssuerSlug}/recipient-groups/${groupToDelete.slug}`,
								"success"
							),
							groupToDelete.deleteRecipientGroup().then(
								() => verifyManagedEntitySet(list, [ apiGroups[1] ], verifyRecipientGroupSummary)
							)
						])
					})
			]);
		})
	);

	it(
		'should handle saving changes to a group',
		inject([ RecipientGroupManager, MockBackend ], (groupManager: RecipientGroupManager, mockBackend: MockBackend) => {
			const apiGroups = [
				generateTestGroupDetail({ issuerSlug: defaultIssuerSlug }),
				generateTestGroupDetail({ issuerSlug: defaultIssuerSlug })
			];

			return Promise.all([
				expectGroupListRequest(mockBackend, apiGroups, false),
				groupManager.loadRecipientGroupsForIssuer(defaultIssuerSlug)
					.then(list => {
						const groupToEdit = list.entityForApiEntity(apiGroups[0]);
						const editedApiGroup = Object.assign({}, apiGroups[0], {name: "Updated from server"});

						return Promise.all([
							expectRequestAndRespondWith(
								mockBackend,
								RequestMethod.Put,
								`/v2/issuers/${defaultIssuerSlug}/recipient-groups/${groupToEdit.slug}?embedRecipients=true`,
								editedApiGroup
							),
							groupToEdit.save().then(
								() => {
									verifyRecipientGroupWithDetail(groupToEdit, editedApiGroup);
								}
							)
						])
					})
			]);
		})
	);

	it(
		'should dynamically load related pathway summaries',
		inject([ RecipientGroupManager, MockBackend ], (groupManager: RecipientGroupManager, mockBackend: MockBackend) => {
			const { issuer1Summary1, issuer1Summary2 } = generateTestPathways();

			const issuerSlug = issuer1Summary1.issuer.slug;

			const apiGroups = [
				generateTestGroupDetail({ issuerSlug, pathwaySlugs: [ issuer1Summary1.slug ]})
			];

			return Promise.all([
				expectGroupListRequest(mockBackend, apiGroups, false),
				groupManager.loadRecipientGroupsForIssuer(issuerSlug)
					.then(list => {
						const group = list.entityForApiEntity(apiGroups[0]);

						return Promise.all([
							expectPathwaysRequests(mockBackend, [ issuer1Summary1, issuer1Summary2 ]),
							group.subscribedPathways.loadedPromise.then(
								() => {
									verifyLinkedEntitySet(group.subscribedPathways, [ issuer1Summary1["@id"] ])
								}
							)
						]);
					})
			]);
		})
	);

	////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
	// Setup
	beforeEach(() => TestBed.configureTestingModule({
		declarations: [  ],
		providers: [
			SystemConfigService,
			MockBackend,
			BaseRequestOptions,
			{ provide: 'config', useValue: { api: { baseUrl: '' }, features: {} } },
			{
				provide: Http,
				useFactory: (backend, options) => new Http(backend, options),
				deps: [ MockBackend, BaseRequestOptions ]
			},

			SessionService,
			CommonEntityManager,
			RecipientGroupApiService,
			MessageService,
			RecipientGroupManager,
			PathwayManager,
			PathwayApiService
		],
		imports: [ ]
	}));

	setupMockResponseReporting();

	beforeEach(inject([ SessionService ], (loginService: SessionService) => {
		loginService.storeToken({ access_token: "MOCKTOKEN" });
	}));
});

export function verifyRecipientGroupSummary(
	group: RecipientGroup,
	apiGroup: ApiRecipientGroup = group.apiModel
) {
	expect(group.url).toEqual(apiGroup[ "@id" ]);
	expect(group.slug).toEqual(apiGroup.slug);

	expect(group.type).toEqual(apiGroup[ "@type" ]);

	expect(group.name).toEqual(apiGroup.name);
	expect(group.description).toEqual(apiGroup.description);

	expect(group.memberCount).toEqual(apiGroup.member_count);
}

export function verifyRecipientGroupWithDetail(
	group: RecipientGroup,
	apiGroup: ApiRecipientGroup = group.apiModel
) {
	expect(apiGroup.members).toBeDefined();
	expect(group.isDetailLoaded).toBeTruthy();

	verifyRecipientGroupSummary(group, apiGroup);

	expect(group.memberCount).toEqual(apiGroup.members.length);
	verifyManagedEntitySet(group.members, apiGroup.members, verifyGroupMember);
}

export function verifyGroupMember(
	member: RecipientGroupMember,
	apiMember: ApiRecipientGroupMember
) {
	expect(member.slug).toEqual(apiMember.slug);
	expect(member.memberName).toEqual(apiMember.name);
	expect(member.memberEmail).toEqual(apiMember.email);
}

export function expectGroupListRequest(
	mockBackend: MockBackend,
	groups: ApiRecipientGroup[],
	withDetail: boolean
) {
	const issuerSlug = groups[0].issuer.slug;

	if (! withDetail) {
		groups = groups.map(stripGroupDetail);
	}

	return expectRequestAndRespondWith(
		mockBackend,
		RequestMethod.Get,
		`/v2/issuers/${issuerSlug}/recipient-groups${withDetail?'?embedRecipients=true':''}`,
		{
			recipientGroups: groups,
			issuer: {
				slug: issuerSlug,
				"@id": `https://api.review.badgr.io/v1/issuers/${issuerSlug}`
			}
		} as ApiIssuerRecipientGroupList
	);
}

export function stripGroupDetail(detail: ApiRecipientGroup) {
	if (detail.members) {
		detail = Object.assign({}, detail);
		delete detail.members;
	}

	return detail;
}

export function expectGroupDetailRequest(
	mockBackend: MockBackend,
	group: ApiRecipientGroup
) {
	const issuerSlug = group.issuer.slug;

	return expectRequestAndRespondWith(
		mockBackend,
		RequestMethod.Get,
		`/v2/issuers/${issuerSlug}/recipient-groups/${group.slug}?embedRecipients=true`,
		group
	);
}

let generatedGroupCounter = 0;

export function testGroupRefForSlugs(issuerSlug: string, groupSlug: string) {
	return {
		"@id": `http://localhost:8000/v2/issuers/${issuerSlug}/recipient-groups/${groupSlug}`,
		"slug": groupSlug,
		"issuer": testIssuerRefForSlug(issuerSlug)
	};
}

export function generateTestGroupSummary({
	name = randomRecipientGroupName(),
	active = true,
	issuerSlug = testSlugForName(randomIssuerName()),
	pathwaySlugs = randomSlugs(5, randomPathwayName),
	memberCount = 5
}): ApiRecipientGroup {
	return {
		"@type": "RecipientGroup",
		"@id": testGroupRefForSlugs(issuerSlug, testSlugForName(name))["@id"],
		"name": name,
		"description": descriptionFromName(name),
		"slug": testSlugForName(name),
		"active": active,
		"issuer": testIssuerRefForSlug(issuerSlug),
		"member_count": memberCount,
		"pathways": pathwaySlugs.map(s => testPathwayRefForSlugs(issuerSlug, s))
	};
}


export function generateTestGroupDetail({
	name = randomRecipientGroupName(),
	active = true,
	issuerSlug = testSlugForName(randomIssuerName()),
	pathwaySlugs = randomSlugs(5, randomPathwayName),
	memberNames = randomNames(10, randomPersonName)
}): ApiRecipientGroup {
	return Object.assign(
		generateTestGroupSummary({
			name,
			active,
			issuerSlug,
			pathwaySlugs,
			memberCount: memberNames.length
		}),
		{
			"members": memberNames.map(memberName => ({
				"@type": "RecipientGroupMembership",
				"@id": `mailto:${testSlugForName(memberName)}@test-data.com`,
				"name": memberName,
				"slug": testSlugForName(memberName),
				"email": `mailto:${testSlugForName(memberName)}@test-data.com`
			}))
		}
	);
}
