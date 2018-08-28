
import { ApiEntityRef } from "../../common/model/entity-ref";

export type IssuerSlug = string;
export type IssuerUrl = string;

export interface IssuerRef {
	"@id": IssuerUrl;
	slug: IssuerSlug;
}

export interface ApiIssuerJsonld {
	'@context': string
	type: string
	id: IssuerUrl

	name: string
	description: string
	email: string
	url: string
	image: string
	faculty: object
}

export interface ApiIssuer {
	name: string
	slug: IssuerSlug
	description: string
	image: string
	faculty: object

	created_at: string
	created_by: string
	staff: ApiIssuerStaff[]

	pathwayCount: number;
	recipientCount: number;
	recipientGroupCount: number;
	badgeClassCount: number;

	json: ApiIssuerJsonld
}

export type IssuerStaffRoleSlug = "owner" | "editor" | "staff";
export interface ApiIssuerStaff {
	role: IssuerStaffRoleSlug
	user: {
		first_name: string
		last_name: string
		email: string
	};
}

export interface IssuerStaffRef extends ApiEntityRef {}

export interface ApiIssuerStaffOperation {
	action: "add" | "modify" | "remove";
	username?: string;
	email?: string;
	role?: IssuerStaffRoleSlug;
}

export interface ApiIssuerForCreation {
	name: string
	description: string
	image?: string
	email: string
	url: string
	faculty: object
}

export interface ApiIssuerForEditing {
	name: string
	description: string
	image?: string
	email: string
	url: string
	faculty: object
}
