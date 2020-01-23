import { NgModule } from "@angular/core";
import { RouterModule } from "@angular/router";

import { BadgrCommonModule, COMMON_IMPORTS } from "../common/badgr-common.module";
import { IssuerListComponent } from "./issuer-list.component";
import { IssuerCreateComponent } from "./issuer-create.component";
import { IssuerDetailComponent } from "./issuer-detail.component";
import { IssuerEditComponent } from "./issuer-edit.component";
import { BadgeClassCreateComponent } from "./badgeclass-create.component";
import { BadgeClassCreateFormalComponent } from "./badgeclass-create-formal.component";
import { BadgeClassCreateNonFormalComponent } from "./badgeclass-create-non-formal.component";
import { BadgeClassEditComponent } from "./badgeclass-edit.component";
import { BadgeClassDetailComponent } from "./badgeclass-detail.component";
import { BadgeClassIssueComponent } from "./badgeclass-issue.component";
import { BadgeClassIssueBulkSignComponent } from "./badgeclass-issue-bulk-sign.component";
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
import { CommonEntityManagerModule } from "../entity-manager/entity-manager.module";
import { IssuerStaffComponent } from "./issuer-staff.component";
import { BadgeClassEditFormComponent } from "./badgeclass-edit-form.component";
import { StudentsEnrolledApiService } from "../issuer/services/studentsenrolled-api.service";
import { ViewIssuerAuthGuard, AddIssuerAuthGuard, UserMaySignBadges, SigningEnabled } from "../auth/auth.gard";
import { EndorsementApiModule } from 'app/endorsement-api/endorsement-api.module';


const routes = [
	/* Issuer */
	{
		path: "",
		component: IssuerListComponent,
		canActivate: [ViewIssuerAuthGuard]
	},
	{
		path: "create",
		component: IssuerCreateComponent,
		canActivate: [AddIssuerAuthGuard]
	},
	{
		path: "bulk-sign",
		component: BadgeClassIssueBulkSignComponent,
		canActivate: [ViewIssuerAuthGuard, UserMaySignBadges, SigningEnabled]
	},
	{
		path: "issuers/:issuerSlug",
		component: IssuerDetailComponent,
		canActivate: [ViewIssuerAuthGuard]
	},
	{
		path: "issuers/:issuerSlug/edit",
		component: IssuerEditComponent,
		canActivate: [ViewIssuerAuthGuard]
	},
	{
		path: "issuers/:issuerSlug/staff",
		component: IssuerStaffComponent,
		canActivate: [ViewIssuerAuthGuard]
	},
	{
		path: "issuers/:issuerSlug/badges/create-formal",
		component: BadgeClassCreateFormalComponent,
		canActivate: [ViewIssuerAuthGuard]
	},
	{
		path: "issuers/:issuerSlug/badges/create-non-formal",
		component: BadgeClassCreateNonFormalComponent,
		canActivate: [ViewIssuerAuthGuard]
	},
	{
		path: "issuers/:issuerSlug/badges/:badgeSlug",
		component: BadgeClassDetailComponent,
		canActivate: [ViewIssuerAuthGuard]
	},
	{
		path: "issuers/:issuerSlug/badges/:badgeSlug/edit",
		component: BadgeClassEditComponent,
		canActivate: [ViewIssuerAuthGuard]
	},
	{
		path: "issuers/:issuerSlug/badges/:badgeSlug/issue",
		component: BadgeClassIssueComponent,
		canActivate: [ViewIssuerAuthGuard]
	},
	{
		path: "issuers/:issuerSlug/pathways/create",
		component: PathwayCreateComponent,
		canActivate: [ViewIssuerAuthGuard]
	},
	{
		path: "issuers/:issuerSlug/pathways/:pathwaySlug/elements/:elementSlug",
		component: PathwayDetailComponent,
		canActivate: [ViewIssuerAuthGuard]
	},
	{
		path: "issuers/:issuerSlug/pathways/:pathwaySlug/subscribed-groups",
		component: PathwayGroupSubscriptionComponent,
		canActivate: [ViewIssuerAuthGuard]
	},
	{
		path: "issuers/:issuerSlug/recipient-groups/create",
		component: RecipientGroupCreateComponent,
		canActivate: [ViewIssuerAuthGuard]
	},
	{
		path: "issuers/:issuerSlug/recipient-groups/:groupSlug",
		component: RecipientGroupDetailComponent,
		canActivate: [ViewIssuerAuthGuard]
	},
	{
		path: "issuers/:issuerSlug/recipient-groups/:groupSlug/csv-import",
		component: RecipientGroupImportCSV,
		canActivate: [ViewIssuerAuthGuard]
	},
	{
		path: "**",
		component: IssuerListComponent,
		canActivate: [ViewIssuerAuthGuard]
	},
];

@NgModule({
	imports: [
		...COMMON_IMPORTS,
		BadgrCommonModule,
		CommonEntityManagerModule,
		RouterModule.forChild(routes),
		EndorsementApiModule
	],
	declarations: [
		BadgeClassCreateComponent,
		BadgeClassCreateFormalComponent,
		BadgeClassCreateNonFormalComponent,
		BadgeClassEditComponent,
		BadgeClassEditFormComponent,
		BadgeClassDetailComponent,
		BadgeClassIssueComponent,

		// BadgeClassIssueBulkAwardComponent,
		// BadgeClassIssueBulkAwardImportComponent,
		// BadgeClassIssueBulkAwardPreviewComponent,
		// BadgeclassIssueBulkAwardError,
		// BadgeclassIssueBulkAwardConformation,
		BadgeClassIssueBulkSignComponent,

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
		StudentsEnrolledApiService,
		AddIssuerAuthGuard,
		ViewIssuerAuthGuard,
		UserMaySignBadges,
		SigningEnabled
	]
})
export class IssuerModule {}
