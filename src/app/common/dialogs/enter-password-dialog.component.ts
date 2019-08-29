import { Component, ElementRef, Renderer2 } from "@angular/core";

import { SystemConfigService } from "../services/config.service";
import { BaseDialog } from './base-dialog';
import { SessionService } from "../services/session.service";
import { SocialAccountProviderInfo } from "../model/user-profile-api.model";

@Component({
	selector: 'enter-password-dialog',
	template: `
		<dialog class="dialog dialog-large dialog-confirm">
			<header class="heading heading-small l-container">
				<div class="heading-x-text">
					Please enter you YubiKey password.
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
export class EnterPasswordDialog extends BaseDialog {

	static defaultOptions = {
		dialogBody: '',
		rejectButtonLabel: "Cancel",
		resolveButtonLabel: "Ok",
		showCloseBox: true,
		showRejectButton: true
	};
	options = EnterPasswordDialog.defaultOptions;
	sessionService;
	provider: SocialAccountProviderInfo;
	loggedIn: boolean = false;
	formState: object;
	resolveFunc: () => void;
	rejectFunc: () => void;
	get currentTheme() { return this.configService.currentTheme }

	constructor(
		private configService: SystemConfigService,
		sessionService: SessionService,
		componentElem: ElementRef,
		renderer: Renderer2,
	) {
		super(componentElem, renderer);
		this.sessionService = sessionService;
	}

	openDialog(formState): Promise<void> {
		let options = {dialogBody: this.currentTheme.consent_apply_badge};
		this.options = Object.assign(this.options, options);
		this.formState = formState

		if (this.isOpen)
			return Promise.reject(new Error("Cannot open dialog, because it is already open."));
		this.showModal();

		return new Promise<any>((resolve, reject) => {
			this.resolveFunc = resolve;
			this.rejectFunc = reject;
		});
	}


	closeDialog(result: boolean) {
		this.closeModal();

		if (result) {
			this.formState['password'] = 'password'
			this.resolveFunc();
		} else {
			this.rejectFunc();
		}
	}


}
