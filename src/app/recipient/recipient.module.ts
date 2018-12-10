import { NgModule } from "@angular/core";
import { RouterModule } from "@angular/router";

import { BadgrCommonModule, COMMON_IMPORTS } from "../common/badgr-common.module";

import { RecipientBadgeCollectionDetailComponent } from "./recipient-badge-collection-detail.component";
import { RecipientBadgeCollectionListComponent } from "./recipient-badge-collection-list.component";
import { RecipientEarnedBadgeDetailComponent } from "./recipient-earned-badge-detail.component";
import { RecipientEarnedBadgeListComponent } from "./recipient-earned-badge-list.component";
import { RecipientEnrollmentListComponent } from "./recipient-enrollment-list.component";
import { AddBadgeDialogComponent } from "./add-badge-dialog.component";
import { RecipientBadgeApiService } from "./services/recipient-badges-api.service";
import { RecipientBadgeManager } from "./services/recipient-badge-manager.service";
import { RecipientBadgeCollectionApiService } from "./services/recipient-badge-collection-api.service";
import { RecipientBadgeCollectionManager } from "./services/recipient-badge-collection-manager.service";
import { RecipientBadgeCollectionCreateComponent } from "./recipient-badge-collection-create.component";
import { RecipientBadgeSelectionDialog } from "./recipient-badge-selection-dialog.component";
import { RecipientBadgeCollectionEditFormComponent } from "./recipient-badge-collection-edit-form.component";
import { RecipientBadgeCollectionSelectionDialog } from "./recipient-badge-collection-selection-dialog";
import { CommonEntityManagerModule } from "../entity-manager/entity-manager.module";
import { StudentsEnrolledApiService } from "../issuer/services/studentsenrolled-api.service";
import { UserProfileApiService } from "../common/services/user-profile-api.service"
import { EndorsementApiModule } from 'app/endorsement-api/endorsement-api.module';


const routes = [
	/* Recipient Badges */
	{
		path: "",
		redirectTo: 'badges',
	},
	{
		path: "badges",
		component: RecipientEarnedBadgeListComponent
	},
	{
		path: "earned-badge/:badgeSlug",
		component: RecipientEarnedBadgeDetailComponent
	},
	{
		path: "enrollments",
		component: RecipientEnrollmentListComponent
	},

	/* Recipient Badge Collections */
	{
		path: "badge-collections",
		component: RecipientBadgeCollectionListComponent
	},
	{
		path: "badge-collections/create",
		component: RecipientBadgeCollectionCreateComponent,
	},
	{
		path: "badge-collections/collection/:collectionSlug",
		component: RecipientBadgeCollectionDetailComponent
	},
	{
		path: "**",
		redirectTo: 'badges',
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
		RecipientEarnedBadgeListComponent,
		RecipientEarnedBadgeDetailComponent,
		RecipientBadgeCollectionListComponent,
		RecipientBadgeCollectionCreateComponent,
		RecipientBadgeCollectionDetailComponent,
		RecipientBadgeCollectionEditFormComponent,
		RecipientBadgeCollectionSelectionDialog,
		RecipientBadgeSelectionDialog,
		RecipientEnrollmentListComponent,
		AddBadgeDialogComponent
	],
	providers: [
		RecipientBadgeApiService,
		RecipientBadgeManager,
		RecipientBadgeCollectionApiService,
		RecipientBadgeCollectionManager,
		StudentsEnrolledApiService,
		UserProfileApiService,
	],
	exports: []
})
export class RecipientModule {}
