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

		<div 	class="l-containerhorizontal l-containervertical l-childrenvertical wrap"
					*bgAwaitPromises="[facultiesLoaded]">
			<table class="table" >
				<thead>
					<tr>
						<th scope="col">Faculty</th>
						<th scope="col">Actions</th>
					</tr>
				</thead>
				<tbody>
					<tr *ngFor="let faculty of faculties">
						<th scope="row">
							<div class="l-childrenhorizontal l-childrenhorizontal-small">
								<a [routerLink]="['/management/faculties/edit/', faculty.slug]">{{faculty.name}}</a>
							</div>
						</th>
						<td>
							<div class="l-childrenhorizontal l-childrenhorizontal-right">
								<button type="button"
												class="button button-primaryghost"
												[routerLink]="['/management/faculties/edit/', faculty.slug]"
												[disabled-when-requesting]="true"
								>Edit Faculty
								</button>
							</div>
						</td>
					</tr>
				</tbody>
			</table>
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
		title.setTitle("Management - Faculties");
		this.facultiesLoaded = this.institutionApi.getAllFacultiesWithinScope()
		.then((faculties) => {
			this.faculties = faculties
		});
	
	
	}

	ngOnInit() {
		super.ngOnInit();
	}


}