import { Injectable } from '@angular/core';
import { CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot, Router } from '@angular/router';
import { Observable } from 'rxjs/Observable';
// import { AuthService } from '../core/auth.service';
import { UserProfileManager } from "../common/services/user-profile-manager.service";

class AuthGuard implements CanActivate {
	
	has_permsission : boolean;
	permission: string;
  // add the service we need
  constructor(
		private router: Router,
		private profileManager: UserProfileManager,
		) {}

	hasPermission(profile){
		var current_user_permissions = JSON.parse(profile.apiModel['user_permissions'])
		// return current_user_permissions.includes('add_issuer');
		console.log(this.permission)
		return current_user_permissions.includes(this.permission);
	}

  canActivate(
		next: ActivatedRouteSnapshot,
    state: RouterStateSnapshot): Observable<boolean> | Promise<boolean> | boolean {
			this.profileManager.userProfilePromise
			.then(profile => {
				this.has_permsission = this.hasPermission(profile)
				if (!this.has_permsission){
					this.router.navigate(['/auth/unauthorized']);
					return false
				}
			})
			return true;
		}
	}


@Injectable()
export class IssuerAuthGuard extends AuthGuard{
	constructor(
		router: Router,
		profileManager: UserProfileManager,
		) {
		super(router, profileManager)
		this.permission = 'add_issuer'
	}
}