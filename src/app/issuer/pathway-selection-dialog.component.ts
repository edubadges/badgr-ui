import { Component, ViewChild, AfterViewInit, ElementRef, Renderer, Renderer2 } from "@angular/core";


import { MessageService } from "../common/services/message.service";
import { registerDialog } from "dialog-polyfill/dialog-polyfill";
import "rxjs/add/observable/combineLatest";
import "rxjs/add/operator/first";
import { LearningPathway, IssuerPathways } from "./models/pathway.model";
import { PathwayManager } from "./services/pathway-manager.service";
import { StringMatchingUtil } from "../common/util/string-matching-util";
import { BaseDialog } from "../common/dialogs/base-dialog";


export interface PathwaySelectionDialogOptions {
	dialogId: string;
	dialogTitle: string;

	multiSelectMode: boolean;
	issuerSlug: string;

	selectedPathways?: LearningPathway[];
}

type PathwaySortBy = "name" | "newest-first" | "oldest-first";

@Component({
	selector: 'pathway-selection-dialog',
	template: `
		<dialog class="dialog dialog-large">

		<section class="l-overflowlist">
	
			<!-- Header and Search Area -->
			<header class="l-childrenvertical l-childrenvertical-is-smalldesktop bordered bordered-bottom">
				<h1 class="title">{{ dialogTitle }}</h1>
				<input type="text"
				       class="search"
				       placeholder="Search pathways"
				       [(ngModel)]="searchQuery"
				/>
			</header>
	
			<!-- Pathway List -->
			<div class="l-overflowlist-x-list">
	
					<table class="table table-dialog" [class.table-aligntop]="pathwayResults.length > 0">
						<thead>
							<tr>
								<th colspan="2">Pathways</th>
							</tr>
						</thead>
						<tbody>
							<tr *ngFor="let pathway of pathwayResults">
								<td class="table-x-input">
										<input class="checklist"
										       type="checkbox"
										       [id]="'pathway-check-' + pathway.url"
										       #pathwayCheckbox
										       [checked]="selectedPathways.has(pathway)"
										       (change)="updatePathwaySelection(pathway, pathwayCheckbox.checked)"
										       *ngIf="multiSelectMode"
										/>
										<input class="checklist checklist-radio"
										       type="radio"
										       [id]="'pathway-check-' + pathway.url"
										       #pathwayRadio
										       [checked]="selectedPathways.has(pathway)"
										       (change)="updatePathwaySelection(pathway, pathwayRadio.checked)"
										       name="pathway-selection-radio"
										       *ngIf="! multiSelectMode"
										/>
										<label htmlFor="pathway-check-{{ pathway.url }}">{{ pathway.name }}</label>
								</td>
								<td class="table-x-span">
									<label htmlFor="pathway-check-{{ pathway.url }}"
												 class="stack stack-list table-x-padded table-x-stack"
									>
									  <span class="stack-x-text">
									    <h2>{{ pathway.name }}</h2>
									    <small>{{pathway.description}}</small>
									  </span>
									</label>
								</td>
							</tr>
							<tr *ngIf="pathwayResults.length < 1">
								<td class="table-x-padded">No pathways matching your query.</td>
							</tr>
						</tbody>
					</table>
	
			</div>
	
			<!-- Selected Pathways and Buttons -->
			<footer class="bordered bordered-top">
	
				<section class="l-overflowlist-x-selected"
				         *ngIf="multiSelectMode"
				>
					<h1 class="title title-small-3x">Selected Pathways</h1>
					<div>
	
						<div class="selecteditem"
						     *ngFor="let selectedPathway of selectedPathways"
						>
							<span>{{ selectedPathway.name }}</span>
							<button (click)="updatePathwaySelection(selectedPathway, false)">Unselect Pathway</button>
						</div>
	
						<p class="small"
							 *ngIf="selectedPathways.size == 0">
							No Selected Pathways
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
export class PathwaySelectionDialog extends BaseDialog {
	dialogId: string = "pathwayDialog";
	dialogTitle: string = "Select Pathways";

	multiSelectMode: boolean = false;
	issuerSlug: string = null;

	private selectedPathways = new Set<LearningPathway>();
	private resolveFunc: { (pathways: LearningPathway[]): void };

	maxDisplayedResults = 100;
	pathwayResults: LearningPathway[] = [];

	allPathways: LearningPathway[];

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
		private pathwayManager: PathwayManager,
		private messageService: MessageService
	) {
		super(componentElem, renderer);
	}

	openDialog(
		{
			dialogId,
			issuerSlug,
			dialogTitle = "Select Pathways",
			multiSelectMode = true,
			selectedPathways = []
		}: PathwaySelectionDialogOptions
	): Promise<LearningPathway[]> {
		this.showModal();
		this._searchQuery = "";

		this.dialogId = dialogId;
		this.dialogTitle = dialogTitle;

		this.multiSelectMode = multiSelectMode;
		this.issuerSlug = issuerSlug;

		this.selectedPathways = new Set<LearningPathway>(selectedPathways);

		this.updateData();

		return new Promise<LearningPathway[]>((resolve, reject) => {
			this.resolveFunc = resolve;
		});
	}

	cancelDialog() {
		this.closeModal();
	}

	saveDialog() {
		this.closeModal();
		this.resolveFunc(Array.from(this.selectedPathways.values()));
	}

	updatePathwaySelection(learningPathway: LearningPathway, select: boolean) {
		if (select) {
			this.selectedPathways.add(learningPathway);
		} else {
			this.selectedPathways.delete(learningPathway);
		}
	}

	private updateData() {
		this.pathwayManager.loadPathwaysForIssuer(this.issuerSlug).then(
			pathways => this.updatePathways(pathways),
			failure => this.messageService.reportAndThrowError(
				"Failed to load pathway list", failure
			)
		);
	}

	private updatePathways(
		pathways: IssuerPathways
	) {
		this.loadedData = true;

		this.allPathways = pathways.entities;

		this.updateResults();
	}

	private updateResults() {
		// Clear Results
		this.pathwayResults.length = 0;

		this.allPathways
			.filter(MatchingAlgorithm.pathwayMatcher(this.searchQuery))
			.forEach(p => this.pathwayResults.push(p));
	}
}


class MatchingAlgorithm {
	static pathwayMatcher(inputPattern: string): (pathway: LearningPathway) => boolean {
		let patternStr = StringMatchingUtil.normalizeString(inputPattern);
		let patternExp = StringMatchingUtil.tryRegExp(patternStr);

		return pathway => (
			StringMatchingUtil.stringMatches(pathway.slug, patternStr, patternExp) ||
			StringMatchingUtil.stringMatches(pathway.name, patternStr, patternExp) ||
			StringMatchingUtil.stringMatches(pathway.description, patternStr, patternExp)
		);
	}
}