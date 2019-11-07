import { BadgrApiFailure } from './../common/services/api-failure';
import { CommonDialogsService } from 'app/common/services/common-dialogs.service';
import { ApiBadgeInstance } from './models/badgeinstance-api.model';
import { BadgeInstanceApiService, BadgeInstanceResultSet } from './services/badgeinstance-api.service';
import { BadgeInstanceManager } from './services/badgeinstance-manager.service';
import { BaseAuthenticatedRoutableComponent } from "../common/pages/base-authenticated-routable.component";
import { SystemConfigService } from './../common/services/config.service';
import { UserProfileManager } from './../common/services/user-profile-manager.service';
import { Component, OnInit } from "@angular/core";
import { Validators } from "@angular/forms";
import { ActivatedRoute, Router } from "@angular/router"
import { MessageService } from "../common/services/message.service";
import { SessionService } from "../common/services/session.service";
import { Title } from "@angular/platform-browser";
import { AbstractControl, FormArray, FormControl, FormGroup, FormBuilder } from "@angular/forms";
import { markControlsDirty } from "../common/util/form-util";

@Component({
	selector: 'badgeclass-issue-bulk-award-signed',
	template: `
	<main>
		<form-message></form-message>
		<header class="wrap wrap-light l-containerhorizontal l-heading">
			<header class="heading">
				<div class="heading-x-text">
					<h1 id="heading-awardbadge">Sign Badges</h1>
				</div>
			</header>
		</header>
		<div class="wrap l-containerhorizontal ">
			<div class="l-overflowhorizontal" *bgAwaitPromises="[badgeInstancesLoaded]">
				<table class="table" *ngIf="badgeInstances?.length">
					<thead>
						<tr>
							<th scope="col">Badgeclass</th>
							<th scope="col">EduID</th>
							<th scope="col">Issue Date</th>
						</tr>
					</thead>
					<tbody>
						<tr *ngFor="let instance of badgeInstances">
							<th scope="row">
								<div class="l-childrenhorizontal l-childrenhorizontal-small">
								
									<a href="{{instance.badge_class}}">
										<img [src]="instance.image" width="40" height="40" alt="{{ instance.badge_class }}" />
									</a>

								</div>
								
							</th>
							<td>
								<label class="table-x-badge">
									{{instance.recipient_identifier}}
								</label>
							</td>
							<td>
								<label class="table-x-badge">
									{{instance.created_at.split('T')[0]}}
								</label>
							</td>
						</tr>
					</tbody>
				</table>

			<form class="l-containerhorizontal l-containervertical"
								[formGroup]="badgeInstanceForm"
								(ngSubmit)="onSubmit()"
								novalidate
					>
				<div class="l-childrenhorizontal l-childrenhorizontal-right">
					<button
						type="submit"
						class="button"
						[disabled]="!! signPromise"
						[loading-promises]="[ signPromise ]"
						loading-message="signing"
						(click)="clickSubmit($event)"
					>Sign All</button>
				</div>
			</form>

			</div>
		</div>
	</main>
	
	`})

export class BadgeClassIssueBulkSignComponent extends BaseAuthenticatedRoutableComponent {
	
	signPromise: Promise<any> | null = null;
	badgeInstancesLoaded: Promise<any>;
	badgeInstances: ApiBadgeInstance[];
	badgeInstanceForm: FormArray;


	constructor(
		sessionService: SessionService,
		router: Router,
		route: ActivatedRoute,
		protected title: Title,
		protected messageService: MessageService,
		protected badgeInstanceApiService: BadgeInstanceApiService,
		protected dialogService: CommonDialogsService,
		protected fb: FormBuilder,
	) {
		super(router, route, sessionService);
		title.setTitle("Sign awarded Badges - Badgr");

		this.badgeInstancesLoaded = this.badgeInstanceApiService.listBadgeInstancesForSigning()
			.then(result => {
				this.badgeInstances = result.instances
				this.badgeInstanceForm = this.fb.array(this.badgeInstances.map(instance => this.fb.group({
					slug: [instance.slug]
				})))
			})
	}

	signBadges(formState, password){
		this.signPromise = this.badgeInstanceApiService.signBadgeInstanceBatched(formState, password)
			.then(r => r)
			.catch(error => {
				this.messageService.reportHandledError(`Unable to sign badges: ${BadgrApiFailure.from(error).verboseError}`)
			})
	}

	onSubmit() {
		const formState = this.badgeInstanceForm.value;
		formState.expires_at = formState.expires_at ? formState.expires_at.format('DD/MM/YYYY') : null  // force remove timezone
		this.dialogService.enterPasswordDialog.openDialog()
			.then(password => {
				this.signBadges(formState, password)
			})
			.catch(error => error)
	}

	clickSubmit(ev) {
		if (!this.badgeInstanceForm.valid) {
			ev.preventDefault();
			markControlsDirty(this.badgeInstanceForm);
		} else {
			this.onSubmit()
		}
	}

}
