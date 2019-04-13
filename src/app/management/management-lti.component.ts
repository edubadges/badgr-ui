import { ActivatedRoute, Router } from "@angular/router";
import { Component, OnInit } from "@angular/core";
import { SessionService } from "../common/services/session.service";
import { BaseAuthenticatedRoutableComponent } from "../common/pages/base-authenticated-routable.component";
import { Title } from "@angular/platform-browser";

@Component({
	selector: 'managementLTI',
	template: `
	<span>LTI</span>
	`
})
export class ManagementLTIComponent extends BaseAuthenticatedRoutableComponent implements OnInit {
	constructor(
		router: Router,
		route: ActivatedRoute,
		sessionService: SessionService,
		protected title: Title,
	) {
		super(router, route, sessionService);
		title.setTitle("Management - LTI");
	}
}