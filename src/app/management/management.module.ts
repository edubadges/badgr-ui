import { NgModule } from "@angular/core";
import { RouterModule } from "@angular/router";
import { FormsModule, ReactiveFormsModule } from "@angular/forms";
import { BadgrCommonModule, COMMON_IMPORTS } from "../common/badgr-common.module";
import { ManagementUsersComponent } from "./management-users.component"
import { ManagementFacultiesEditComponent } from "./management-faculties-edit.component"
import { ManagementFacultiesListComponent } from "./management-faculties-list.component"
import { ManagementLTIComponent } from "./management-lti.component"
import { InstitutionApiService } from "./services/institution-api.service"
import { UserProfileApiService } from "../common/services/user-profile-api.service";
import { ViewManagementAuthGuard, HasInstitutionScope } from "../auth/auth.gard";

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
		path: "faculties/edit/:facultySlug",
		component: ManagementFacultiesEditComponent,
		canActivate: [ViewManagementAuthGuard, 
									HasInstitutionScope]
	},
	{
		path: "faculties",
		component: ManagementFacultiesListComponent,
		canActivate: [ViewManagementAuthGuard, 
									HasInstitutionScope]
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
		ManagementFacultiesEditComponent,
		ManagementFacultiesListComponent,
	],
	exports: [],
	providers: [
		UserProfileApiService,
	 	InstitutionApiService,		
		ViewManagementAuthGuard,
		HasInstitutionScope,
	]
})
export class ManagementModule {}
