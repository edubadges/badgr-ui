import { Component, OnInit } from "@angular/core";
import { FormBuilder, FormGroup, Validators } from "@angular/forms";
import { Router, ActivatedRoute } from "@angular/router";
import { MessageService } from "../common/services/message.service";
import { BaseRoutableComponent } from "../common/pages/base-routable.component";
import { Title } from "@angular/platform-browser";
import { RecipientBadgeCollectionManager } from "./services/recipient-badge-collection-manager.service";
import { ApiRecipientBadgeCollectionForCreation } from "./models/recipient-badge-collection-api.model";
import { markControlsDirty } from "../common/util/form-util";
import { SessionService } from "../common/services/session.service";
import { BaseAuthenticatedRoutableComponent } from "../common/pages/base-authenticated-routable.component";

@Component({
	selector: 'create-recipient-badge-collection',
	template: `
		<main>
			<form-message></form-message>
		
			<header class="wrap wrap-light l-containerhorizontal l-heading">
		
				<nav>
					<h1 class="visuallyhidden">Breadcrumbs</h1>
					<ul class="breadcrumb">
						<li><a [routerLink]="['/issuer']">Collections</a></li>
					</ul>
				</nav>
		
				<div class="heading">
					<div class="heading-x-text">
						<h1>Add Badge Collection</h1>
						<p>Adding a collection allows your to organize your badges.</p>
					</div>
				</div>
			</header>
		
			<div class="l-containerhorizontal l-containervertical l-childrenvertical wrap">
				<form class="l-form l-form-image"
				      [formGroup]="badgeCollectionForm"
				      (ngSubmit)="onSubmit(badgeCollectionForm.value)"
				      novalidate>
					<fieldset>
		
						 <bg-formfield-text [control]="badgeCollectionForm.controls.collectionName"
						                   [label]="'Name'"
						                   [errorMessage]="{required:'Please enter a collection name'}"
						                   [autofocus]="true">
                          <span label-additions>Max 128 characters</span> 
	                    </bg-formfield-text>
		
						<bg-formfield-text [control]="badgeCollectionForm.controls.collectionDescription"
						                   [label]="'Description'"
					                       [errorMessage]="{required: 'Please enter a description'}"
						                   [multiline]="true">
	                      <span label-additions>Max 255 characters</span>
                        </bg-formfield-text>
		
						<div class="l-form-x-offset l-childrenhorizontal l-childrenhorizontal-small l-childrenhorizontal-right">
							<a [routerLink]="['/recipient/badge-collections']"
							   class="button button-primaryghost"
							   [disabled-when-requesting]="true"
							>Cancel</a>
							<button type="submit"
							        class="button"
							        [disabled]="!! createCollectionPromise"
							        (click)="clickSubmit($event)"
							        [loading-promises]="[ createCollectionPromise ]"
							        loading-message="Adding"
							>Add Collection</button>
						</div>
					</fieldset>
				</form>
		
			</div>
		</main>
		`
})
export class RecipientBadgeCollectionCreateComponent extends BaseAuthenticatedRoutableComponent implements OnInit {
	badgeCollectionForm: FormGroup;
	createCollectionPromise: Promise<any>;

	constructor(
		router: Router,
		route: ActivatedRoute,
		loginService: SessionService,
		private formBuilder: FormBuilder,
		private title: Title,
		private messageService: MessageService,
		private recipientBadgeCollectionManager: RecipientBadgeCollectionManager
	) {
		super(router, route, loginService);

		title.setTitle("Create Collection - Badgr");

		this.badgeCollectionForm = this.formBuilder.group({
			collectionName: [ '',
                Validators.compose([
                	Validators.required,
	                Validators.maxLength(128)
				])
			],
			collectionDescription: [
				'',
				Validators.compose([
					Validators.required,
					Validators.maxLength(255)
				])
			]
		} as CreateBadgeCollectionForm<any[]>);
	}

	ngOnInit() {
		super.ngOnInit();
	}

	onSubmit(formState: CreateBadgeCollectionForm<string>) {
		const collectionForCreation: ApiRecipientBadgeCollectionForCreation = {
			name: formState.collectionName,
			description: formState.collectionDescription,
			published: false,
			badges: []
		};

		this.createCollectionPromise = this.recipientBadgeCollectionManager.createRecipientBadgeCollection(
			collectionForCreation
		).then((collection) => {
			this.router.navigate([ '/recipient/badge-collections/collection', collection.slug ]);
			this.messageService.reportMinorSuccess("Collection created successfully.");
		}, error => {
			this.messageService.reportHandledError("Unable to create collection", error);
		}).then(() => this.createCollectionPromise = null);
	}

	clickSubmit(ev) {
		if (!this.badgeCollectionForm.valid) {
			ev.preventDefault();
			markControlsDirty(this.badgeCollectionForm);
		}
	}
}

interface CreateBadgeCollectionForm<T> {
	collectionName: T;
	collectionDescription: T;
}