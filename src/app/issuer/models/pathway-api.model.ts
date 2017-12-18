import { BadgeClassUrl, BadgeClassRef } from "./badgeclass-api.model";
import { IssuerRef } from "./issuer-api.model";
import { RecipientGroupRef } from "./recipientgroup-api.model";
import { ApiEntityRef } from "../../common/model/entity-ref";

export type PathwayUrl = string
export type PathwaySlug = string

export type PathwayElementUrlId = string;
export type PathwayElementSlug = string;

export interface PathwayRef extends ApiEntityRef {
	// TODO: Add issuer to PathwayRef once the API provides it
	// issuer: IssuerRef;
}


export interface ApiIssuerPathwayList {
	pathways: ApiPathwaySummary[];
}

export interface ApiPathwaySummaryForCreation {
	name: string;
	description: string;
	alignmentUrl?: string;
}

export interface ApiPathwaySummary extends ApiPathwaySummaryForCreation {
	"@id": PathwayUrl;
	slug: PathwaySlug;
	issuer: IssuerRef;
	completionBadge?: BadgeClassRef;
	rootChildCount: number;
	elementCount: number;
	
	groups: RecipientGroupRef[];
}

export interface ApiPathwayDetail extends ApiPathwaySummary {
	rootElement?: PathwayElementUrlId;
	elements?: ApiPathwayElement[];
}


export interface ApiPathwayElementForCreation {
	name: string;
	description: string;
	alignmentUrl: string;
	completionBadge?: BadgeClassRef;
	ordering?: number;
}

export interface PathwayElementRef extends ApiEntityRef {}

export interface ApiPathwayElement extends ApiPathwayElementForCreation {
	"@id": PathwayElementUrlId;
	slug: PathwayElementSlug;
	ordering: number;
	children: PathwayElementUrlId[];
	badges: BadgeClassUrl[];
	requirements?: ApiElementRequirement;
}

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// Pathway Element Requirements

/**
 * Base Interface for PathwayElement Completion Requirements.
 */
export const ApiElementRequirementType = {
	BadgeJunction: "BadgeJunction" as ApiElementRequirementType,
	ElementJunction: "ElementJunction" as ApiElementRequirementType
};
export type ApiElementRequirementType  = "BadgeJunction" | "ElementJunction";
export interface ApiElementRequirement {
	"@type": ApiElementRequirementType;
}

/**
 * Base Interface for PathwayElement Completion Requirements.
 */
export interface ApiElementJunctionRequirement extends ApiElementRequirement {
	junctionConfig: ApiElementRequirementJunctionConfig;
}

/**
 * Pathway Element Completion Requirement for Badges. Requires that a user is a recipient of some set of badges to
 * complete the owning element.
 */
export interface ApiElementBadgeJunctionRequirement extends ApiElementJunctionRequirement {
	"@type": "BadgeJunction";

	junctionConfig: ApiElementRequirementJunctionConfig;
	badges: string[];
}

/**
 * Pathway Element Completion Requirement for Badges. Requires that a user has completed other PathwayElements to
 * complete the owning element.
 */
export interface ApiElementElementJunctionRequirement extends ApiElementJunctionRequirement {
	"@type": "ElementJunction";

	junctionConfig: ApiElementRequirementJunctionConfig;
	elements: string[];
}

/**
 * Configuration for the logical junction used in ApiElementJunctionRequirement.
 */
export const ApiElementRequirementJunctionType = {
	Disjunction: "Disjunction",
	Conjunction: "Conjunction"
};
export type ApiElementRequirementJunctionType = "Disjunction" | "Conjunction";
export interface ApiElementRequirementJunctionConfig {
	"@type": ApiElementRequirementJunctionType;
}

/**
 * Logical Disjunction, a logical "OR" of several elements. Allows requiring a certain number of children to be completed.
 */
export interface ApiElementRequirementDisjunctionConfig extends ApiElementRequirementJunctionConfig {
	"@type": "Disjunction";
	requiredNumber?: number;
}

/**
 * Logical Conjunction, a logical "AND" of several things.
 */
export interface ApiElementRequirementConjunctionConfig extends ApiElementRequirementJunctionConfig {
	"@type": "Conjunction";
}


////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// V2 Proposals

interface ApiElementRequirements {
	elements: {
		elementUrls: string[]
		requiredCount: number
	}
	badges: {
		badgrUrls: string[]
		requiredCount: number
	}
	completionBadgeShortcut: boolean
}

interface ApiElementEarnerProgressSummary {
	completedBadgeCount: number;
	neededBadgeCount: number;
}

interface ApiPathwayEarnerProgressDetail {
	completedBadgeRefs: BadgeClassRef[];
	neededBadgeRefs: BadgeClassRef[];

	elementProgress: {
		elementRef: PathwayElementRef;
		requiredBadgeRefs: BadgeClassRef[]
	}[];
}

interface ApiElementGroupProgressSummary {
	completedUserCount: number;
}

interface ApiPathwayGroupProgressDetail {
	groupRef: RecipientGroupRef;

	elementProgress: {
		elementRef: PathwayElementRef;
		completedUserCount: number;
		userProgressSummaries: {
			userEmail: string;
			completedBadgeCount: number;
			neededBadgeCount: number;
		}[];
	}[];
}