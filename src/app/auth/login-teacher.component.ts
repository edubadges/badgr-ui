import { AfterViewInit, Component, OnInit, ViewChild } from "@angular/core";
import { ActivatedRoute, Router } from "@angular/router";
import { SessionService } from "../common/services/session.service";
import { MessageService } from "../common/services/message.service";
import { BaseRoutableComponent } from "../common/pages/base-routable.component";
import { Title } from "@angular/platform-browser";


import { SystemConfigService } from "../common/services/config.service";
import { QueryParametersService } from "../common/services/query-parameters.service";
import { OAuthManager } from "../common/services/oauth-manager.service";


@Component({
	selector: 'login-teacher',
	template: `
		<main *bgAwaitPromises="[ initFinished ]">
			<form-message></form-message>
			
			<div  class="l-auth">
				<ng-template [ngIf]="! oAuthManager.currentAuthorization">
					<ng-template [ngIf]="! verifiedName">
						<h3 class="l-auth-x-title title title-bold" id="heading-form">{{ currentTheme.welcomeMessage }}</h3>
						<p class="l-auth-x-text text text-quiet" *ngIf="sessionService.enabledExternalAuthProviders.length">
							Login for staff
						</p>
					</ng-template>
				</ng-template>
	
				<form class="l-form l-form-span"
				      role="form"
				      aria-labelledby="heading-form"
				      (ngSubmit)="submitAuth()"
				      novalidate
				>
					<!-- Social Account Buttons -->
					
          <div class="formfield">
            <p class="formfield-x-label">Sign In With</p>
            <div class="l-authbuttons">
                <button type="button"
                class="buttonauth buttonauth-{{ provider.slug }}"
                (click)="sessionService.initiateUnauthenticatedExternalAuth(provider)"
                >{{ provider.name }}
                </button>
            </div>
          </div>
	
					<div class="formdivider"></div>
				</form>
			</div>
		</main>
	`
})
export class LoginTeacherComponent extends BaseRoutableComponent implements OnInit, AfterViewInit {
	verifiedName: string;
	verifiedEmail: string;
  provider: object;

	initFinished: Promise<any> = new Promise(() => {});
	loginFinished: Promise<any>;

	get currentTheme() { return this.configService.currentTheme }

	constructor(
		private title: Title,
		private sessionService: SessionService,
		private messageService: MessageService,
		private configService: SystemConfigService,
		private queryParams: QueryParametersService,
		public oAuthManager: OAuthManager,
		router: Router,
		route: ActivatedRoute
	) {
		super(router, route);
		let serviceName: string;
		serviceName = this.configService.currentTheme.serviceName;
		title.setTitle("Login - " + serviceName);
		this.handleQueryParamCases();
	}

	ngOnInit() {
		super.ngOnInit();

		let email: string;

		this.initVerifiedData();

		email = this.verifiedEmail || '';
    
    for (let provider of this.sessionService.enabledExternalAuthProviders){
      if (provider.name == 'SURFconext') {
        this.provider = provider
      }
    }
    
	}

	private handleQueryParamCases() {
		try {
			// Handle external auth case
			if (this.queryParams.queryStringValue("authToken", true)) {
				this.sessionService.storeToken({
					token: this.queryParams.queryStringValue("authToken", true)
				});

				this.initFinished = this.router.navigate([ 'recipient' ]);
				return;
			}

			// Handle external auth failure case
			else if (this.queryParams.queryStringValue("authError", true)) {
				this.sessionService.logout();
				this.messageService.reportHandledError(this.queryParams.queryStringValue("authError", true), null, true);
			}

			// Handle already logged-in case
			else if (this.sessionService.isLoggedIn) {
				this.initFinished = this.router.navigate([ 'recipient' ]);
				return;
			}

			this.initFinished = Promise.resolve(true);
		} finally {
			this.queryParams.clearInitialQueryParams();
		}
	}

	ngAfterViewInit(): void {
		
	}

	private initVerifiedData() {
		this.verifiedName = this.queryParams.queryStringValue('name');
		this.verifiedEmail = this.queryParams.queryStringValue('email');
	}

}
