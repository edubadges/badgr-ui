import { Component, OnInit } from "@angular/core";
import { FormControl, FormGroup, FormBuilder, Validators } from "@angular/forms";
import { Router, ActivatedRoute } from "@angular/router";
import { SessionService } from "../common/services/session.service";
import { MessageService } from "../common/services/message.service";
import { Title } from "@angular/platform-browser";
import { BaseAuthenticatedRoutableComponent } from "../common/pages/base-authenticated-routable.component";
import { RecipientGroupManager } from "./services/recipientgroup-manager.service";
import { ApiRecipientGroupForCreation } from "./models/recipientgroup-api.model";
import { Issuer } from "./models/issuer.model";
import { IssuerManager } from "./services/issuer-manager.service";
import { markControlsDirty } from "../common/util/form-util";

/**
 * Defines the fields in the form for this component. Can be used for type checking any type that exposes a property
 * per form field.
 */
interface RecipientGroupCreateForm<T> {
	recipientGroup_name: T;
	recipientGroup_description: T;
	alignment_url: T;
}

@Component({
	selector: 'recipientGroup-create',
	template: `
		<main *bgAwaitPromises="[issuerLoaded]"> 
			<form-message></form-message>
		
			<header class="wrap wrap-light l-containerhorizontal l-heading">
		
				<nav>
					<h1 class="visuallyhidden">Breadcrumbs</h1>
					<ul class="breadcrumb">
						<li><a [routerLink]="['/issuer']">Issuers</a></li>
						<li *ngIf="issuer"><a [routerLink]="['/issuer/issuers', issuerSlug]">{{ issuer.name }}</a></li>
		
						<li class="breadcrumb-x-current">Add Group</li>
					</ul>
				</nav>
		
				<div class="heading">
					<div class="heading-x-text">
						<h1>Add Group</h1>
						<p>Use the form below to create a new recipient group. Once created, you’ll be able to add elements and align badges to it.</p>
					</div>
				</div>
		
			</header>
		
			<div class="l-containerhorizontal l-containervertical l-childrenvertical wrap">
		
				<form class="l-form"
				      [formGroup]="recipientGroupForm"
				      (ngSubmit)="onSubmit(recipientGroupForm.value)"
				      novalidate>
					<fieldset>
						<bg-formfield-text [control]="recipientGroupForm.controls.recipientGroup_name"
						                   [label]="'Name'"
						                   [errorMessage]="{required:'Please enter a group name'}"
						                   [autofocus]="true"
						></bg-formfield-text>
		
						<bg-formfield-text [control]="recipientGroupForm.controls.recipientGroup_description"
						                   [label]="'Description'"
						                   [errorMessage]="{required:'Please enter a group description'}"
						                   [multiline]="true"
						></bg-formfield-text>
					</fieldset>
		
					<div class="l-childrenhorizontal l-childrenhorizontal-small l-childrenhorizontal-right">
							<a class="button button-primaryghost"
							   [routerLink]="['/issuer/issuers/', issuerSlug]"
							   [disabled-when-requesting]="true"
							>Cancel</a>
							<button class="button"
							        type="submit"
							        [disabled]="!! createGroupFinished"
							        (click)="createRecipientGroup($event)"
							        [loading-promises]="[ createGroupFinished ]"
							        loading-message="Adding"
							>Create Group</button>
					</div>
				</form>
		
			</div>
		</main>
	`
})
export class RecipientGroupCreateComponent extends BaseAuthenticatedRoutableComponent implements OnInit {
	recipientGroupForm: FormGroup;
	creationSent: boolean = false;
	issuer: Issuer;

	issuerLoaded: Promise<any>;
	createGroupFinished: Promise<any>;

	constructor(
		loginService: SessionService,
		router: Router,
		route: ActivatedRoute,
		protected messageService: MessageService,
		protected title: Title,
		protected formBuilder: FormBuilder,
		protected recipientGroupManager: RecipientGroupManager,
		protected issuerManager: IssuerManager
	) {
		super(router, route, loginService);

		title.setTitle("Create RecipientGroup - Badgr");

		this.recipientGroupForm = formBuilder.group({
			recipientGroup_name:  [ '',
                Validators.compose([
                    Validators.required,
                    Validators.maxLength(254)
                ])
			],
			recipientGroup_description: [ '', Validators.required ]
		} as RecipientGroupCreateForm<any[]>);

		this.issuerLoaded = issuerManager.issuerBySlug(this.issuerSlug).then(
			issuer => this.issuer = issuer,
			error => this.messageService.reportLoadingError(`Failed to load issuer ${this.issuerSlug}`, error)
		)
	}

	get controls(): RecipientGroupCreateForm<FormControl> {
		return this.recipientGroupForm.controls as any;
	}

	get issuerSlug() { return this.route.snapshot.params['issuerSlug']; }

	ngOnInit() {
		super.ngOnInit();
	}

	onSubmit(formState: RecipientGroupCreateForm<string>) {
		var newRecipientGroupData = {
			name: formState.recipientGroup_name,
			description: formState.recipientGroup_description,
			alignmentUrl: formState.alignment_url,
			members: [],
			pathways: []
		} as ApiRecipientGroupForCreation;

		this.createGroupFinished = this.recipientGroupManager.createRecipientGroup(this.issuerSlug, newRecipientGroupData).then(
			createdRecipientGroup => {
				this.router.navigate([
					'issuer/issuers', this.issuerSlug, 'recipient-groups', createdRecipientGroup.slug
				]);
				this.messageService.reportMinorSuccess("RecipientGroup created successfully.");
			},
			error => {
				this.messageService.reportAndThrowError(`Unable to create recipientGroup`, error);
			}).then(() => this.createGroupFinished = null)
	}

	createRecipientGroup(ev) {
		if (!this.recipientGroupForm.valid && !this.creationSent) {
			this.creationSent = true;

			markControlsDirty(this.recipientGroupForm);

			ev.preventDefault();
		}
	}
}
