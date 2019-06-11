import { NgModule } from "@angular/core";
import { RouterModule } from "@angular/router";
import { FormsModule, ReactiveFormsModule } from "@angular/forms";
import { BadgrCommonModule, COMMON_IMPORTS } from "../common/badgr-common.module";
import { ManagementUsersListComponent } from "./management-users-list.component"
import { ManagementUsersEditComponent } from "./management-users-edit.component"
import { ManagementFacultiesEditComponent } from "./management-faculties-edit.component"
import { ManagementFacultiesCreateComponent } from "./management-faculties-create.component"
import { ManagementFacultiesListComponent } from "./management-faculties-list.component"
import { ManagementReportsComponent } from "./management-reports.component"
import { ManagementFacultyReportsComponent } from "./management-faculty-reports.component"
import { InstitutionApiService } from "./services/institution-api.service"
import { UserProfileApiService } from "../common/services/user-profile-api.service";
import { ViewManagementAuthGuard, HasInstitutionScope } from "../auth/auth.gard";
import { IssuerManager } from "../issuer/services/issuer-manager.service";
import { IssuerApiService } from "../issuer/services/issuer-api.service";
import { ManagementApiService } from "../management/services/management-api.service";
import { ChartsModule } from 'ng2-charts';


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
		path: "reports",
		component: ManagementReportsComponent,
		canActivate: [ViewManagementAuthGuard]
	},
	{
		path: "reports/faculty/:facultySlug",
		component: ManagementFacultyReportsComponent,
		canActivate: [ViewManagementAuthGuard]
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
		ChartsModule,
	],
	declarations: [
		ManagementUsersListComponent,
		ManagementUsersEditComponent,
		ManagementFacultiesEditComponent,
		ManagementFacultiesCreateComponent,
		ManagementFacultiesListComponent,
		ManagementReportsComponent,
		ManagementFacultyReportsComponent,
	],
	exports: [],
	providers: [
		UserProfileApiService,
		InstitutionApiService,
		ViewManagementAuthGuard,
		HasInstitutionScope,
		IssuerManager,
		IssuerApiService,
		ManagementApiService,
	]
})
export class ManagementModule {}
