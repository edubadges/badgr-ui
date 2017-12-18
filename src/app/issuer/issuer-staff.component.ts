import { Component, OnInit } from "@angular/core";
import { ActivatedRoute, Router } from "@angular/router";
import { FormBuilder, FormGroup, Validators } from "@angular/forms";

import { BaseAuthenticatedRoutableComponent } from "../common/pages/base-authenticated-routable.component";

import { SessionService } from "../common/services/session.service";
import { MessageService } from "../common/services/message.service";
import { IssuerManager } from "./services/issuer-manager.service";
import { Title } from "@angular/platform-browser";
import { Issuer, issuerRoleInfoFor, issuerStaffRoles, IssuerStaffMember } from "./models/issuer.model";
import { preloadImageURL } from "../common/util/file-util";
import { EmailValidator } from "../common/validators/email.validator";
import { FormFieldSelectOption } from "../common/components/formfield-select";
import { markControlsDirty } from "../common/util/form-util";
import { BadgrApiFailure } from "../common/services/api-failure";
import { CommonDialogsService } from "../common/services/common-dialogs.service";
import { UserProfileManager } from "../common/services/user-profile-manager.service";
import { UserProfileEmail } from "../common/model/user-profile.model";
import { IssuerStaffRoleSlug } from "./models/issuer-api.model";


@Component({
	template: `
		<main *bgAwaitPromises="[issuerLoaded, profileEmailsLoaded]">
			<form-message></form-message>
			<header class="wrap wrap-light l-containerhorizontal l-heading">

				<nav>
					<h1 class="visuallyhidden">Breadcrumbs</h1>
					<ul class="breadcrumb">
						<li><a [routerLink]="['/issuer']">Issuers</a></li>
						<li *ngIf="issuer"><a [routerLink]="['/issuer/issuers', issuerSlug]">{{ issuer.name }}</a></li>
						<li class="breadcrumb-x-current">
							{{ isCurrentUserIssuerOwner ? "Manage Staff" : "View Staff" }}
						</li>
					</ul>
				</nav>

				<div class="heading">
					<div class="heading-x-image">
						<img *ngIf="issuer.image" [src]="issuer.image" alt="{{issuer.name}} logo " />
						<img *ngIf="!issuer.image" [src]="issuerImagePlaceHolderUrl" alt="Default issuer image">
					</div>
					<div class="heading-x-text">
						<h1>{{ isCurrentUserIssuerOwner ? "Manage Staff" : "View Staff" }}</h1>
						<p>
							{{
							isCurrentUserIssuerOwner
								? "Manage who has access to manage and act on behalf of this issuer."
								: "View who has access to manage and act on behalf of this issuer."
							}}
						</p>
					</div>
				</div>

			</header>

			<div class="l-containerhorizontal l-containervertical l-childrenvertical wrap">
				<form [formGroup]="staffCreateForm"
				      (ngSubmit)="submitStaffCreate(staffCreateForm.value)">
					<table class="table table-staffeditor">
						<thead>
							<tr>
								<th>Name</th>
								<th class="hidden hidden-is-tablet">Email</th>
								<th class="table-staffeditor-x-role">Role</th>
								<th class="hidden hidden-is-tablet" *ngIf="isCurrentUserIssuerOwner"><span class="visuallyhidden">Actions</span>
								</th>
							</tr>
						</thead>

						<!-- Add Member Row -->
						<tbody class="table-x-tbody hidden hidden-is-tablet" *ngIf="isCurrentUserIssuerOwner">
							<tr class="table-x-active">
								<th>
									<em>
										New Staff Member
									</em>
								</th>

								<td>
									<bg-formfield-text [control]="staffCreateForm.controls.staffEmail"
									                   [errorMessage]="'Please enter valid email address'"
									                   placeholder="Staff Email"
									></bg-formfield-text>
								</td>

								<td class="table-staffeditor-x-role">
									<bg-formfield-select [control]="staffCreateForm.controls.staffRole"
									                     [options]="issuerStaffRoleOptions"
									                     [errorMessage]="'Please select a staff role'"
									></bg-formfield-select>
								</td>

								<td class="hidden hidden-is-tablet">
									<button class="button button-primaryghost"
									        type="submit"
									        [disabled-when-requesting]="true"
									>Add Member
									</button>
								</td>
							</tr>
						</tbody>

						<tbody>
							<tr *ngFor="let member of issuer.staff">
								<td>
									{{ member.nameLabel }}
								</td>
								<td class="hidden hidden-is-tablet">
									{{ member.email }}
								</td>
								<td class="l-childrenhorizontal formfield table-staffeditor-x-role">
									<select [value]="member.roleSlug"
									        [disabled]="member == issuer.currentUserStaffMember"
									        (change)="changeMemberRole(member, $event.target.value)"
									        *ngIf="isCurrentUserIssuerOwner"
									>
										<option *ngFor="let role of issuerStaffRoleOptions" [value]="role.value">{{ role.label }}</option>
									</select>
									<span *ngIf="! isCurrentUserIssuerOwner">
										{{ member.roleInfo.label }}
									</span>
								</td>
								<td *ngIf="isCurrentUserIssuerOwner" class="hidden hidden-is-tablet">
									<button class="button button-primaryghost"
									        type="button"
									        [disabled-when-requesting]="true"
									        (click)="removeMember(member)"
									        *ngIf="member != issuer.currentUserStaffMember"
									>Remove Member
									</button>
								</td>
							</tr>
						</tbody>
					</table>
				</form>
			</div>
		</main>
	`
})
export class IssuerStaffComponent extends BaseAuthenticatedRoutableComponent implements OnInit {
	readonly issuerImagePlaceHolderUrl = preloadImageURL(require(
		'../../breakdown/static/images/placeholderavatar-issuer.svg'));

	issuer: Issuer;
	issuerSlug: string;
	issuerLoaded: Promise<Issuer>;
	profileEmailsLoaded: Promise<UserProfileEmail[]>;
	profileEmails: UserProfileEmail[] = [];
	staffCreateForm: FormGroup;

	constructor(
		loginService: SessionService,
		router: Router,
		route: ActivatedRoute,
		protected formBuilder: FormBuilder,
		protected title: Title,
		protected messageService: MessageService,
		protected issuerManager: IssuerManager,
		protected profileManager: UserProfileManager,
		protected dialogService: CommonDialogsService
	) {
		super(router, route, loginService);
		title.setTitle("Manage Issuer Staff - Badgr");

		this.issuerSlug = this.route.snapshot.params[ 'issuerSlug' ];
		this.issuerLoaded = this.issuerManager.issuerBySlug(this.issuerSlug)
			.then(issuer => this.issuer = issuer);

		this.profileEmailsLoaded = this.profileManager.userProfilePromise
			.then(profile => profile.emails.loadedPromise)
			.then(emails => this.profileEmails = emails.entities);

		this.initStaffCreateForm();
	}

	private _issuerStaffRoleOptions: FormFieldSelectOption[];
	get issuerStaffRoleOptions() {
		return this._issuerStaffRoleOptions || (this._issuerStaffRoleOptions = issuerStaffRoles.map(r => ({
			label: r.label,
			value: r.slug
		})));
	}

	get isCurrentUserIssuerOwner() {
		return this.issuer && this.issuer.currentUserStaffMember && this.issuer.currentUserStaffMember.isOwner
	}

	//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
	// Staff Editing

	changeMemberRole(
		member: IssuerStaffMember,
		roleSlug: IssuerStaffRoleSlug
	) {
		member.roleSlug = roleSlug;

		member.save().then(
			() => {
				this.messageService.reportMajorSuccess(`${member.nameLabel}'s role has been changed to ${member.roleInfo.label}`);
				this.initStaffCreateForm();
			},
			error => this.messageService.reportHandledError(`Failed to edit member: ${BadgrApiFailure.from(error).firstMessage}`)
		);
	}

	async removeMember(member: IssuerStaffMember) {
		if (!await this.dialogService.confirmDialog.openTrueFalseDialog({
				dialogTitle: `Remove ${member.nameLabel}?`,
				dialogBody: `${member.nameLabel} is ${member.roleInfo.indefiniteLabel} of ${this.issuer.name}. Are you sure you want to remove them from this role?`,
				resolveButtonLabel: `Remove ${member.nameLabel}`,
				rejectButtonLabel: "Cancel",
			})) {
			return;
		}

		return member.remove().then(
			() => this.messageService.reportMinorSuccess(`Removed ${member.nameLabel} from ${this.issuer.name}`),
			error => this.messageService.reportHandledError(`Failed to add member: ${BadgrApiFailure.from(error).firstMessage}`)
		);
	}

	//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
	// Staff Creation

	protected initStaffCreateForm() {
		this.staffCreateForm = this.formBuilder.group({
			staffRole: [ 'staff', Validators.required ],
			staffEmail: [
				'', Validators.compose([
					Validators.required,
					EmailValidator.validEmail
				])
			],
		} as StaffCreateForm<any[]>);
	}

	submitStaffCreate(formData: StaffCreateForm<string>) {
		if (!this.staffCreateForm.valid) {
			markControlsDirty(this.staffCreateForm);
			return;
		}

		return this.issuer.addStaffMember(
			formData.staffRole as IssuerStaffRoleSlug,
			formData.staffEmail
		).then(
			() => {
				this.messageService.reportMinorSuccess(`Added ${formData.staffEmail} as ${formData.staffRole}`);
				this.initStaffCreateForm();
			},
			error => this.messageService.reportHandledError(`Failed to add member: ${BadgrApiFailure.from(error).firstMessage}`)
		);
	}
}

interface StaffCreateForm<T> {
	staffRole: T;
	staffEmail: T;
}
