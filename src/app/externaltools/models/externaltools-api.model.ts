
export type ApiExternalToolSlug = string;

export interface ExternalToolRef {
	"@id": string;
	slug: ApiExternalToolSlug;
}

export interface ApiExternalTool {
	slug: ApiExternalToolSlug;
	name: string;
	client_id: string;
	launchpoints: object;
}

export interface ApiExternalToolLaunchpoint {
	url: string;
	icon_url?: string;
	launch_url: string;
	label: string;
}


export type ExternalToolLaunchpointName =
	"earner_assertion_action" |
	"issuer_assertion_action"
	;