import { Component, ViewChild, AfterViewInit, ElementRef, Renderer, Renderer2 } from "@angular/core";

import { Router } from "@angular/router";
import { registerDialog } from "dialog-polyfill/dialog-polyfill";
import { BaseDialog } from "./base-dialog";
import { SystemConfigService } from "../services/config.service";

export interface EduIDDialogOptions {
	dialogTitle?: string;
	dialogBody: string;
	resolveButtonLabel?: string;
	rejectButtonLabel?: string;
	showCloseBox?: boolean;
	showRejectButton?: boolean;
}

@Component({
	selector: 'eduid-failure-dialog',
	template: `
    <dialog class="dialog dialog-confirm">

        <header class="heading heading-small l-container">

					<div class="heading-x-text">

            <h1>{{ options.dialogTitle }}</h1>

            <p [innerHTML]="options.dialogBody"></p>

					</div>

        </header>

        <div class="l-childrenhorizontal l-childrenhorizontal-small l-childrenhorizontal-right l-container">
            <button *ngIf="options.showRejectButton" 
                    class="button button-primaryghost" 
                    (click)="closeDialog(false)">{{ options.rejectButtonLabel }}</button>
            <button class="button" (click)="closeDialog(true)">{{ options.resolveButtonLabel }}</button>
        </div>

    </dialog>
    `,

})
export class EduIDFailureDialog extends BaseDialog {
	static defaultOptions = {
		dialogTitle: "Your EduID account does not have you institution information.",
		dialogBody: "Please login into you EduID account to add your institution account.",
		rejectButtonLabel: "go back",
		resolveButtonLabel: "Go to EduID",
		showCloseBox: true,
		showRejectButton: true
	} as EduIDDialogOptions;

	
	options: EduIDDialogOptions = EduIDFailureDialog.defaultOptions;
	resolveFunc: () => void;
	rejectFunc: () => void;


	constructor(
		private configService: SystemConfigService,
		componentElem: ElementRef,
		renderer: Renderer2,
		public router: Router,
	) {
		super(componentElem, renderer);
	}

	/**
	 * Opens the confirm dialog with the given options. If the user clicks the "resolve" button, the promise will be
	 * resolved, otherwise, it will be rejected.
	 *
	 * @param options Options for the dialog
	 * @returns {Promise<void>}
	 */
	 
	resolveFunction(){
		let eduIDUrl = this.configService.featuresConfig["socialAccountProviderUrls"]['edu_id']
		window.open(eduIDUrl, '_self');
	}
	
	openFailureDialog(): Promise<void> {
		if (this.isOpen)
			return Promise.reject(new Error("Cannot open dialog, because it is already open. "));
	
		// this.options = Object.assign({}, EduIDFailureDialog.defaultOptions, options);
		this.showModal();
	
		return new Promise<void>((resolve, reject) => {
			this.resolveFunc = this.resolveFunction;
			this.rejectFunc = reject;
		});
	}
	
	/**
	 * Opens the confirm dialog with the given options. If the user clicks the "resolve" button, the promise will be
	 * resolved with `true`, otherwise it will be _resolved_ with `false`. This is meant for easier use with `await`.
	 *
	 * @param options Options for the dialog
	 * @returns {Promise<boolean>}
	 */

	closeDialog(result: boolean) {
		this.closeModal();
	
		if (result) {
			this.resolveFunc();
		} else {
			this.rejectFunc();
		}
	}
}
