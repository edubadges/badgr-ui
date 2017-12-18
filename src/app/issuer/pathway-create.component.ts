import { Component, OnInit } from "@angular/core";

import { FormControl, FormGroup, FormBuilder, Validators } from '@angular/forms';
import { Router, ActivatedRoute } from "@angular/router";
import { SessionService } from "../common/services/session.service";
import { MessageService } from "../common/services/message.service";
import { Title } from "@angular/platform-browser";
import { UrlValidator } from "../common/validators/url.validator";
import { BaseAuthenticatedRoutableComponent } from "../common/pages/base-authenticated-routable.component";
import { ApiPathwaySummaryForCreation } from "./models/pathway-api.model";
import { PathwayManager } from "./services/pathway-manager.service";
import { FormFieldText } from "../common/components/formfield-text";
import { IssuerManager } from "./services/issuer-manager.service";
import { Issuer } from "./models/issuer.model";
import { FormMessageComponent } from "../common/components/form-message.component";
import { markControlsDirty } from "../common/util/form-util";

/**
 * Defines the fields in the form for this component. Can be used for type checking any type that exposes a property
 * per form field.
 */
interface PathwayCreateForm<T> {
	pathway_name: T;
	pathway_description: T;
	alignment_url: T;
}

@Component({
	selector: 'pathway-create',
	template: `
		<main>
			<form-message></form-message>
		
			<header class="wrap wrap-light l-containerhorizontal l-heading">
		
				<nav>
					<h1 class="visuallyhidden">Breadcrumbs</h1>
					<ul class="breadcrumb">
						<li><a [routerLink]="['/issuer']">Issuers</a></li>
						<li *ngIf="issuer"><a [routerLink]="['/issuer/issuers', issuerSlug]">{{ issuer.name }}</a></li>
		
						<li class="breadcrumb-x-current">Create Pathway</li>
					</ul>
				</nav>
		
				<div class="heading">
					<div class="heading-x-text">
						<h1>New Pathway</h1>
						<p>
							Create a Learning Pathway based on combinations of learning objectives with badges from one issuer or many. Learning Pathways can represent competencies, job requirements, content knowledge and more. 
							<a href="https://support.badgr.io/display/BSKB/Learning+Pathways+and+Badge+System+Designs" target="_blank">Learn More.</a>
						</p>
					</div>
				</div>
		
			</header>
		
			<div class="l-containerhorizontal l-containervertical l-childrenvertical wrap">
		
				<form class="l-form"
				      [formGroup]="pathwayForm"
				      (ngSubmit)="onSubmit(pathwayForm.value)"
				      novalidate>
					<fieldset>
						<bg-formfield-text [control]="pathwayForm.controls.pathway_name"
						                   [label]="'Name'"
						                   [errorMessage]="{required:'Please enter a pathway name'}"
						                   [autofocus]="true"
						></bg-formfield-text>
		
						<bg-formfield-text [control]="pathwayForm.controls.pathway_description"
						                   [label]="'Description'"
						                   [errorMessage]="{required:'Please enter a pathway description'}"
						                   [multiline]="true"
						></bg-formfield-text>
		
						<bg-formfield-text [control]="pathwayForm.controls.alignment_url"
						                   [label]="'Alignment URL (Optional)'"
						                   [description]="'An Alignment URL will be automatically created for you if you don’t have one.'"
						                   [errorMessage]="'Please enter a valid URL'"
						                   [urlField]="true"
						></bg-formfield-text>
					</fieldset>
		
					<div class="l-childrenhorizontal l-childrenhorizontal-small l-childrenhorizontal-right">
							<a class="button button-primaryghost"
							   [routerLink]="['/issuer/issuers', issuerSlug]"
							   [disabled-when-requesting]="true"
							>Cancel</a>
							<button class="button"
							        type="submit"
							        [disabled]="creationSent"
							        (click)="createPathway($event)"
							        [loading-when-requesting]="true"
							>Create Pathway</button>
					</div>
				</form>
		
			</div>
		</main>
	`
})
export class PathwayCreateComponent extends BaseAuthenticatedRoutableComponent implements OnInit {
	pathwayForm: FormGroup;
	creationSent: boolean = false;
	issuer: Issuer;

	constructor(
		loginService: SessionService,
		router: Router,
		route: ActivatedRoute,
		protected messageService: MessageService,
		protected title: Title,
		protected formBuilder: FormBuilder,
		protected pathwayManager: PathwayManager,
		protected issuerManager: IssuerManager
	) {
		super(router, route, loginService);

		title.setTitle("Create Pathway - Badgr");

		this.pathwayForm = formBuilder.group({
			pathway_name: [ '',
			                Validators.compose([
				                Validators.required,
				                Validators.maxLength(128)
			                ])
			],
			pathway_description: [ '',
			                       Validators.compose([
				                       Validators.required,
				                       Validators.maxLength(255)
			                       ])
			],
			alignment_url: [ '', Validators.compose([ UrlValidator.validUrl ]) ]
		} as PathwayCreateForm<any[]>);

		issuerManager.issuerBySlug(this.issuerSlug).then(
			issuer => this.issuer = issuer,
			error => this.messageService.reportLoadingError(`Failed to load issuer ${this.issuerSlug}`, error)
		)
	}

	get controls(): PathwayCreateForm<FormControl> {
		return this.pathwayForm.controls as any;
	}

	get issuerSlug() {
		return this.route.snapshot.params['issuerSlug'];
		;
	}

	postProcessUrl() {
		var control: FormControl = this.controls.alignment_url;
		UrlValidator.addMissingHttpToControl(control);
	}

	ngOnInit() {
		super.ngOnInit();
	}

	onSubmit(formState: PathwayCreateForm<string>) {
		var newPathwayData = {
			name: formState.pathway_name,
			description: formState.pathway_description,
			alignmentUrl: formState.alignment_url || null
		} as ApiPathwaySummaryForCreation;

		this.pathwayManager.createPathway(this.issuerSlug, newPathwayData).then(createdPathway => {
			this.router.navigate([
				'issuer/issuers', this.issuerSlug, 'pathways', createdPathway.slug, 'elements', createdPathway.slug
			]);
			this.messageService.setMessage("Pathway created successfully.", "success");
		}, error => {
			this.messageService.setMessage(`Unable to create pathway: ${error}`, "error");
		})
	}

	createPathway(ev) {
		if (!this.pathwayForm.valid) {
			ev.preventDefault();
			markControlsDirty(this.pathwayForm);
		}
	}
}
