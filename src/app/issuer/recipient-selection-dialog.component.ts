import { Component, ViewChild, AfterViewInit, ElementRef, Renderer, Renderer2 } from "@angular/core";


import { MessageService } from "../common/services/message.service";
import { Observable } from "rxjs/Observable";
import { registerDialog } from "dialog-polyfill/dialog-polyfill";
import "rxjs/add/observable/combineLatest";
import "rxjs/add/operator/first";
import { StringMatchingUtil } from "../common/util/string-matching-util";
import {
	RecipientGroupMember, IssuerRecipientGroups,
	RecipientGroup
} from "./models/recipientgroup.model";
import { RecipientGroupManager } from "./services/recipientgroup-manager.service";
import { SettingsService } from "../common/services/settings.service";
import { RecipientGroupMemberUrl, RecipientGroupUrl } from "./models/recipientgroup-api.model";
import { flatten } from "../common/util/array-reducers";
import { BaseDialog } from "../common/dialogs/base-dialog";


export interface RecipientSelectionDialogOptions {
	dialogId: string;
	dialogTitle: string;
	
	issuerSlug: string;

	excludedGroupUrls: RecipientGroupUrl[];
	excludedMemberEmails: string[];

	multiSelectMode: boolean;
	restrictToGroupId?: string;
	selectedRecipients?: RecipientGroupMember[];
}

type RecipientSortBy = "name";

export interface RecipientSelectionDialogSettings {
	groupByGroup: boolean;
	recipientSortBy: RecipientSortBy;
}

@Component({
	selector: 'recipient-selection-dialog',
	template: `
		<dialog class="dialog dialog-large">
		
			<section class="l-overflowlist">
				<!-- Header and Search Area -->
				<header class="l-childrenvertical l-childrenvertical-is-smalldesktop bordered bordered-bottom">
					<h1 class="title">{{ dialogTitle }}</h1>
					<div class="l-childrenhorizontal l-childrenhorizontal-stackmobile">
						<input type="text"
						       class="search l-childrenhorizontal-x-offset"
						       placeholder="Filter recipients"
						       [(ngModel)]="searchQuery"
						/>
					</div>
				</header>
		
				<!-- Recipient List -->
				<div class="l-overflowlist-x-list">
		
						<table class="table table-dialog" *bgAwaitPromises="[ recipientsPromise ]">
							<thead>
								<tr>
									<th colspan="2">Import Existing Recipients</th>
									<th><span class="table-x-issued hidden hidden-is-tablet">Group</span></th>
								</tr>
							</thead>
							<tbody>
								<tr *ngIf="recipientResults.length < 1">
									<td class="table-x-padded"
											*ngIf="hasMultipleGroups"
											colspan="2"
									>
										No non-enrolled recipients or groups match your query.
									</td>
									<td class="table-x-padded"
											*ngIf="! hasMultipleGroups"
											colspan="2"
									>
										No non-enrolled recipients match your query
									</td>
									<td></td>
								</tr>
								<tr *ngFor="let result of recipientResults">
									<td class="table-x-input">
										<input class="checklist"
										       type="checkbox"
										       id="recipient-check-{{ result.recipient.url }}"
										       #recipientCheckbox
										       [checked]="selectedRecipients.has(result.recipient)"
										       (change)="updateRecipientSelection(result.recipient, recipientCheckbox.checked)"
										       *ngIf="multiSelectMode"
										/>
										<input class="checklist checklist-radio"
										       type="radio"
										       id="recipient-check-{{ result.recipient.url }}"
										       #recipientRadio
										       [checked]="selectedRecipients.has(result.recipient)"
										       (change)="updateRecipientSelection(result.recipient, recipientRadio.checked)"
										       name="recipient-selection-radio"
										       *ngIf="! multiSelectMode"
										/>
										<label htmlFor="recipient-check-{{ result.recipient.url }}">{{ result.recipient.memberName }}</label>
									</td>
									<td class="table-x-padded">
										<label htmlFor="recipient-check-{{ result.recipient.url }}"
													 class="stack stack-list table-x-stack"
										>
											<span class="stack-x-text">
												<span class="stack-x-title">{{ result.recipient.memberName }}</span>
												<small>{{ result.recipient.memberEmail }}</small>
											</span>
										</label>
									</td>
									<td class="table-x-padded"><span class="small hidden hidden-is-tablet">{{ result.group?.name || "Unknown Group" }}</span></td>
								</tr>
							</tbody>
						</table>
		
				</div>
		
				<!-- Selected Recipients and Buttons -->
				<footer class="bordered bordered-top">
					<section class="l-overflowlist-x-selected"
					         *ngIf="multiSelectMode"
					>
						<h1 class="title title-small-3x">Recipient(s) to be imported</h1>
						<div>
		
							<div class="selecteditem"
							     *ngFor="let selectedRecipient of selectedRecipients"
							>
								<span>{{ selectedRecipient.memberName }}</span>
								<button (click)="updateRecipientSelection(selectedRecipient, false)">Unselect Recipient</button>
							</div>
		
							<p class="small"
								 *ngIf="selectedRecipients.size == 0"
							>
								No Selected Recipients
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
export class RecipientSelectionDialog extends BaseDialog {
	dialogId: string = "recipientDialog";
	dialogTitle: string = "Select Recipients";
	
	issuerSlug: string;
	excludedGroupUrls: RecipientGroupUrl[];
	excludedMemberEmails: string[];

	multiSelectMode: boolean = false;
	restrictToGroupUrl: string = null;

	recipientsPromise: Promise<any>;

	private selectedRecipients = new Set<RecipientGroupMember>();
	private resolveFunc: { (recipients: RecipientGroupMember[]): void };

	maxDisplayedResults = 100;
	recipientResults: RecipientResult[] = [];
	groupResults: MatchingGroupRecipients[] = [];

	allRecipientGroups: RecipientGroup[];

	hasMultipleGroups: boolean = true;

	private _searchQuery: string = "";
	get searchQuery() { return this._searchQuery; }

	set searchQuery(query) {
		this._searchQuery = query;
		this.updateResults();
	}

	get isRestrictedToSingleGroup(): boolean {
		return !!this.restrictToGroupUrl;
	}

	static defaultSettings: RecipientSelectionDialogSettings = {
		groupByGroup: true,
		recipientSortBy: "name"
	};
	settings: RecipientSelectionDialogSettings = Object.assign({}, RecipientSelectionDialog.defaultSettings);

	get recipientSortBy() { return this.settings.recipientSortBy; }

	set recipientSortBy(recipientSortBy: RecipientSortBy) {
		this.settings.recipientSortBy = recipientSortBy || "name";
		this.applySorting();
		this.saveSettings();
	}

	get groupByGroup() { return this.settings.groupByGroup }

	set groupByGroup(value: boolean) {
		this.settings.groupByGroup = value;
		this.saveSettings();
	}

	private loadedData = false;

	constructor(
		componentElem: ElementRef,
		renderer: Renderer2,
		private recipientManager: RecipientGroupManager,
		private messageService: MessageService,
		private settingsService: SettingsService
	) {
		super(componentElem, renderer);
	}

	openDialog(
		{
			dialogId,
			dialogTitle = "Select Recipients",
			multiSelectMode = true,
			restrictToGroupId = null,
			selectedRecipients = [],
			excludedGroupUrls = [],
			excludedMemberEmails = [],
			issuerSlug
		}: RecipientSelectionDialogOptions
	): Promise<RecipientGroupMember[]> {
		this.showModal();
		this._searchQuery = "";

		this.dialogId = dialogId;
		this.dialogTitle = dialogTitle;
		this.multiSelectMode = multiSelectMode;
		this.restrictToGroupUrl = restrictToGroupId;

		this.selectedRecipients = new Set<RecipientGroupMember>(selectedRecipients);
		this.issuerSlug = issuerSlug;
		this.excludedGroupUrls = excludedGroupUrls;
		this.excludedMemberEmails = excludedMemberEmails;

		this.loadSettings();
		this.updateData();

		return new Promise<RecipientGroupMember[]>((resolve, reject) => {
			this.resolveFunc = resolve;
		});
	}

	cancelDialog() {
		this.closeModal();
	}

	saveDialog() {
		this.closeModal();
		this.resolveFunc(Array.from(this.selectedRecipients.values()));
	}

	updateRecipientSelection(member: RecipientGroupMember, select: boolean) {
		if (select) {
			this.selectedRecipients.add(member);
		} else {
			this.selectedRecipients.delete(member);
		}
	}

	private loadSettings() {
		this.settings = this.settingsService.loadSettings(this.dialogId, RecipientSelectionDialog.defaultSettings);
	}

	private saveSettings() {
		this.settingsService.saveSettings(this.dialogId, this.settings);
	}

	private updateData() {
		this.recipientsPromise = this.recipientManager.loadRecipientGroupsForIssuer(this.issuerSlug)
			.then(groups => groups.allDetailsLoadedPromise)
			.then(
				groups => this.updateRecipients(groups),
				failure => this.messageService.reportAndThrowError(
					"Failed to load all issuer recipient groups", failure
				)
			);
	}

	private updateRecipients(
		issuerGroups: IssuerRecipientGroups
	) {
		this.loadedData = true;

		this.allRecipientGroups = issuerGroups.entities
			.filter(group => group.members.entities
				.filter(m => this.excludedMemberEmails.indexOf(m.memberEmail) < 0)
				.length > 0
			)
			.filter(group => this.excludedGroupUrls.indexOf(group.url) < 0)
		;

		this.hasMultipleGroups = ! this.restrictToGroupUrl && this.allRecipientGroups.length > 1;

		this.updateResults();
	}

	private updateResults() {
		// Clear Results
		this.recipientResults.length = 0;
		this.groupResults.length = 0;

		let groupResultsByGroup: {[groupUrl: string]: MatchingGroupRecipients} = {};
		let addedRecipientIds = new Set<RecipientGroupMemberUrl>();

		const addRecipientToResults = (recipient: RecipientGroupMember) => {
			if (addedRecipientIds.has(recipient.url)) {
				return;
			} else {
				addedRecipientIds.add(recipient.url);
			}

			if (this.excludedMemberEmails.indexOf(recipient.memberEmail) >= 0) {
				return;
			}

			// Restrict Length
			if (this.recipientResults.length > this.maxDisplayedResults) {
				return false;
			}

			// Restrict to group
			if (this.restrictToGroupUrl && recipient.group.url != this.restrictToGroupUrl) {
				return false;
			}

			let groupResults = groupResultsByGroup[ recipient.group.url ];
			if (! groupResults) {
				groupResults = groupResultsByGroup[ recipient.group.url ] = new MatchingGroupRecipients(
					recipient.group
				);
				this.groupResults.push(groupResults);
			}

			groupResults.addRecipient(recipient);


			if (!this.recipientResults.find(r => r.recipient == recipient)) {
				this.recipientResults.push(new RecipientResult(recipient, groupResults.group));
			}

			return true;
		};

		const addGroupToResults = (group: RecipientGroup) => {
			group.members.entities.forEach(addRecipientToResults);
		};

		this.allRecipientGroups
			.filter(MatchingAlgorithm.groupMatcher(this.searchQuery))
			.forEach(addGroupToResults);

		(this.allRecipientGroups.map(g=>g.members.entities).reduce(flatten<RecipientGroupMember>(), []))
			.filter(MatchingAlgorithm.recipientMatcher(this.searchQuery))
			.forEach(addRecipientToResults);

		this.applySorting();
	}

	applySorting() {
		const recipientSorter = (a: RecipientGroupMember, b: RecipientGroupMember) => {
			if (this.recipientSortBy === "name") {
				var aName = a.memberName.toLowerCase();
				var bName = b.memberName.toLowerCase();

				return aName == bName ? 0 : (aName < bName ? -1 : 1);
			}
		};

		(this.recipientResults || []).sort((a, b) => recipientSorter(a.recipient, b.recipient));
		(this.groupResults || []).forEach(i => i.recipients.sort(recipientSorter));
	}
}

class RecipientResult {
	constructor(
		public recipient: RecipientGroupMember,
		public group: RecipientGroup
	) {}
}

class MatchingGroupRecipients {
	constructor(
		public group: RecipientGroup,
		public recipients: RecipientGroupMember[] = []
	) {}

	addRecipient(recipient: RecipientGroupMember) {
		if (recipient.group == this.group) {
			if (this.recipients.indexOf(recipient) < 0) {
				this.recipients.push(recipient);
			}
		}
	}
}

class MatchingAlgorithm {
	static groupMatcher(inputPattern: string): (group: RecipientGroup) => boolean {
		let patternStr = StringMatchingUtil.normalizeString(inputPattern);
		let patternExp = StringMatchingUtil.tryRegExp(patternStr);

		return group => (
			StringMatchingUtil.stringMatches(group.slug, patternStr, patternExp) ||
			StringMatchingUtil.stringMatches(group.name, patternStr, patternExp) ||
			StringMatchingUtil.stringMatches(group.description, patternStr, patternExp)
		);
	}

	static recipientMatcher(inputPattern: string): (recipient: RecipientGroupMember) => boolean {
		let patternStr = StringMatchingUtil.normalizeString(inputPattern);
		let patternExp = StringMatchingUtil.tryRegExp(patternStr);

		return recipient => (
			StringMatchingUtil.stringMatches(recipient.slug, patternStr, patternExp) ||
			StringMatchingUtil.stringMatches(recipient.memberEmail, patternStr, patternExp) ||
			StringMatchingUtil.stringMatches(recipient.memberName, patternStr, patternExp)
		);
	}
}