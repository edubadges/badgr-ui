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
	selector: 'managementLTICreate',
	template: `

	<main>
		<form-message></form-message>
		<header class="wrap wrap-light l-containerhorizontal l-heading">

			<nav>
				<h1 class="visuallyhidden">Breadcrumbs</h1>
				<ul class="breadcrumb">
					<li><a [routerLink]="['/management']">Management</a></li>
					<li class="breadcrumb-x-current">Create LTI Client</li>
				</ul>
			</nav>

			<div class="heading">
				<div class="heading-x-text">
					<h1>Create LTI Client</h1>
					<p>Creating LTI clients allows you to connect badgr with your learning management system.</p>
				</div>
			</div>

		</header>
	</main>




	<div class="l-containerhorizontal l-containervertical l-childrenvertical wrap">
		<form (ngSubmit)="onSubmit(ltiClientForm.value)" novalidate>
			<div class="l-formsection wrap wrap-well" role="group">
				<fieldset>
					<bg-formfield-text 	[control]="ltiClientForm.controls.name"
															[label]="'Name'"
															[errorMessage]="{required:'Please enter a faculty name'}"
															[autofocus]="true"
					></bg-formfield-text>
					<bg-formfield-text 	[control]="ltiClientForm.controls.issuer_slug"
															[label]="'slug'"
															[errorMessage]="{required:'Please enter a slug'}"
															[autofocus]="true"
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
export class ManagementLTIClientCreateComponent extends BaseAuthenticatedRoutableComponent implements OnInit {
	
	lti: object;
	ltiClientForm: FormGroup;
	addLTIClientFinished: Promise<any>;

	constructor(
		router: Router,
		route: ActivatedRoute,
		sessionService: SessionService,
		protected title: Title,
		protected formBuilder: FormBuilder,
		protected ltiClientApiService: LTIClientApiService,
		protected userProfileApiService: UserProfileApiService,
		protected messageService: MessageService,
	) {
		super(router, route, sessionService);
		title.setTitle("Management- Faculties");
		
		this.ltiClientForm = this.formBuilder.group({
			'name': [ '', Validators.compose([Validators.required, Validators.maxLength(1024)])],
			'issuer_slug': [ '', Validators.compose([Validators.required, Validators.maxLength(1024)])],
		})
	}


	ngOnInit() {
		super.ngOnInit();
	}


	onSubmit(formState) {
		this.addLTIClientFinished = this.ltiClientApiService.createClient(formState).then((new_client) => {
			this.messageService.reportMajorSuccess("LTI client created successfully.", true);
			this.router.navigate([ 'management/lti' ]);
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
