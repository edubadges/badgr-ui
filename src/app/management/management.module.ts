import { NgModule } from "@angular/core";
import { RouterModule } from "@angular/router";
import { FormsModule, ReactiveFormsModule } from "@angular/forms";
import { BadgrCommonModule, COMMON_IMPORTS } from "../common/badgr-common.module";
import { ManagementComponent } from "./management.component"
import { UserProfileApiService } from "../common/services/user-profile-api.service";
import { ViewManagementAuthGuard } from "../auth/auth.gard";

const routes = [
	/* staff */
	{
		path: "",
		component: ManagementComponent,
		canActivate: [ViewManagementAuthGuard]
	},
	{
		path: "**",
		redirectTo: '',
	},
];
@NgModule({
	imports: [
		...COMMON_IMPORTS,
		BadgrCommonModule,
	  RouterModule.forChild(routes),
		RouterModule,
		FormsModule,
		ReactiveFormsModule,
	],
	declarations: [
		ManagementComponent,
	],
	exports: [],
	providers: [
		UserProfileApiService,
		ViewManagementAuthGuard,
	]
})
export class ManagementModule {}
