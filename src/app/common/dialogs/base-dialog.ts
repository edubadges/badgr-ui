import { ElementRef, ViewChild, AfterViewInit, Renderer, Renderer2 } from "@angular/core";
import { registerDialog, HTMLDialogElement } from "dialog-polyfill/dialog-polyfill";

export abstract class BaseDialog implements AfterViewInit {
	constructor(
		protected componentElem: ElementRef,
		protected renderer: Renderer2
	) {}

	private get dialogElem(): HTMLDialogElement {
		return (this.componentElem.nativeElement as HTMLElement).querySelector("dialog") as any;
	}

	ngAfterViewInit() {
		this.renderer.listen(this.dialogElem, "close", () => this.onDialogClosed());
		this.renderer.listen(this.dialogElem, "cancel", () => this.onDialogCanceled());

		if (!("showModal" in this.dialogElem)) {
			registerDialog(this.dialogElem);
		}
	}

	protected showModal() {
		this.dialogElem.showModal();
		this.onDialogOpened();
	}

	protected closeModal() {
		this.dialogElem.close();
	}

	get isOpen() {
		return this.dialogElem.hasAttribute("open");
	}

	protected onDialogOpened() {
		document.documentElement.classList.add("l-dialogopen");
	}
	protected onDialogClosed() {
		document.documentElement.classList.remove("l-dialogopen");
	}
	protected onDialogCanceled() {}
}