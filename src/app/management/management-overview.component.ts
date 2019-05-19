import { ActivatedRoute, Router } from "@angular/router";
import { Component, OnInit } from "@angular/core";
import { SessionService } from "../common/services/session.service";
import { BaseAuthenticatedRoutableComponent } from "../common/pages/base-authenticated-routable.component";
import { Title } from "@angular/platform-browser";
import { InstitutionApiService } from "./services/institution-api.service"
import { ManagementApiService } from "../management/services/management-api.service";
import { ChartOptions, ChartType, ChartDataSets } from 'chart.js';
import { preloadImageURL } from "../common/util/file-util";


@Component({
	selector: 'managementOverview',
	template: `

	<main>
		<header class="wrap wrap-light l-containerhorizontal l-heading">
			<div class="heading">
				<div class="heading-x-text">
					<h1>Overview <span *ngIf="faculties">{{ faculties?.length }} Faculties</span></h1>
				</div>
			</div>

		</header>

		<div 	class="l-containerhorizontal l-containervertical l-childrenvertical wrap"
					*bgAwaitPromises="[facultiesLoaded]">
			<div>
				<table class="table">
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
													[routerLink]="['/management/overview/faculty/', faculty.slug]"
													[disabled-when-requesting]="true"
									>Show Statistics
									</button>
								</div>
							</td>
						</tr>
					</tbody>
				</table>
			</div>
		</div>
	</main>
	`
})
export class ManagementOverviewComponent extends BaseAuthenticatedRoutableComponent implements OnInit {

	faculties: Array<any>;
	facultiesLoaded: Promise<any>;
	
	constructor(
		router: Router,
		route: ActivatedRoute,
		sessionService: SessionService,
		protected title: Title,
		protected institutionApi: InstitutionApiService,
		protected managementApi: ManagementApiService,

	) {
		super(router, route, sessionService);
		title.setTitle("Management - Faculties");
		this.facultiesLoaded = this.institutionApi.getAllFacultiesWithinScope()
		.then((faculties) => {
			this.faculties = faculties
			this.faculties.sort(this.compareFaculties)
		});
	}

	ngOnInit() {
		super.ngOnInit();
	}

	compareFaculties(a, b){
		return a['name'].localeCompare(b['name'])
	}

}