import { CommonModule } from '@angular/common';
import { NgModule } from "@angular/core";
import { RouterModule } from "@angular/router";
import { BadgrCommonModule, COMMON_IMPORTS } from "../common/badgr-common.module";

// Import components for configuration page
import { ConfigurationPage } from './configuration-page/configuration-page.component';
import { InfoEntityComponent } from './configuration-page/entity/info-entity.component';
import { ManageEntityComponent } from './configuration-page/entity/manage-entity.component';
import { ManageInstituteComponent } from './configuration-page/institute/manage-institute.component';
import { LoginComponent } from './configuration-page/login/login.component';

// Components for integration in Badgr UI
import { EndorsementsBadgeClassComponent } from './endorsements-badgeclass/endorsements-badgeclass.component';
import { EndorsementsBadgeComponent } from './endorsements-badge/endorsements-badge.component';

// Routes (register configuration page to /blockchain/settings )
const routes = [
	{
		path: "settings",
        component: ConfigurationPage
	},
];

@NgModule({
    imports: [
		...COMMON_IMPORTS,
		BadgrCommonModule,
        CommonModule,
        RouterModule.forChild(routes),
    ],
	exports: [
        EndorsementsBadgeClassComponent,
        EndorsementsBadgeComponent,
        ConfigurationPage,
        LoginComponent,
        ManageInstituteComponent,
        ManageEntityComponent,
        InfoEntityComponent
    ],
	declarations: [
        EndorsementsBadgeClassComponent,
        EndorsementsBadgeComponent,
        ConfigurationPage,
        LoginComponent,
        ManageInstituteComponent,
        ManageEntityComponent,
        InfoEntityComponent
	]
})
export class EndorsementApiModule {

    constructor() { }
 }