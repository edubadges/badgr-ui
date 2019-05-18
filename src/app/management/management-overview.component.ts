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
			<div style="height:300px; overflow:auto;">
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
													(click)="showFacultyStats(faculty.slug)"
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


		<ng-container *ngIf='showingStats'>
			<div class="l-containerhorizontal l-containervertical l-childrenvertical wrap"
						*bgAwaitPromises="[facultyStatsLoaded]">
				<div *ngFor="let issuer of currentStats.issuers; let i = index">
					<a (click)="showExtendedStats(i)" 
							class="card card-large" >
						<div class="card-x-main">
							<div class="card-x-image">
								<img [loaded-src]="issuer.image"
		                [loading-src]="issuerPlaceholderSrc"
		                 [error-src]="issuerPlaceholderSrc"
											alt="{{ issuer.name }} avatar"
											width="80"
											height="80">
							</div>
							<div class="card-x-text">
								<h1 [truncatedText]="issuer.name" [maxLength]="20"></h1>
							</div>
							<div class="card-x-actions">
								<canvas baseChart
								[datasets]="makeIssuerBarChartData(issuer)"
								[colors]="makeIssuerColors()"
								[options]="issuerBarChartOptions"
								[legend]="barChartLegend"
								[chartType]="barChartType">
								</canvas>
							</div>
						</div>
					</a>
					<br><br>
					<ng-container *ngIf="showingExtendedStats(i)">
						<ng-container *ngIf="issuer.badgeclasses.length == 0">
							<div class="card card-large">
								<div class="card-x-main">
									<div class="card-x-text">
										<h2> No Badge Classes Found</h2>
									</div>
								</div>
							</div>
						</ng-container>
						<ng-container *ngIf="issuer.badgeclasses.length > 0">
							<div class="l-gridtwo">
								<div *ngFor="let badgeClass of issuer.badgeclasses">
									<article class="card card-largeimage">
										<a class="card-x-main" [routerLink]="['/issuer/issuers', issuer.slug, 'badges', badgeClass.slug]">
											<div class="card-x-image">
												<img [loaded-src]="badgeClass.image"
															[loading-src]="badgeLoadingImageUrl"
															[error-src]="badgeFailedImageUrl"
															alt="{{ badgeClass.name }} avatar"
															width="80"
															height="80">
											</div>
											<div class="card-x-text">
												<h1 [truncatedText]="badgeClass.name" [maxLength]="12"></h1>
											</div>
											<div >
												<canvas style="width:200px !important;height:150px !important;" 
															baseChart
															[colors]="makeBadgeClassColors()"
															[datasets]="makeBadgeClassBarChartData(badgeClass)"
															[options]="issuerBarChartOptions"
															[legend]="barChartLegend"
															[chartType]="barChartType">
												</canvas>
											</div>
										</a>
									</article>
								</div>
							</div>
						</ng-container>
					</ng-container>
				</div>
			</div>
		</ng-container>
	</main>
	`
})
export class ManagementOverviewComponent extends BaseAuthenticatedRoutableComponent implements OnInit {
	readonly issuerPlaceholderSrc = preloadImageURL(require('../../breakdown/static/images/placeholderavatar-issuer.svg'));
	readonly badgeLoadingImageUrl = require('../../breakdown/static/images/badge-loading.svg');
	readonly badgeFailedImageUrl = require('../../breakdown/static/images/badge-failed.svg');

	faculties: Array<any>;
	facultiesLoaded: Promise<any>;
	facultyStatsLoaded: Promise<any>;
	currentStats: Object;
	chartData: object;
	showingStats: boolean = false;
	indexToShowExtendedStats: Number;

  barChartType: ChartType = 'bar';
  barChartLegend = true;
	issuerBarChartOptions: ChartOptions = {
		responsive: true,
    scales: { xAxes: [{}], yAxes: [
			{
				ticks: { beginAtZero: true,
									suggestedMax: 10,
								},
			}
		] },
    plugins: {
      datalabels: {
        anchor: 'end',
        align: 'end',
      }
    }
	};

	makeBadgeClassColors(){
		return [{ backgroundColor: 'rgba(195,10,40,0.5)'}]
	}
	
	makeIssuerColors(){
		return [
			{ backgroundColor: 'rgba(14,146,186,0.5)'},
			{ backgroundColor: 'rgba(195,10,40,0.5)'}
		]
	}


	makeBadgeClassBarChartData(badgeClass){
		let assertionCount = badgeClass['assertion_count']
		let barChartData:  ChartDataSets[] = [
			{ data : [assertionCount], 
				label: 'Assertions',
			},
		]
		 return barChartData
	}

	makeIssuerBarChartData(issuer){
		let badgeClassCount = issuer['badgeclasses'].length
		let assertionCount = 0
		for (let bc of issuer['badgeclasses']){
			assertionCount += bc['assertion_count']
		}
		let barChartData:  ChartDataSets[] = [
			{ data : [badgeClassCount], label: 'Badgeclasses'},
			{ data : [assertionCount], label: 'Assertions'},
		]
		 return barChartData
	}
	
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

	showFacultyStats(faculty_slug){
		this.facultyStatsLoaded = this.managementApi.getFacultyStats(faculty_slug)
		.then((stats) => {
			this.showingStats = true
			this.indexToShowExtendedStats = -1
			this.currentStats = stats
		})
	}

	showingExtendedStats(index){
		return this.indexToShowExtendedStats == index
	}

	showExtendedStats(index){
		this.indexToShowExtendedStats = index
	}

	compareFaculties(a, b){
		return a['name'].localeCompare(b['name'])
	}

}