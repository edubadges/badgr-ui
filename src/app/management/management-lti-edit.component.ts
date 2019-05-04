import { ActivatedRoute, Router } from "@angular/router";
import { Component, OnInit } from "@angular/core";
import { FormBuilder, FormGroup, Validators } from "@angular/forms";
import { Title } from "@angular/platform-browser";

import { MessageService } from "../common/services/message.service";
import { SessionService } from "../common/services/session.service";
import { LTIClientApiService } from "./services/lti-client-api.service"
import { BaseAuthenticatedRoutableComponent } from "../common/pages/base-authenticated-routable.component";
import { UserProfileApiService } from "../common/services/user-profile-api.service";
import { markControlsDirty, markControlsPristine } from "../common/util/form-util";
import { IssuerManager } from "../issuer/services/issuer-manager.service";
import { preloadImageURL } from "../common/util/file-util";


@Component({
	selector: 'managementLTIClientEdit',
	template: `

	<main>
		<form-message></form-message>
		<header class="wrap wrap-light l-containerhorizontal l-heading">

			<nav>
				<h1 class="visuallyhidden">Breadcrumbs</h1>
				<ul class="breadcrumb">
					<li><a [routerLink]="['/management']">Management</a></li>
					<li class="breadcrumb-x-current">Edit LTI Client</li>
				</ul>
			</nav>

			<div *bgAwaitPromises="[ltiClientLoaded]"  class="heading">
				<div class="heading-x-text">
					<h1>{{ ltiClient.name }}</h1>
					<p>Edit the LTI client here.</p>
				</div>
			</div>

		</header>
	</main>

	<div *bgAwaitPromises="[ltiClientLoaded]" class="l-containerhorizontal l-containervertical l-childrenvertical wrap">
		<form (ngSubmit)="onSubmit(ltiClientForm.value)" novalidate>
			<div class="l-formsection wrap wrap-well" role="group">
				<fieldset>
					<bg-formfield-text 	[control]="ltiClientForm.controls.name"
															[label]="'Name'"
															[errorMessage]="{required:'Please enter an LTI client name'}"
					></bg-formfield-text><br>
					<bg-formfield-text 	[control]="ltiClientForm.controls.consumer_key"
															[label]="'Consumer Key'"
															[locked]='true'
					></bg-formfield-text><br>
					<bg-formfield-text 	[control]="ltiClientForm.controls.shared_secret"
															[label]="'Shared Secret'"
															[locked]='true'
					></bg-formfield-text><br>
				</fieldset><br>
				<table class="table" >
					<thead>
						<tr>
							<th scope="col">Issuer</th>
							<th scope="col">Actions</th>
						</tr>
					</thead>
					<tbody *ngIf="!selectingNewIssuer">
						<tr *bgAwaitPromises="[selectedIssuerLoaded]">
							<th scope="row">
								<div class="l-childrenhorizontal l-childrenhorizontal-small">
									<img class="l-childrenhorizontal-x-offset"
									src="{{selectedIssuer.image}}"
									alt="{{selectedIssuer.name}}"
									width="40">
									<a [routerLink]="['/issuer/issuers', selectedIssuer.slug]">{{selectedIssuer.name}}</a>
								</div>
							</th>
							<td *ngIf="!selectingNewIssuer">
								<div class="l-childrenhorizontal l-childrenhorizontal-right">
									<button type="button"
													class="button button-primaryghost"
													(click)="loadIssuers()"
													[disabled-when-requesting]="true"
									>Change Issuer
									</button>
								</div>
							</td>
						</tr>
					</tbody>
					<ng-container *bgAwaitPromises="[issuersLoaded]">
						<tbody *ngIf="selectingNewIssuer">
							<tr *ngFor="let issuer of issuers">
								<th scope="row">
									<div class="l-childrenhorizontal l-childrenhorizontal-small">
										<img class="l-childrenhorizontal-x-offset"
										src="{{issuer.image}}"
										alt="{{issuer.name}}"
										width="40">
										<a [routerLink]="['/issuer/issuers', issuer.slug]">{{issuer.name}}</a>
									</div>
								</th>
								<td>
									<div class="l-childrenhorizontal l-childrenhorizontal-right">
										<button *ngIf="issuerLoadedFromDb.slug != issuer.slug"
														type="button"
														class="button button-primaryghost"
														(click)="setAsSelectedIssuer(issuer.slug)"
														[disabled-when-requesting]="true"
										>Select Issuer
										</button>
										<button  *ngIf="issuerLoadedFromDb.slug == issuer.slug"
														type="button"
														class="button button-primaryghost"
														(click)="setAsSelectedIssuer(issuer.slug)"
														[disabled-when-requesting]="true"
										>Select Previous
										</button>
									</div>
								</td>
							</tr>
						</tbody>
					</ng-container>
				</table>

			</div>

			<hr class="rule l-rule">

			<div class="l-form-x-offset l-childrenhorizontal l-childrenhorizontal-small l-childrenhorizontal-right">
				<a [routerLink]="['/management/lti']"
						class="button button-primaryghost"
						[disabled-when-requesting]="true"
				>Cancel</a>
				<button
						*ngIf="ltiClientForm.dirty"
						type="submit"
						class="button"
						[disabled]="!! [savePromise]"
						[loading-promises]="[ savePromise ]"
						(click)="clickSubmit($event)"
				>Save Changes</button>
				<button 
						*ngIf="!ltiClientForm.dirty"
						class="button button-is-disabled"
						[disabled] = 'true'
				>Save Changes</button>
			</div>

		</form>
	</div>

	`
})
export class ManagementLTIClientEditComponent extends BaseAuthenticatedRoutableComponent implements OnInit {
	
	readonly issuerPlaceholderSrc = preloadImageURL(require('../../breakdown/static/images/placeholderavatar-issuer.svg'));
	selectedIssuer: object;
	issuerLoadedFromDb: object;
	issuers: Array<object>;
	ltiClient: object;
	ltiClientSlug: string;
	ltiClientForm: FormGroup;
	ltiClientLoaded: Promise<any>;
	selectedIssuerLoaded: Promise<any>;
	issuersLoaded: Promise<any>;
	savePromise: Promise<any> | null = null;
	addLTIClientFinished: Promise<any>;
	selectingNewIssuer: boolean = false;

	constructor(
		router: Router,
		route: ActivatedRoute,
		sessionService: SessionService,
		protected title: Title,
		protected formBuilder: FormBuilder,
		protected ltiClientApi: LTIClientApiService,
		protected userProfileApiService: UserProfileApiService,
		protected messageService: MessageService,
		protected issuerManager: IssuerManager,
	) {
		super(router, route, sessionService);
		title.setTitle("Management - LTI");
		
		this.ltiClientSlug = this.route.snapshot.params['ltiClientSlug'];

		this.ltiClientLoaded = this.ltiClientApi.getLTIClient(this.ltiClientSlug)
			.then(
				(ltiClient) => { 	this.ltiClient = ltiClient
													this.initFormFromExistingClients(ltiClient)
													this.loadSelectedIssuer(ltiClient['issuer_slug'])
													},
				error => this.messageService.reportAndThrowError(`Failed to load LTI client, error: ${error.response.status}`)
			);
	}


	ngOnInit() {
		super.ngOnInit();
	}


	initFormFromExistingClients(ltiClient) {
		this.ltiClientForm = this.formBuilder.group({
			'slug': ltiClient['slug'], 
			'name': [ltiClient['name'], Validators.compose([Validators.required, Validators.maxLength(1024)])],
			'issuer_slug': [ltiClient['issuer_slug'], Validators.compose([Validators.required, Validators.maxLength(1024)])],
			'consumer_key': [ltiClient['consumer_key'], Validators.compose([Validators.required, Validators.maxLength(1024)])],
			'shared_secret': [ltiClient['shared_secret'], Validators.compose([Validators.required, Validators.maxLength(1024)])],
		})
	}

	updateIssuerSlugInForm(){
		this.ltiClientForm.controls.issuer_slug.patchValue(this.selectedIssuer['slug'])
	}

	setAsSelectedIssuer(issuer_slug) {
		if (issuer_slug != this.issuerLoadedFromDb['slug']){
			markControlsDirty(this.ltiClientForm.controls.issuer_slug);
		} else if (issuer_slug == this.issuerLoadedFromDb['slug']) {
			markControlsPristine(this.ltiClientForm.controls.issuer_slug)
		}
		for (let issuer of this.issuers) {
			if (issuer['slug'] == issuer_slug) {
				this.selectedIssuer = issuer
				this.updateIssuerSlugInForm()
				this.selectingNewIssuer = false 
			} 
		}
	}

	loadSelectedIssuer(issuer_slug){
			this.selectedIssuerLoaded = this.issuerManager.issuerBySlug(issuer_slug).then(
			(issuer) => {
				this.selectedIssuer = issuer
				this.issuers= [issuer]
				this.issuerLoadedFromDb = issuer
			},
			error => {
				this.messageService.reportAndThrowError(`Failed to load Issuer, error: ${error.response.status}`)
			})
	}

	loadIssuers(){
		this.selectingNewIssuer = true
		this.issuersLoaded =  new Promise((resolve, reject) => {
			this.issuerManager.allIssuers$.subscribe(
				(issuers) => {
					let issuersWithinScope = issuers.slice().sort(
						(a, b) => b.createdAt.getTime() - a.createdAt.getTime()
					);
					this.issuers = issuersWithinScope
					this.issuers.sort(this.compareIssuers)
					resolve()
				},
				error => {
					this.messageService.reportAndThrowError("Failed to load issuers", error);
					resolve();
				}
			);
		});
	}


	onSubmit(formState) {
		this.savePromise = this.ltiClientApi.editClient(this.ltiClientSlug, formState).then((new_client) => {
			this.messageService.reportMajorSuccess("LTI client updated successfully.", true);
			this.router.navigate([ 'management/lti/edit', new_client.slug ]);
		}, error => {
				this.messageService.setMessage("Unable to create LTI client: " + error, "error");
		})
		.then(() => this.addLTIClientFinished = null);
	}


	clickSubmit(ev) {
		if (!this.ltiClientForm.valid) {
			ev.preventDefault();
			markControlsDirty(this.ltiClientForm);
		}
	}

	compareIssuers(a, b){
		return a['name'].localeCompare(b['name'])
	}
}
