import { ApiEntityRef } from "../../common/model/entity-ref";

export type AppIntegrationType = "canvas-lti1";

export type ApiAppIntegrationUid = string;

export interface ApiAppIntegrationRef extends ApiEntityRef {}

export interface ApiAppIntegration {
	integrationType: AppIntegrationType;
	integrationUid?: string;

	integrationData: any;
}

export interface ApiBadgebookCanvasLti1AppIntegration extends ApiAppIntegration {
	integrationType: "canvas-lti1";

	integrationData: {
		credential: {
			client_secret: string;
			client_id: string;
		}
		config_url: string;
	}
}