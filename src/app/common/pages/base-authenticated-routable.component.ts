import { BaseRoutableComponent } from "./base-routable.component";
import { OnInit, Inject, Component } from "@angular/core";
import { Router, ActivatedRoute, UrlSegment } from "@angular/router";
//import { LoginService } from "../../auth/auth.service";
import { SessionService } from "../services/session.service";
import {UserProfileManager} from "../services/user-profile-manager.service";

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

export class BaseAuthorizedAndAuthenticatedRoutableComponent extends BaseAuthenticatedRoutableComponent implements OnInit{
	currentPermissionLoaded: Promise<any>;
	constructor(
		protected router: Router,
		protected route: ActivatedRoute,
		protected sessionService: SessionService,
		protected profileManager: UserProfileManager,
		protected permission_needed: String,
	) {
		super(router, route, sessionService);
	}
	
	hasViewPermission(profile){
		let current_user_permissions = JSON.parse(profile.apiModel['user_permissions']);
		if (current_user_permissions[0]=="is_superuser" || current_user_permissions[0]=="is_staff"){
			// do nothing
		} else {
			let current_user_has_permission = current_user_permissions.includes(this.permission_needed);
			if (! current_user_has_permission ) {
				this.router.navigate(['/auth/unauthorized']);
			}
		}
	}
	
	ngOnInit() {
		super.ngOnInit();
		this.currentPermissionLoaded = this.profileManager.userProfilePromise
			.then(profile => this.hasViewPermission(profile))
			.catch(e =>	this.router.navigate(['/auth/unauthorized']))
	}
}
