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


@Component({
	selector: 'lti-badges-staff',
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
															
																<a [routerLink]="['/public/badges/', badge.badgeClassEntityId]"><h1>{{badge.name}}</h1></a>
                              </div>
													</td>
													<td>
                                  <a class="button button-primaryghost" *ngIf="badge.can_award"
                                          (click)="removeBadgeClassFromLMS($event, badge,ltiContextId)"
                                  >Remove badge from this LMS course</a>
                                  <a class="button button-primaryghost"  *ngIf="badge.can_award"
                                     [routerLink]="['/issuer/issuers/', badge.issuer_slug, 'badges', badge.badgeClassEntityId, 'issue']"
                                  >Award</a>
                          </td>


                      </tr>
                      </tbody>
                  </table>

                  <p class="empty" *ngIf="! currentLtiBadges?.length">
                      There are no badges for this course
                  </p>
                  <div>
                      <p>
                          <a class="button button-primaryghost" [routerLink]="['/issuer/']">Voeg Badge toe aan cursus</a>
                      </p>
                  </div>
              </div>


          </ng-template>
      </main>
	`,
})
export class LtiBadgesStaffComponent extends BaseAuthenticatedRoutableComponent implements OnInit {


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
	) {
		super(router, route, loginService);

		title.setTitle("Issuer Detail - Badgr");
		this.badgesLoaded = new Promise((resolve, reject) => {
				ltiManager.currentContextId.then(r => {
					this.currentContextId = r['lticontext'];
					ltiManager.getAllContextIdBadgeClasses(this.currentContextId).then(r => {
						this.currentLtiBadges = r;
					});
					resolve();
				});
			}
		);

	}

	ngOnInit() {
		super.ngOnInit();
	}


	get ltiContextId(): string{
		return this.currentContextId;
	}

	removeBadgeClassFromLMS(ev,badge,ltiContextId){
		let badgeClassContextId = {
			badgeClassEntityId:badge.slug,
			contextId: ltiContextId
		} as ApiBadgeClassContextId;
		badgeClassContextId.badgeClassEntityId = badge.badgeClassEntityId;
		badgeClassContextId.contextId = ltiContextId;
		this.ltiManager.removeBadgeClassFromLMS(badgeClassContextId).then(r => { console.log('succes');
			this.ltiManager.getAllContextIdBadgeClasses(this.currentContextId).then(r => {
				this.currentLtiBadges = r;
			});
		});

	}



}