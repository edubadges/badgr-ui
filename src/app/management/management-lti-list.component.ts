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
			<table class="table" >
				<thead>
					<tr>
						<th scope="col">Client</th>
						<th scope="col">Actions</th>
					</tr>
				</thead>
				<tbody>
					<tr *ngFor="let client of ltiClients">
						<th scope="row">
							<div class="l-childrenhorizontal l-childrenhorizontal-small">
								<a [routerLink]="['/management/lti/edit/', client.slug]">{{client.name}}</a>
							</div>
						</th>
						<td>
							<div class="l-childrenhorizontal l-childrenhorizontal-right">
								<button type="button"
												class="button button-primaryghost"
												[routerLink]="['/management/lti/edit/', client.slug]"
												[disabled-when-requesting]="true"
								>Edit Client
								</button>
							</div>
						</td>
					</tr>
				</tbody>gd
			</table>
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