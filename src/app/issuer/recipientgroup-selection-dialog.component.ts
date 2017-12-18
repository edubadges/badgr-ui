import { Component, ViewChild, AfterViewInit, ElementRef, Renderer, Renderer2 } from "@angular/core";


import { MessageService } from "../common/services/message.service";
import { registerDialog } from "dialog-polyfill/dialog-polyfill";
import "rxjs/add/observable/combineLatest";
import "rxjs/add/operator/first";
import { RecipientGroup, IssuerRecipientGroups } from "./models/recipientgroup.model";
import { RecipientGroupManager } from "./services/recipientgroup-manager.service";
import { StringMatchingUtil } from "../common/util/string-matching-util";
import { BaseDialog } from "../common/dialogs/base-dialog";


export interface RecipientGroupSelectionDialogOptions {
	dialogId: string;
	dialogTitle: string;

	multiSelectMode: boolean;
	issuerSlug: string;

	selectedRecipientGroups?: RecipientGroup[];
	omittedRecipientGroups?: RecipientGroup[];
}

@Component({
	selector: 'recipientgroup-selection-dialog',
	template: `
		<dialog class="dialog">

			<section class="l-overflowlist">
				<!-- Header and Search Area -->
				<header class="l-childrenvertical l-childrenvertical-is-smalldesktop bordered bordered-bottom">
					<h1 class="title">{{ dialogTitle }}</h1>
					<div class="l-childrenhorizontal l-childrenhorizontal-stackmobile">
						<input type="text"
						       class="search l-childrenhorizontal-x-offset"
						       placeholder="Search Groups"
						       [(ngModel)]="searchQuery"
						/>
					</div>
				</header>
		
				<!-- RecipientGroup List -->
				<div class="l-overflowlist-x-list">
					<table class="table table-dialog">
						<thead>
							<tr>
								<th colspan="2">Group</th>
							</tr>
						</thead>
						<tbody>
							<tr *ngIf="recipientGroupResults.length < 1">
								<td class="table-x-padded">No recipient groups matching your query.</td>
							</tr>
							<tr *ngFor="let recipientGroup of recipientGroupResults">
								<td class="table-x-input">
									<input class="checklist"
									       type="checkbox"
									       [id]="'recipientGroup-check-' + recipientGroup.url"
									       #recipientGroupCheckbox
									       [checked]="selectedRecipientGroups.has(recipientGroup)"
									       (change)="updateRecipientGroupSelection(recipientGroup, recipientGroupCheckbox.checked)"
									       *ngIf="multiSelectMode"
									/>
									<input class="checklist checklist-radio"
									       type="radio"
									       [id]="'recipientGroup-check-' + recipientGroup.url"
									       #recipientGroupRadio
									       [checked]="selectedRecipientGroups.has(recipientGroup)"
									       (change)="updateRecipientGroupSelection(recipientGroup, recipientGroupRadio.checked)"
									       name="recipientGroup-selection-radio"
									       *ngIf="! multiSelectMode"
									/>
									<label htmlFor="recipientGroup-check-{{ recipientGroup.url }}">{{ recipientGroup.name }}</label>
								</td>
								<td>
									<label htmlFor="recipientGroup-check-{{ recipientGroup.url }}"
												 class="stack stack-list table-x-padded table-x-stack"
									>
										<span class="stack-x-text">
										  <span class="stack-x-title">{{ recipientGroup.name }}</span>
										</span>
									</label>
								</td>
							</tr>
						</tbody>
					</table>
				</div>
		
				<!-- Selected RecipientGroups and Buttons -->
				<footer class="bordered bordered-top">
					<section class="l-overflowlist-x-selected"
					         *ngIf="multiSelectMode"
					>
						<h1 class="title title-small-3x">Selected Recipient Groups</h1>
						<div>
							<div class="selecteditem"
							     *ngFor="let selectedRecipientGroup of selectedRecipientGroups"
							>
								{{ selectedRecipientGroup.name }}
								<button (click)="updateRecipientGroupSelection(selectedRecipientGroup, false)">Unselect Recipient Group</button>
							</div>
		
							<p class="small"
								 *ngIf="selectedRecipientGroups.size == 0"
							>
								No Selected Recipient Groups
							</p>
						</div>
					</section>
					<div class="l-childrenhorizontal l-childrenhorizontal-small l-childrenhorizontal-right">
						<button class="button button-primaryghost" (click)="cancelDialog()">Cancel</button>
						<button class="button" (click)="saveDialog()">Save Changes</button>
					</div>
				</footer>
			</section>
		</dialog>
	`,

})
export class RecipientGroupSelectionDialog extends BaseDialog {
	dialogId: string = "recipientGroupDialog";
	dialogTitle: string = "Select RecipientGroups";

	multiSelectMode: boolean = false;
	issuerSlug: string = null;

	private selectedRecipientGroups = new Set<RecipientGroup>();
	private resolveFunc: { (recipientGroups: RecipientGroup[]): void };

	maxDisplayedResults = 100;
	recipientGroupResults: RecipientGroup[] = [];

	allRecipientGroups: RecipientGroup[];
	omittedRecipientGroups: RecipientGroup[];

	hasMultipleIssuers: boolean = true;

	private _searchQuery: string = "";
	get searchQuery() { return this._searchQuery; }

	set searchQuery(query) {
		this._searchQuery = query;
		this.updateResults();
	}

	private loadedData = false;

	constructor(
		componentElem: ElementRef,
		renderer: Renderer2,
		private recipientGroupManager: RecipientGroupManager,
		private messageService: MessageService
	) {
		super(componentElem, renderer);
	}

	openDialog(
		{
			dialogId,
			issuerSlug,
			dialogTitle = "Select RecipientGroups",
			multiSelectMode = true,
			selectedRecipientGroups = [],
			omittedRecipientGroups = []
		}: RecipientGroupSelectionDialogOptions
	): Promise<RecipientGroup[]> {
		this.showModal();
		this._searchQuery = "";

		this.dialogId = dialogId;
		this.dialogTitle = dialogTitle;

		this.multiSelectMode = multiSelectMode;
		this.issuerSlug = issuerSlug;

		this.omittedRecipientGroups = omittedRecipientGroups || [];

		this.selectedRecipientGroups = new Set<RecipientGroup>(selectedRecipientGroups);

		this.updateData();

		return new Promise<RecipientGroup[]>((resolve, reject) => {
			this.resolveFunc = resolve;
		});
	}

	cancelDialog() {
		this.closeModal();
	}

	saveDialog() {
		this.closeModal();
		this.resolveFunc(Array.from(this.selectedRecipientGroups.values()));
	}

	updateRecipientGroupSelection(learningRecipientGroup: RecipientGroup, select: boolean) {
		if (select) {
			this.selectedRecipientGroups.add(learningRecipientGroup);
		} else {
			this.selectedRecipientGroups.delete(learningRecipientGroup);
		}
	}

	private updateData() {
		this.recipientGroupManager.loadRecipientGroupsForIssuer(this.issuerSlug).then(
			recipientGroups => this.updateRecipientGroups(recipientGroups),
			failure => this.messageService.reportAndThrowError(
				"Failed to load recipient group list", failure
			)
		);
	}

	private updateRecipientGroups(
		recipientGroups: IssuerRecipientGroups
	) {
		this.loadedData = true;

		this.allRecipientGroups = recipientGroups.entities
			.filter(g => this.omittedRecipientGroups.indexOf(g) === -1);

		this.updateResults();
	}

	private updateResults() {
		// Clear Results
		this.recipientGroupResults.length = 0;

		this.allRecipientGroups
			.filter(MatchingAlgorithm.recipientGroupMatcher(this.searchQuery))
			.forEach(p => this.recipientGroupResults.push(p));
	}
}


class MatchingAlgorithm {
	static recipientGroupMatcher(inputPattern: string): (recipientGroup: RecipientGroup) => boolean {
		let patternStr = StringMatchingUtil.normalizeString(inputPattern);
		let patternExp = StringMatchingUtil.tryRegExp(patternStr);

		return recipientGroup => (
			StringMatchingUtil.stringMatches(recipientGroup.slug, patternStr, patternExp) ||
			StringMatchingUtil.stringMatches(recipientGroup.name, patternStr, patternExp) ||
			StringMatchingUtil.stringMatches(recipientGroup.description, patternStr, patternExp)
		);
	}
}