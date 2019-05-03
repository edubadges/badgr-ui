import { NgModule } from "@angular/core";
import { Route, RouterModule } from "@angular/router";
import { BadgrCommonModule, COMMON_IMPORTS } from "../common/badgr-common.module";

import { CommonEntityManagerModule } from "../entity-manager/entity-manager.module";
import { EndorsementApiModule } from 'app/endorsement-api/endorsement-api.module';
import { LtiBadgesComponent } from "./lti-badges.component";
import { LtiApiService } from "./services/lti-api.service";

export const routes: Route[] = [
	{
		path: "",
		component: LtiBadgesComponent
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
		LtiBadgesComponent
	],
	exports: [],
	providers: [
		LtiApiService
	]
})
export class LtiApiModule {}
