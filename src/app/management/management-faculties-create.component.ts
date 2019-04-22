import { ActivatedRoute, Router } from "@angular/router";
import { Component, OnInit } from "@angular/core";
import { FormBuilder, FormGroup, Validators } from "@angular/forms";
import { Title } from "@angular/platform-browser";

import { MessageService } from "../common/services/message.service";
import { SessionService } from "../common/services/session.service";
import { InstitutionApiService } from "./services/institution-api.service"
import { BaseAuthenticatedRoutableComponent } from "../common/pages/base-authenticated-routable.component";
import { UserProfileApiService } from "../common/services/user-profile-api.service";
import { markControlsDirty } from "../common/util/form-util";

@Component({
	selector: 'managementFacultiesCreate',
	template: `

	<main>
		<form-message></form-message>
		<header class="wrap wrap-light l-containerhorizontal l-heading">

			<nav>
				<h1 class="visuallyhidden">Breadcrumbs</h1>
				<ul class="breadcrumb">
					<li><a [routerLink]="['/management']">Management</a></li>
					<li class="breadcrumb-x-current">Create Faculty</li>
				</ul>
			</nav>

			<div class="heading">
				<div class="heading-x-text">
					<h1>Create Faculty</h1>
					<p>Creating faculties allows you to organise users and issuers within different parts of your organisation.</p>
				</div>
			</div>

		</header>
	</main>




	<div class="l-containerhorizontal l-containervertical l-childrenvertical wrap">
		<form (ngSubmit)="onSubmit(facultyForm.value)" novalidate>
			<div class="l-formsection wrap wrap-well" role="group">
				<fieldset>
					<bg-formfield-text 	[control]="facultyForm.controls.name"
															[label]="'Name'"
															[errorMessage]="{required:'Please enter a faculty name'}"
															[autofocus]="true"
					></bg-formfield-text>
				</fieldset>
			</div>

			<hr class="rule l-rule">
			<div class="l-form-x-offset l-childrenhorizontal l-childrenhorizontal-small l-childrenhorizontal-right">
				<a [routerLink]="['/management/faculties']"
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
export class ManagementFacultiesCreateComponent extends BaseAuthenticatedRoutableComponent implements OnInit {
	
	faculty: object;
	facultySlug: string;
	facultyLoaded: Promise<any>;
	facultyForm: FormGroup;
	addFacultyFinished: Promise<any>;

	constructor(
		router: Router,
		route: ActivatedRoute,
		sessionService: SessionService,
		protected title: Title,
		protected formBuilder: FormBuilder,
		protected institutionApi: InstitutionApiService,
		protected userProfileApiService: UserProfileApiService,
		protected messageService: MessageService,
	) {
		super(router, route, sessionService);
		title.setTitle("Management- Faculties");
		
		this.facultyForm = this.formBuilder.group({
			'name': [ '', 
								Validators.compose([Validators.required, Validators.maxLength(1024)]) 
							]
		})
	}


	ngOnInit() {
		super.ngOnInit();
	}


	onSubmit(formState) {
		this.addFacultyFinished = this.institutionApi.createFaculty(formState).then((new_faculty) => {
				this.router.navigate([ 'management/faculties' ]);
				this.messageService.setMessage("Faculty created successfully.", "success");
		}, error => {
				this.messageService.setMessage("Unable to create faculty: " + error, "error");
		})
		.then(() => this.addFacultyFinished = null);

	}


	clickSubmit(ev) {
		if (!this.facultyForm.valid) {
			ev.preventDefault();
			markControlsDirty(this.facultyForm);
		}
	}

}
