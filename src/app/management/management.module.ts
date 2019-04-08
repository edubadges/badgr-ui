import { NgModule } from "@angular/core";
import { RouterModule } from "@angular/router";
import { FormsModule, ReactiveFormsModule } from "@angular/forms";
import { BadgrCommonModule, COMMON_IMPORTS } from "../common/badgr-common.module";
import { ManagementUsersComponent } from "./management-users.component"
import { ManagementFacultiesComponent } from "./management-faculties.component"
import { ManagementLTIComponent } from "./management-lti.component"
import { InstitutionApiService } from "./services/institution-api.service"
import { UserProfileApiService } from "../common/services/user-profile-api.service";
import { ViewManagementAuthGuard } from "../auth/auth.gard";

const routes = [
	/* staff */
	{
		path: "users",
		component: ManagementUsersComponent,
		canActivate: [ViewManagementAuthGuard]
	},
	{
		path: "lti",
		component: ManagementLTIComponent,
		canActivate: [ViewManagementAuthGuard]
	},
	{
		path: "faculties",
		component: ManagementFacultiesComponent,
		canActivate: [ViewManagementAuthGuard]
	},
	{
		path: "**",
		component: ManagementUsersComponent,
		canActivate: [ViewManagementAuthGuard]
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
		ManagementUsersComponent,
		ManagementLTIComponent,
		ManagementFacultiesComponent,
	],
	exports: [],
	providers: [
		UserProfileApiService,
	 	InstitutionApiService,		
		ViewManagementAuthGuard,
	]
})
export class ManagementModule {}
