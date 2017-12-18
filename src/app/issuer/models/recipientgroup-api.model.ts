import { PathwayRef } from "./pathway-api.model";
import { IssuerRef } from "./issuer-api.model";
import { ApiEntityRef } from "../../common/model/entity-ref";

export type RecipientGroupUrl = string;
export type RecipientGroupSlug = string;

export type RecipientGroupMemberUrl = string;
export type RecipientGroupMemberSlug = string;

export interface RecipientGroupRef extends ApiEntityRef {
	// TODO: Add issuer to RecipientGroupRef once the API provides it
	// issuer: IssuerRef;
}

export interface ApiIssuerRecipientGroupList {
	recipientGroups: ApiRecipientGroup[];
	issuer: IssuerRef
}

export interface ApiIssuerRecipientGroupDetailList extends ApiIssuerRecipientGroupList{
	recipientGroups: ApiRecipientGroup[];
	issuer: IssuerRef
}

export interface ApiRecipientGroupForCreation {
	name: string;
	description: string;
	pathways: PathwayRef[];
	members: ApiRecipientGroupMember[];
}

export interface ApiRecipientGroup {
	"@type": "RecipientGroup";
	"@id": RecipientGroupUrl;
	slug: RecipientGroupSlug;
	name: string;
	description: string;
	pathways: PathwayRef[];
	issuer: IssuerRef;
	member_count: number;
	active: boolean;
	members?: ApiRecipientGroupMember[];
}

export interface ApiRecipientGroupMemberForCreation {
	name: string;
	email: string;
}


export interface ApiRecipientGroupMember extends ApiRecipientGroupMemberForCreation{
	"@id": RecipientGroupMemberUrl;
	slug: RecipientGroupMemberSlug;
}
