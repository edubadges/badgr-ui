import { Component, OnInit } from "@angular/core";
import { Router, ActivatedRoute } from "@angular/router";
import { SessionService } from "../common/services/session.service";
import { BaseAuthenticatedRoutableComponent } from "../common/pages/base-authenticated-routable.component";
import { MessageService } from "../common/services/message.service";
import { IssuerManager } from "./services/issuer-manager.service";
import { BadgeClassManager } from "./services/badgeclass-manager.service";
import { Issuer } from "./models/issuer.model";
import { BadgeClass } from "./models/badgeclass.model";
import { Title } from "@angular/platform-browser";
import { preloadImageURL } from "../common/util/file-util";


@Component({
	selector: 'issuer-list',
	template: `
		<main>
		  <form-message></form-message>
		  <header class="wrap wrap-light l-containerhorizontal l-heading">
		
		    <div class="heading">
		      <div class="heading-x-text">
		        <h1>Issuers <span *ngIf="issuers">{{ issuers?.length }} Issuers</span></h1>
		      </div>
		      <div class="heading-x-actions">
		        <a [routerLink]="['/issuer/create']"
		           class="button button-major"
		           [disabled-when-requesting]="true">Create Issuer</a>
		      </div>
		    </div>
		
		  </header>
		
		  <div class="l-containerhorizontal l-containervertical l-childrenvertical wrap"
		       *bgAwaitPromises="[issuersLoaded, badgesLoaded]">
		    <article class="emptyillustration" *ngIf="! issuers.length">
		      <div>
			    Create an issuer to begin awarding badges! 
			    <a href="https://support.badgr.io/pages/viewpage.action?pageId=327776" target="_blank">Learn more</a> about Open Badges
			  </div>
		      <img [src]="noIssuersPlaceholderSrc" alt="You have no issuers">
		    </article>
		
		    <a class="card card-large" *ngFor="let issuer of issuers" [routerLink]="['/issuer/issuers/', issuer.slug]">
		        <div class="card-x-main">
		            <div class="card-x-image">
		              <img [loaded-src]="issuer?.image"
		                   [loading-src]="issuerPlaceholderSrc"
		                   [error-src]="issuerPlaceholderSrc"
		                   alt="{{ issuer.name }} avatar"
		                   width="80"
		                   height="80">
		            </div>
		            <div class="card-x-text">
		                <h1>{{issuer.name}}</h1>

			              <small>Your Role: {{ issuer.currentUserStaffMember?.roleInfo.label }}</small>
			            
		                <p [truncatedText]="issuer.description" [maxLength]="250"></p>
		                <ul class="statlist">
		                  <li class="statlist-x-badge">
		                    <strong>{{ issuer.badgeClassCount }}</strong>
		                    {{ issuer.badgeClassCount == 1 ? 'Badge' : 'Badges' }}
		                  </li>
		                  <li class="statlist-x-earner">
		                    <strong>{{ issuer.recipientCount }}</strong>
		                    {{ issuer.recipientCount == 1 ? 'Recipient' : 'Recipients' }}
		                  </li>
		                  <li class="statlist-x-group">
		                    <strong>{{ issuer.recipientGroupCount }}</strong>
		                    {{ issuer.recipientGroupCount == 1 ? 'Group' : 'Groups' }}
		                  </li>
		                  <li class="statlist-x-pathway">
		                    <strong>{{ issuer.pathwayCount }}</strong>
		                    {{ issuer.pathwayCount == 1 ? 'Pathway' : 'Pathways' }}
		                  </li>
		                </ul>
		            </div>
		        </div>
		
		        <!-- Top Badges Stack -->
		        <div class="card-x-actions" *ngFor="let issuerBadges of [issuerToBadgeInfo[issuer.issuerUrl]]">
		          <h2 class="titledivider" *ngIf="issuerBadges">Top Badges</h2>
		
		          <!-- Top Badge -->
		          <ng-template [ngIf]="issuerBadges">
		            <div class="stack stack-small"
		                 *ngFor="let badge of issuerBadges.badges.slice(0,3)"
		            >
		              <badge-image class="stack-x-image" [badge]="badge" [size]="40"></badge-image>
		              <div class="stack-x-text">
		                <h2>{{ badge.name }}</h2>
		                <small *ngIf="badge.recipientCount === 1">{{ badge.recipientCount }} Recipient</small>
		                <small *ngIf="badge.recipientCount > 1">{{ badge.recipientCount }} Recipients</small>
		              </div>
		            </div>
		          </ng-template>
		        </div>
		    </a>
		  </div>
		</main>
	`
})
export class IssuerListComponent extends BaseAuthenticatedRoutableComponent implements OnInit {
	readonly issuerPlaceholderSrc = preloadImageURL(require('../../breakdown/static/images/placeholderavatar-issuer.svg'));
	readonly noIssuersPlaceholderSrc = require('../../breakdown/static/images/emptyillustration-noissuers.svg');

	issuers: Array<Issuer>;
	badges: Array<BadgeClass>;
	issuerToBadgeInfo: {[issuerId: string]: IssuerBadgesInfo} = {};

	issuersLoaded: Promise<any>;
	badgesLoaded: Promise<any>;

	constructor(
		protected title: Title,
		protected messageService: MessageService,
		protected issuerManager: IssuerManager,
		protected badgeClassService: BadgeClassManager,
		loginService: SessionService,
		router: Router,
		route: ActivatedRoute
	) {
		super(router, route, loginService);
		title.setTitle("Issuers - Badgr");

		// subscribe to issuer and badge class changes
		this.issuersLoaded = new Promise((resolve, reject) => {

			this.issuerManager.allIssuers$.subscribe(
				(issuers) => {
					this.issuers = issuers.slice().sort(
						(a, b) => b.createdAt.getTime() - a.createdAt.getTime()
					);
					resolve();
				},
				error => {
					this.messageService.reportAndThrowError("Failed to load issuers", error);
					resolve();
				}
			);

		});

		this.badgesLoaded = new Promise((resolve, reject) => {

			this.badgeClassService.badgesByIssuerUrl$.subscribe(badges => {
				this.issuerToBadgeInfo = {};

				Object.keys(badges).forEach(issuerSlug => {
					let issuerBadges = badges[ issuerSlug ];

					this.issuerToBadgeInfo[ issuerSlug ] = new IssuerBadgesInfo(
						issuerBadges.reduce((sum, badge) => sum + badge.recipientCount, 0),
						issuerBadges.sort((a, b) => b.recipientCount - a.recipientCount)
					);
				});

				resolve();
			});

		});
	}

	ngOnInit() {
		super.ngOnInit();
	}
}

class IssuerBadgesInfo {
	constructor(
		public totalBadgeIssuanceCount: number = 0,
		public badges: BadgeClass[] = []
	) {}
}

