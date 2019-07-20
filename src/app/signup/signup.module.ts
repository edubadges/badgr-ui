// import { NgModule } from "@angular/core";
// import { RouterModule } from "@angular/router";
// import { FormsModule, ReactiveFormsModule } from "@angular/forms";

// import { SignupSuccessComponent } from "../signup/signup-success.component";
// import { SignupComponent } from "../signup/signup.component";
// import { BadgrCommonModule, COMMON_IMPORTS } from "../common/badgr-common.module";
// import { SignupService } from "./signup.service";
// import { AuthModule } from "../auth/auth.module";

// const routes = [
// 	/* Signup */
// 	{
// 		path: "",
// 		component: SignupComponent
// 	},
// 	{
// 		path: "success",
// 		component: SignupSuccessComponent
// 	},
// 	{
// 		path: "success/:email",
// 		component: SignupSuccessComponent
// 	},
// 	{
// 		path: "**",
// 		redirectTo: '',
// 	},
// ];

// @NgModule({
// 	imports: [
// 		...COMMON_IMPORTS,
// 		RouterModule,
// 		FormsModule,
// 		ReactiveFormsModule,

// 		BadgrCommonModule,
// 	  RouterModule.forChild(routes)
// 	],
// 	declarations: [
// 		SignupComponent,
// 		SignupSuccessComponent,
// 	],
// 	exports: [],
// 	providers: [
// 		SignupService
// 	]
// })
// export class SignupModule {}
