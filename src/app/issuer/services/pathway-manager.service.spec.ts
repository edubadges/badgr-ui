import { TestBed, inject } from "@angular/core/testing";
import {
	ApiPathwaySummary,
	ApiIssuerPathwayList,
	ApiPathwayDetail,
	ApiPathwayElement,
	ApiElementBadgeJunctionRequirement,
	ApiElementRequirementDisjunctionConfig, ApiElementJunctionRequirement, ApiElementElementJunctionRequirement
} from "../models/pathway-api.model";
import {
	LearningPathway,
	IssuerPathways,
	LearningPathwayStructure,
	LearningPathwayElement
} from "../models/pathway.model";
import { PathwayManager } from "./pathway-manager.service";
import { PathwayApiService } from "./pathway-api.service";
import { MessageService } from "../../common/services/message.service";
import { MockBackend } from "@angular/http/testing";
import { BaseRequestOptions, Http, RequestMethod } from "@angular/http";
import { SystemConfigService } from "../../common/services/config.service";
import {
	expectRequestAndRespondWith,
	setupMockResponseReporting,
	expectRequest
} from "../../common/util/mock-response-util";
import { verifyManagedEntitySet } from "../../common/model/managed-entity-set.spec";
import { groupIntoArray } from "../../common/util/array-reducers";
import { testIssuerRefForSlug } from "./issuer-manager.service.spec";
import {
	expectGroupListRequest, generateTestGroupSummary,
	testGroupRefForSlugs
} from "./recipientgroup-manager.service.spec";
import { verifyLinkedEntitySet } from "../../common/model/linked-entity-set.spec";
import { RecipientGroupManager } from "./recipientgroup-manager.service";
import { RecipientGroupApiService } from "./recipientgroup-api.service";
import { CommonEntityManager } from "../../entity-manager/common-entity-manager.service";
import { SessionService } from "../../common/services/session.service";

describe('PathwayManager', () => {
	it(
		'should be constructable',
		inject([ PathwayManager, MockBackend ], (pathwayManager: PathwayManager, mockBackend: MockBackend) => {
			const { issuer1Summary1 } = generateTestPathways();

			const apiSummary = issuer1Summary1;
			const issuerSlug = issuerSlugFor(apiSummary);

			return Promise.all([
				expectPathwaysRequests(mockBackend, [ apiSummary ]),
				pathwayManager.loadPathwaysForIssuer(issuerSlug)
					.then(list => {
						verifyManagedEntitySet(list, [ apiSummary ], verifyPathwaySummary)
					})
			]);
		})
	);

	it(
		'should load subscribed groups on demand',
		inject([ PathwayManager, MockBackend ], (pathwayManager: PathwayManager, mockBackend: MockBackend) => {

			const { issuer1Summary1 } = generateTestPathways();
			const apiSummary = issuer1Summary1;
			const issuerSlug = issuerSlugFor(apiSummary);

			const apiGroups = [
				generateTestGroupSummary({ issuerSlug, pathwaySlugs: [ issuer1Summary1.slug ]}),
				generateTestGroupSummary({ issuerSlug, pathwaySlugs: [ issuer1Summary1.slug ]}),
				generateTestGroupSummary({ issuerSlug, pathwaySlugs: [ issuer1Summary1.slug ]}),
			];

			issuer1Summary1.groups = [
				testGroupRefForSlugs(issuerSlug, apiGroups[0].slug),
				testGroupRefForSlugs(issuerSlug, apiGroups[1].slug)
			];

			return Promise.all([
				expectPathwaysRequests(mockBackend, [ apiSummary ]),
				pathwayManager.loadPathwaysForIssuer(issuerSlug)
					.then(list => {
						let pathway = list.entityForApiEntity(issuer1Summary1);

						return Promise.all([
							expectGroupListRequest(mockBackend, apiGroups, false),
						  pathway.subscribedGroups.loadedPromise.then(
							  () => verifyLinkedEntitySet(pathway.subscribedGroups, [ apiGroups[0]["@id"], apiGroups[1]["@id"] ])
						  )
						]);
					})
			]);
		})
	);

	it(
		'should create a pathway',
		inject([ PathwayManager, MockBackend ], (pathwayManager: PathwayManager, mockBackend: MockBackend) => {
			const { issuer1Summary1, issuer1Summary2 } = generateTestPathways();

			const existingSummary = issuer1Summary1;
			const issuerSlug = issuerSlugFor(existingSummary);

			const newSummary = issuer1Summary2;

			return Promise.all([
				expectPathwaysRequests(mockBackend, [ existingSummary ]),
				expectRequestAndRespondWith(
					mockBackend,
					RequestMethod.Post,
					`/v2/issuers/${issuerSlug}/pathways`,
					newSummary
				),
				pathwayManager.loadPathwaysForIssuer(issuerSlug)
					.then(list => verifyManagedEntitySet(list, [ existingSummary ], verifyPathwaySummary))
					.then(list => list.createPathway(newSummary).then(() => list))
					.then(list => verifyManagedEntitySet(list, [ existingSummary, newSummary ], verifyPathwaySummary))
			]);
		})
	);
	it(
		'should load a pathway structure',
		inject([ PathwayManager, MockBackend ], (pathwayManager: PathwayManager, mockBackend: MockBackend) => {
			const { issuer1Summary1, issuer1Detail1 } = generateTestPathways();

			const apiSummary = issuer1Summary1;
			const apiDetail = issuer1Detail1;

			const issuerSlug = issuerSlugFor(apiSummary);

			return Promise.all([
				expectPathwaysRequests(mockBackend, [ apiSummary ]),
				expectDetailRequest(mockBackend, apiDetail),
				pathwayManager.loadPathwaysForIssuer(issuerSlug)
					.then((pathways: IssuerPathways) => verifyManagedEntitySet(pathways,
						[ apiSummary ],
						verifyPathwaySummary))
					.then((pathways: IssuerPathways) => pathways.entities[ 0 ].structure.loadedPromise)
					.then((structure: LearningPathwayStructure) => verifyPathwayStructure(structure, apiDetail))
			]);
		})
	);
	it(
		'should delete a pathway structure',
		inject([ PathwayManager, MockBackend ], (pathwayManager: PathwayManager, mockBackend: MockBackend) => {
			const { issuer1Summary1, issuer1Summary2 } = generateTestPathways();

			const issuerSlug = issuerSlugFor(issuer1Summary1);

			return Promise.all([
				expectPathwaysRequests(mockBackend, [ issuer1Summary1, issuer1Summary2 ]),
				expectRequestAndRespondWith(
					mockBackend,
					RequestMethod.Delete,
					`/v2/issuers/${issuerSlug}/pathways/${issuer1Summary1.slug}`,
					null
				),
				pathwayManager.loadPathwaysForIssuer(issuerSlug)
					.then(pathways => verifyManagedEntitySet(pathways, [ issuer1Summary1, issuer1Summary2 ], verifyPathwaySummary))
					.then(pathways => pathways.entities[ 0 ].deletePathway().then(() => pathways))
					.then(pathways => verifyManagedEntitySet(pathways, [ issuer1Summary2 ], verifyPathwaySummary))
			]);
		})
	);

	it(
		'should add a new pathway element',
		inject([ PathwayManager, MockBackend ], (pathwayManager: PathwayManager, mockBackend: MockBackend) => {
			const { issuer1Summary1, issuer1Detail1, issuer1Detail1Element1, issuer1Detail1Element2 } = generateTestPathways();

			const apiSummary = issuer1Summary1;

			const issuerSlug = issuerSlugFor(apiSummary);

			const initialTree = buildApiTree(issuer1Detail1, issuer1Detail1Element1);
			const postAddTree = buildApiTree(
				issuer1Detail1, {
					node: issuer1Detail1Element1,
					children: [ issuer1Detail1Element2 ]
				});
			const rootElement = postAddTree.elements[ 0 ];
			const newChildElement = postAddTree.elements[ 1 ];

			return setupSingleStructure(pathwayManager, mockBackend, initialTree)
				.then((structure: LearningPathwayStructure) =>
					Promise.all([
						expectRequestAndRespondWith(
							mockBackend,
							RequestMethod.Post,
							`/v2/issuers/${issuerSlug}/pathways/${apiSummary.slug}/elements`,
							newChildElement
						),
						expectRequestAndRespondWith(
							mockBackend,
							RequestMethod.Put,
							`/v2/issuers/${issuerSlug}/pathways/${apiSummary.slug}/elements/${rootElement.slug}`,
							rootElement
						),
						expectPathwaysRequests(mockBackend, [ initialTree ]), // Expect another pathway request because we modified the root
						structure.rootElement.addChild(newChildElement)
					]).then(() => structure)
				)
				.then((structure: LearningPathwayStructure) => verifyPathwayStructure(structure, postAddTree))
		})
	);
	it(
		'should delete pathway elements',
		inject([ PathwayManager, MockBackend ], (pathwayManager: PathwayManager, mockBackend: MockBackend) => {
			const { issuer1Summary1, issuer1Detail1, issuer1Detail1Element1, issuer1Detail1Element2 } = generateTestPathways();

			const apiSummary = issuer1Summary1;

			const issuerSlug = issuerSlugFor(apiSummary);

			const postDeleteTree = buildApiTree(issuer1Detail1, issuer1Detail1Element1);
			const initialTree = buildApiTree(
				issuer1Detail1, {
					node: issuer1Detail1Element1,
					children: [ issuer1Detail1Element2 ]
				});
			const rootElement = initialTree.elements[ 0 ];
			const removedChildElement = initialTree.elements[ 1 ];

			return setupSingleStructure(pathwayManager, mockBackend, initialTree)
				.then((structure: LearningPathwayStructure) =>
					Promise.all([
						expectRequestAndRespondWith(
							mockBackend,
							RequestMethod.Delete,
							`/v2/issuers/${issuerSlug}/pathways/${apiSummary.slug}/elements/${removedChildElement.slug}`,
							"Element removed"
						),
						expectElementRequest(mockBackend, initialTree, postDeleteTree.elements[ 0 ]),
						structure.entityForApiEntity(removedChildElement).deleteElement()
					]).then(() => structure)
				)
				.then((structure: LearningPathwayStructure) => verifyPathwayStructure(structure, postDeleteTree))
		})
	);

	it(
		'should move pathway elements',
		inject([ PathwayManager, MockBackend ], (pathwayManager: PathwayManager, mockBackend: MockBackend) => {
			const { issuer1Summary1, issuer1Detail1, issuer1Detail1Element1, issuer1Detail1Element2, issuer1Detail1Element3,
				issuer1Detail1Element4, issuer1Detail1Element5 } = generateTestPathways();

			const apiSummary = issuer1Summary1;

			const issuerSlug = issuerSlugFor(apiSummary);

			const initialTree = buildApiTree(
				issuer1Detail1, {
					node: issuer1Detail1Element1,
					children: [
						{
							node: issuer1Detail1Element2,
							children: [
								issuer1Detail1Element3,
								issuer1Detail1Element4
							]
						},
						issuer1Detail1Element5
					]
				});

			const [initialRoot, initialChild1, initialGrandchild1, initialGrandchild2, initialChild2] = initialTree.elements;

			const postMoveTree = buildApiTree(
				issuer1Detail1, {
					node: issuer1Detail1Element1,
					children: [
						{
							node: issuer1Detail1Element2,
							children: [
								issuer1Detail1Element3,
								issuer1Detail1Element5,
								issuer1Detail1Element4,
							]
						}
					]
				});
			const [movedRoot, movedChild1, movedGrandchild1, movedGrandchild2, movedGrandchild3] = postMoveTree.elements;
			movedRoot.requirements = {
				"@type": 'ElementJunction', junctionConfig: Object(
					{
						"@type": 'Conjunction'
					}
				),
				elements: []
			} as ApiElementJunctionRequirement;

			return setupSingleStructure(pathwayManager, mockBackend, initialTree)
				.then((structure: LearningPathwayStructure) =>
					Promise.all([
						expectRequestAndRespondWith(
							mockBackend,
							RequestMethod.Put,
							`/v2/issuers/${issuerSlug}/pathways/${apiSummary.slug}/elements/${initialChild1.slug}`,
							movedChild1
						),
						structure.entityForApiEntity(initialChild2)
							.moveAfterSibling(
								structure.entityForApiEntity(initialChild1),
								structure.entityForApiEntity(initialGrandchild1)
							)
					]).then(() => structure)
				)
				.then((structure: LearningPathwayStructure) => verifyPathwayStructure(structure, postMoveTree))
		})
	);

	it(
		'should update requirements when elements are moved',
		inject([ PathwayManager, MockBackend ], (pathwayManager: PathwayManager, mockBackend: MockBackend) => {
			const { issuer1Summary1, issuer1Detail1, issuer1Detail1Element1, issuer1Detail1Element2, issuer1Detail1Element3,
				issuer1Detail1Element4, issuer1Detail1Element5 } = generateTestPathways();

			const apiSummary = issuer1Summary1;

			const issuerSlug = issuerSlugFor(apiSummary);

			const initialTree = buildApiTree(
				issuer1Detail1, {
					node: issuer1Detail1Element1,
					children: [
						{
							node: issuer1Detail1Element2,
							children: [
								issuer1Detail1Element3,
								issuer1Detail1Element4
							]
						},
						issuer1Detail1Element5
					]
				});

			const [initialRoot, initialChild1, initialGrandchild1, initialGrandchild2, initialChild2] = initialTree.elements;

			const postMoveTree = buildApiTree(
				issuer1Detail1, {
					node: issuer1Detail1Element1,
					children: [
						{
							node: issuer1Detail1Element2,
							children: [
								issuer1Detail1Element3,
								issuer1Detail1Element5,
								issuer1Detail1Element4,
							]
						}
					]
				});
			const [movedRoot, movedChild1, movedGrandchild1, movedGrandchild2, movedGrandchild3] = postMoveTree.elements;

			return setupSingleStructure(pathwayManager, mockBackend, initialTree)
				.then((structure: LearningPathwayStructure) => {
					structure.entityForApiEntity(initialRoot).requirements.requiredElementIds = [
						structure.entityForApiEntity(initialChild2).id
					];

					return Promise.all<any>([
						expectRequest(
							mockBackend,
							RequestMethod.Put,
							`/v2/issuers/${issuerSlug}/pathways/${apiSummary.slug}/elements/${initialChild1.slug}`
						).then(conn => {
							const request = conn.requestJson<ApiPathwayElement>();
							expect((request.requirements as ApiElementElementJunctionRequirement).elements)
								.toContain(structure.entityForApiEntity(initialChild2).id);
							conn.respondWithJson(request);
						}),
						structure.entityForApiEntity(initialChild2)
							.moveAfterSibling(
								structure.entityForApiEntity(initialChild1),
								structure.entityForApiEntity(initialGrandchild1)
							),
					]).then(() => structure)
				})
		})
	);

	it(
		'should edit pathway element properties',
		inject([ PathwayManager, MockBackend ], (pathwayManager: PathwayManager, mockBackend: MockBackend) => {
			const { issuer1Summary1, issuer1Detail1, issuer1Detail1Element1, issuer1Detail1Element2 } = generateTestPathways();

			const apiSummary = issuer1Summary1;

			const issuerSlug = issuerSlugFor(apiSummary);
			const preUpdateDetail = buildApiTree(issuer1Detail1, {
				node: issuer1Detail1Element1,
				children: [ issuer1Detail1Element2 ]
			});
			const [root, preUpdateChild] = preUpdateDetail.elements;

			const postUpdateChild = Object.assign({}, preUpdateChild, { name: "updated" });
			const postUpdateDetail = buildApiTree(issuer1Detail1, {
				node: root,
				children: [ postUpdateChild ]
			});

			let child: LearningPathwayElement;

			return setupSingleStructure(pathwayManager, mockBackend, preUpdateDetail)
				.then((structure: LearningPathwayStructure) => {
					child = structure.entityForApiEntity(preUpdateChild);
					child.name = "changed";

					return Promise.all([
						expectRequestAndRespondWith(
							mockBackend,
							RequestMethod.Put,
							`/v2/issuers/${issuerSlug}/pathways/${apiSummary.slug}/elements/${preUpdateChild.slug}`,
							postUpdateChild
						),
						child.save()

					]).then(() => structure)
				})
				.then((structure: LearningPathwayStructure) => {
					expect(child.name).toEqual("updated");
					verifyPathwayStructure(structure, postUpdateDetail)
				})
		})
	);
	it(
		'should reload the pathway list when the root is edited',
		inject([ PathwayManager, MockBackend ], (pathwayManager: PathwayManager, mockBackend: MockBackend) => {
			const { issuer1Summary1, issuer1Detail1, issuer1Detail1Element1, issuer1Detail1Element2 } = generateTestPathways();

			const apiSummary = issuer1Summary1;

			const issuerSlug = issuerSlugFor(apiSummary);
			const preUpdateDetail = buildApiTree(issuer1Detail1, {
				node: issuer1Detail1Element1,
				children: [ issuer1Detail1Element2 ]
			});
			const [root, preUpdateChild] = preUpdateDetail.elements;

			const postUpdateChild = Object.assign({}, preUpdateChild, { name: "updated" });
			const postUpdateDetail = buildApiTree(issuer1Detail1, {
				node: root,
				children: [ postUpdateChild ]
			});

			let child: LearningPathwayElement;

			return setupSingleStructure(pathwayManager, mockBackend, preUpdateDetail)
				.then((structure: LearningPathwayStructure) => {
					child = structure.entityForApiEntity(preUpdateChild);
					child.name = "changed";

					return Promise.all<any>([
						expectRequest(
							mockBackend,
							RequestMethod.Put,
							`/v2/issuers/${issuerSlug}/pathways/${apiSummary.slug}/elements/${preUpdateChild.slug}`
						).then(
							conn => {
								const incoming = conn.requestJson<ApiPathwayElement>();

								expect(incoming.name).toEqual("changed");

								conn.respondWithJson(postUpdateChild);
							}
						),
						child.save()

					]).then(() => structure)
				})
				.then((structure: LearningPathwayStructure) => {
					expect(child.name).toEqual("updated");
					verifyPathwayStructure(structure, postUpdateDetail)
				})
		})
	);
	it(
		'should correctly setup badge requirements',
		inject([ PathwayManager, MockBackend ], (pathwayManager: PathwayManager, mockBackend: MockBackend) => {
			const { issuer1Summary1, issuer1Detail1, issuer1Detail1Element1, issuer1Detail1Element2 } = generateTestPathways();

			const apiSummary = issuer1Summary1;

			const issuerSlug = issuerSlugFor(apiSummary);
			const apiDetail = buildApiTree(issuer1Detail1, {
				node: issuer1Detail1Element1,
				children: [ issuer1Detail1Element2 ]
			});
			const [apiRoot, apiChild] = apiDetail.elements;

			return setupSingleStructure(pathwayManager, mockBackend, apiDetail)
				.then((structure: LearningPathwayStructure) => {
					const root = structure.entityForApiEntity(apiRoot);
					root.requirements.requiredBadgeIds = [ "badge-id-1", "badge-id-2" ];

					// Since we're updating the root, the list will be updated as well
					expectPathwaysRequests(mockBackend, [ apiDetail ]);

					expectRequest(
						mockBackend,
						RequestMethod.Put,
						`/v2/issuers/${issuerSlug}/pathways/${apiSummary.slug}/elements/${root.slug}`
					).then(connection => {
						const request = connection.requestJson<ApiPathwayElement>();
						expect<any>(request.requirements).toEqual({
							"@type": "BadgeJunction",
							junctionConfig: {
								"@type": "Disjunction",
								requiredNumber: 1,
							},
							badges: [ "badge-id-1", "badge-id-2" ]
						});

						connection.respondWithJson(request);
					});

					return root.save();
				});
		})
	);
	it(
		'should correctly setup children requirements',
		inject([ PathwayManager, MockBackend ], (pathwayManager: PathwayManager, mockBackend: MockBackend) => {
			const { issuer1Summary1, issuer1Detail1, issuer1Detail1Element1, issuer1Detail1Element2 } = generateTestPathways();

			const apiSummary = issuer1Summary1;

			const issuerSlug = issuerSlugFor(apiSummary);
			const apiDetail = buildApiTree(issuer1Detail1, {
				node: issuer1Detail1Element1,
				children: [ issuer1Detail1Element2 ]
			});
			const [apiRoot, apiChild] = apiDetail.elements;

			return setupSingleStructure(pathwayManager, mockBackend, apiDetail)
				.then((structure: LearningPathwayStructure) => {
					const root = structure.entityForApiEntity(apiRoot);
					const child = structure.entityForApiEntity(apiChild);

					child.requiredForParentCompletion = true;

					// Since we're updating the root, the list will be updated as well
					expectPathwaysRequests(mockBackend, [ apiDetail ]);

					expectRequest(
						mockBackend,
						RequestMethod.Put,
						`/v2/issuers/${issuerSlug}/pathways/${apiSummary.slug}/elements/${root.slug}`
					).then(connection => {
						const request = connection.requestJson<ApiPathwayElement>();
						expect<any>(request.requirements).toEqual({
							"@type": "ElementJunction",
							junctionConfig: {
								"@type": "Conjunction"
							},
							elements: [ child.url ]
						});

						connection.respondWithJson(request);
					});

					return root.save();
				});
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
			PathwayApiService,
			MessageService,
			PathwayManager,
			RecipientGroupApiService,
			RecipientGroupManager
		],
		imports: [ ]
	}));

	setupMockResponseReporting();

	beforeEach(inject([ SessionService ], (loginService: SessionService) => {
		loginService.storeToken({ access_token: "MOCKTOKEN" });
	}));
});

function setupSingleStructure(
	pathwayManager: PathwayManager,
	mockBackend: MockBackend,
	apiDetail: ApiPathwayDetail
): Promise<LearningPathwayStructure> {
	return Promise.all([
		expectPathwaysRequests(mockBackend, [ apiDetail ]),
		expectDetailRequest(mockBackend, apiDetail),
		pathwayManager.loadPathwaysForIssuer(issuerSlugFor(apiDetail))
			.then((pathways: IssuerPathways) => verifyManagedEntitySet(pathways, [ apiDetail ], verifyPathwaySummary))
			.then((pathways: IssuerPathways) => pathways.entities[ 0 ].structure.loadedPromise)
	]).then(([a, b, structure]) => structure);
}

function expectElementRequest(
	mockBackend: MockBackend,
	pathway: ApiPathwaySummary,
	apiElement: ApiPathwayElement
) {
	const issuerSlug = issuerSlugFor(pathway);

	return expectRequestAndRespondWith(
		mockBackend,
		RequestMethod.Get,
		`/v2/issuers/${issuerSlug}/pathways/${pathway.slug}/elements/${apiElement.slug}`,
		apiElement
	);
}

export function expectPathwaysRequests(
	mockBackend: MockBackend,
	apiPathways: ApiPathwaySummary[]
): Promise<any> {
	return Promise.all(
		apiPathways
			.reduce(groupIntoArray(issuerSlugFor), [])
			.map(
				({ key: issuerSlug, values: apiSummaries }) =>
					expectRequestAndRespondWith(
						mockBackend,
						RequestMethod.Get,
						`/v2/issuers/${issuerSlug}/pathways`,
						{ pathways: apiSummaries } as ApiIssuerPathwayList
					)
			)
	);
}

interface ApiElementTree {
	node: ApiPathwayElement;
	children: (ApiElementTree | ApiPathwayElement)[];
}
function buildApiTree(
	apiDetail: ApiPathwayDetail,
	root: ApiElementTree | ApiPathwayElement
) {
	const elements: ApiPathwayElement[] = [];

	return Object.assign(
		{},
		apiDetail,
		{
			rootElement: walk(root),
			elements: elements
		}
	);

	function walk(node: ApiElementTree | ApiPathwayElement): string {
		if (isTree(node)) {
			let newNode = Object.assign({}, node.node);
			elements.push(newNode);

			// Walk children so the elements list is in a depth-last order
			newNode.children = node.children.map(walk);
			return node.node[ "@id" ];
		} else {
			elements.push(Object.assign(
				{},
				node as ApiPathwayElement,
				{ children: [] }
			));
			return node[ "@id" ];
		}
	}

	function isTree(node: ApiElementTree | ApiPathwayElement): node is ApiElementTree {
		return "node" in node;
	}

}

function expectDetailRequest(
	mockBackend: MockBackend,
	apiDetail: ApiPathwayDetail
) {
	const issuerSlug = issuerSlugFor(apiDetail);

	return expectRequestAndRespondWith(
		mockBackend,
		RequestMethod.Get,
		`/v2/issuers/${issuerSlug}/pathways/${apiDetail.slug}`,
		apiDetail
	);
}

function issuerSlugFor(apiPathway: ApiPathwaySummary): string {
	return LearningPathway.issuerSlugForApiPathwaySummary(apiPathway);
}

function verifyPathwayStructure(
	structure: LearningPathwayStructure,
	apiDetail: ApiPathwayDetail
) {
	// Basic structure verification
	verifyManagedEntitySet(structure, apiDetail.elements, verifyPathwayElement);

	// Root element check
	expect(structure.rootElement).toBeTruthy();
	expect(structure.rootElement.url).toEqual(structure.apiDetail.rootElement);

	let seenNodeCount = 0;

	// Walk the tree and verify
	function verifyNode(
		parentElement: LearningPathwayElement,
		element: LearningPathwayElement
	) {
		verifyPathwayElement(element);
		seenNodeCount++;

		expect(element.parentElement).toBe(parentElement);

		if (parentElement) {
			expect(element.prevSibling).toBe(
				parentElement.children[ parentElement.children.indexOf(element) - 1 ] || null
			);
			expect(element.nextSibling).toBe(
				parentElement.children[ parentElement.children.indexOf(element) + 1 ] || null
			);
		} else {
			expect(element.prevSibling).toBe(null);
			expect(element.nextSibling).toBe(null);
		}

		element.children.forEach(child => verifyNode(element, child))
	}

	verifyNode(null, structure.rootElement);

	// Verify child counts
	expect(structure.pathway.elementCount).toEqual(seenNodeCount - 1);
	expect(structure.pathway.rootChildCount).toEqual(structure.rootElement.children.length);
}

export function verifyPathwaySummary(
	pathway: LearningPathway,
	apiPathway: ApiPathwaySummary
) {
	expect(pathway.url).toEqual(apiPathway[ "@id" ]);
	expect(pathway.slug).toEqual(apiPathway.slug);

	expect(pathway.issuerSlug).toEqual(LearningPathway.issuerSlugForApiPathwaySummary(apiPathway));
	expect(pathway.pathwaySlug).toEqual(apiPathway.slug);
	expect(pathway.id).toEqual(apiPathway[ "@id" ]);
	expect(pathway.type).toEqual(apiPathway[ "@type" ]);
	expect(pathway.name).toEqual(apiPathway.name);
	expect(pathway.description).toEqual(apiPathway.description);
	expect(pathway.alignmentUrl).toEqual(apiPathway.alignmentUrl);
	expect(pathway.completionBadge.entityRef).toEqual(apiPathway.completionBadge);
	expect(pathway.rootChildCount).toEqual(apiPathway.rootChildCount);
	expect(pathway.elementCount).toEqual(apiPathway.elementCount - 1);
}

export function verifyPathwayElement(
	element: LearningPathwayElement,
	apiElement: ApiPathwayElement = element.apiModel
) {
	expect(element.url).toEqual(apiElement[ "@id" ]);
	expect(element.slug).toEqual(apiElement.slug);

	expect(element.type).toEqual(apiElement[ "@type" ]);

	expect(element.name).toEqual(apiElement.name);
	expect(element.description).toEqual(apiElement.description);
	expect(element.alignmentUrl).toEqual(apiElement.alignmentUrl);

	expect(element.children.map(c => c.url)).toEqual(apiElement.children);
}

export function testPathwayRefForSlugs(issuerSlug: string, pathwaySlug: string) {
	return {
		"@id": `https://api.review.badgr.io/v2/issuers/${issuerSlug}/pathways/${pathwaySlug}`,
		"slug": pathwaySlug,
		"issuer": testIssuerRefForSlug(issuerSlug)
	};
}

export function generateTestPathways() {
	const issuer1Summary1 = {
		"@id": "https://api.review.badgr.io/v2/issuers/galatic-empire/pathways/imperial-bootcamp",
		"issuer": {
			"@id": "https://api.review.badgr.io/v1/issuers/galatic-empire/",
			"slug": "galatic-empire"
		},
		"groups": [],
		"slug": "imperial-bootcamp",
		"name": "Imperial Bootcamp",
		"description": "All the troopers",
		"completionBadge": null,
		"elementCount": 7,
		"rootChildCount": 2
	} as ApiPathwaySummary;

	const issuer1Summary2 = {
		"@id": "https://api.review.badgr.io/v2/issuers/galatic-empire/pathways/badge-image-test-2",
		"issuer": { "@id": "https://api.review.badgr.io/v1/issuers/galatic-empire/",  "slug": "galatic-empire"},
		"groups": [],
		"slug": "badge-image-test-2",
		"name": "Badge Image Test",
		"description": "test",
		"completionBadge": { "@id": "http://api.review.badgr.io/public/badges/rebel-extinguisher", "slug": "rebel-extinguisher" },
		"elementCount": 1,
		"rootChildCount": 0
	} as ApiPathwaySummary;

	const issuer1PathwayList = {
		"@context": "https://badgr.io/public/contexts/pathways",
		"@type": "IssuerPathwayList",
		"pathways": [ issuer1Summary1, issuer1Summary2 ]
	} as ApiIssuerPathwayList;

	const issuer1Detail1Element1 = {
		"@id": "https://api.review.badgr.io/v2/issuers/galatic-empire/pathways/imperial-bootcamp/elements/child",
		"slug": "child",
		"name": "Child",
		"description": "Many Child",
		"alignmentUrl": null,
		"ordering": 1,
		"completionBadge": null,
		"children": [],
		"badges": [
			"https://api.review.badgr.io/public/badges/rebel-extinguisher-2",
			"https://api.review.badgr.io/public/badges/sunsploder",
			"https://api.review.badgr.io/public/badges/empire-online",
			"https://api.review.badgr.io/public/badges/planet-connect",
			"https://api.review.badgr.io/public/badges/rebel-extinguisher",
			"https://api.review.badgr.io/public/badges/empire-awesome",
			"https://api.review.badgr.io/public/badges/test-badge",
			"https://api.review.badgr.io/public/badges/vader-cocktail"
		],
		"requirements": {
			"junctionConfig": { "requiredNumber": 1, "@type": "Disjunction" } as ApiElementRequirementDisjunctionConfig,
			"@type": "BadgeJunction",
			"badges": [
				"https://api.review.badgr.io/public/badges/empire-awesome",
				"https://api.review.badgr.io/public/badges/sunsploder"
			]
		} as ApiElementBadgeJunctionRequirement
	};
	const issuer1Detail1Element2 = {
		"@id": "https://api.review.badgr.io/v2/issuers/galatic-empire/pathways/imperial-bootcamp/elements/getting-nested-more",
		"slug": "getting-nested-more",
		"name": "Getting Nested More",
		"description": "asdjf\n\nasdfasdf\n\nasdfasdfsaf",
		"alignmentUrl": null,
		"ordering": 1,
		"completionBadge": null,
		"children": [],
		"badges": [
			"https://api.review.badgr.io/public/badges/rebel-extinguisher-2",
			"https://api.review.badgr.io/public/badges/test-badge",
			"https://api.review.badgr.io/public/badges/sunsploder",
			"https://api.review.badgr.io/public/badges/rebel-extinguisher",
			"https://api.review.badgr.io/public/badges/vader-cocktail",
			"https://api.review.badgr.io/public/badges/empire-awesome",
			"https://api.review.badgr.io/public/badges/empire-online",
			"https://api.review.badgr.io/public/badges/good-employee-skills",
			"https://api.review.badgr.io/public/badges/planet-connect",
			"https://api.review.badgr.io/public/badges/catalogue-planet",
			"https://api.review.badgr.io/public/badges/planet-travel",
			"https://api.review.badgr.io/public/badges/customer-service",
			"https://api.review.badgr.io/public/badges/teaching-and-learning",
			"https://api.review.badgr.io/public/badges/team-work",
			"https://api.review.badgr.io/public/badges/leadership"
		],
		"requirements": {
			"junctionConfig": { "requiredNumber": 1, "@type": "Disjunction" } as ApiElementRequirementDisjunctionConfig,
			"@type": "BadgeJunction",
			"badges": [
				"https://api.review.badgr.io/public/badges/test-badge",
				"https://api.review.badgr.io/public/badges/empire-online",
				"https://api.review.badgr.io/public/badges/empire-awesome",
				"https://api.review.badgr.io/public/badges/planet-travel",
				"https://api.review.badgr.io/public/badges/team-work",
				"https://api.review.badgr.io/public/badges/planet-connect",
				"https://api.review.badgr.io/public/badges/teaching-and-learning",
				"https://api.review.badgr.io/public/badges/rebel-extinguisher",
				"https://api.review.badgr.io/public/badges/rebel-extinguisher-2",
				"https://api.review.badgr.io/public/badges/leadership",
				"https://api.review.badgr.io/public/badges/catalogue-planet",
				"https://api.review.badgr.io/public/badges/good-employee-skills",
				"https://api.review.badgr.io/public/badges/vader-cocktail",
				"https://api.review.badgr.io/public/badges/customer-service",
				"https://api.review.badgr.io/public/badges/sunsploder"
			]
		} as ApiElementBadgeJunctionRequirement
	};
	const issuer1Detail1Element3 = {
		"@id": "https://api.review.badgr.io/v2/issuers/galatic-empire/pathways/imperial-bootcamp/elements/my-child",
		"slug": "my-child",
		"name": "My Child",
		"description": "Here is a description",
		"alignmentUrl": null,
		"ordering": 2,
		"completionBadge": null,
		"children": [
			"https://api.review.badgr.io/v2/issuers/galatic-empire/pathways/imperial-bootcamp/elements/getting-nested-more",
			"https://api.review.badgr.io/v2/issuers/galatic-empire/pathways/imperial-bootcamp/elements/sibling-nested-more",
			"https://api.review.badgr.io/v2/issuers/galatic-empire/pathways/imperial-bootcamp/elements/another-nested-child",
			"https://api.review.badgr.io/v2/issuers/galatic-empire/pathways/imperial-bootcamp/elements/nested-child"
		],
		"badges": []
	};
	const issuer1Detail1Element4 = {
		"@id": "https://api.review.badgr.io/v2/issuers/galatic-empire/pathways/imperial-bootcamp/elements/sibling-nested-more",
		"slug": "sibling-nested-more",
		"name": "Sibling Nested More",
		"description": "aksdf\nasf\n\nasdf",
		"alignmentUrl": null,
		"ordering": 2,
		"completionBadge": null,
		"children": [],
		"badges": []
	};
	const issuer1Detail1Element5 = {
		"@id": "https://api.review.badgr.io/v2/issuers/galatic-empire/pathways/imperial-bootcamp/elements/another-nested-child",
		"slug": "another-nested-child",
		"name": "Another Nested Child",
		"description": "Here is my description.",
		"alignmentUrl": null,
		"ordering": 3,
		"completionBadge": null,
		"children": [],
		"badges": []
	};
	const issuer1Detail1Element6 = {
		"@id": "https://api.review.badgr.io/v2/issuers/galatic-empire/pathways/imperial-bootcamp/elements/nested-child",
		"slug": "nested-child",
		"name": "Nested Child",
		"description": "Here is my description.",
		"alignmentUrl": null,
		"ordering": 4,
		"completionBadge": null,
		"children": [],
		"badges": [
			"https://api.review.badgr.io/public/badges/sunsploder",
			"https://api.review.badgr.io/public/badges/empire-awesome"
		],
		"requirements": {
			"junctionConfig": { "requiredNumber": 1, "@type": "Disjunction" } as ApiElementRequirementDisjunctionConfig,
			"@type": "BadgeJunction",
			"badges": []
		} as ApiElementBadgeJunctionRequirement
	};
	const issuer1Detail1Element7 = {
		"@id": "https://api.review.badgr.io/v2/issuers/galatic-empire/pathways/imperial-bootcamp/elements/imperial-bootcamp",
		"slug": "imperial-bootcamp",
		"name": "Imperial Bootcamp",
		"description": "All the troopers",
		"alignmentUrl": null,
		"ordering": 99,
		"completionBadge": { "@id": "http://api.review.badgr.io/public/badges/sunsploder", "slug": "sunsploder" },
		"children": [
			"https://api.review.badgr.io/v2/issuers/galatic-empire/pathways/imperial-bootcamp/elements/child",
			"https://api.review.badgr.io/v2/issuers/galatic-empire/pathways/imperial-bootcamp/elements/my-child"
		],
		"badges": []
	};

	const issuer1Detail1 = {
		"@id": "https://api.review.badgr.io/v2/issuers/galatic-empire/pathways/imperial-bootcamp",
		"issuer": { "@id": "https://api.review.badgr.io/v1/issuers/galatic-empire/",  "slug": "galatic-empire"},
		"groups": [],
		"slug": "imperial-bootcamp",
		"name": "Imperial Bootcamp",
		"description": "All the troopers",
		"completionBadge": null,
		"elementCount": 7,
		"rootChildCount": 2,
		"rootElement": "https://api.review.badgr.io/v2/issuers/galatic-empire/pathways/imperial-bootcamp/elements/imperial-bootcamp",
		"elements": [
			issuer1Detail1Element1,
			issuer1Detail1Element2,
			issuer1Detail1Element3,
			issuer1Detail1Element4,
			issuer1Detail1Element5,
			issuer1Detail1Element6,
			issuer1Detail1Element7
		]
	} as ApiPathwayDetail;

	const issuer1Detail2Element1 = {
		"@id": "https://api.review.badgr.io/v2/issuers/galatic-empire/pathways/badge-image-test-2/elements/badge-image-test-2",
		"slug": "badge-image-test-2",
		"name": "Badge Image Test",
		"description": "test",
		"alignmentUrl": null,
		"ordering": 99,
		"completionBadge": { "@id": "http://api.review.badgr.io/public/badges/rebel-extinguisher", "slug": "rebel-extinguisher" },
		"children": [],
		"badges": [
			"https://api.review.badgr.io/public/badges/dcsi2-training",
			"https://api.review.badgr.io/public/badges/dcsi-training"
		],
		"requirements": {
			"junctionConfig": { "requiredNumber": 1, "@type": "Disjunction" } as ApiElementRequirementDisjunctionConfig,
			"@type": "BadgeJunction",
			"badges": [
				"https://api.review.badgr.io/public/badges/dcsi-training",
				"https://api.review.badgr.io/public/badges/dcsi2-training"
			]
		} as ApiElementBadgeJunctionRequirement
	};

	const issuer1Detail2 = {
		"@id": "https://api.review.badgr.io/v2/issuers/galatic-empire/pathways/badge-image-test-2",
		"issuer": { "@id": "https://api.review.badgr.io/v1/issuers/galatic-empire/",  "slug": "galatic-empire"},
		"groups": [],
		"slug": "badge-image-test-2",
		"name": "Badge Image Test",
		"description": "test",
		"completionBadge": { "@id": "http://api.review.badgr.io/public/badges/rebel-extinguisher", "slug": "rebel-extinguisher" },
		"elementCount": 1,
		"rootChildCount": 0,
		"rootElement": "https://api.review.badgr.io/v2/issuers/galatic-empire/pathways/badge-image-test-2/elements/badge-image-test-2",
		"elements": [
			issuer1Detail2Element1
		]
	} as ApiPathwayDetail;

	return {
		issuer1Summary1,
		issuer1Summary2,
		issuer1PathwayList,
		issuer1Detail1Element1,
		issuer1Detail1Element2,
		issuer1Detail1Element3,
		issuer1Detail1Element4,
		issuer1Detail1Element5,
		issuer1Detail1Element6,
		issuer1Detail1Element7,
		issuer1Detail1,
		issuer1Detail2Element1,
		issuer1Detail2
	};
}

