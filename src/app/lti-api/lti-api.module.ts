import { NgModule } from "@angular/core";
import { Route, RouterModule } from "@angular/router";
import { BadgrCommonModule, COMMON_IMPORTS } from "../common/badgr-common.module";

import { CommonEntityManagerModule } from "../entity-manager/entity-manager.module";
import { EndorsementApiModule } from 'app/endorsement-api/endorsement-api.module';
import { LtiBadgesComponent } from "./lti-badges.component";
import { LtiApiService } from "./services/lti-api.service";
import { LtiBadgesStaffComponent } from "./lti-badges-staff.component";

export const routes: Route[] = [
	{
		path: "",
		component: LtiBadgesComponent
	},
	{
		path: "staff",
		component: LtiBadgesStaffComponent
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
		LtiBadgesComponent,
		LtiBadgesStaffComponent
	],
	exports: [],
	providers: [
		LtiApiService
	]
})
export class LtiApiModule {}
