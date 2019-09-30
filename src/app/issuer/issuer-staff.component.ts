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
import { SigningApiService } from '../common/services/signing-api.service';
import { SystemConfigService } from '../common/services/config.service';


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
								<th class="table-staffeditor-x-role"  *ngIf="signingEnabled && isCurrentUserIssuerOwner">Signer</th>
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

								<td  *ngIf="signingEnabled && isCurrentUserIssuerOwner" ></td>

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

								<td *ngIf="signingEnabled && isCurrentUserIssuerOwner" class="hidden hidden-is-tablet">								
									<button class="button button-primaryghost"
													type="button"
													[disabled-when-requesting]="true"
													(click)="makeMemberSigner(member)"
													*ngIf="member.isSigner == false  && !currentSigner && member.mayBecomeSigner"
									>Make Signer
									</button>
									<button class="signingEnabled && button button-primaryghost"
													type="button"
													[disabled-when-requesting]="true"
													(click)="enterPassword(member)"
													*ngIf="member.isSigner == false  && currentSigner && member.mayBecomeSigner"
									>Make Signer
									</button>
									<span *ngIf="signingEnabled && member.isSigner">Is signer</span>
								</td>

								<td *ngIf="isCurrentUserIssuerOwner" class="hidden hidden-is-tablet">
									<button class="button button-primaryghost"
									        type="button"
									        [disabled-when-requesting]="true"
													(click)="removeMember(member)"
													*ngIf="member != issuer.currentUserStaffMember && member.isSigner == false"
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
	currentSigner: IssuerStaffMember;

	get signingEnabled() { return this.configService.signingEnabled }

	constructor(
		loginService: SessionService,
		router: Router,
		route: ActivatedRoute,
		private signingApiService: SigningApiService,
		private configService: SystemConfigService,
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
			.then(issuer => {
				this.currentSigner = this.getCurrentSigner(issuer)
				this.issuer = issuer
				return this.issuer
			});

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


	getCurrentSigner(issuer) {
		for (let index in issuer.staff.entities as IssuerStaffMember) {
			let member = issuer.staff.entities[index]
			if (member.isSigner) {
				return member
			}
		}
		return null
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


	makeMemberSigner(member: IssuerStaffMember){
		this.signingApiService.setNewSigner(
			this.issuer,
			member).then(
				() => {
					member.isSigner = true
					this.currentSigner = member
					this.messageService.reportMajorSuccess(`${member.nameLabel}'s has been made signer.`);
					this.initStaffCreateForm();
				},
				error => this.messageService.reportHandledError(`Failed to make member signer: ${BadgrApiFailure.from(error).verboseError}`)
			);
	}


	enterPassword(new_member) {
		this.dialogService.changeSignerPasswordDialog.openDialog(this.issuer, this.currentSigner, new_member)
			.then( () => {
				this.currentSigner.isSigner = false
				new_member.isSigner = true
				this.currentSigner = new_member
				this.messageService.reportMajorSuccess(`Signer role succesfully changed to ${new_member.nameLabel}`);

				this.initStaffCreateForm();
			})
			.catch( error => {
				this.messageService.reportHandledError(`Failed to change signer: ${BadgrApiFailure.from(error).verboseError}`)
			})
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
			error => this.messageService.reportHandledError(`Failed to remove member: ${BadgrApiFailure.from(error).verboseError}`)
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
				this.messageService.setMessage(`Succesfully invited ${formData.staffEmail} to become ${formData.staffRole}`, "success");
				this.initStaffCreateForm();
			},
			error => this.messageService.reportHandledError(`Failed to add member: ${BadgrApiFailure.from(error).verboseError}`)
		);
	}
}

interface StaffCreateForm<T> {
	staffRole: T;
	staffEmail: T;
}
