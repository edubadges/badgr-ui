import { NgModule } from "@angular/core";
import { Route, RouterModule } from "@angular/router";
import { BadgrCommonModule, COMMON_IMPORTS } from "../common/badgr-common.module";

import { PublicComponent } from "./public.component";
import { CommonEntityManagerModule } from "../entity-manager/entity-manager.module";
import { PublicBadgeAssertionComponent } from "./badge-assertion.component";
import { PublicApiService } from "./services/public-api.service";
import { PublicBadgeClassComponent } from "./badgeclass.component";
import { PublicIssuerComponent } from "./issuer.component";
import { PublicBadgeCollectionComponent } from "./badge-collection.component";

// Blockchain endorsements module
import { EndorsementApiModule } from './../endorsement-api/endorsement-api.module';

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
		RouterModule.forChild(routes),
                EndorsementApiModule
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
		PublicApiService
	]
})
export class PublicModule {}
