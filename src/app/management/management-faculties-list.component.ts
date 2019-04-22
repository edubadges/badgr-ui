import { ActivatedRoute, Router } from "@angular/router";
import { Component, OnInit } from "@angular/core";
import { SessionService } from "../common/services/session.service";
import { BaseAuthenticatedRoutableComponent } from "../common/pages/base-authenticated-routable.component";
import { Title } from "@angular/platform-browser";
import { InstitutionApiService } from "./services/institution-api.service"

@Component({
	selector: 'managementFacultiesList',
	template: `
	<main>
		<header class="wrap wrap-light l-containerhorizontal l-heading">
			<div class="heading">
				<div class="heading-x-text">
					<h1>Faculties <span *ngIf="faculties">{{ faculties?.length }} Faculties</span></h1>
				</div>
				<div class="heading-x-actions">
					<a [routerLink]="['/management/faculties/create/']"
						class="button button-major"
						[disabled-when-requesting]="true">Create Faculty</a>
				</div>
			</div>

		</header>

		<div *bgAwaitPromises="[facultiesLoaded]">
		<a class="card card-large" *ngFor="let faculty of faculties" [routerLink]="['/management/faculties/edit/', faculty.slug]">
		<div class="card-x-main">
		<div class="card-x-text">
		<h1>{{faculty.name}}</h1>
		</div>
		</div>
		</a>
		</div>
	</main>
	`
})
export class ManagementFacultiesListComponent extends BaseAuthenticatedRoutableComponent implements OnInit {
	
	faculties: object;
	facultiesLoaded: Promise<any>;


	constructor(
		router: Router,
		route: ActivatedRoute,
		sessionService: SessionService,
		protected title: Title,
		protected institutionApi: InstitutionApiService,
	) {
		super(router, route, sessionService);
		title.setTitle("Profile - Badgr");
		this.facultiesLoaded = this.institutionApi.getAllInstitutionFaculties()
		.then((faculties) => {
			this.faculties = faculties
		});
	
	
	}

	ngOnInit() {
		super.ngOnInit();
	}


}