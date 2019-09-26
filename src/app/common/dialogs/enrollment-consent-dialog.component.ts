import { Component, ElementRef, Renderer2 } from "@angular/core";

import { SystemConfigService } from "../services/config.service";
import { BaseDialog } from './base-dialog';
import { SessionService } from "../services/session.service";
import { SocialAccountProviderInfo } from "../model/user-profile-api.model";
import { ThemeApiService } from "../../../theming/services/theme-api.service";

@Component({
	selector: 'enrollment-consent-dialog',
	template: `
		<dialog class="dialog dialog-large dialog-confirm">
			<header class="heading heading-small l-container">
				<div class="heading-x-text">
					<div>
						<button class="button" (click)="openInOtherLanguage()">{{ switchLanguageText}}</button>
						<br><br><br>
					</div>


					<markdown-display value="{{options.dialogBody}}">  </markdown-display>
				</div>
			</header>
			<div class="l-childrenhorizontal l-childrenhorizontal-right l-container">
				<button class="button button-primaryghost"
								(click)="closeDialog(false)">{{ options.rejectButtonLabel }}</button>
				<button class="button" (click)="closeDialog(true)">{{ options.resolveButtonLabel }}</button>
			</div>
		</dialog>
	`,
})
export class EnrollmentConsentDialog extends BaseDialog {

	static defaultOptions = {
		dialogBody: '',
		rejectButtonLabel: "Ik geef geen toestemming",
		resolveButtonLabel: "Ik geef toestemming",
		showCloseBox: true,
		showRejectButton: true
	};
	switchLanguageText = '';
	currentLangNl = false;
	options = EnrollmentConsentDialog.defaultOptions;
	sessionService;
	provider: SocialAccountProviderInfo;
	loggedIn: boolean = false;
	resolveFunc: () => void;
	rejectFunc: () => void;
	get currentTheme() { return this.themeManager.currentTheme }


	constructor(
		private configService: SystemConfigService,
		sessionService: SessionService,
		componentElem: ElementRef,
		renderer: Renderer2,
		private themeManager: ThemeApiService,
	) {

		super(componentElem, renderer);
		this.sessionService = sessionService;
		this.currentLangNl = this.currentTheme.dutch_language_codes.includes(this.currentTheme.language_detected);
	}

	openConsentDialog(): Promise<void> {
		let options = {dialogBody: this.currentTheme.consent_apply_badge};
		EnrollmentConsentDialog.defaultOptions.rejectButtonLabel = 'Ik geef geen toestemming';
		EnrollmentConsentDialog.defaultOptions.resolveButtonLabel = 'Ik geef toestemming';
		this.switchLanguageText = 'View in English';
		if(!(this.currentLangNl )) {
			this.switchLanguageText = 'Bekijk in het Nederlands';
			options = {dialogBody: this.currentTheme.consent_apply_badge_en};
			EnrollmentConsentDialog.defaultOptions.rejectButtonLabel = 'I DO NOT CONSENT';
			EnrollmentConsentDialog.defaultOptions.resolveButtonLabel = 'I CONSENT';
		}
		this.options = Object.assign(this.options, options);

		if (this.isOpen)
			return Promise.reject(new Error("Cannot open dialog, because it is already open."));
		this.showModal();

		return new Promise<void>((resolve, reject) => {
			this.resolveFunc = resolve;
			this.rejectFunc = reject;
		});
	}


	closeDialog(result: boolean) {
		this.closeModal();

		if (result) {
			this.resolveFunc();
		} else {
			this.rejectFunc();
		}
	}

	openInOtherLanguage(): any{
		this.closeModal();
		this.currentLangNl = !this.currentLangNl;
		if(this.currentLangNl) {
			this.switchLanguageText = 'View in English';
		}
		else{
			this.switchLanguageText = 'Bekijk in het Nederlands';
		}
		this.openConsentDialog().then(
			() => {
				this.sessionService.initiateUnauthenticatedExternalAuth(this.provider)
			},
			() => void 0
		);

	}

	ngOnInit() {
		this.loggedIn = this.sessionService.isLoggedIn;
		this.sessionService.loggedin$.subscribe(
			loggedIn => setTimeout(() => this.loggedIn = loggedIn)
		);
		for (let provider of this.sessionService.enabledExternalAuthProviders) {
			if (provider.name == 'EduID') {
				this.provider = provider
			}
		}
	}


}
