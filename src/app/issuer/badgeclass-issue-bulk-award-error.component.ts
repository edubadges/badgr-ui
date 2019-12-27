// import { Component, Input, Output, EventEmitter, OnInit } from "@angular/core";
// import { FormGroup, FormBuilder, FormArray, Validators } from "@angular/forms";
// import { Router, ActivatedRoute } from "@angular/router";
// import { SessionService } from "../common/services/session.service";
// import { MessageService } from "../common/services/message.service";
// import { Title } from "@angular/platform-browser";
// import { BaseAuthenticatedRoutableComponent } from "../common/pages/base-authenticated-routable.component";
// import { EmailValidator } from "../common/validators/email.validator";
// import { TransformedImportData, ViewState } from "./badgeclass-issue-bulk-award.component"
// import { UrlValidator } from "../common/validators/url.validator";


// @Component({
// 	selector: 'Badgeclass-issue-bulk-award-error',
// 	template: `
// 		<section class="wrap l-containerhorizontal">					
// 			<div>
// 			<div class="importHeading">
// 				  <h1 class=title>Import Errors</h1>
// 				  <p>
// 				    {{transformedImportData.validRowsTransformed.size}} rows will be imported. The following {{transformedImportData.invalidRowsTransformed.length}} contain errors. Please fix the errors below or select REMOVE.					    
// 				  </p>
// 				</div>
		
// 				<form [formGroup]="importErrorForm">

// 					<table formArrayName="users"
// 						   class="table table-issues">
// 						<thead>
// 							<tr>
// 								<th scope="col">Email</th>
// 								<th scope="col">Evidence URL</th>
// 								<th><!-- header for remove link--></th>
// 							</tr>
// 						</thead>
// 						<tbody>
// 						<tr *ngFor="let user of importErrorForm.controls['users']['controls']; let i=index">
//                             <td class="table-issues-x-confirmationText">
// 								<bg-formfield-text 
// 										[control]="importErrorForm.controls['users']['controls'][i].controls.email"
//                                         [errorMessage]="'Please enter a valid email'"
//                                 ></bg-formfield-text>
//                             </td>
//                             <td class="table-issues-x-confirmationText">
// 								<bg-formfield-text 
// 										[control]="importErrorForm.controls['users']['controls'][i].controls.evidence"
// 						                [errorMessage]="{required:'Please enter a valid URL'}"
// 				                ></bg-formfield-text>	
//                             </td>
// 							<td>
// 								<button class="button button-primaryghost" 
// 										(click)="removeButtonErrorState(i)"
// 								>REMOVE</button>
// 							</td>
// 						</tr>
// 						<tbody> 
// 					</table>
// 				</form>				
// 			</div>			

// 			<!-- BUTTONS -->				
// 			<div class="l-display-flex l-childrenhorizontal-right l-marginTop-4x l-marginBottom-4x">
// 				<button 
// 					class="button button-primaryghost" 
// 					(click)="updateViewState('import')"
// 				>cancel</button>						   		  
				
// 				<button
// 					class="button l-marginLeft-x2"
// 					(click)="continueButtonAction()"	
// 				>continue</button>
// 		    </div>
// 		</section>
// 	`,

// })

// export class BadgeclassIssueBulkAwardError extends BaseAuthenticatedRoutableComponent implements OnInit{

// 	@Input() transformedImportData:TransformedImportData;
// 	@Output() updateStateEmitter  = new EventEmitter<ViewState>();

// 	importErrorForm:FormGroup;
// 	issuer:string;

// 	constructor (
// 		protected formBuilder: FormBuilder,
// 		protected sessionService: SessionService,
// 		protected messageService: MessageService,
// 		protected router: Router,
// 		protected route: ActivatedRoute,
// 		protected title: Title
// 	)
// 	{
// 		super(router, route, sessionService);
// 	}

// 	ngOnInit(){
// 		this.initImportErrorForm();
// 		this.markFormControllsAsDirty();
// 	}

// 	initImportErrorForm(){
// 		const createFormArray = () =>{
// 			let formArray = [];
// 			this.transformedImportData.invalidRowsTransformed.forEach(row =>{
// 				formArray.push(
// 					this.formBuilder.group(
// 						{
// 							evidence: [row.evidence,
// 								       Validators.compose(
// 									       [
// 										       UrlValidator.validUrl
// 									       ]
// 								       )
// 							],
// 							email: [row.email,
// 							        Validators.compose(
// 								        [
// 									        Validators.required,
// 									        EmailValidator.validEmail
// 								        ]
// 							        )
// 							]
// 						}
// 					)
// 				)
// 			})
// 			return formArray;
// 		}


// 		this.importErrorForm = this.formBuilder.group({
// 			users: this.formBuilder.array(
// 				createFormArray()
// 			)
// 		})
// 	}

// 	continueButtonAction(){
// 		if (!this.importErrorForm.valid){
// 			this.markFormControllsAsDirty();
// 		}
// 		else{
// 			this.importErrorForm.value["users"].forEach(row =>{
// 				this.transformedImportData.validRowsTransformed
// 					.add(
// 						{
// 							evidence: row["evidence"] ? row["evidence"].trim() : null,
// 							email: row["email"] ? row["email"].trim() : null
// 						}
// 					)
// 			})
// 			this.removeDuplicateEmails();
// 			this.updateViewState("importConformation");
// 		}
// 	}

// 	updateViewState(state:ViewState){
// 		this.updateStateEmitter.emit(state);
// 	}

// 	removeDuplicateEmails(){
// 		let tempRow = new Set<string>();
// 		this.transformedImportData.validRowsTransformed.forEach( row => {
// 			if (tempRow.has(row.email)) {
// 				this.transformedImportData.duplicateRecords.push(row)
// 				this.transformedImportData.validRowsTransformed.delete(row);
// 			}
// 			else {
// 				tempRow.add(row.email);
// 			}
// 		})
// 	}

// 	markFormControllsAsDirty(){
// 		let formArray:FormArray = <FormArray>this.importErrorForm.controls["users"];

// 		formArray.controls.forEach((group:FormGroup) =>{
// 			Object.getOwnPropertyNames(group.controls).forEach(controlName =>{
// 				group.controls[controlName].markAsDirty()
// 			})
// 		})
// 	}

// 	removeButtonErrorState(row:number){
// 		this.removeInvalidRowsTransformed(row);
// 		this.removeErrorFormControll(row);
// 	}

// 	removeInvalidRowsTransformed(i:number){
// 		this.transformedImportData.invalidRowsTransformed.splice(i,1);
// 	}

// 	removeErrorFormControll(controlIndex:number){
// 		const control = <FormArray>this.importErrorForm.controls['users'];
// 		control.removeAt(controlIndex);
// 	}
// }