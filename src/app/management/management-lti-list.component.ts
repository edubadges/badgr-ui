import { ActivatedRoute, Router } from "@angular/router";
import { Component, OnInit } from "@angular/core";
import { SessionService } from "../common/services/session.service";
import { BaseAuthenticatedRoutableComponent } from "../common/pages/base-authenticated-routable.component";
import { Title } from "@angular/platform-browser";
import { LTIClientApiService } from "./services/lti-client-api.service"

@Component({
	selector: 'managementLTIList',
	template: `
	<main>
		<header class="wrap wrap-light l-containerhorizontal l-heading">
			<div class="heading">
				<div class="heading-x-text">
					<h1>LTI Clients <span *ngIf="ltiClients">{{ ltiClients?.length }} LTI Clients</span></h1>
				</div>
				<div class="heading-x-actions">
					<a [routerLink]="['/management/lti/create/']"
						class="button button-major"
						[disabled-when-requesting]="true">Create LTI Client</a>
				</div>
			</div>

		</header>

		<div 	class="l-containerhorizontal l-containervertical l-childrenvertical wrap"
					*bgAwaitPromises="[ltiClientsLoaded]">
			<a class="card card-large" *ngFor="let client of ltiClients" [routerLink]="['/management/lti/edit/', client.slug]">
				<div class="card-x-main">
					<div class="card-x-text">
						<h1>{{client.name}}</h1>
					</div>
				</div>
			</a>
		</div>

	</main>
	`
})
export class ManagementLTIClientListComponent extends BaseAuthenticatedRoutableComponent implements OnInit {
	
	ltiClients: object;
	ltiClientsLoaded: Promise<any>;
	
	constructor(
		router: Router,
		route: ActivatedRoute,
		sessionService: SessionService,
		protected title: Title,
		protected ltiClientApi: LTIClientApiService,
	) {
		super(router, route, sessionService);
		title.setTitle("Management - LTI");
		this.ltiClientsLoaded = this.ltiClientApi.getLTIClientsWithinScope()
		.then((ltiClients) => {
			this.ltiClients = ltiClients
		});
	}

	ngOnInit() {
		super.ngOnInit();
	}

}