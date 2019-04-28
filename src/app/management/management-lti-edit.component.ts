import { ActivatedRoute, Router } from "@angular/router";
import { Component, OnInit } from "@angular/core";
import { FormBuilder, FormGroup, Validators } from "@angular/forms";
import { Title } from "@angular/platform-browser";

import { MessageService } from "../common/services/message.service";
import { SessionService } from "../common/services/session.service";
import { LTIClientApiService } from "./services/lti-client-api.service"
import { BaseAuthenticatedRoutableComponent } from "../common/pages/base-authenticated-routable.component";
import { UserProfileApiService } from "../common/services/user-profile-api.service";
import { markControlsDirty } from "../common/util/form-util";

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

			<div class="heading">
				<div class="heading-x-text">
					<h1>Edit LTI Client</h1>
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
					></bg-formfield-text>
					<bg-formfield-text 	[control]="ltiClientForm.controls.issuer_slug"
															[label]="'Issuer Slug'"
															[errorMessage]="{required:'Please enter a slug'}"
					></bg-formfield-text>

					<bg-formfield-text 	[control]="ltiClientForm.controls.consumer_key"
															[label]="'Consumer Key'"
															[locked]='true'
					></bg-formfield-text>
					<bg-formfield-text 	[control]="ltiClientForm.controls.shared_secret"
															[label]="'Shared Secret'"
															[locked]='true'
					></bg-formfield-text>
				</fieldset>
			</div>

			<hr class="rule l-rule">
			<div class="l-form-x-offset l-childrenhorizontal l-childrenhorizontal-small l-childrenhorizontal-right">
				<a [routerLink]="['/management/lti']"
						class="button button-primaryghost"
						[disabled-when-requesting]="true"
				>Cancel</a>
				<button
						type="submit"
						class="button"
						(click)="clickSubmit($event)"
				>Submit</button>
			</div>

		</form>
	</div>


	`
})
export class ManagementLTIClientEditComponent extends BaseAuthenticatedRoutableComponent implements OnInit {
	
	ltiClient: object;
	ltiClientSlug: string;
	ltiClientForm: FormGroup;
	ltiClientLoaded: Promise<any>;
	addLTIClientFinished: Promise<any>;

	constructor(
		router: Router,
		route: ActivatedRoute,
		sessionService: SessionService,
		protected title: Title,
		protected formBuilder: FormBuilder,
		protected ltiClientApi: LTIClientApiService,
		protected userProfileApiService: UserProfileApiService,
		protected messageService: MessageService,
	) {
		super(router, route, sessionService);
		title.setTitle("Management - LTI");
		
		this.ltiClientSlug = this.route.snapshot.params['ltiClientSlug'];

		this.ltiClientLoaded = this.ltiClientApi.getLTIClient(this.ltiClientSlug)
			.then(
				(ltiClient) => { 	this.ltiClient = ltiClient
													this.initFormFromExistingClients(ltiClient)	},
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


	onSubmit(formState) {
		this.ltiClientApi.editClient(this.ltiClientSlug, formState).then((new_client) => {
			this.messageService.reportMajorSuccess("LTI client created successfully.", true);
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

}
