import { Injectable } from '@angular/core';
import { CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot, Router } from '@angular/router';
import { Observable } from 'rxjs/Observable';
import { UserProfileManager } from "../common/services/user-profile-manager.service";
import { SystemConfigService } from 'app/common/services/config.service';

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
export class AddIssuerAuthGuard extends AuthGuard{
	constructor(
		router: Router,
		profileManager: UserProfileManager,
		) {
		super(router, profileManager)
		this.permission = 'ui_issuer_add'
	}
}


@Injectable()
export class ViewIssuerAuthGuard extends AuthGuard{
	constructor(
		router: Router,
		profileManager: UserProfileManager,
		) {
		super(router, profileManager)
		this.permission = 'view_issuer_tab'
	}
}

@Injectable()
export class ViewManagementAuthGuard extends AuthGuard{
	constructor(
		router: Router,
		profileManager: UserProfileManager,
		) {
		super(router, profileManager)
		this.permission = 'view_management_tab' 
	}
}


@Injectable()
export class HasInstitutionScope extends AuthGuard{
	constructor(
		router: Router,
		profileManager: UserProfileManager,
		) {
		super(router, profileManager)
		this.permission = 'has_institution_scope' 
	}
}


@Injectable()
export class UserMaySignBadges extends AuthGuard{
	constructor(
		router: Router,
		profileManager: UserProfileManager,
		) {
		super(router, profileManager)
		this.permission = 'may_sign_assertions' 
	}
}


@Injectable()
export class IsStudentAuthGuard implements CanActivate {
	
	answer: boolean;
  // add the service we need
  constructor(
		private router: Router,
		private profileManager: UserProfileManager,
		) {}

  canActivate(
		next: ActivatedRouteSnapshot,
    state: RouterStateSnapshot): Observable<boolean> | Promise<boolean> | boolean {

			return this.profileManager.profileService.fetchSocialAccounts()
			.then(socialAccounts => {
				for (let account of socialAccounts){
					if (account['provider'] == 'edu_id' || account['provider'] == 'surfconext_ala'){
						return true
					} else {
						this.router.navigate(['/auth/unauthorized']);
						return false
					}
				}				
			})
	}
}


@Injectable()
export class SigningEnabled implements CanActivate {

	answer: boolean;
	// add the service we need
	constructor(
		private router: Router,
		private configService: SystemConfigService
	) { }

	canActivate() {
		if (this.configService.signingEnabled) {
			return true
		} else {
			this.router.navigate(['/auth/unauthorized']);
			return false
		}
	}
}

@Injectable()
export class EndorsementsEnabled implements CanActivate {

	answer: boolean;
	// add the service we need
	constructor(
		private router: Router,
		private configService: SystemConfigService
	) { }

	canActivate(){
		if (this.configService.endorsementsEnabled) {
			return true
		} else {
			this.router.navigate(['/auth/unauthorized']);
			return false
		}
	}
}


