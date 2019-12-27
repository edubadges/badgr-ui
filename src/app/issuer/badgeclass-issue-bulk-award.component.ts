// import { Component } from "@angular/core";
// import { FormBuilder } from "@angular/forms";
// import { Router, ActivatedRoute } from "@angular/router";
// import { SessionService } from "../common/services/session.service";
// import { MessageService } from "../common/services/message.service";
// import { Title } from "@angular/platform-browser";
// import { BaseAuthenticatedRoutableComponent } from "../common/pages/base-authenticated-routable.component";
// import { IssuerManager } from "./services/issuer-manager.service";
// import { BadgeClass } from "./models/badgeclass.model";
// import { Issuer } from "./models/issuer.model";
// import { BadgeClassManager } from "./services/badgeclass-manager.service";


// export interface TransformedImportData {
// 	duplicateRecords:BulkIssueData[],
// 	validRowsTransformed:Set<BulkIssueData>,
// 	invalidRowsTransformed:Array<BulkIssueData>
// }

// export interface BulkIssueImportPreviewData{
// 	columnHeaders:ColumnHeaders[],
// 	invalidRows:string[][],
// 	rowLongerThenHeader:boolean,
// 	rows:string[],
// 	validRows:string[][]
// }

// export interface BulkIssueData{
// 	email:string,
// 	evidence:string
// }

// export type DestSelectOptions = "email" | "evidence" | "NA";

// export type ViewState = "import" | "importPreview" | "importError" | "importConformation" | "cancel" | "exit";

// export interface ColumnHeaders{
// 	destColumn: DestSelectOptions,
// 	sourceName: string
// }

// @Component({
// 	selector: 'Badgeclass-issue-bulk-award',
// 	template: `
// 		<main *bgAwaitPromises="[issuerLoaded, badgeClassLoaded]">
// 			<form-message></form-message>
// 			<!-- Breadcrumb -->
// 			<header class="wrap wrap-light l-containerhorizontal l-heading">
// 				<nav>
// 					<h1 class="visuallyhidden">Breadcrumbs</h1>
// 					<ul class="breadcrumb">
// 						<li><a [routerLink]="['/issuer']">Issuers</a></li>
// 						<li><a [routerLink]="['/issuer/issuers', issuerSlug]">{{issuer.name}}</a></li>
// 						<li><a [routerLink]="['/issuer/issuers', issuerSlug, 'badges', badge_class.slug]" [truncatedText]="badge_class.name" [maxLength]="64"></a></li>
// 						<li class="breadcrumb-x-current">Bulk Award Badge</li>
// 					</ul>
// 				</nav>
// 				<div class="heading">
// 					<div class="heading-x-text">
// 						<h1>Bulk Award</h1>
// 					</div>
// 				</div>
// 			</header>
			
// 			<Badgeclass-issue-bulk-award-import
// 				*ngIf ="viewState == 'import'"
// 				(importPreviewDataEmitter) = onBulkIssueImportPreviewData($event)
// 				(updateStateEmitter) = updateViewState($event)>
// 			</Badgeclass-issue-bulk-award-import>

// 			<Badgeclass-issue-bulk-award-preview
// 				*ngIf ="viewState == 'importPreview'"
// 				[importPreviewData] = "importPreviewData"
// 				(transformedImportDataEmitter) = onTransformedImportData($event)
// 				(updateStateEmitter) = updateViewState($event)>
// 			</Badgeclass-issue-bulk-award-preview>

// 			<Badgeclass-issue-bulk-award-conformation
// 				*ngIf ="viewState == 'importConformation'"
// 				[transformedImportData] = "transformedImportData"
// 				(updateStateEmitter) = updateViewState($event)
// 				[badgeSlug]="badgeSlug"
// 				[issuerSlug]="issuerSlug">
// 			</Badgeclass-issue-bulk-award-conformation>

// 			<Badgeclass-issue-bulk-award-error
// 				*ngIf ="viewState == 'importError'"
// 				[transformedImportData] = "transformedImportData"
// 				(updateStateEmitter) = updateViewState($event)>
// 			</Badgeclass-issue-bulk-award-error>

// 		</main>
// 	`,
// })

// export class BadgeClassIssueBulkAwardComponent extends BaseAuthenticatedRoutableComponent{
// 	importPreviewData:BulkIssueImportPreviewData;
// 	transformedImportData:TransformedImportData;
// 	viewState:ViewState;
// 	badge_class: BadgeClass;
// 	badgeClassLoaded: Promise<any>;

// 	issuer: Issuer;
// 	issuerLoaded: Promise<any>;

// 	constructor (
// 		protected badgeClassManager: BadgeClassManager,
// 		protected formBuilder: FormBuilder,
// 		protected issuerManager: IssuerManager,
// 		protected sessionService: SessionService,
// 		protected messageService: MessageService,
// 		protected router: Router,
// 		protected route: ActivatedRoute,
// 		protected title: Title
// 	)
// 	{
// 		super(router, route, sessionService);

// 		this.updateViewState("import");

// 		this.issuerLoaded = this.issuerManager.issuerBySlug(this.issuerSlug).then((issuer) => {
// 			this.issuer = issuer;
// 			this.badgeClassLoaded = this.badgeClassManager.badgeByIssuerUrlAndSlug(
// 				issuer.issuerUrl,
// 				this.badgeSlug
// 			).then((badge_class) => {
// 				this.badge_class = badge_class;
// 				this.title.setTitle("Bulk Award Badge - " + badge_class.name + " - Badgr");
// 			});
// 		})
// 	}

// 	onBulkIssueImportPreviewData(importPreviewData:BulkIssueImportPreviewData){
// 		this.importPreviewData = importPreviewData;
// 		this.updateViewState('importPreview');
// 	}

// 	onTransformedImportData(transformedImportData){
// 		this.transformedImportData = transformedImportData;

// 		// Determine if the transformed data contains any errors
// 		this.transformedImportData && transformedImportData.invalidRowsTransformed.length
// 			? this.updateViewState('importError')
// 			: this.updateViewState("importConformation");
// 	}

// 	updateViewState(state:ViewState){
// 		if(state == "cancel") {
// 			this.navigateToIssueBadgeInstance();
// 			return;
// 		}
// 		this.viewState = state;
// 	}

// 	get issuerSlug() {
// 		return this.route.snapshot.params['issuerSlug'];
// 	}

// 	get badgeSlug() {
// 		return this.route.snapshot.params['badgeSlug'];
// 	}

// 	navigateToIssueBadgeInstance(){
// 		this.router.navigate(
// 			['/issuer/issuers', this.issuer.slug,"badges",this.badgeSlug]
// 		);
// 	}

// 	createRange(size:number){
// 		let items: string[] = [];
// 		for(var i = 1; i <= size; i++){
// 			items.push("");
// 		}
// 		return items;
// 	}
// }
