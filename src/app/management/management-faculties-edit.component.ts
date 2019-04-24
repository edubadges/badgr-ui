import { ActivatedRoute, Router } from "@angular/router";
import { Component, OnInit, Input } from "@angular/core";
import { FormBuilder, FormGroup, FormArray } from "@angular/forms";
import { Title } from "@angular/platform-browser";

import { MessageService } from "../common/services/message.service";
import { SessionService } from "../common/services/session.service";
import { InstitutionApiService } from "./services/institution-api.service"
import { BaseAuthenticatedRoutableComponent } from "../common/pages/base-authenticated-routable.component";
import { UserProfileApiService } from "../common/services/user-profile-api.service";
import { markControlsDirty } from "../common/util/form-util";

@Component({
	selector: 'managementFacultiesEdit',
	template: `


	<main>
		<form-message></form-message>
		<header class="wrap wrap-light l-containerhorizontal l-heading">

			<nav>
				<h1 class="visuallyhidden">Breadcrumbs</h1>
				<ul class="breadcrumb">
					<li><a [routerLink]="['/management']">Management</a></li>
					<li class="breadcrumb-x-current">Edit Faculty</li>
				</ul>
			</nav>

			<div class="heading">
				<div class="heading-x-text">
					<h1>Edit Faculty</h1>
					<p>Edit this faculty belonging to your institution.</p>
				</div>
			</div>

		</header>
	</main>

	<div *bgAwaitPromises="[facultyLoaded]" class="l-containerhorizontal l-containervertical l-childrenvertical wrap">
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
export class ManagementFacultiesEditComponent extends BaseAuthenticatedRoutableComponent implements OnInit {
	
	faculty: object;
	facultySlug: string;
	facultyLoaded: Promise<any>;
	facultyForm: FormGroup;

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
		
		this.facultySlug = this.route.snapshot.params['facultySlug'];
		
		this.facultyLoaded = this.institutionApi.getFaculty(this.facultySlug)
			.then(
				(faculty) => { 	this.faculty = faculty
												this.initFormFromExistingFaculties(faculty)	},
				error => this.messageService.reportAndThrowError(`Failed to load faculty, error: ${error.response.status}`)
			);
	}

	ngOnInit() {
		super.ngOnInit();
	}

	initFormFromExistingFaculties(faculty) {
		this.facultyForm = this.formBuilder.group({
			'slug': faculty['slug'],
			'name': faculty['name'],
		})
	}

	onSubmit(formState) {
		this.institutionApi.editFaculty(this.facultySlug, formState)
	}

	clickSubmit(ev) {
		if (!this.facultyForm.valid) {
			ev.preventDefault();
			markControlsDirty(this.facultyForm);
		}
	}


}
