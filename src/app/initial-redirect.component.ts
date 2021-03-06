import { Component } from "@angular/core";
import { Router } from "@angular/router";
import { SessionService } from "./common/services/session.service";
import { UserProfileManager } from "./common/services/user-profile-manager.service";

import "../thirdparty/scopedQuerySelectorShim";

// Shim in support for the :scope attribute
// See https://github.com/lazd/scopedQuerySelectorShim and
// https://stackoverflow.com/questions/3680876/using-queryselectorall-to-retrieve-direct-children/21126966#21126966

@Component({
	selector: "initial-redirect",
	template: ``
})
export class InitialRedirectComponent {
	constructor(
		private sessionService: SessionService,
		private router: Router,
		private profileManager: UserProfileManager,
	) {
		if (sessionService.isLoggedIn) {
			this.profileManager.profileService.fetchSocialAccounts()
			.then(socialAccounts => {
				this.profileManager.userProfilePromise
					.then(profile => {
						var current_user_permissions = JSON.parse(profile.apiModel['user_permissions'])

						for (let account of socialAccounts){
							if (account['provider'] == 'edu_id' || account['provider'] == 'surfconext_ala'){
								router.navigate(['/recipient/badges']);
							}
							else if (account['provider'] == 'surf_conext'){
								if (current_user_permissions.includes('view_issuer_tab')) {
									router.navigate(['/issuer']);
								} else {
									router.navigate(['/profile/profile']);
								}
							}
						};		
					})
			})
		} else {
			router.navigate(['/auth/login']);
		}
	}
}
