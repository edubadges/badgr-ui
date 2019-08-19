import { NgModule } from "@angular/core";
import { RouterModule } from "@angular/router";

import { UnauthorizedComponent } from "./unauthorized.component";
import { LogoutComponent } from "./logout.component";
import { LoginComponent } from "./login.component";
import { BadgrCommonModule, COMMON_IMPORTS } from "../common/badgr-common.module";
import { CommonEntityManagerModule } from "../entity-manager/entity-manager.module";
import { OAuth2AuthorizeComponent } from "./oauth2-authorize.component";

const routes = [
	{
		path: "",
		redirectTo: "login",
		pathMatch: 'full',
	},
	{
		path: "login",
		component: LoginComponent
	},
	{
		path: "logout",
		component: LogoutComponent
	},
	{
		path: "login/:name",
		component: LoginComponent
	},
	{
		path: "login/:name/:email",
		component: LoginComponent
	},
	{
		path: "unauthorized",
		component: UnauthorizedComponent
	},
	/* OAuth2 */
	{
		path: "oauth2/authorize",
		component: OAuth2AuthorizeComponent
	},
	{
		path: "**",
		redirectTo: "login",
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
		LoginComponent,
		LogoutComponent,
		OAuth2AuthorizeComponent,
		UnauthorizedComponent
	],
	exports: [],
	providers: []
})
export class AuthModule {}
