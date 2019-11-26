import { Injectable, Injector } from "@angular/core";
import { ThemeApiService } from "../../../theming/services/theme-api.service";

/**
 * The shape of a Badgr Config object. As there may be multiple config sources, each one may not specify all parts.
 */
export interface BadgrConfig {
	api?: ApiConfig;
	help?: HelpConfig;
	features?: FeaturesConfig;
	googleAnalytics?: GoogleAnalyticsConfig;
	assertionVerifyUrl?: string;
}

/**
 * API Configuration, indicating where and how Badgr UI should communicate with the server.
 */
export interface ApiConfig {
	/**
	 * The base URL of the Badgr Server to communicate with. All API calls will be relative to this, e.g. 'http://localhost:8000'
	 */
	baseUrl: string;

	integrationEndpoints: string[];

	/**
	 * Configures an optional delay for all API calls. Allows the simulation of a slow server or network for testing of
	 * progress indication and other API-speed dependent features.
	 */
	debugDelayRange?: {
		/**
		 * Minimum number of milliseconds all API calls should be delayed by.
		 */
		minMs: number;
		/**
		 * Maximum number of milliseconds all API calls should be delayed by.
		 */
		maxMs: number;
	};
}

/**
 * Support configuration, used for help links, contact information, etc...
 */
export interface HelpConfig {
	email: string;
	alternateLandingUrl?: string;
}

/**
 * Feature configuration for experimental or other optional features
 */
export interface FeaturesConfig {
	/**
	 * Enables the initial landing page redirect
	 */
	alternateLandingRedirect?: boolean

	/**
	 * Allows configuration of a specific set of social providers smaller than the default. If omitted, all providers
	 * will be enabled.
	 */
	socialAccountProviders?: Array<string>
}

/**
 * Google Analytics configuration.
 */
export interface GoogleAnalyticsConfig {
	/**
	 * The GA tracking identifier, e.g. UA-12345678-9
	 */
	trackingId: string;
}

@Injectable()
export class SystemConfigService{
	constructor(private injector: Injector) {}

	private getConfig<T>(getter: (config: BadgrConfig) => T): T {
		const configProviders: { (): BadgrConfig }[] = [
			() => window[ 'config' ],
			() => this.injector.get('config', {}),
			() => ({
				api: {
					baseUrl: (window.location.protocol + "//" + window.location.hostname + ":8000"),
				},
				features: {
					alternateLandingRedirect: false
				},
				help: {
					email: "info@edubadges.io"
				},
				assertionVerifyUrl: "https://badgecheck.edubadges.nl/"
			}),
		];

		for (const provider of configProviders) {
			const overall = provider();
			if (typeof overall === "object") {
				const config = getter(overall);

				if (config) {
					return config;
				}
			}
		}

		throw `Could not resolve required config value using ${getter.toString()}. Please ensure that config.js is setup correctly.`
	}

	get apiConfig(): ApiConfig {
		return this.getConfig(config => config.api);
	}

	get featuresConfig(): FeaturesConfig {
		return this.getConfig(config => config.features);
	}

	get helpConfig(): HelpConfig {
		return this.getConfig(config => config.help);
	}

	get googleAnalyticsConfig(): GoogleAnalyticsConfig {
		return this.getConfig(config => (config.googleAnalytics || { trackingId: null }));
	}

	get assertionVerifyUrl(): string {
		return this.getConfig(config => config.assertionVerifyUrl)
	}

	get currentTheme() {
		return window["badgrTheme"];
	}

	get signingEnabled() {
		return this.featuresConfig["signingEnabled"] == true
	}

	get endorsementsEnabled() {
		return this.featuresConfig["endorsementsEnabled"] == true
	}

	get splitBadgesCategoryEnabled() {
		return this.featuresConfig["splitBadgesCategoryEnabled"] == true
	}

}
