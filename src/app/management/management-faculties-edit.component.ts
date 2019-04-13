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
	<span>Faculty</span>
	<div *bgAwaitPromises="[facultyLoaded]">
		<form (ngSubmit)="onSubmit(facultyForm.value)" novalidate>
				<div>
					<bg-formfield-text [control]="facultyForm.controls.name" ></bg-formfield-text>
				</div>

			<button
					type="submit"
					class="button"
					(click)="clickSubmit($event)"
				>Submit</button>
		</form>
	</div>


	`
})
export class ManagementFacultiesEditComponent extends BaseAuthenticatedRoutableComponent implements OnInit {
	
	faculty: object;
	facultyID: string;
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
		
		this.facultyID = this.route.snapshot.params['facultyID'];
		
		this.facultyLoaded = this.institutionApi.getFaculty(this.facultyID)
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
			'id': faculty['id'],
			'name': faculty['name'],
		})
	}

	onSubmit(formState) {
		console.log(formState)
		this.institutionApi.editFaculty(this.facultyID, formState)
	}

	clickSubmit(ev) {
		if (!this.facultyForm.valid) {
			ev.preventDefault();
			markControlsDirty(this.facultyForm);
		}
	}


}
