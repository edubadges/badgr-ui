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
	selector: 'ManagementFacultyReports',
	template: `

	<main>
		<header class="wrap wrap-light l-containerhorizontal l-heading">
			<div class="heading">
				<div *bgAwaitPromises="[facultyStatsLoaded]" class="heading-x-text">
					<h1>{{faculty.name}}</h1>
					<h2>Reports of Issuers belonging to this faculty</h2>
				</div>
          <button type="button"
                  class="button button-primaryghost"
                  [routerLink]="['/management/reports/']"
                  [disabled-when-requesting]="true"
          >Back to overview
          </button>
			</div>
		</header>

		<div class="l-containerhorizontal l-containervertical l-childrenvertical wrap"
					*bgAwaitPromises="[facultyStatsLoaded]">
			<ng-container *ngIf="faculty.issuers.length == 0">
				<div class="card card-large" >
					<div class="card-x-main">
						<div class="card-x-image">
								<img 	[loaded-src]="issuerPlaceholderSrc"
											width="80"
											height="80">
						</div>
						<div class="card-x-text">
							<h1>This faculty has no Issuers</h1>
						</div>
					</div>
				</div>
			</ng-container>
			<ng-container *ngIf="faculty.issuers.length > 0">
				<div *ngFor="let issuer of faculty.issuers; let i = index">
					<div class="card card-large card-no-hover" >
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
							<div class="card-x-text">
								<canvas baseChart
								[datasets]="makeIssuerBarChartData(issuer)"
								[colors]="makeIssuerColors()"
								[options]="issuerBarChartOptions"
								[legend]="barChartLegend"
								[chartType]="barChartType">
								</canvas>
							</div>
							<div class="card-x-text"> 
								<div *ngIf="!showingExtendedStats(i)" style='height:80px; right:15px; top: 15px; position:absolute'>
									<button  type="button"
													class="button button-primaryghost"
													(click)="showExtendedStats(i)" > Show Badges
									</button>
								</div>
								<div *ngIf="showingExtendedStats(i)" style='height:80px; right:15px; top: 15px; position:absolute'>
									<button  type="button"
													class="button button-primaryghost"
													(click)="hideExtendedStats(i)" > Hide Badges
									</button>
								</div>
							</div>
						</div>
					</div>
					<br><br>
					<ng-container *ngIf="showingExtendedStats(i)">
						<ng-container *ngIf="issuer.badgeclasses.length == 0">
							<div class="card card-large">
								<div class="card-x-main">
									<div class="card-x-text">
										<h2> This Issuer has no Badge classes</h2>
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
			</ng-container>
		</div>
	</main>
	`
})
export class ManagementFacultyReportsComponent extends BaseAuthenticatedRoutableComponent implements OnInit {
	readonly issuerPlaceholderSrc = preloadImageURL(require('../../breakdown/static/images/placeholderavatar-issuer.svg'));
	readonly badgeLoadingImageUrl = require('../../breakdown/static/images/badge-loading.svg');
	readonly badgeFailedImageUrl = require('../../breakdown/static/images/badge-failed.svg');

	faculty: object;
	facultySlug: string;
	facultyStatsLoaded: Promise<any>;
	chartData: object;
	indexToShowExtendedStats: Array<Number> = [];

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
		this.facultySlug = this.route.snapshot.params['facultySlug'];
		this.showFacultyStats()
	}

	ngOnInit() {
		super.ngOnInit();
	}

	showFacultyStats(){
		this.facultyStatsLoaded = this.managementApi.getFacultyStats(this.facultySlug)
		.then((stats) => {
			this.faculty = stats
		})
	}

	showingExtendedStats(index){
		return this.indexToShowExtendedStats.includes(index)
	}

	showExtendedStats(index){
		this.indexToShowExtendedStats.push(index)
	}

	hideExtendedStats(index){
		let index_to_remove_at = this.indexToShowExtendedStats.indexOf(index)
		this.indexToShowExtendedStats.splice(index_to_remove_at, 1)
	}

	compareFaculties(a, b){
		return a['name'].localeCompare(b['name'])
	}

}