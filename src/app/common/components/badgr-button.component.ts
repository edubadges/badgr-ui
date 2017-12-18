import { Component, Output, EventEmitter, Input, OnChanges, ElementRef } from "@angular/core";
import { MessageService } from "../services/message.service";

@Component({
	selector: 'button[loading-promises],.button[loading-promises],button[disabled-when-requesting],.button[disabled-when-requesting],button[loading-when-requesting],.button[loading-when-requesting]',
	host: {
		"[class.button-is-loading]": "showLoadindMessage",
		"[class.button-is-disabled]": "disabledForLoading",
		"[attr.disabled]": "disabledForLoading ? true : null"
	},
	template: `
		<span class="button-x-defaulttext" *ngIf="! showLoadindMessage"><ng-content></ng-content></span>
		<span class="button-x-loading" *ngIf="showLoadindMessage">{{ loadingMessage }}</span>
	`,
})
export class BadgrButtonComponent {
	loadingPromise: Promise<any>;
	promiseLoading: boolean = false;

	@Input('disabled-when-requesting')
	disabledWhenRequesting: boolean = false;

	@Input('loading-when-requesting')
	loadingWhenRequesting: boolean = false;

	@Input('loading-message')
	loadingMessage: string = "Loading";

	@Input('loading-promises')
	set inputPromises(promises: Promise<any> | Promise<any>[] | null) {
		this.updatePromises(
			promises
				? Array.isArray(promises)
					? promises.filter(p => !!p)
				  : [ promises ]
		    : []
		);
	}

	get showLoadindMessage() {
		return this.promiseLoading || (this.loadingWhenRequesting && this.messageService.pendingRequestCount > 0);
	}

	get disabledForLoading() {
		return this.showLoadindMessage || (this.disabledWhenRequesting && this.messageService.pendingRequestCount > 0);
	}

	constructor(
		private messageService: MessageService
	) {}

	private updatePromises(promises: Promise<any>[]) {
		if (promises.length == 0) {
			this.loadingPromise = null;
			this.promiseLoading = false;
		} else {
			const ourPromise = this.loadingPromise = Promise.all(promises);

			this.promiseLoading = true;

			ourPromise.then(
				() => {
					if (ourPromise == this.loadingPromise) {
						this.promiseLoading = false;
					}
				},
				() => {
					if (ourPromise == this.loadingPromise) {
						this.promiseLoading = false;
					}
				}
			)
		}
	}
}
