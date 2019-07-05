import { Component, ElementRef, Renderer2 } from "@angular/core";

import { SystemConfigService } from "../services/config.service";
import { BaseDialog } from './base-dialog';

@Component({
	selector: 'enrollment-consent-dialog',
	template: `
    <dialog class="dialog dialog-large dialog-confirm">
        <header class="heading heading-small l-container">
					<div class="heading-x-text">
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

	options = EnrollmentConsentDialog.defaultOptions;
	resolveFunc: () => void;
	rejectFunc: () => void;

	get currentTheme() { return this.configService.currentTheme }

	constructor(
		private configService: SystemConfigService,
		componentElem: ElementRef,
		renderer: Renderer2,
	) {
		super(componentElem, renderer);
	}

	openConsentDialog(): Promise<void> {
		let options = {dialogBody: this.currentTheme.consent_apply_badge};
		if(!(this.currentTheme.dutch_language_codes.includes(this.currentTheme.language_detected ))) {
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

}
