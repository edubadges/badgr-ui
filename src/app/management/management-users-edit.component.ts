import { ActivatedRoute, Router } from "@angular/router";
import { Component, OnInit } from "@angular/core";
import { SessionService } from "../common/services/session.service";
import { BaseAuthenticatedRoutableComponent } from "../common/pages/base-authenticated-routable.component";
import { Title } from "@angular/platform-browser";
import { UserProfileApiService } from './../common/services/user-profile-api.service';
import { MessageService } from "../common/services/message.service";
import { FormBuilder, FormGroup, Validators, FormArray, FormControl } from "@angular/forms";
import { markControlsDirty } from "../common/util/form-util";
import { InstitutionApiService } from "./services/institution-api.service"
import { GroupApiService } from "../management/services/group-api.service";


@Component({
	selector: 'managementUsersEdit',
	template: `
	<main>
		<form-message></form-message>
		<header class="wrap wrap-light l-containerhorizontal l-heading">

			<nav>
				<h1 class="visuallyhidden">Breadcrumbs</h1>
				<ul class="breadcrumb">
					<li><a [routerLink]="['/management']">Management</a></li>
					<li class="breadcrumb-x-current">Edit user</li>
				</ul>
			</nav>

			<div *bgAwaitPromises="[userLoaded]" class="heading">
				<div class="heading-x-text">
					<h1> {{user.first_name}} {{user.last_name}} </h1>
					<p> {{user.email}} </p>
					<br>
					<p>Edit the user permissions and faculties here.</p>
				</div>
			</div>

		</header>
	</main>


	<div *bgAwaitPromises="[userLoaded]" class="l-containerhorizontal l-containervertical l-childrenvertical wrap">
	
		<!--  Faculties  -->

		<form (ngSubmit)="onSubmit(userForm.value)" novalidate>
			<table class="table">
				<thead>
					<tr>
						<th scope="col">Faculties</th>
						<th scope="col">Actions</th>
					</tr>
				</thead>
				<tbody>
					<tr *ngFor="let faculty of faculties.value; let i = index">
						<th scope="row">
							<a [routerLink]="['/management/faculties/edit', faculty.slug]">{{faculty.name}}</a>
						</th>
						<td scope="row">
							<div class="l-childrenhorizontal l-childrenhorizontal-right">
								<button type="button"
												class="button button-primaryghost"
												(click)="removeFacultyFromForm(i)"
												[disabled-when-requesting]="true"
								>Remove Faculty
								</button>
							</div>
						</td>
					</tr>
					<tr *ngIf="faculties.value.length==0;">
						<th scope="row">
							<span>No Faculties</span>
						</th>
					</tr>
					<tr>
						<th scope="row">
						</th>
						<td scope="row">
							<div *ngIf="!addingFacultiesForSelection" class="l-childrenhorizontal l-childrenhorizontal-right">
								<button type="button"
												class="button button-primaryghost"
												(click)="triggerFacultyAddition()"
												[disabled-when-requesting]="true"
								>Add Faculties
								</button>
							</div>
						</td>
					</tr>
				</tbody>
			</table>

			<br><br>

			<ng-container *bgAwaitPromises='[facultiesForSelectionLoaded]'>
				<ng-container *ngIf="addingFacultiesForSelection">
					<table  class="table">
						<thead>
							<tr>
								<th scope="col"> Select New Faculties </th>
								<th scope="col">
									<button style="float:right;"
													(click)="stopAddingFaculties()"	> 
										<span style="color:white;">X</span>
									</button>
								</th>
							</tr>
						</thead>
						<tbody *ngIf="facultiesForSelection.length > 0">
							<tr *ngFor="let faculty of facultiesForSelection; let i = index">
								<th scope="row">
									<a [routerLink]="['/management/faculties/edit', faculty.slug]">{{faculty.name}}</a>
								</th>
								<td scope="row">
									<div class="l-childrenhorizontal l-childrenhorizontal-right">
										<button type="button"
														class="button button-primaryghost"
														(click)="selectFaculty(i)"
										>Add Faculty
										</button>
									</div>
								</td>
							</tr>
						</tbody>
						<tbody *ngIf="facultiesForSelection.length == 0">
							<tr>
								<th scope="row">
									No Faculties
								</th>
								<td scope="row">
								</td>
							</tr>
						</tbody>
					</table>
					<br><br>
				</ng-container>
			</ng-container>

			<!--  Groups  -->

			<table class='table'>
				<thead>
					<tr>
						<th scope="col">Groups</th>
						<th scope="col">Actions</th>
					</tr>
				</thead>
				<tbody>
					<tr *ngFor="let group of groups.value; let i = index">
						<th scope="row">
							{{group.name}}
						</th>
						<td scope="row">
							<div class="l-childrenhorizontal l-childrenhorizontal-right">
								<button type="button"
												class="button button-primaryghost"
												(click)="removeGroupFromForm(i)"
												[disabled-when-requesting]="true"
								>Remove Group
								</button>
							</div>
						</td>
					</tr>
					<tr *ngIf="groups.value.length==0;">
						<th scope="row">
							<span>No Groups</span>
						</th>
					</tr>
					<tr>
						<th scope="row">
						</th>
						<td scope="row">
							<div *ngIf="!addingGroupsForSelection" class="l-childrenhorizontal l-childrenhorizontal-right">
								<button type="button"
												class="button button-primaryghost"
												(click)="triggerGroupAddition()"
												[disabled-when-requesting]="true"
								>Add Groups
								</button>
							</div>
						</td>
					</tr>
				</tbody>
			</table>
			<br><br>
	

			<ng-container *bgAwaitPromises="[groupsForSelectionLoaded]">
				<ng-container *ngIf="addingGroupsForSelection">
					<table  class="table">
						<thead>
							<tr>
								<th> Select New Groups </th>
								<th scope="col">
									<button style="float:right;"
													(click)="stopAddingGroups()"	> 
										<span style="color:white;">X</span>
									</button>
								</th>
							</tr>
						</thead>
						<tbody *ngIf="groupsForSelection.length > 0">
							<tr *ngFor="let group of groupsForSelection; let i = index">
								<th>
									{{group.name}}
								</th>
								<td scope="row">
									<div class="l-childrenhorizontal l-childrenhorizontal-right">
										<button type="button"
														class="button button-primaryghost"
														(click)="selectGroup(i)"
										>Add Group
										</button>
									</div>
								</td>
							</tr>
						</tbody>
						<tbody *ngIf="groupsForSelection.length == 0">
							<tr>
								<th>
									No Groups
								</th>
								<td scope="row">
								</td>
							</tr>
						</tbody>
					</table>
				</ng-container>
			</ng-container>

			<br><br>

			<div  class="l-form-x-offset l-childrenhorizontal l-childrenhorizontal-small l-childrenhorizontal-right">
				<a [routerLink]="['/management/user']"
						class="button button-primaryghost"
						[disabled-when-requesting]="true"
				>Cancel</a>
				<button
						*ngIf="userForm.dirty"
						type="submit"
						class="button button-x-loading"
						[disabled]="!! [savePromise]"
						[loading-promises]="[ savePromise ]"
						(click)="clickSubmit($event)"
				>Save Changes</button>
				<button 
						*ngIf="!userForm.dirty"
						class="button button-is-disabled"
						[disabled] = 'true'
				>Save Changes</button>
			</div>
		</form>
	</div>

	`
})
export class ManagementUsersEditComponent extends BaseAuthenticatedRoutableComponent implements OnInit {
	
	user: object;
	userSlug: string;
	userForm: FormGroup;
	userLoaded: Promise<any>;
	addUserFinished: Promise<any>;
	
	facultiesForSelectionLoaded: Promise<any>;
	facultiesForSelection: Array<any>;
	addingFacultiesForSelection: boolean = false;
	
	groupsForSelectionLoaded: Promise<any>;
	groupsForSelection: Array<any>;
	addingGroupsForSelection: boolean = false;
	
	savePromise: Promise<any> | null = null;

	constructor(
		router: Router,
		route: ActivatedRoute,
		sessionService: SessionService,
		protected title: Title,
		protected formBuilder: FormBuilder,
		protected userProfileApi: UserProfileApiService,
		protected messageService: MessageService,
		protected institutionApi: InstitutionApiService,
		protected groupApi: GroupApiService,
	) {
		super(router, route, sessionService);
		title.setTitle("Management - User");

		this.userSlug = this.route.snapshot.params['userSlug'];

		this.userForm = formBuilder.group({
			'slug' : [ '' ],
			'faculties' : formBuilder.array([]),
			'groups' : formBuilder.array([])
		} as userForm<any[], FormArray, FormArray>);

		this.userLoaded = this.userProfileApi.getUser(this.userSlug)
		.then(
			(user) => { 	this.user = user
												this.initFormFromExistingUser(user)
												},
			error => this.messageService.reportAndThrowError(`Failed to load user, error: ${error.response.status}`)
		);

	}

	get editControls(): userForm<FormControl, FormArray, FormArray> {
		return this.userForm.controls as any;
	}

	get faculties() {
		return this.userForm.controls['faculties'] as FormArray;
	}
	
	get groups() {
		return this.userForm.controls['groups'] as FormArray;
	}

	stopAddingFaculties(){
		this.addingFacultiesForSelection = false
	}

	stopAddingGroups(){
		this.addingGroupsForSelection = false
	}

	addFacultyToForm(faculty){
		let fac = this.formBuilder.group({
			name: [ faculty['name'] ],
			slug: [ faculty['slug'] ],
			})
			this.editControls.faculties.push(fac)
	}

	addGroupToForm(permissionGroup){
		let permGroup = this.formBuilder.group({
			name: [ permissionGroup['name'] ],
			slug: [ permissionGroup['slug'] ],
			})
			this.editControls.groups.push(permGroup)
	}

	initFormFromExistingUser(user){
		this.editControls.slug.setValue(user['slug'], { emitEvent: false });
		user['faculties'].sort(this.compareByName)
		for (let faculty of user['faculties']){
			this.addFacultyToForm(faculty)
		}
		user['groups'].sort(this.compareByName)
		for (let group of user['groups']){
			this.addGroupToForm(group)
		}
	}

	removeFacultyFromForm(index){
		markControlsDirty(this.userForm.controls.faculties)
		let removed_faculty = this.faculties.value[index]
		this.faculties.removeAt(index)
		if (this.facultiesForSelection != undefined){
			this.facultiesForSelection.push(removed_faculty)
			this.facultiesForSelection.sort(this.compareByName)
		}
	}

	removeGroupFromForm(index){
		markControlsDirty(this.userForm.controls.groups)
		let removed_group = this.groups.value[index]
		this.groups.removeAt(index)
		if (this.groupsForSelection != undefined){
			this.groupsForSelection.push(removed_group)
			this.groupsForSelection.sort(this.compareByName)
		}
	}

	selectFaculty(index){
		markControlsDirty(this.userForm.controls.faculties)
		let selectedFaculty = this.facultiesForSelection.splice(index, 1)
		this.addFacultyToForm(selectedFaculty[0])
	}

	selectGroup(index){
		markControlsDirty(this.userForm.controls.groups)
		let selectedGroup = this.groupsForSelection.splice(index, 1)
		this.addGroupToForm(selectedGroup[0])
	}

	loadFacultiesForSelection(){
		this.facultiesForSelectionLoaded = this.institutionApi.getAllFacultiesWithinScope()
			.then((faculties) => {
				this.facultiesForSelection = faculties
				this.facultiesForSelection.sort(this.compareByName)
				this.filterFacultiesForSelection()
			})
	}

	loadGroupsForSelection(){
		this.groupsForSelectionLoaded = this.groupApi.getAllGroupsWithinScope()
			.then((groups) => {
				this.groupsForSelection = groups
				this.groupsForSelection.sort(this.compareByName)
				this.filterGroupsForSelection()
			})
	}

	facultyHasBeenSelected(slug){
		for (let f of this.faculties.value){
			if (f['slug'] == slug){
				return true
			}
		}
		return false
	}

	groupHasBeenSelected(slug){
		for (let g of this.groups.value){
			if (g['slug'] == slug){
				return true
			}
		}
		return false
	}

	filterFacultiesForSelection(){
		for (var i = 0; i < this.facultiesForSelection.length; i++){
			let fac = this.facultiesForSelection[i]
			if (this.facultyHasBeenSelected(fac['slug'])){
				this.facultiesForSelection.splice(i, 1)
				i -= 1
			} 
		}
	}

	filterGroupsForSelection(){
		for (var i = 0; i < this.groupsForSelection.length; i++){
			let group = this.groupsForSelection[i]
			if (this.groupHasBeenSelected(group['slug'])){
				this.groupsForSelection.splice(i, 1)
				i -= 1
			} 
		}
	}

	triggerFacultyAddition(){
		this.addingFacultiesForSelection = true
		this.loadFacultiesForSelection()
	}

	triggerGroupAddition(){
		this.addingGroupsForSelection = true
		this.loadGroupsForSelection()
	}

	onSubmit(formState) {
		this.savePromise = this.userProfileApi.editUser(this.userSlug, formState).then((updated_user) => {
			this.messageService.reportMajorSuccess("User updated successfully.", true);
			this.router.navigate([ 'management/user/edit', updated_user.slug ]);
		}, error => {
				this.messageService.setMessage("Unable to update user: " + error, "error");
		})
		.then(() => this.addUserFinished = null);
	}

	clickSubmit(ev) {
		if (!this.userForm.valid) {
			ev.preventDefault();
			markControlsDirty(this.userForm);
		}
	}

	compareByName(a, b){
		return a['name'].localeCompare(b['name'])
	}

}

interface userForm<T, FacultyType, GroupType> {
	slug: T;
	faculties: FacultyType;
	groups: GroupType;
}