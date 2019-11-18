import { Component, forwardRef, Inject, OnInit } from "@angular/core";

import { ActivatedRoute, Router } from "@angular/router";
import { SessionService } from "../common/services/session.service";
import { BaseAuthenticatedRoutableComponent } from "../common/pages/base-authenticated-routable.component";
import { MessageService } from "../common/services/message.service";
import { Title } from "@angular/platform-browser";
import { UserProfileManager } from "../common/services/user-profile-manager.service";

import { ExternalToolsManager } from "app/externaltools/services/externaltools-manager.service";
import { LtiApiService } from "./services/lti-api.service";
import { BadgeClass } from "../issuer/models/badgeclass.model";
import { ApiBadgeClassContextId } from "../issuer/models/badgeclass-api.model";
import { EmbedService } from "../common/services/embed.service";


@Component({
	selector: 'lti-badges',
	template:`
		<main>
			<form-message></form-message>
			<ng-template [bgAwaitPromises]="[badgesLoaded]">
				
	
					<!-- Badge Class List =============================================================================================-->
					<header class="l-childrenhorizontal l-childrenhorizontal-spacebetween l-childrenhorizontal-spacebetween">
						<h2 class="title title-is-smallmobile l-marginBottom-1andhalfx">Badges die beschikbaar zijn voor deze cursus</h2>
					</header>
					<div class="l-overflowhorizontal" *bgAwaitPromises="[badgesLoaded]">
						<table class="table" *ngIf="currentLtiBadges?.length">
							<thead>
								<tr>
									<th scope="row" colspan="3">Badge</th>
									
								</tr>
							</thead>
							<tbody>
								 	
								<tr *ngFor="let badge of currentLtiBadges">
									<td>
											<div class="l-childrenhorizontal l-childrenhorizontal-small">
												<img class="l-childrenhorizontal-x-offset"
														 src="{{badge.image}}"
														 width="100">
											
												<a [routerLink]="['/public/badges/', badge.badgeClassEntityId]">{{badge.name}}</a>
                      </div>
										</td>
										<td>
												<div *ngIf="badge.requested"><span class="state state-pill state-is-pending">Requested</span></div>
													<div *ngIf="badge.rewarded"><span class="state state-pill state-is-success">Awarded</span></div>
													<div *ngIf="badge.revoked"><span class="state state-pill state-is-error">Revoked</span></div>
													<div *ngIf="badge.denied"><span class="state state-pill state-is-error">Denied</span></div>
													<div *ngIf="!badge.requested && !badge.rewarded && !badge.revoked && !badge.denied">
                              <a class="button button-primaryghost"
                                 [routerLink]="['/public/badges/', badge.badgeClassEntityId]"
                              >Request badge</a>
													</div>
											
									</td>
									
									
								</tr>
							</tbody>
						</table>
              
						<p class="empty" *ngIf="! currentLtiBadges?.length">
							There are no badges for this course
						</p>
							
							
					</div>
          <div>
							<br>
              <a class="button button-major" [routerLink]="['/recipient/badges']">backpack</a>
          </div>
				
			</ng-template>
		</main>
	`,
})
export class LtiBadgesComponent extends BaseAuthenticatedRoutableComponent implements OnInit {


	badges: Array<BadgeClass>;
	currentLtiBadges: Array<ApiBadgeClassContextId>;

	badgesLoaded: Promise<any>;

	currentContextId: string = "";

	constructor(
		loginService: SessionService,
		router: Router,
		route: ActivatedRoute,
		protected messageService: MessageService,
		protected title: Title,
		protected profileManager: UserProfileManager,
		private externalToolsManager: ExternalToolsManager,
		private ltiManager: LtiApiService,
		private embedService: EmbedService
	) {
		super(router, route, loginService);

		title.setTitle("Issuer Detail - Badgr");
		if(this.embedService.isEmbedded) {
			this.badgesLoaded = new Promise((resolve, reject) => {
					ltiManager.currentContextId.then(r => {
						this.currentContextId = r['lticontext'];
						ltiManager.getAllContextIdStudentBadgeClasses(this.currentContextId).then(r => {
							this.currentLtiBadges = r;
						});
						resolve();
					});
				}
			);
		}

	}

	ngOnInit() {
		super.ngOnInit();
	}


	get ltiContextId(): string{
		return this.currentContextId;
	}



}