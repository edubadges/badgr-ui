import { NgModule } from "@angular/core";
// import { CommonModule } from '@angular/common';
import { RouterModule } from "@angular/router";

import { BadgrCommonModule, COMMON_IMPORTS } from "../common/badgr-common.module";
import { IssuerListComponent } from "./issuer-list.component";
import { IssuerCreateComponent } from "./issuer-create.component";
import { IssuerDetailComponent } from "./issuer-detail.component";
import { IssuerEditComponent } from "./issuer-edit.component";
import { BadgeClassCreateComponent } from "./badgeclass-create.component";
import { BadgeClassEditComponent } from "./badgeclass-edit.component";
import { BadgeClassDetailComponent } from "./badgeclass-detail.component";
import { BadgeClassIssueComponent } from "./badgeclass-issue.component";
import { BadgeClassIssueBulkAwardComponent } from "./badgeclass-issue-bulk-award.component";
import { BadgeClassIssueBulkAwardPreviewComponent } from "./badgeclass-issue-bulk-award-preview.component";
import { BadgeclassIssueBulkAwardConformation } from "./badgeclass-issue-bulk-award-conformation.component";
import { BadgeclassIssueBulkAwardError } from "./badgeclass-issue-bulk-award-error.component";
import { PathwayCreateComponent } from "./pathway-create.component";
import { PathwayDetailComponent } from "./pathway-detail.component";
import { RecipientGroupCreateComponent } from "./recipientgroup-create.component";
import { RecipientGroupDetailComponent } from "./recipientgroup-detail.component";
import { RecipientGroupImportCSV } from "./recipientgroup-import-csv.component";
import { RecipientGroupManager } from "./services/recipientgroup-manager.service";
import { PathwayManager } from "./services/pathway-manager.service";
import { PathwayApiService } from "./services/pathway-api.service";
import { BadgeInstanceManager } from "./services/badgeinstance-manager.service";
import { BadgeInstanceApiService } from "./services/badgeinstance-api.service";
import { BadgeClassManager } from "./services/badgeclass-manager.service";
import { BadgeClassApiService } from "./services/badgeclass-api.service";
import { IssuerManager } from "./services/issuer-manager.service";
import { RecipientGroupApiService } from "./services/recipientgroup-api.service";
import { IssuerApiService } from "./services/issuer-api.service";
import { BadgeSelectionDialog } from "./badge-selection-dialog.component";
import { PathwayElementComponent } from "./pathway-element.component";
import { PathwayElementEditForm } from "./pathway-element-edit-form.component";
import { RecipientGroupSelectionDialog } from "./recipientgroup-selection-dialog.component";
import { PathwaySelectionDialog } from "./pathway-selection-dialog.component";
import { RecipientGroupEditForm } from "./recipientgroup-edit-form.component";
import { RecipientSelectionDialog } from "./recipient-selection-dialog.component";
import { BadgeStudioComponent } from "./badge-studio.component";
import { PathwayGroupSubscriptionComponent } from "./pathway-group-subscription.component";
import { BadgeClassIssueBulkAwardImportComponent } from "./badgeclass-issue-bulk-award-import.component";
import { CommonEntityManagerModule } from "../entity-manager/entity-manager.module";
import { IssuerStaffComponent } from "./issuer-staff.component";
import { ProfileModule } from "../profile/profile.module";
import { BadgeClassEditFormComponent } from "./badgeclass-edit-form.component";

const routes = [
	/* Issuer */
	{
		path: "",
		component: IssuerListComponent
	},
	{
		path: "create",
		component: IssuerCreateComponent
	},
	{
		path: "issuers/:issuerSlug",
		component: IssuerDetailComponent
	},
	{
		path: "issuers/:issuerSlug/edit",
		component: IssuerEditComponent
	},
	{
		path: "issuers/:issuerSlug/staff",
		component: IssuerStaffComponent
	},
	{
		path: "issuers/:issuerSlug/badges/create",
		component: BadgeClassCreateComponent
	},
	{
		path: "issuers/:issuerSlug/badges/:badgeSlug",
		component: BadgeClassDetailComponent
	},
	{
		path: "issuers/:issuerSlug/badges/:badgeSlug/edit",
		component: BadgeClassEditComponent
	},
	{
		path: "issuers/:issuerSlug/badges/:badgeSlug/issue",
		component: BadgeClassIssueComponent
	},
	{
		path: "issuers/:issuerSlug/badges/:badgeSlug/bulk-import",
		component: BadgeClassIssueBulkAwardComponent
	},
	{
		path: "issuers/:issuerSlug/pathways/create",
		component: PathwayCreateComponent
	},
	{
		path: "issuers/:issuerSlug/pathways/:pathwaySlug/elements/:elementSlug",
		component: PathwayDetailComponent
	},
	{
		path: "issuers/:issuerSlug/pathways/:pathwaySlug/subscribed-groups",
		component: PathwayGroupSubscriptionComponent
	},
	{
		path: "issuers/:issuerSlug/recipient-groups/create",
		component: RecipientGroupCreateComponent
	},
	{
		path: "issuers/:issuerSlug/recipient-groups/:groupSlug",
		component: RecipientGroupDetailComponent
	},
	{
		path: "issuers/:issuerSlug/recipient-groups/:groupSlug/csv-import",
		component: RecipientGroupImportCSV
	},
	{
		path: "**",
		component: IssuerListComponent
	},
];

@NgModule({
	imports: [
		...COMMON_IMPORTS,
		BadgrCommonModule,
		CommonEntityManagerModule,
		RouterModule.forChild(routes)
	],
	declarations: [
		BadgeClassCreateComponent,
		BadgeClassEditComponent,
		BadgeClassEditFormComponent,
		BadgeClassDetailComponent,
		BadgeClassIssueComponent,

		BadgeClassIssueBulkAwardComponent,
		BadgeClassIssueBulkAwardImportComponent,
		BadgeClassIssueBulkAwardPreviewComponent,
		BadgeclassIssueBulkAwardError,
		BadgeclassIssueBulkAwardConformation,

		BadgeClassDetailComponent,
		BadgeClassIssueComponent,
		BadgeSelectionDialog,
		BadgeStudioComponent,

		IssuerCreateComponent,
		IssuerDetailComponent,
		IssuerEditComponent,
		IssuerStaffComponent,
		IssuerListComponent,

		PathwayCreateComponent,
		PathwayDetailComponent,
		PathwayGroupSubscriptionComponent,
		PathwayElementComponent,
		PathwayElementEditForm,
		PathwaySelectionDialog,

		RecipientGroupCreateComponent,
		RecipientGroupDetailComponent,
		RecipientGroupEditForm,
		RecipientGroupSelectionDialog,
		RecipientSelectionDialog,
		RecipientGroupImportCSV,
	],
	exports: [],
	providers: [
		BadgeClassApiService,
		BadgeClassManager,
		BadgeInstanceApiService,
		BadgeInstanceManager,
		IssuerApiService,
		IssuerManager,
		PathwayApiService,
		PathwayManager,
		RecipientGroupApiService,
		RecipientGroupManager,
	]
})
export class IssuerModule {}
