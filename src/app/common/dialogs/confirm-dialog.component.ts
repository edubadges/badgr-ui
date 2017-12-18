import { Component, ViewChild, AfterViewInit, ElementRef, Renderer, Renderer2 } from "@angular/core";


import { registerDialog } from "dialog-polyfill/dialog-polyfill";
import { BaseDialog } from "./base-dialog";

export interface ConfirmDialogOptions {
	dialogTitle?: string;
	dialogBody: string;
	resolveButtonLabel?: string;
	rejectButtonLabel?: string;
	showCloseBox?: boolean;
	showRejectButton?: boolean;
}

@Component({
	selector: 'confirm-dialog',
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
export class ConfirmDialog extends BaseDialog {
	static defaultOptions = {
		dialogTitle: "Confirm",
		dialogBody: "Please confirm",
		rejectButtonLabel: "Cancel",
		resolveButtonLabel: "OK",
		showCloseBox: true,
		showRejectButton: true
	} as ConfirmDialogOptions;

	options: ConfirmDialogOptions = ConfirmDialog.defaultOptions;
	resolveFunc: () => void;
	rejectFunc: () => void;


	constructor(
		componentElem: ElementRef,
		renderer: Renderer2,
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
	openResolveRejectDialog(
		options: ConfirmDialogOptions
	): Promise<void> {
		if (this.isOpen)
			return Promise.reject(new Error("Cannot open dialog, because it is already open. Old options" + JSON.stringify(this.options) + "; new options: " + JSON.stringify(options)));

		this.options = Object.assign({}, ConfirmDialog.defaultOptions, options);
		this.showModal();

		return new Promise<void>((resolve, reject) => {
			this.resolveFunc = resolve;
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
	openTrueFalseDialog(
		options: ConfirmDialogOptions
	): Promise<boolean> {
		return this.openResolveRejectDialog(options)
			.then(() => true, () => false);
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
