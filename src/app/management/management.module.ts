import { NgModule } from "@angular/core";
import { RouterModule } from "@angular/router";
import { FormsModule, ReactiveFormsModule } from "@angular/forms";
import { BadgrCommonModule, COMMON_IMPORTS } from "../common/badgr-common.module";
import { ManagementUsersListComponent } from "./management-users-list.component"
import { ManagementUsersEditComponent } from "./management-users-edit.component"
import { ManagementFacultiesEditComponent } from "./management-faculties-edit.component"
import { ManagementFacultiesCreateComponent } from "./management-faculties-create.component"
import { ManagementFacultiesListComponent } from "./management-faculties-list.component"
import { InstitutionApiService } from "./services/institution-api.service"
import { UserProfileApiService } from "../common/services/user-profile-api.service";
import { ViewManagementAuthGuard, HasInstitutionScope } from "../auth/auth.gard";
import { IssuerManager } from "../issuer/services/issuer-manager.service";
import { IssuerApiService } from "../issuer/services/issuer-api.service";
import { GroupApiService } from "../management/services/group-api.service";

const routes = [
	/* institution */
	{
		path: '',
		redirectTo: 'users',
		pathMatch: 'full',
	},
	{
		path: "users",
		component: ManagementUsersListComponent,
		canActivate: [ViewManagementAuthGuard]
	},
	{
		path: "users/edit/:userSlug",
		component: ManagementUsersEditComponent,
		canActivate: [ViewManagementAuthGuard]
	},
	{
		path: "faculties/edit/:facultySlug",
		component: ManagementFacultiesEditComponent,
		canActivate: [ViewManagementAuthGuard, 
									HasInstitutionScope]
	},
	{
		path: "faculties/create",
		component: ManagementFacultiesCreateComponent,
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
		component: ManagementUsersListComponent,
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
		ManagementUsersListComponent,
		ManagementUsersEditComponent,
		ManagementFacultiesEditComponent,
		ManagementFacultiesCreateComponent,
		ManagementFacultiesListComponent,
	],
	exports: [],
	providers: [
		UserProfileApiService,
		InstitutionApiService,
		ViewManagementAuthGuard,
		HasInstitutionScope,
		IssuerManager,
		IssuerApiService,
		GroupApiService,
	]
})
export class ManagementModule {}
