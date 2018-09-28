import { NgModule } from "@angular/core";
import { Route, RouterModule } from "@angular/router";
import { BadgrCommonModule, COMMON_IMPORTS } from "../common/badgr-common.module";

import { UserProfileApiService } from "../common/services/user-profile-api.service";
import { BaseHttpApiService } from "../common/services/base-http-api.service";
import { PublicComponent } from "./public.component";
import { CommonEntityManagerModule } from "../entity-manager/entity-manager.module";
import { PublicBadgeAssertionComponent } from "./badge-assertion.component";
import { PublicApiService } from "./services/public-api.service";
import { StudentsEnrolledApiService } from "../issuer/services/studentsenrolled-api.service";
import { PublicBadgeClassComponent } from "./badgeclass.component";
import { PublicIssuerComponent } from "./issuer.component";
import { PublicBadgeCollectionComponent } from "./badge-collection.component";

export const routes: Route[] = [
	{
		path: "",
		component: PublicComponent
	},

	{
		path: "assertions/:assertionId",
		component: PublicBadgeAssertionComponent
	},

	{
		path: "badges/:badgeId",
		component: PublicBadgeClassComponent
	},

	{
		path: "issuers/:issuerId",
		component: PublicIssuerComponent
	},

	{
		path: "collections/:collectionShareHash",
		component: PublicBadgeCollectionComponent
	},

	{
		path: "**",
		component: PublicComponent
	},
];

@NgModule({
	imports: [
		...COMMON_IMPORTS,
		BadgrCommonModule,
		CommonEntityManagerModule,
		RouterModule.forChild(routes)
		/* RouterModule.forChild(routes),
                EndorsementApiModule */
	],
	declarations: [
		PublicComponent,
		PublicBadgeAssertionComponent,
		PublicBadgeClassComponent,
		PublicIssuerComponent,
		PublicBadgeCollectionComponent
	],
	exports: [],
	providers: [
		PublicApiService,
		StudentsEnrolledApiService,
		UserProfileApiService,
	]
})
export class PublicModule {}
