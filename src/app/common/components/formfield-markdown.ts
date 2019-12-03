import { AfterViewInit, Component, ElementRef, Input, OnChanges, SimpleChanges, ViewChild } from "@angular/core";
import { FormControl, FormGroup } from "@angular/forms";

import { CommonDialogsService } from "../services/common-dialogs.service";
import { CustomValidatorMessages, messagesForValidationError } from "./formfield-text";

@Component({
	selector: 'bg-formfield-markdown',
	host: {
		'class': "formfield",
		'[class.formfield-is-error]': "isErrorState",
		'[class.formfield-locked]': "isLockedState",
	},
	template: `

		<div class="markdowneditor">

			<div class="markdowneditor-x-editor">
				<div class="formfield">
					<label [attr.for]="inputName" *ngIf="label || includeLabelAsWrapper">
						{{ label }} <span *ngIf="optional">(OPTIONAL)</span>
						<span *ngIf="formFieldAside">{{ formFieldAside }}</span>
						<button type="button" *ngIf="isLockedState" (click)="unlock()">(unlock)</button>
						<ng-content select="[label-additions]"></ng-content>
					</label>

					<textarea
						autosize
						[name]="inputName"
						[ngStyle]="{'height.px':textHeight}"
						[id]="inputName"
						[formControl]="control"
						[placeholder]="placeholder || ''"
						(change)="postProcessInput()"
						(focus)="cacheControlState()"
						(keypress)="handleKeyPress($event)"
						*ngIf="!_preview"
						#textareaInput
					></textarea>
				</div>
			</div>

			<div class="markdowneditor-x-preview"
			     #markdownPreviewPane
			     [innerHTML]="control.value | MarkdownToHtml : {  
				gfm: false,
				tables: false,
				breaks: false,
				pedantic: false,
				sanitize: true,
				smartLists: true,
				smartypants: false
			}"
			     [ngStyle]="{'height.px':textHeight}"
			     *ngIf="_preview">Markdown preview
			</div>

			<div class="markdowneditor-x-tabbar">
				<div
					class="markdowneditor-x-tab markdowneditor-x-writebutton"
					[ngClass]="{'markdowneditor-x-tab-is-active':!_preview}"
					(click)="markdownPreview(false);">Write
				</div>
				<div
					class="markdowneditor-x-tab markdowneditor-x-previewbutton"
					[ngClass]="{'markdowneditor-x-tab-is-active':_preview}"
					(click)="markdownPreview(true);">Preview
				</div>
				<tooltip>
					<button class="trigger">Markdown Supported</button>
					<header></header>
					<content>
						<div class="markdowneditor">
							<div class="markdowneditor-x-display">
								<h1># This is an H1</h1>
								<h2>## This is an H2</h2>
								<h3>### This is an H3</h3>

								<p>
									_<em>These are italics</em>_
								</p>

								<p>
									**<strong>This is bold</strong>**
								</p>

								<p>
									[Link](<a href="javascript:void(0)">http://badgr.io/login</a>)
								</p>

								<ul>
									<li>Unordered (bulleted) list item1</li>
									<li>Unordered (bulleted) list item2</li>
								</ul>

								<ol>
									<li>Ordered (numbered) list item1</li>
									<li>Ordered (numbered) list item2</li>
								</ol>
							</div>
						</div>
					</content>
					<footer>
						<a href="//daringfireball.net/projects/markdown/basics" target="_blank">Learn More</a>
					</footer>
				</tooltip>
			</div>


		</div> 
		<p class="formfield-x-error" *ngIf="isErrorState">{{ errorMessageForDisplay }}</p>
		`
})
export class FormFieldMarkdown implements OnChanges, AfterViewInit {
	@Input() control: FormControl;
	@Input() initialValue: string;
	@Input() label: string;
	@Input() includeLabelAsWrapper: boolean = false; // includes label for layout purposes even if label text wasn't passed in.
	@Input() formFieldAside: string; // Displays additional text above the field. I.E (optional)
	@Input() errorMessage: CustomValidatorMessages;
	@Input() description: string;
	@Input() placeholder: string;
	@Input() optional: boolean = false;

	@Input() errorGroup: FormGroup;
	@Input() errorGroupMessage: CustomValidatorMessages;

	@Input() unlockConfirmText: string = "Unlocking this field may have unintended consequences. Are you sure you want to continue?";

	@Input() autofocus: boolean = false;

	@ViewChild("textareaInput") textareaInput: ElementRef;
	@ViewChild("markdownPreviewPane") markdownPreviewPane: ElementRef;

	textHeight: number;

	private _unlocked = false;
	_preview = false;

	@Input()
	set unlocked(unlocked: boolean) {
		this._unlocked = unlocked;
		this.updateDisabled();
	}

	get unlocked() { return this._unlocked }

	private _locked = false;
	@Input()
	set locked(locked: boolean) {
		this._locked = locked;
		this.updateDisabled();
	}

	get locked() { return this._locked }

	get inputElement(): HTMLTextAreaElement {
		if (this.textareaInput && this.textareaInput.nativeElement) {
			return this.textareaInput.nativeElement;
		}
		return null;
	}

	get hasFocus(): boolean {
		return document.activeElement === this.inputElement;
	}

	get errorMessageForDisplay(): string {
		return this.hasFocus ? this.cachedErrorMessage : this.uncachedErrorMessage;
	}

	get uncachedErrorMessage(): string {
		return messagesForValidationError(
			this.label,
			this.control && this.control.errors,
			this.errorMessage
		).concat(messagesForValidationError(
			this.label,
			this.errorGroup && this.errorGroup.errors,
			this.errorGroupMessage
		))[ 0 ]; // Only display the first error
	}

	get value() {
		return this.control.value;
	}

	private cachedErrorMessage = null;
	private cachedErrorState = null;
	private cachedDirtyState = null;

	get controlErrorState() { return this.control.dirty && (!this.control.valid || (this.errorGroup && !this.errorGroup.valid)) }

	get isErrorState() {
		if (this.hasFocus && this.cachedErrorState !== null) {
			return this.cachedErrorState;
		} else {
			return this.controlErrorState;
		}
	}

	get isLockedState() { return this.locked && !this.unlocked }

	private randomName = "field" + Math.random();

	get inputName() { return (this.label || this.placeholder || this.randomName).replace(/[^\w]+/g, "_").toLowerCase() }

	constructor(
		private dialogService: CommonDialogsService,
	) { }

	ngAfterViewInit() {
		if (this.autofocus) {
			this.focus();
		}
	}

	ngOnChanges(changes: SimpleChanges): any {
		// Unlocked by default when there is no value
		if (!this.control.value) {
			this.unlocked = true;
		}

		if ("initialValue" in changes) {
			const initialValue = changes[ "initialValue" ].currentValue;
			if ((this.value === null || this.value === undefined || this.value === '') &&
				(initialValue !== null && initialValue !== undefined && initialValue !== '')
			) {
				this.control.setValue(initialValue);
			}
		}

		this.updateDisabled();
	}

	markdownPreview(preview) {
		this.textHeight = (!preview)
			? this.markdownPreviewPane.nativeElement.offsetHeight
			: this.textareaInput.nativeElement.offsetHeight;
		this._preview = preview;
	}

	updateDisabled() {
		if (!this.control) {
			return;
		}

		if (this.isLockedState) {
			this.control.disable();
		} else {
			this.control.enable();
		}
	}

	unlock() {
		this.dialogService.confirmDialog.openResolveRejectDialog({
			dialogTitle: "Are you sure?",
			dialogBody: this.unlockConfirmText,
			resolveButtonLabel: "Continue",
			rejectButtonLabel: "Cancel",
		}).then(
			() => this.unlocked = true,
			() => void 0
		);
	}

	focus() {
		this.inputElement.focus();
	}

	select() {
		this.inputElement.select();
	}

	private cacheControlState() {
		this.cachedErrorMessage = this.uncachedErrorMessage;
		this.cachedDirtyState = this.control.dirty;
		this.cachedErrorState = this.controlErrorState;
	}

	private postProcessInput() {
	}

	private handleKeyPress(event: KeyboardEvent) {
		// This handles revalidating when hitting enter from within an input element. Ideally, we'd catch _all_ form submission
		// events, but since the form supresses those if things aren't valid, that doesn't really work. So we do this hack.
		if (event.keyCode === 13) {
			this.control.markAsDirty();
			this.cacheControlState();
		}
	}
}