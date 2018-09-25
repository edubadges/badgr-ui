import { NgModule } from "@angular/core";
import { RouterModule } from "@angular/router";

import { BadgrCommonModule, COMMON_IMPORTS } from "../common/badgr-common.module";
import { ProfileComponent } from "./profile.component";
import { AppIntegrationListComponent } from "./app-integrations-list.component";
//import { UserProfileService } from "../common/services/user-profile-api.service";
import { AppIntegrationApiService } from "./services/app-integration-api.service";
import { AppIntegrationManager } from "./services/app-integration-manager.service";
import { BadgebookLti1DetailComponent, IntegrationImageComponent } from "./badgebook-lti1-integration-detail.component";
import { CommonEntityManagerModule } from "../entity-manager/entity-manager.module";
// import { ProfileEditComponent } from "./profile-edit.component";
import { UserProfileManager } from "../common/services/user-profile-manager.service";
import { UserProfileApiService } from "../common/services/user-profile-api.service";
// import { ChangePasswordComponent } from "./change-password.component";
import { OAuthAppDetailComponent } from "./oauth-app-detail.component";

const routes = [
	/* Profile */
	{
		path: "",
		redirectTo: "profile",
		pathMatch: 'full',
	},
	{
		path: "profile",
		component: ProfileComponent
	},
	// {
	// 	path: "edit",
	// 	component: ProfileEditComponent
	// },
	{
		path: "app-integrations",
		component: AppIntegrationListComponent
	},
	{
		path: "app-integrations/app/canvas-lti1",
		component: BadgebookLti1DetailComponent
	},
	{
		path: "app-integrations/oauth-app/:appId",
		component: OAuthAppDetailComponent
	},
	// {
	// 	path: "change-password",
	// 	component: ChangePasswordComponent
	// },
	{
		path: "**",
		component: ProfileComponent
	},
];

@NgModule({
	imports: [
		...COMMON_IMPORTS,
		BadgrCommonModule,
		CommonEntityManagerModule,
		RouterModule.forChild(routes)
	],
	declarations: [
		BadgebookLti1DetailComponent,
		AppIntegrationListComponent,
		ProfileComponent,
		// ProfileEditComponent,
		IntegrationImageComponent,
		// ChangePasswordComponent,
		OAuthAppDetailComponent
	],
	providers: [
		//UserProfileService,
		AppIntegrationApiService,
		AppIntegrationManager,
		UserProfileApiService,
		UserProfileManager,
	],
	exports: []
})
export class ProfileModule {}
