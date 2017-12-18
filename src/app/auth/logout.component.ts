import { Component, OnInit } from "@angular/core";
import { Router, ActivatedRoute } from "@angular/router";
import { SessionService } from "../common/services/session.service";
import { MessageService } from "../common/services/message.service";
import { BaseRoutableComponent } from "../common/pages/base-routable.component";


@Component({
	selector: 'logout',
	template: ''
})
export class LogoutComponent extends BaseRoutableComponent {
	constructor(
		router: Router,
		route: ActivatedRoute,
		protected loginService: SessionService
	) {
		super(router, route);
	}

	ngOnInit() {
		super.ngOnInit();

		this.loginService.logout();
		window.location.assign('/auth')
	}
}

