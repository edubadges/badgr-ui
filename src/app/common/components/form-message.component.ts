import { OnInit, OnDestroy, Component, Input, ElementRef } from "@angular/core";
import { MessageService, FlashMessage } from "../services/message.service";

import { Router } from "@angular/router";
import { Subscription } from "rxjs/Subscription";
import { EventsService } from "../services/events.service";


@Component({
	selector: 'form-message',
	template: `
		<div class="l-formmessage formmessage formmessage-is-{{status}}"
		     [class.formmessage-is-active]="message"
		     [class.formmessage-is-inactive]="messageDismissed">
		    <p *ngIf="msg">{{ msg }}</p>
		    <button type="button" (click)="dismissMessage()">Dismiss</button>
		</div>
	`
})
export class FormMessageComponent implements OnInit, OnDestroy {
	messageDismissed = false;
	message: FlashMessage;
	msg: string;
	status: string;
	subscription: Subscription;
	timeout: any;
	private clickSubscription: Subscription;

	constructor(
		protected messageService: MessageService,
		protected router: Router,
		protected elemRef: ElementRef,
		protected eventService: EventsService
	) {
		this.subscription = this.messageService.message$.subscribe((message) => {
			this.setMessage(message);
		});
		this.clickSubscription = this.eventService.documentClicked.subscribe(e => this.onDocumentClick(e));
	}

	ngOnDestroy() {
		this.subscription.unsubscribe();
		this.clickSubscription.unsubscribe();
	}

	ngOnInit() {
		this.setMessage(this.messageService.getMessage());
	}

	get element(): HTMLElement {
		return this.elemRef.nativeElement as HTMLElement;
	}

	onDocumentClick(ev: MouseEvent) {
		if (! this.element.contains(ev.target as Element)) {
			this.dismissMessage();
		}
	}

	setMessage(message: FlashMessage) {
		this.messageDismissed = this.message && !message;

		this.message = message;
		if (message) {
			this.msg = message.message;
			this.status = message.status;
			if (this.timeout) {
				clearTimeout(this.timeout);
				this.timeout = null;
			}
			if (this.status == "success") {
				this.timeout = setTimeout(() => {
					this.dismissMessage();
					this.timeout = null;
				}, 10000);
			}
		}

	}

	dismissMessage() {
		this.messageService.dismissMessage();
	}
}
