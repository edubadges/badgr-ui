import { NgModule } from "@angular/core";
import { RouterModule } from "@angular/router";

import { BadgrCommonModule, COMMON_IMPORTS } from "../common/badgr-common.module";
import { ProfileComponent } from "./profile.component";
import { SigningComponent } from "./signing.component";
import { AppIntegrationListComponent } from "./app-integrations-list.component";
import { AppIntegrationApiService } from "./services/app-integration-api.service";
import { AppIntegrationManager } from "./services/app-integration-manager.service";
import { BadgebookLti1DetailComponent, IntegrationImageComponent } from "./badgebook-lti1-integration-detail.component";
import { CommonEntityManagerModule } from "../entity-manager/entity-manager.module";
import { UserProfileManager } from "../common/services/user-profile-manager.service";
import { UserProfileApiService } from "../common/services/user-profile-api.service";
import { OAuthAppDetailComponent } from "./oauth-app-detail.component";
import { UserMaySignBadges, SigningEnabled } from "../auth/auth.gard";
import { SigningApiService } from './../common/services/signing-api.service';


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
	{
		path: "signing",
		component: SigningComponent,
		canActivate: [UserMaySignBadges, SigningEnabled]
	},
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
		SigningComponent,
		IntegrationImageComponent,
		OAuthAppDetailComponent
	],
	providers: [
		AppIntegrationApiService,
		AppIntegrationManager,
		UserProfileApiService,
		SigningApiService,
		UserProfileManager,
		UserMaySignBadges,
		SigningEnabled
	],
	exports: []
})
export class ProfileModule {}
