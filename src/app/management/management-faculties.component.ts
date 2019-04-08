import { ActivatedRoute, Router } from "@angular/router";
import { Component, OnInit } from "@angular/core";
import { SessionService } from "../common/services/session.service";
import { BaseAuthenticatedRoutableComponent } from "../common/pages/base-authenticated-routable.component";
import { Title } from "@angular/platform-browser";
import { InstitutionApiService } from "./services/institution-api.service"
import { UserProfileApiService } from "../common/services/user-profile-api.service";

@Component({
	selector: 'managementFaculties',
	template: `
	<span>Faculties</span>
	<div *bgAwaitPromises="[facultiesLoaded]">{{ faculties }}</div>
	`
})
export class ManagementFacultiesComponent extends BaseAuthenticatedRoutableComponent implements OnInit {
	
	faculties: object;
	facultiesLoaded: Promise<any>;

	constructor(
		router: Router,
		route: ActivatedRoute,
		sessionService: SessionService,
		protected title: Title,
		protected institutionApi: InstitutionApiService,
		protected userProfileApiService: UserProfileApiService,
	) {
		super(router, route, sessionService);
		title.setTitle("Management- Faculties");
		// invalid url: see django
		// this.faculties = this.institutionApi.getAllInstitutionFaculties()
		this.facultiesLoaded = this.institutionApi.getAllInstitutionFaculties()
			.then((faculties) => {
				this.faculties = faculties
			});

	}

}
