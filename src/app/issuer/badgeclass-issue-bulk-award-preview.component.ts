// import { Component, Input, Output, EventEmitter } from "@angular/core";
// import { FormBuilder } from "@angular/forms";
// import { Router, ActivatedRoute } from "@angular/router";
// import { SessionService } from "../common/services/session.service";
// import { MessageService } from "../common/services/message.service";
// import { Title } from "@angular/platform-browser";
// import { BaseAuthenticatedRoutableComponent } from "../common/pages/base-authenticated-routable.component";

// import { BulkIssueData,
// 	     BulkIssueImportPreviewData,
// 		 DestSelectOptions,
// 		 TransformedImportData,
// 		 ViewState } from "./badgeclass-issue-bulk-award.component"

// @Component({
// 	selector: 'Badgeclass-issue-bulk-award-preview',
// 	template:`
// 		<section class="wrap l-containerhorizontal">
// 			<div class="select-csvUpload">
// 				<div class="importHeading">
// 				  <h1 class=title>Map CSV Columns</h1>
// 				  <p *ngIf="importPreviewData?.rows">
// 				    Below is a preview of the first {{ (importPreviewData.rows.length < MAX_ROWS_TO_DISPLAY) ? importPreviewData.rows.length : MAX_ROWS_TO_DISPLAY}}
// 				     of {{importPreviewData.rows.length}} rows in your file.

// 					  For each column in the table below, choose the heading from the dropdown that matches the data in your CSV.
// 				  </p>
// 				</div>
// 				<table class="table table-import">
// 					<thead>
// 						<tr>
// 							<th scope="col" *ngFor="let columnHeaderName of importPreviewData.columnHeaders; let columnId = index;">
// 								<label class="select select-inputonly select-import">
// 									<span>Sort by</span>
// 									<select name="select"
// 											[id]= "'select'+columnId"
// 											#selectDest
// 											[value] = columnHeaderName.destColumn
// 											(change)="mapDestNameToSourceName(columnId,selectDest.value)">
// 										<option value="NA">N/A</option>
// 										<option value="email">Email</option>
// 										<option value="evidence">Evidence URL</option>
// 									</select>
// 								</label>
// 							</th>
// 						</tr>
// 					</thead>
// 					<tbody>
// 						<tr>
// 							<td *ngFor="let columnHeaderName of importPreviewData.columnHeaders">
// 								{{ columnHeaderName.sourceName }}
// 							</td>
// 						</tr>
// 						<tr *ngFor="let row of importPreviewData?.rows.slice(0,MAX_ROWS_TO_DISPLAY)">
// 							<td *ngFor="let cell of row">
// 								{{ cell}} 
// 							</td>
// 							<ng-template [ngIf]="row.length < columnHeadersCount">
// 								<td *ngFor="let spacer of createRange(columnHeadersCount-row.length)"></td>
// 							</ng-template>
// 						</tr>
// 					</tbody>
// 				</table>
// 			</div>
		
// 			<!-- BUTTONS -->
// 			<div class="l-display-flex l-childrenhorizontal-right l-marginTop-4x l-marginBottom-4x">
// 				<button 
// 					class="button button-primaryghost" 
// 					(click)="updateViewState('import')"
// 				>cancel</button>
				
// 				<button
// 					class="button l-marginLeft-x2"
// 					[class.button-is-disabled]=buttonDisabledClass 
// 					[attr.disabled] = buttonDisabledAttribute
// 					(click)="generateImportPreview()"	
// 				>continue</button>
// 		    </div>
// 		</section>
		
// 		<div *ngIf="rowIsLongerThanHeader">
// 			<div class="l-formmessage formmessage formmessage-is-error formmessage-is-active">
// 			    <p>The CSV uploaded contains row lengths longer then its header lengths. Please correct this error and try again.</p>
// 			    <!--<button type="button" (click)="rowIsLongerThanHeader = false">Dismiss</button>-->
// 			</div>
// 		</div>
// 	`
// })

// export class BadgeClassIssueBulkAwardPreviewComponent extends BaseAuthenticatedRoutableComponent{
// 	@Input() importPreviewData:BulkIssueImportPreviewData;

// 	@Output() updateStateEmitter  = new EventEmitter<ViewState>();
// 	@Output() transformedImportDataEmitter = new EventEmitter();

// 	MAX_ROWS_TO_DISPLAY:number = 5;

// 	buttonDisabledAttribute = true;
// 	buttonDisabledClass = true;
// 	columnHeadersCount:number;
// 	destNameToColumnHeaderMap:{
// 		[destColumnName: string]: number
// 	};
// 	duplicateRecords:BulkIssueData[]=[];

// 	rowIsLongerThanHeader:boolean;
// 	validRowsTransformed= new Set<BulkIssueData>();
// 	invalidRowsTransformed = Array<BulkIssueData>();

// 	viewState: ViewState;

// 	constructor (
// 		protected formBuilder: FormBuilder,
// 		protected loginService: SessionService,
// 		protected messageService: MessageService,
// 		protected router: Router,
// 		protected route: ActivatedRoute,
// 		protected title: Title
// 	)
// 	{
// 		super(router, route, loginService);
// 	}

// 	ngOnChanges(changes){
// 		this.disableActionButton();
// 		this.rowIsLongerThanHeader = this.importPreviewData.rowLongerThenHeader;
// 		this.columnHeadersCount = this.importPreviewData.columnHeaders.length;

// 		if( ! this.importPreviewData.rowLongerThenHeader ){
// 			this.isEmailColumnHeaderMapped()
// 				? this.enableActionButton()
// 				: this.disableActionButton();
// 		}
// 	}

// 	disableActionButton(){
// 		this.buttonDisabledClass = true;
// 		this.buttonDisabledAttribute = true;
// 	}

// 	enableActionButton(){
// 		this.buttonDisabledClass = false;
// 		this.buttonDisabledAttribute = null;
// 	}

// 	updateViewState(state:ViewState){
// 		this.viewState = state;
// 		this.updateStateEmitter.emit(state);
// 	}

// 	emitTransformedData(){
// 		let transformedImportData:TransformedImportData = {
// 			duplicateRecords : this.duplicateRecords,
// 			validRowsTransformed: this.validRowsTransformed,
// 			invalidRowsTransformed: this.invalidRowsTransformed
// 		}

// 		this.transformedImportDataEmitter.emit(transformedImportData);
// 	}

// 	isEmailColumnHeaderMapped():boolean{
// 		return this.importPreviewData.columnHeaders
// 			.some(columnHeader => columnHeader.destColumn == "email");
// 	}

// 	//////// Generating import data ////////
// 	generateImportPreview(){
// 		this.generateDestNameToColumnHeaderMap();
// 		this.removeFromInvalidRowsWithEmptyOptionalCells();
// 		this.transformInvalidRows();
// 		this.transformValidRows();
// 		this.removeDuplicateEmails();
// 		this.emitTransformedData();
// 	}

// 	removeFromInvalidRowsWithEmptyOptionalCells(){
// 		let invalidRow = [];
// 		let EmptyCellsAreOptional:boolean;

// 		this.importPreviewData.invalidRows
// 		.forEach(row => {

// 			EmptyCellsAreOptional =
// 				row.every(
// 					(cell,index) => {
// 						if (!cell.length && index !=this.destNameToColumnHeaderMap["evidence"]){
// 							return false;
// 						}
// 						if(cell.length){
// 							return true;
// 						}
// 						else if (!cell.length && index == this.destNameToColumnHeaderMap["evidence"]){
// 							return true;
// 						}
// 						else{
// 							return false;
// 						}
// 					}
// 				)

// 			EmptyCellsAreOptional
// 			? this.importPreviewData.validRows.push(row)
// 			: invalidRow.push(row);
// 		})

// 		this.importPreviewData.invalidRows = invalidRow;


// 	}

// 	transformInvalidRows(){
// 		this.importPreviewData.invalidRows
// 			.forEach((row) => {
// 				this.invalidRowsTransformed
// 					. push(
// 						{
// 							evidence:this.getEvidenceFromRow(row),
// 							email:this.getEmailFromRow(row)
// 						}
// 					)
// 			});
// 	}

// 	transformValidRows(){
// 		this.importPreviewData.validRows
// 			.forEach((row) => {
// 				this.validRowsTransformed
// 					.add(
// 						{
// 							evidence: this.getEvidenceFromRow(row),
// 							email: this.getEmailFromRow(row)
// 						}
// 					)
// 			})
// 	}

// 	removeDuplicateEmails(){
// 		let tempRow = new Set<string>();
// 		this.validRowsTransformed.forEach( row => {
// 			if( tempRow.has(row.email)){
// 				this.duplicateRecords.push(row)
// 				this.validRowsTransformed.delete(row);
// 			}
// 			else{
// 				tempRow.add(row.email);
// 			}
// 		})
// 	}

// 	mapDestNameToSourceName(columnHeaderId:number, selected:DestSelectOptions){
// 		Object.keys(this.importPreviewData.columnHeaders)
// 			.forEach( columnId => {
// 				if (columnId !== columnHeaderId.toString()
// 					&&
// 					this.importPreviewData.columnHeaders[ columnId ].destColumn === selected
// 				)
// 				{
// 					this.importPreviewData.columnHeaders[ columnId ].destColumn = "NA";
// 				}

// 				if (columnId === columnHeaderId.toString())
// 				{
// 					this.importPreviewData.columnHeaders[ columnId ].destColumn = selected;
// 				}
// 			})

// 		this.isEmailColumnHeaderMapped() ? this.enableActionButton() : this.disableActionButton();
// 	}

// 	getEvidenceFromRow(row) {
// 		return this.getCellFromRowByDestName('evidence', row);
// 	}

// 	getEmailFromRow(row) {
// 		return this.getCellFromRowByDestName('email', row);
// 	}

// 	getCellFromRowByDestName(destName:string, row:Object) {
// 		return row[this.destNameToColumnHeaderMap[destName]];
// 	}

// 	generateDestNameToColumnHeaderMap(){
// 		this.destNameToColumnHeaderMap = {};
// 		Object
// 			.keys(this.importPreviewData.columnHeaders)
// 			.forEach(key => {
// 				if(this.importPreviewData.columnHeaders[ key ].destColumn != "NA"){
// 					this.destNameToColumnHeaderMap[ this.importPreviewData.columnHeaders[ key ].destColumn ] = Number(key);
// 				}
// 			})
// 	}

// 	createRange(size:number){
// 		let items: string[] = [];
// 		for(var i = 1; i <= size; i++){
// 			items.push("");
// 		}
// 		return items;
// 	}
// }