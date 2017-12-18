import { Injectable } from "@angular/core";

@Injectable()
export class SettingsService {
	constructor() {}

	public loadSettings<T>(settingsId: string, defaults: T) {
		try {
			let settingsString = window.localStorage[ "settings-" + settingsId ] || "{}";
			return Object.assign(
				{},
				defaults,
				JSON.parse(settingsString)
			);
		} catch (e) {
			console.error(`Failed to load settings: ${settingsId}`, e);
			return Object.assign({}, defaults);
		}
	}

	public saveSettings(settingsId: string, settings: any) {
		try {
			window.localStorage[ "settings-" + settingsId ] = JSON.stringify(settings);
		} catch (e) {
			console.error(`Failed to save settings for ${settingsId}`, e);
		}
	}
}