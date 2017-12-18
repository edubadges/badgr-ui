import { Component, OnInit, ViewChild } from "@angular/core";
import { FormControl, FormGroup, FormBuilder, Validators } from "@angular/forms";
import { Router, ActivatedRoute } from "@angular/router";
import { SessionService } from "../common/services/session.service";
import { MessageService } from "../common/services/message.service";
import { BaseAuthenticatedRoutableComponent } from "../common/pages/base-authenticated-routable.component";
import { RecipientGroupManager } from "./services/recipientgroup-manager.service";
import { Title } from "@angular/platform-browser";
import { Issuer } from "./models/issuer.model";
import { IssuerManager } from "./services/issuer-manager.service";
import { RecipientGroup, RecipientGroupMember } from "./models/recipientgroup.model";
import { PathwaySelectionDialog } from "./pathway-selection-dialog.component";
import { LearningPathway } from "./models/pathway.model";
import { CommonDialogsService } from "../common/services/common-dialogs.service";
import { FormFieldText } from "../common/components/formfield-text";
import { EmailValidator } from "../common/validators/email.validator";
import { RecipientSelectionDialog } from "./recipient-selection-dialog.component";
import { jsonCopy } from "../common/util/deep-assign";
import { markControlsDirty } from "../common/util/form-util";

@Component({
	selector: 'recipientGroup-detail',
	template: `
		<main *bgAwaitPromises="[issuerLoaded, groupLoaded]">

			<form-message></form-message>

			<ng-template [ngIf]="recipientGroup">

				<header class="wrap wrap-light l-containerhorizontal l-heading">

					<nav [class.inactive]="editForm.isEditing">
						<h1 class="visuallyhidden">Breadcrumbs</h1>
						<ul class="breadcrumb">
							<li><a [routerLink]="['/issuer']">Issuers</a></li>
							<li *ngIf="issuer"><a [routerLink]="['/issuer/issuers', issuerSlug]">{{ issuer.name }}</a></li>

							<li class="breadcrumb-x-current">GROUP: {{ recipientGroup?.name }}</li>
						</ul>
					</nav>

					<div class="heading">
						<div class="heading-x-text">
							<h1 *ngIf="! editForm.isEditing">{{ recipientGroup.name }}
								<button class="heading-x-edit"
								        type="button"
								        (click)="editForm.startEditing()"
								        *ngIf="! editForm.isEditing">Edit
								</button>
							</h1>
							<ng-template [ngIf]="! editForm.isEditing">
								<p> {{ recipientGroup.description }}</p>
							</ng-template>
							<recipientgroup-edit-form [recipientGroup]="recipientGroup" #editForm></recipientgroup-edit-form>
						</div>
						<div class="heading-x-actions" [class.inactive]="editForm.isEditing">
							<button class="button button-major" (click)="subscribeToPathway()">Manage Pathways</button>
							<input class="switch switch-bold" type="checkbox" id="status" name="status"
								[value]="recipientGroup.active"
								(change)="updateGroupActiveState($event.target.value === 'true')"
							>
							<label for="status">
							  <span class="switch-x-text">Your group is </span>
							  <span class="switch-x-toggletext">
							    <span class="switch-x-unchecked"><span class="switch-x-hiddenlabel">Unchecked: </span>Private</span>
							    <span class="switch-x-checked"><span class="switch-x-hiddenlabel">Checked: </span>Public</span>
							  </span>
							</label>
						</div>
					</div>

				</header>

				<div class="wrap l-containerhorizontal l-containervertical l-childrenvertical" [class.inactive]="editForm.isEditing">

					<h2 class="title title-is-smallmobile hidden hidden-is-tablet">Subscribed Pathways</h2>

					<div class="l-gridthree hidden hidden-is-tablet"
					     [class.inactive]="editForm.isEditing">
						<div *ngFor="let pathway of recipientGroup.subscribedPathways">
							<div class="card">
								<a class="card-x-main" [routerLink]="['/issuer/issuers/', issuerSlug, 'pathways', pathway?.slug||'', 'elements', pathway?.slug||'']">
									<div class="card-x-image">
							      <div class="badge">
								      <badge-image [badge]="pathway.completionBadge.entity" [size]="40"></badge-image>
							      </div>
							    </div>
									<div class="card-x-text">
										<h1>{{ pathway.name }}</h1>
										<small>{{ pathway.elementCount }} Child Elements</small>
										<p [truncatedText]="pathway.description" [maxLength]="150"></p>
									</div>
								</a>
							</div>
						</div>
					</div>

					<header class="l-childrenhorizontal l-childrenhorizontal-spacebetween">
						<h2 class="title">{{ recipientGroup.members.length }} Members</h2>
						<div>
						<button class="button" 
								type="button"
								[routerLink]="['/issuer/issuers', issuer.slug, 'recipient-groups', recipientGroup.slug,'csv-import']"
						>UPLOAD CSV</button>
								
						<button class="button button-secondary l-marginLeft"
								type="button"
								(click)="importExistingRecipients()">
							Import <span class="hidden hidden-is-tablet">Existing Members</span>
						</button>
						</div>
					</header>

					<div class="l-overflowhorizontal">

						<!-- Members Tables -->
						<div class="table">
							<!-- Table Header -->
							<div class="table-x-thead">
								<div class="table-x-tr">
									<div class="table-x-th" scope="col">Member</div>
									<div class="table-x-th hidden hidden-is-tablet" scope="col">Email</div>
									<div class="table-x-th table-x-actions hidden hidden-is-tablet" scope="col"><span class="visuallyhidden">Actions</span></div>
								</div>
							</div>

							<!-- Add Member Row -->
							<div class="table-x-tbody hidden hidden-is-tablet">
								<form class="table-x-tr table-x-active"
								      [formGroup]="memberCreateForm"
								      (ngSubmit)="submitMemberCreate(memberCreateForm.value)">
									<div class="table-x-th"
											 scope="row">
										<bg-formfield-text [control]="memberCreateForm.controls.memberName"
										                   [errorMessage]="'Please enter a member name'"
										                   placeholder="Member Name"
										                   #memberCreateName
																			 [class.inactive]="editForm.isEditing || isEditingMember"
										></bg-formfield-text>
									</div>
									<div class="table-x-td">
										<bg-formfield-text [control]="memberCreateForm.controls.memberEmail"
										                   [errorMessage]="'Please enter valid email address'"
										                   placeholder="Member Email"
																			 [class.inactive]="editForm.isEditing || isEditingMember"
										></bg-formfield-text>
									</div>
									<div class="table-x-td">
										<div class="l-childrenhorizontal l-childrenhorizontal-small l-childrenhorizontal-right"
												 [class.inactive]="editForm.isEditing || isEditingMember">
											<button class="button" type="submit" [disabled-when-requesting]="true">Add Member</button>
										</div>
									</div>
								</form>
							</div>

							<!-- Member Edit Form -->
						<form class="table-x-tbody"
						      [formGroup]="memberEditForm"
						      (ngSubmit)="submitMemberEdit(memberEditForm.value)">
							<!-- Member Row -->
							<div class="table-x-tr"
							     *ngFor="let member of recipientGroup.members.entities.slice().reverse()">
								<div class="table-x-th"
										 scope="row"
										 [class.inactive]="isEditingMember && editingMember != member">
									<bg-formfield-text [control]="memberEditForm.controls.memberName"
									                   [errorMessage]="'Please enter a member name'"
									                   placeholder="Member Name"
									                   *ngIf="editingMember == member"
									                   #editMemberNameField
									></bg-formfield-text>

										<ng-template [ngIf]="editingMember != member">
											{{ member.memberName }}
										</ng-template>
									</div>
									<div class="table-x-td hidden hidden-is-tablet"
											 [class.inactive]="isEditingMember && editingMember != member">
										{{ member.memberEmail }}
									</div>
									<div class="table-x-td table-x-actions hidden hidden-is-tablet"
											 [class.inactive]="isEditingMember && editingMember != member">
										<div class="l-childrenhorizontal l-childrenhorizontal-small l-childrenhorizontal-right">
											<button class="button button-primaryghost"
											        type="button"
											        (click)="editMember(member)"
											        *ngIf="editingMember != member"
											>Edit</button>

											<button class="button button-primaryghost"
											        type="button"
											        (click)="cancelMemberEdit()"
											        *ngIf="editingMember == member"
											>Cancel</button>

											<button class="button"
											        type="submit"
											        *ngIf="editingMember == member"
											        [disabled-when-requesting]="true"
											>Update</button>

											<button class="button button-primaryghost"
											        type="button"
											        *ngIf="editingMember != member"
											        (click)="deleteMember(member)"
											        [class.inactive]="isEditingMember && editingMember == member"
											        [disabled-when-requesting]="true"
											>Delete</button>
										</div>
									</div>
								</div>
							</form>
						</div>
					</div>
			</div>
		</ng-template>

		<pathway-selection-dialog #pathwayDialog></pathway-selection-dialog>
		<recipient-selection-dialog #recipientSelectionDialog></recipient-selection-dialog>
	</main>
	`
})
export class RecipientGroupDetailComponent extends BaseAuthenticatedRoutableComponent implements OnInit {
	memberCreateForm: FormGroup;
	memberEditForm: FormGroup;

	editingMember: RecipientGroupMember;

	viewLoaded: boolean = false;
	issuer: Issuer;

	recipientGroup: RecipientGroup;

	@ViewChild("pathwayDialog")
	pathwayDialog: PathwaySelectionDialog;

	@ViewChild("memberCreateName")
	memberCreateNameField: FormFieldText;

	@ViewChild("editMemberNameField")
	editMemberNameField: FormFieldText;

	@ViewChild("recipientSelectionDialog")
	recipientSelectionDialog: RecipientSelectionDialog;

	issuerLoaded: Promise<any>;
	groupLoaded: Promise<any>;

	constructor(
		loginService: SessionService,
		router: Router,
		route: ActivatedRoute,
		protected messageService: MessageService,
		protected title: Title,
		protected formBuilder: FormBuilder,
		protected recipientGroupManager: RecipientGroupManager,
		protected issuerManager: IssuerManager,
		protected dialogService: CommonDialogsService
	) {
		super(router, route, loginService);

		title.setTitle("Recipient Group Detail - Badgr");

		this.issuerLoaded = issuerManager.issuerBySlug(this.issuerSlug).then(
			issuer => this.issuer = issuer,
			error => messageService.reportAndThrowError(`Failed to load issuer ${this.issuerSlug}`, error)
		);

		this.groupLoaded = recipientGroupManager.recipientGroupSummaryFor(
			this.issuerSlug,
			this.groupSlug
		).then(s => s.detailLoadedPromise).then(
			group => this.recipientGroup = group,
			error => messageService.reportAndThrowError(`No Such Recipient Group ${this.issuerSlug} / ${this.groupSlug}`, error)
		);

		this.initMemberEditForm();
		this.initMemberCreateForm();
	}

	ngOnInit() {
		super.ngOnInit();
	}

	get issuerSlug() {
		return this.route.snapshot.params['issuerSlug'];
	}

	get groupSlug() {
		return this.route.snapshot.params['groupSlug'];
	}

	//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
	// Group Editing

	updateGroupActiveState(active: boolean) {
		this.recipientGroup.active = active;
		this.recipientGroup.save().then(
			() => this.messageService.reportMinorSuccess(
				`${active ? 'Activated' : 'Deactivated'} recipient group ${this.recipientGroup.name}`
			),
			error => this.messageService.reportAndThrowError(
				`Failed to ${active ? 'activate' : 'deactivate'} recipient group ${this.recipientGroup.name}`,
				error
			)
		)
	}

	//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
	// Member Deletion

	deleteMember(member: RecipientGroupMember) {
		this.dialogService.confirmDialog.openResolveRejectDialog({
			dialogTitle: "Delete Group Member",
			dialogBody: `Are you sure you want to delete ${member.memberName} from group ${this.recipientGroup.name}`,
			resolveButtonLabel: "Delete Member",
			rejectButtonLabel: "Cancel"
		}).then(
			() => {
				this.recipientGroup.members.remove(member);

				this.recipientGroup.save().then(
					() => this.messageService.reportMinorSuccess(
						`Deleted ${member.memberName} from group ${this.recipientGroup.name}`
					),
					error => this.messageService.reportAndThrowError(
						`Failed to delete ${member.memberName} from group ${this.recipientGroup.name}`,
						error
					)
				)
			},
			() => void 0 // Cancel
		);
	}

	//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
	// Member Editing

	get memberCreateFormControls() {
		return this.memberCreateForm.controls as any as RecipientMemberCreateForm<FormControl>;
	}

	protected initMemberEditForm(memberName: string = "") {
		this.memberEditForm = this.formBuilder.group({
			memberName: [ memberName, Validators.required ]
		} as RecipientMemberEditForm<any[]>);
	}

	get memberEditFormControls() {
		return this.memberCreateForm.controls as any as RecipientMemberEditForm<FormControl>;
	}

	editMember(member: RecipientGroupMember) {
		this.initMemberEditForm(member.memberName);

		this.editingMember = member;

		// Delay so the input has time to show up
		setTimeout(() => this.editMemberNameField && this.editMemberNameField.select());
	}

	submitMemberEdit(formState: RecipientMemberEditForm<string>) {
		if (! this.memberEditForm.valid){
			markControlsDirty(this.memberEditForm);
			return;
		}

		const oldMemberName = this.editingMember.memberName;

		this.editingMember.memberName = formState.memberName;
		this.recipientGroup.save().then(
			() => {
				this.messageService.reportMinorSuccess(
					`Changed member name for ${this.editingMember.memberEmail} from '${oldMemberName}' to '${formState.memberName}'`
				);
				this.editingMember = null;
			},
			error => this.messageService.reportAndThrowError(
				`Failed to change member name for ${this.editingMember.memberEmail} from '${oldMemberName}' to '${formState.memberName}'`,
				error
			)
		);
	}

	cancelMemberEdit() {
		if (this.isEditingMember) {
			this.editingMember.revertChanges();
			this.editingMember = null;
		}
	}

	get isEditingMember(): boolean {
		return !! this.editingMember;
	}

	//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
	// Member Creation

	protected initMemberCreateForm() {
		this.memberCreateForm = this.formBuilder.group({
			memberName: [ '', Validators.required ],
			memberEmail: [ '', Validators.compose([
				Validators.required,
				EmailValidator.validEmail
			])]
		} as RecipientMemberCreateForm<any[]>);
	}

	submitMemberCreate(formState: RecipientMemberCreateForm<string>) {
		if (! this.memberCreateForm.valid) {
			markControlsDirty(this.memberCreateForm);
			return;
		}

		this.recipientGroup.addMember({
			name: formState.memberName,
			email: formState.memberEmail
		});

		this.recipientGroup.save().then(
			() => {
				this.messageService.reportMinorSuccess(
					`Added member ${formState.memberName} <${formState.memberEmail}> to the group`
				);
				this.initMemberCreateForm();
				this.memberCreateNameField.focus();
			},
			error => this.messageService.reportAndThrowError(
				`Failed to add member ${formState.memberName} <${formState.memberEmail}> to the group`
			)
		);
	}

	//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
	// Pathway Subscriptions

	removeSubscribedPathway(pathway: LearningPathway) {
		this.dialogService.confirmDialog.openResolveRejectDialog({
			dialogTitle: "Unsubscribe From Pathway",
			dialogBody: `Are you sure you want to unsubscribe recipient group ${this.recipientGroup.name} from pathway ${pathway.name}`,
			resolveButtonLabel: "Unsubscribe",
			rejectButtonLabel: "Cancel"
		}).then(
			() => {
				this.recipientGroup.subscribedPathways.remove(pathway);

				this.recipientGroup.save().then(
					() =>
						this.messageService.reportMinorSuccess(`Unsubscribed ${this.recipientGroup.name} from pathway ${pathway.name}`),
					error => this.messageService.reportAndThrowError(`Failed to unsubscribe ${this.recipientGroup.name} from pathway ${pathway.name}`,
						error)
				)
			},
			() => void 0 // Cancel
		);
	}

	private subscribeToPathway() {
		this.pathwayDialog.openDialog({
			dialogId: "recipient-group-subscribe",
			issuerSlug: this.issuerSlug,
			dialogTitle: "Add Pathways",
			multiSelectMode: true,
			selectedPathways: Array.from(this.recipientGroup.subscribedPathways.entities)
		}).then(
			newPathways => {
				this.recipientGroup.subscribedPathways.setTo(newPathways);
				this.recipientGroup.save().then(
					() => this.messageService.reportMinorSuccess(`Updated subscribed pathways for ${this.recipientGroup.name}`),
					error => this.messageService.reportAndThrowError(`Failed to update subscribed pathways for ${this.recipientGroup.name}`, error)
				);
			},
			cancel => void 0
		)
	}

	//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
	// Recipient Importing

	private importExistingRecipients() {
		this.recipientSelectionDialog.openDialog({
			dialogId: "recipient-group-include-members",
			issuerSlug: this.issuerSlug,
			dialogTitle: "Import Existing Recipients",
			multiSelectMode: true,
			selectedRecipients: [],
			excludedGroupUrls: [ this.recipientGroup.url ],
			excludedMemberEmails: this.recipientGroup.members.entities.map(m => m.memberEmail)
		}).then(
			newMembers => {
				newMembers.forEach(member => {
					this.recipientGroup.members.addOrUpdate(jsonCopy(member.apiModel));
				});

				this.recipientGroup.save().then(
					() => this.messageService.reportMinorSuccess(`Updated members for ${this.recipientGroup.name}`),
					error => this.messageService.reportAndThrowError(`Failed to import members into ${this.recipientGroup.name}`, error)
				);
			},
			cancel => void 0
		)
	}

}

interface RecipientMemberEditForm<T> {
	memberName: T;
}


interface RecipientMemberCreateForm<T> extends RecipientMemberEditForm<T> {
	memberEmail: T;
}
