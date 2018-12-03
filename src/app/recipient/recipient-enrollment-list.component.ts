import { Component, OnInit} from "@angular/core";
import { Router, ActivatedRoute } from "@angular/router";
import { Title } from "@angular/platform-browser";
import { SessionService } from "../common/services/session.service";
import { UserProfileManager } from "../common/services/user-profile-manager.service";
import { BaseAuthenticatedRoutableComponent } from "../common/pages/base-authenticated-routable.component";
import { UserProfile } from "../common/model/user-profile.model";
import { StudentsEnrolledApiService } from "../issuer/services/studentsenrolled-api.service";
import { UserProfileApiService } from "../common/services/user-profile-api.service"


@Component({
	selector: 'recipient-earned-badge-list',
	template: `
  <main>
    <header class="wrap wrap-light l-containerhorizontal l-heading">
      <div class="heading">
        <div class="heading-x-text">
          <h1>Enrollments <span *ngIf="!! allEnrollments">{{ allEnrollments.length }} {{ allEnrollments.length == 1 ? "Enrollment" : "Enrollments" }}</span></h1>
        </div>
      </div>
    </header>
  </main>
	<ng-template [bgAwaitPromises]="[ enrollmentsLoaded ]">		
		<article class="emptyillustration l-containervertical" *ngIf="allEnrollments?.length == 0">
			<h1>You have no current enrollments</h1>
			<div>
				Enroll for Badges by visiting the url provided by your teacher.
			</div>
		</article>
		
		<div class="l-containerhorizontal wrap" *ngIf="allEnrollments?.length > 0">
			<div class="l-headeredsection">
				<div class="l-overflowhorizontal">
				<table class="table">
						<thead>
							<tr>
								<th scope="col">Badge</th>
								<th scope="col">Issuer</th>
								<th scope="col">Enrollment Date</th>
								<th scope="col">Status</th>
								<th class="table-x-hidetext hidden" scope="col">Actions</th>
							</tr>
						</thead>
						<tbody>
							<ng-template ngFor let-enrollment [ngForOf]="allEnrollments" let-i="index" >
								<tr>
									<th scope="row">
										<a class="stack stack-list"
											 [routerLink]="['/public/badges', enrollment.badge_class.entity_id]">
											<span class="stack-x-image">
												<img [loaded-src]="enrollment.badge_class.image"
														 [loading-src]="badgeLoadingImageUrl"
														 [error-src]="badgeFailedImageUrl"
														 width="40" />
											</span>
											<span class="stack-x-text">
												<span class="stack-x-title">{{ enrollment.badge_class.name }}</span>
											</span>
										</a>
									</th>
									<th scope="row">{{enrollment.badge_class.issuer.name}}</th>
									<th scope="row">{{enrollment.date_created}}</th>
									<th scope="row">{{enrollment.revoked? 'Revoked' : enrollment.date_awarded? 'Awarded' : 'Enrolled'}}</th>
									<td>
										<div class="l-childrenhorizontal l-childrenhorizontal-right">
											<button *ngIf="!enrollment.date_awarded" class="button button-primaryghost" type="button" (click)="withdrawStudent(i, enrollment.id)">Withdraw</button>
										</div>
									</td>
								</tr>
							</ng-template>
						</tbody>
					</table>
				</div>
			</div>
		</div>
	</ng-template>
  `
})

export class RecipientEnrollmentListComponent extends BaseAuthenticatedRoutableComponent implements OnInit {
  
  enrollmentsLoaded: Promise<any>;
  allEnrollments: object[];
  profile: UserProfile;
  profileLoaded: Promise<any>;
  
  constructor(
    router: Router,
		route: ActivatedRoute,
		sessionService: SessionService,
		private title: Title,
    private profileManager: UserProfileManager,
    private apiService: StudentsEnrolledApiService,
    private userProfileApiService: UserProfileApiService,

  ){
    super(router, route, sessionService);
    title.setTitle("Enrollments - Badgr");
    this.profileLoaded = profileManager.userProfilePromise
    .then(profile => {
      this.profile = profile
      this.loadSocialAccount()
    })                      
  }
  
  ngOnInit() {
    super.ngOnInit();
	}
	
	withdrawStudent(index, enrollmentID){
		this.apiService.withdrawStudent(enrollmentID)
			.then(r => {
				this.allEnrollments.splice(index, 1)})
			.catch(r => console.log(r))
	}
	
  getEnrollments(eduID) {
		this.enrollmentsLoaded = this.apiService.getEnrollments(eduID)
                              .then(response => {
																this.allEnrollments = response
															})
  }
	
  loadSocialAccount(){
    this.userProfileApiService.fetchSocialAccounts()
      .then(socialAccounts => {
				for (let account of socialAccounts){
					if (account['provider']=='edu_id') {
						let eduID = account['uid']
						this.getEnrollments(eduID)
				}	else {
					// there was no eduID socialAccount
						this.router.navigate(['/auth/unauthorized']);
				}
			}
    })
  }
  
}
