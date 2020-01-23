import { ApiEntityRef } from "../../common/model/entity-ref";
import { BadgeClassUrl } from "./badgeclass-api.model";
import { IssuerUrl } from "./issuer-api.model";

export type BadgeInstanceSlug = string;
export type BadgeInstanceUrl = string;
export interface BadgeInstanceRef extends ApiEntityRef {}


export interface ApiBadgeInstanceJsonld {
	'@context': string
	type: string
	id: BadgeInstanceUrl

	uid: string
	evidence_items: ApiBadgeInstanceEvidenceItem[]
	issuedOn: string
	image: string
}

export interface ApiBadgeInstanceForBatchCreation {
	issuer: IssuerUrl
	create_notification?: boolean
	badge_class: BadgeClassUrl
	recipients: BadgeInstanceBatchAssertion[]
	expires_at?: string
	narrative?: string
	issue_signed: boolean
	signing_password?: string
	evidence_items?: ApiBadgeInstanceEvidenceItem[]
}

export interface ApiBadgeInstanceForCreation {
	issuer: IssuerUrl
	badge_class: BadgeClassUrl
	issue_signed?: boolean
	signing_password?: string
	narrative?: string
	create_notification?: boolean
	expires_at?: string
	evidence_items?: ApiBadgeInstanceEvidenceItem[]
	extensions?: object
	recipients?: ApiBadgeInstanceRecipient[]
}

export interface ApiBadgeInstanceRecipient {
	recipient_type: string;
	recipient_name?: string
	recipient_identifier: string
}

export interface ApiBadgeInstanceEvidenceItem {
	evidence_url?: string
	narrative?: string
}

export interface ApiBadgeInstance {
	slug: BadgeInstanceSlug
	image: string
	recipient_identifier: string
	recipient_email: string
	recipient_name: string
	recipient_type?: string
	revoked: boolean
	revocation_reason?: string

	evidence_items?: ApiBadgeInstanceEvidenceItem[]

	issuer: IssuerUrl
	badge_class: BadgeClassUrl

	created_at: string
	created_by: string

	json: ApiBadgeInstanceJsonld
	extensions?: object
}

export interface BadgeInstanceBatchAssertion {
	recipient_identifier: string,
	evidence_items?: ApiBadgeInstanceEvidenceItem[]
}
