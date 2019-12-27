// import { Component, Input, Output, EventEmitter } from "@angular/core";
// import { FormBuilder} from "@angular/forms";
// import { Router, ActivatedRoute } from "@angular/router";
// import { SessionService } from "../common/services/session.service";
// import { MessageService } from "../common/services/message.service";
// import { Title } from "@angular/platform-browser";
// import { BaseAuthenticatedRoutableComponent } from "../common/pages/base-authenticated-routable.component";
// import { TransformedImportData, ViewState } from "./badgeclass-issue-bulk-award.component"

// import "rxjs/add/observable/combineLatest";
// import "rxjs/add/operator/first";
// import { BadgeInstanceManager } from "./services/badgeinstance-manager.service";
// import { BadgeInstanceBatchAssertion, ApiBadgeInstanceForBatchCreation } from "./models/badgeinstance-api.model";
// import { BadgrApiFailure } from "../common/services/api-failure";

// @Component({
// 	selector: 'Badgeclass-issue-bulk-award-conformation',
// 	template: `
// 		<section class="wrap l-containerhorizontal">
// 			<div>
// 				<div class="importHeading">
// 				  <h1 class=title>Import Preview</h1>
// 				  <p>
// 				    {{transformedImportData.validRowsTransformed.size}} Rows ready to be imported. {{transformedImportData.duplicateRecords.length}}
// 				     rows were found to be duplicates and will be ignored.  Click the AWARD BADGE button below to award this badge.
// 				  </p>
// 				</div>
		
// 				<table class="table table-issues">
// 					<thead>
// 						<tr>
// 							<th scope="col">Email</th>
// 							<th scope="col">Evidence</th>
// 							<th><!-- header for remove link--></th>
// 						</tr>
// 					</thead>
// 					<tbody>
// 						<tr *ngFor="let row of transformedImportData.validRowsTransformed">						
// 							<td class="table-issues-x-confirmationText">
// 								{{row.email}}
// 							</td>
// 							<td class="table-issues-x-confirmationText">
// 								{{row.evidence}}
// 							</td>
// 							<td>
// 								<button class="button button-primaryghost" 
// 									(click)="removeValidRowsTransformed(row)"
// 								>REMOVE</button>
// 							</td>
// 						</tr>
// 					<tbody> 
// 				</table>
// 			</div>	
			
// 			<div class="l-childrenvertical l-marginTop-4x">
// 				<div>
// 					<h1 class=title>Notification Preference</h1>
// 				</div>
// 				<div>
// 				<label class="formcheckbox" for="notify_earner">
// 		          <input 
// 			          checked name="notify_earner" 
// 			          id="notify_earner" 
// 			          type="checkbox" 
// 			          [(ngModel)]="notifyEarner">
// 		          <span class="formcheckbox-x-text">Notify recipient by email</span>
// 		        </label>
// 				</div>				
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
// 					(click)="dataConfirmed()"	
// 				>Award Badge</button>
// 		    </div>
// 		</section>
// `,

// })

// export class BadgeclassIssueBulkAwardConformation extends BaseAuthenticatedRoutableComponent{

// 	@Input() transformedImportData:TransformedImportData;
// 	@Input() badgeSlug:string;
// 	@Input() issuerSlug:string;
// 	@Output() updateStateEmitter  = new EventEmitter<ViewState>();

// 	buttonDisabledClass = true;
// 	buttonDisabledAttribute = true;
// 	issuer:string;
// 	notifyEarner:boolean = true;

// 	issueBadgeFinished: Promise<any>;

// 	constructor (
// 		protected badgeInstanceManager: BadgeInstanceManager,
// 		protected sessionService: SessionService,
// 		protected router: Router,
// 		protected route: ActivatedRoute,
// 		protected messageService: MessageService,
// 		protected formBuilder: FormBuilder,
// 		protected title: Title
// 	)
// 	{
// 		super(router, route, sessionService);
// 		this.enableActionButton();
// 	}

// 	enableActionButton(){
// 		this.buttonDisabledClass = false;
// 		this.buttonDisabledAttribute = null;
// 	}

// 	disableActionButton(){
// 		this.buttonDisabledClass = true;
// 		this.buttonDisabledAttribute = true;
// 	}

// 	dataConfirmed(){
// 		this.disableActionButton();

// 		let assertions: BadgeInstanceBatchAssertion[] =[];

// 		this.transformedImportData.validRowsTransformed.forEach(row => {
// 			let assertion: BadgeInstanceBatchAssertion;
// 			if (row.evidence) {
// 				assertion = {
// 					recipient_identifier: row.email,
// 					evidence_items: [{evidence_url: row.evidence}]
// 				}
// 			}
// 			else {
// 				assertion= {
// 					recipient_identifier: row.email
// 				}
// 			}
// 			assertions.push(assertion)
// 		})

// 		this.badgeInstanceManager.createBadgeInstanceBatched(
// 			this.issuerSlug,
// 			this.badgeSlug,
// 			{   issuer: this.issuerSlug,
// 				badge_class: this.badgeSlug,
// 				create_notification: this.notifyEarner,
// 				assertions: assertions
// 			}
// 		).then(result =>{
// 			this.router.navigate(
// 				['/issuer/issuers', this.issuerSlug,"badges",this.badgeSlug]
// 			);
// 		}, error => {
// 			this.messageService.setMessage("Unable to award badge: " + BadgrApiFailure.from(error).firstMessage, "error");
// 		})
// 	}

// 	updateViewState(state:ViewState){
// 		this.updateStateEmitter.emit(state);
// 	}

// 	removeValidRowsTransformed(row){
// 		this.transformedImportData.validRowsTransformed.delete(row);
// 		if (!this.transformedImportData.validRowsTransformed.size ){
// 			this.disableActionButton();
// 		}
// 	}

// }
