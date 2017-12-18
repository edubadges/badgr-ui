import { BaseRoutableComponent } from "./base-routable.component";
import { OnInit, Inject, Component } from "@angular/core";
import { Router, ActivatedRoute, UrlSegment } from "@angular/router";
//import { LoginService } from "../../auth/auth.service";
import { SessionService } from "../services/session.service";

import "rxjs/operator/skip"

/**
 * Base class for all routable components (pages in the applications) that require authentication.
 */
export class BaseAuthenticatedRoutableComponent extends BaseRoutableComponent implements OnInit {
	constructor(
		protected router: Router,
		protected route: ActivatedRoute,
		protected sessionService: SessionService,
	) {
		super(router, route);
	}

	ngOnInit() {
		super.ngOnInit();

		if (! this.sessionService.isLoggedIn) {
			// Do a hard browser redirect to avoid any corrupted state from not being logged in
			window.location.assign(`/auth/login?authError=${encodeURIComponent("Please log in to Badgr first")}`);

			throw new Error("Not logged in");
		}
	}
}
