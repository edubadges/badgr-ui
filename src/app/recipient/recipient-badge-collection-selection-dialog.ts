import { Component, ViewChild, AfterViewInit, ElementRef, Renderer, Renderer2 } from "@angular/core";
import { MessageService } from "../common/services/message.service";
import { registerDialog } from "dialog-polyfill/dialog-polyfill";
import "rxjs/add/observable/combineLatest";
import "rxjs/add/operator/first";
import { StringMatchingUtil } from "../common/util/string-matching-util";
import { SettingsService } from "../common/services/settings.service";
import { RecipientBadgeManager } from "./services/recipient-badge-manager.service";
import { RecipientBadgeInstance } from "./models/recipient-badge.model";
import { RecipientBadgeCollection } from "./models/recipient-badge-collection.model";
import { RecipientBadgeCollectionManager } from "./services/recipient-badge-collection-manager.service";
import { BaseDialog } from "../common/dialogs/base-dialog";

export interface RecipientBadgeCollectionSelectionDialogOptions {
	dialogId: string;
	dialogTitle:string;
	omittedCollection:RecipientBadgeInstance
}

@Component({
	selector: 'recipient-badge-collection-selection-dialog',
	template: `
			<dialog class="dialog dialog-large">
			<section class="l-overflowlist">

				<!-- Header and Search Area -->
				<header class="l-childrenvertical l-childrenvertical-is-smalldesktop bordered bordered-bottom">
					<h1 class="title">{{ dialogTitle }}</h1>
					<div class="l-childrenhorizontal l-childrenhorizontal-stackmobile">
						<input type="text"
						       class="search l-childrenhorizontal-x-offset"
						       placeholder="Filter your badges"
						       [(ngModel)]="searchQuery"/>
					</div>
				</header>

				<!-- Badge List -->
				<div class="l-overflowlist-x-list">
					<table class="table table-dialog" *bgAwaitPromises="[collectionListLoaded]">
						<thead>
							<tr>
								<th colspan="3">Collection</th>
							</tr>
						</thead>
						<tbody>
							<tr *ngFor="let collection of badgeCollectionsResults">
								<td class="table-x-input">
									<label htmlFor="collection-{{ collection.slug }}">
										<input type="checkbox"
											   #collectionsCheckbox
										       id="collection-{{ collection.slug }}"
										       name="collection-{{ collection.slug }}"
										       (change)="updateCollection(collection, collectionsCheckbox.checked)">
										<span class="formcheckbox-x-text">{{collection.name}}</span>
									</label>
								</td>
							</tr>
						</tbody>
					</table>
				</div>
				<footer class="bordered bordered-top">
					<section class="l-overflowlist-x-selected">
						<div>
							<p class="small"
			                    *ngIf="badgeCollectionsResults.length == 0">
								No Available Collections
							</p>
						</div>
					</section>
					<div class="l-childrenhorizontal l-childrenhorizontal-small l-childrenhorizontal-right">
						<button class="button button-primaryghost" (click)="cancelDialog()">Cancel</button>
						<button class="button" (click)="saveDialog()">Apply</button>
					</div>
				</footer>
			</section>
		</dialog>
		`
})
export class RecipientBadgeCollectionSelectionDialog extends BaseDialog {
	dialogId: string = "recipientBadgeCollectionSelection";
	dialogTitle: string = "Select Badges";

	collectionListLoaded: Promise<any>;
	badgeCollections: RecipientBadgeCollection[];
	badgeCollectionsResults:RecipientBadgeCollection[] = [];

	omittedCollection:RecipientBadgeInstance;
	selectedCollections:RecipientBadgeCollection[] = [];

	private resolveFunc: { (collection: RecipientBadgeCollection[]): void };
	private _searchQuery: string = "";
	get searchQuery() { return this._searchQuery; }

	set searchQuery(query) {
		this._searchQuery = query;
		this.updateResults();
	}

	constructor(
		componentElem: ElementRef,
		renderer: Renderer2,
		private badgeManager: RecipientBadgeManager,
		private recipientBadgeCollectionManager: RecipientBadgeCollectionManager,
		private messageService: MessageService,
		private settingsService: SettingsService
	) {
		super(componentElem, renderer);
	}

	openDialog(
		{ dialogId,
		  dialogTitle,
		  omittedCollection
		}: RecipientBadgeCollectionSelectionDialogOptions
	): Promise<RecipientBadgeCollection[]> {
		this.dialogId = dialogId;
		this.dialogTitle = dialogTitle;
		this.omittedCollection = omittedCollection;
		this.selectedCollections = [];
		this._searchQuery = "";

		this.showModal();
		this.updateData();

		return new Promise<RecipientBadgeCollection[]>((resolve, reject) => {
			this.resolveFunc = resolve;
		});
	}

	cancelDialog() {
		this.closeModal();
	}

	saveDialog() {
		this.closeModal();
		this.resolveFunc(this.selectedCollections);
	}

	updateData(){
		this.collectionListLoaded = this.recipientBadgeCollectionManager.recipientBadgeCollectionList.loadedPromise
			.then( r => {
				this.badgeCollections = r.entities;
				this.updateResults()
			})
			.catch(e => this.messageService.reportAndThrowError("Failed to load your badges", e));
	}

	updateCollection(checkedCollection:RecipientBadgeCollection, checked:boolean){
		if(checked){
			this.selectedCollections.push(checkedCollection)
		}
		else{
			this.selectedCollections = this.selectedCollections.filter(collection => {
				return collection.name != checkedCollection.name
			})
		}
	}

	private updateResults() {
		this.badgeCollectionsResults.length = 0;

		const addCollectionToResults = collection => {
			//only display the collections not currently associated with badge.
			if( this.omittedCollection.collections.has(collection)){
				return
			}

			this.badgeCollectionsResults.push(collection);
		}

		this.badgeCollections
			.filter(MatchingAlgorithm.collectionMatcher(this.searchQuery))
			.forEach(addCollectionToResults);

		this.applySorting();
	}

	applySorting() {

		const collectionSorter = (a:RecipientBadgeCollection, b: RecipientBadgeCollection) => {
			var aName = a.name.toLowerCase();
			var bName = b.name.toLowerCase();

			return aName == bName ? 0 : (aName < bName ? -1 : 1);
		};
		(this.badgeCollectionsResults || []).sort(collectionSorter);
	}
}

class MatchingAlgorithm {
	static collectionMatcher(inputPattern: string): (collection: RecipientBadgeCollection) => boolean {
		let patternStr = StringMatchingUtil.normalizeString(inputPattern);
		let patternExp = StringMatchingUtil.tryRegExp(patternStr);

		return collection => (
			StringMatchingUtil.stringMatches(collection.name, patternStr, patternExp)
		);
	}
}
