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

			<div *bgAwaitPromises="[facultyLoaded]" class="heading">
				<div class="heading-x-text">
					<h1>{{faculty.name}}</h1>
					<p>Edit the faculty name here.</p>
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
						*ngIf="facultyForm.dirty"
						type="submit"
						class="button"
						(click)="clickSubmit($event)"
				>Save Changes</button>
				<button 
						*ngIf="!facultyForm.dirty"
						class="button button-is-disabled"
						[disabled] = 'true'
				>Save Changes</button>
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
	editFacultyFinished: Promise<any>;

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
		title.setTitle("Management - Faculties");
		
		this.facultySlug = this.route.snapshot.params['facultySlug'];
		
		this.facultyLoaded = this.institutionApi.getFaculty(this.facultySlug)
			.then(
				(faculty) => { 	this.faculty = faculty
												this.initFormFromExistingFaculty(faculty)	},
				error => this.messageService.reportAndThrowError(`Failed to load faculty, error: ${error.response.status}`)
			);
	}

	ngOnInit() {
		super.ngOnInit();
	}

	initFormFromExistingFaculty(faculty) {
		this.facultyForm = this.formBuilder.group({
			'slug': faculty['slug'],
			'name': [faculty['name'], Validators.compose([Validators.required, Validators.maxLength(1024)])],
		})
	}

	onSubmit(formState) {
		this.editFacultyFinished = this.institutionApi.editFaculty(this.facultySlug, formState).then((new_faculty) => {
			this.router.navigate([ 'management/faculties' ]);
			this.messageService.setMessage("Faculty edited successfully.", "success");
			this.messageService.reportMajorSuccess("Faculty edited successfully.", true);
		}, error => {
			this.messageService.setMessage("Unable to edit Faculty: " + error, "error");
		}).then(() => this.editFacultyFinished = null);
	}

	clickSubmit(ev) {
		if (!this.facultyForm.valid) {
			ev.preventDefault();
			markControlsDirty(this.facultyForm);
		}
	}


}
