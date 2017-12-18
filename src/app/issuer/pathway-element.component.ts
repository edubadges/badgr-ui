import { Component, Input } from "@angular/core";
import { FormControl, FormGroup, FormBuilder, Validators } from "@angular/forms";
import { UrlValidator } from "../common/validators/url.validator";
import { PathwayDetailComponent } from "./pathway-detail.component";
import { LearningPathwayElement } from "./models/pathway.model";
import { MessageService } from "../common/services/message.service";
import { BadgeSelectionDialogOptions } from "./badge-selection-dialog.component";
import { BadgeClassManager } from "./services/badgeclass-manager.service";
import { ApiElementRequirementJunctionType } from "./models/pathway-api.model";
import { BadgeClassUrl, BadgeClassSlug, BadgeClassRef } from "./models/badgeclass-api.model";
import { markControlsDirty } from "../common/util/form-util";
import { Router } from "@angular/router";

@Component({
	selector: 'pathway-element',
	host: {
		// The root element only shows children, and does not generally act like a normal pathway element
		'[class.pathway]': "! isRootElement",
		'[class.pathway-is-inactivemove]': "isMoveInProgress && !isThisElementMoving",
		'[class.pathway-is-activemove]': "isThisElementMoving",

		// The root element acts as a vertical container for it's children, nothing more.
		'[class.l-childrenvertical]': "isRootElement",
	},
	template: `
	<div class="pathwaydetail pathway-x-content" *ngIf="! isRootElement">
		<div class="pathwaydetail-x-body"
				 *ngIf="! editForm.isEditing"
				 [class.pathwaydetail-x-inactive]="isMoveInProgress"
		>
			<a class="pathwaydetail-x-image"
				 *ngIf="! editForm.isEditing && pathwayElement.hasCompletionBadge"
				 [routerLink]="['/issuer/issuers', issuerSlug, 'pathways', pathwaySlug, 'elements', pathwayElement.slug]"
			>
				<badge-image [badge]="pathwayElement.completionBadge.entity" size="64"></badge-image>
			</a>
			<div class="pathwaydetail-x-main">
				<div class="pathwaydetail-x-text">
					<a [routerLink]="['/issuer/issuers', issuerSlug, 'pathways', pathwaySlug, 'elements', pathwayElement.slug]">
						<h1>{{ pathwayElement.name }}</h1>
						<p>{{ pathwayElement.description }}</p>
					</a>
					<label class="formcheckbox">
						<input type="checkbox" [(ngModel)]="isRequiredForParentCompletion">
						<span class="formcheckbox-x-text">Required for parent completion</span>
					</label>
					<p class="pathwaydetail-x-children"
						 *ngIf="pathwayElement.children.length"
					><strong>{{pathwayElement.children.length}}</strong> Children</p>
				</div>
				<!-- Connected Badges -->
				<div class="pathwaydetail-x-badges"
						 *ngIf="pathwayElement.requirements.requiredBadgeIds?.length > 0"
				>
					<h2 class="titledivider">{{ pathwayElement.requirements.requiredBadgeIds.length }} {{ pathwayElement.requirements.requiredBadgeIds.length == 1 ? "Connected Badge" : "Connected Badges"}}</h2>
					<div>
						<div class="selecteditem selecteditem-badge"
								 *ngFor="let badgeId of pathwayElement.requirements.requiredBadgeIds">
							<badge-image [badgeId]="badgeId" [size]="40"></badge-image>
							<button (click)="removeRequiredBadgeId(badgeId)" [disabled-when-requesting]="true">Remove Badge</button>
						</div>
					</div>
				</div>
			</div>
		</div>
		<div class="pathwaydetail-x-footer"
				 *ngIf="! editForm.isEditing"
		>
			<div class="l-childrenhorizontal l-childrenhorizontal-small"
					 [class.pathwaydetail-x-inactive]="isMoveInProgress"
			>
				<label class="select select-inputonly select-secondary">
				  <span>Badge completion criteria</span>
	
					<select [(ngModel)]="requirementJunctionType" *ngIf="hasBadgeRequirements">
						<option value="Conjunction">ALL badges are required for completion</option>
						<option value="Disjunction">At least ONE badge is required for completion</option>
					</select>
	
					<select [(ngModel)]="requirementJunctionType" *ngIf="hasChildElementRequirements">
						<option value="Conjunction">ALL checked children are required for completion</option>
						<option value="Disjunction">At least ONE checked child is required for completion</option>
					</select>
				</label>
			</div>
	
			<div class="pathwaydetail-x-action l-childrenhorizontal l-childrenhorizontal-small"
					 *ngIf="! hasRequirements && ! isAddingChild && ! isMoveInProgress"
			>
				<button class="button button-secondaryghost"
								(click)="openRequiredBadgeDialog()"
				>Connect Badge</button>
				<span class="pathwaydetail-x-or">or</span>
				<button class="button button-secondaryghost"
								(click)="beginAddingChild()"
				>Add Child</button>
			</div>
			<div class="pathwaydetail-x-action"
					 *ngIf="hasBadgeRequirements && ! isMoveInProgress"
			>
				<button class="button button-secondaryghost"
								(click)="openRequiredBadgeDialog()"
				>Connect Badge</button>
			</div>
			<div class="pathwaydetail-x-action"
					 *ngIf="hasChildElementRequirements && ! isRootElement && ! isMoveInProgress"
			>
				<button class="button button-secondaryghost"
					            (click)="beginAddingChild()"
				>Add Child</button>
			</div>
			<div class="pathwaydetail-x-action l-childrenhorizontal l-childrenhorizontal-small"
					 *ngIf="isThisElementMoving"
			>
					<button class="button button-primaryghost"
								  (click)="cancelElementMove()"
					>Cancel Move</button>
			</div>
		</div>
	
		<div class="pathwaydetail-x-menu menumore"
				 [class.menumore-is-active]="menu.show"
				 [class.pathwaydetail-x-inactive]="isMoveInProgress"
				 *ngIf="! editForm.isEditing"
				 #menu
				 (document:click)="(menu.clickedState ? (menu.clickedState = false) : (menu.show = false)) || true"
		>
			<!-- TODO: Above is an awesome hack that hides the menu when clicking on the document... might want to replace with something more stable. -->
			<button type="button"
							aria-controls="menumore1"
							(click)="menu.show = ! menu.show; menu.clickedState = menu.show;"
			>Toggle Menu</button>
			<ul [attr.aria-hidden]="! menu.show"
					 (click)="menu.show = false"
			>
				<li class="menumoreitem"
						[class.menumoreitem-is-disabled]="! pathwayElement.hasValidMoveTargets"
						*ngIf="! isMoveInProgress"
				>
					<button class="menumoreitem"
									type="button"
									[disabled]="! pathwayElement.hasValidMoveTargets"
									(click)="startElementMove()">Move</button>
				</li>
				<li class="menumoreitem">
					<button class="menumoreitem"
									(click)="editForm.startEditing()">Edit</button>
				</li>
				<li class="menumoreitem">
					<button class="menumoreitem"
					        [disabled-when-requesting]="true"
									(click)="deleteElement()">Delete</button>
				</li>
			</ul>
		</div>
	
		<pathway-element-edit-form #editForm [pathwayElement]="pathwayElement" [formSpan]="true"></pathway-element-edit-form>
	
		</div>
		
		<!-- Move as First Child Button -->
		<div class="pathway" [class.pathway-is-dropzone]="!isRootElement" *ngIf="isValidMoveTarget(null)">
			<button class="pathway-x-move" (click)="moveElementAfterChild(null)">Move Element Here</button>
		</div>
		
		<!-- Element Children -->
		<ng-template ngFor let-child [ngForOf]="pathwayElement.children">
			<pathway-element [pathwayElement]="child"
			                 [pathwayComponent]="pathwayComponent"
			                 [isRootElement]="false"
			                 [elementDisplayDepth]="elementDisplayDepth + 1"
			>
			</pathway-element>
			<div class="pathway" [class.pathway-is-dropzone]="!isRootElement" *ngIf="isValidMoveTarget(child)">
				<button class="pathway-x-move" (click)="moveElementAfterChild(child)">Move Element Here</button>
			</div>
		</ng-template>
		
	<!-- Add New Child Form -->
	<div class="pathway" *ngIf="isAddingChild">
		<div class="pathway-x-content pathwaydetail">
			<form class="l-form l-form-span"
			      [formGroup]="elementCreateForm"
			      (ngSubmit)="submitCreate(elementCreateForm.value)"
			      novalidate
			>
				<fieldset>
					<bg-formfield-text [control]="elementCreateForm.controls.element_name"
					                   [label]="'Element Name'"
					                   [errorMessage]="'Please enter an element name'"
					></bg-formfield-text>
	
					<bg-formfield-text [control]="elementCreateForm.controls.element_description"
					                   [label]="'Element Description'"
					                   [errorMessage]="'Please enter an element description'"
					                   [multiline]="true"
					></bg-formfield-text>
	
					<bg-formfield-text [control]="elementCreateForm.controls.alignment_url"
					                   [label]="'Alignment URL'"
					                   [description]="'An Alignment URL will be automatically created for you if you don’t have one.'"
					                   [errorMessage]="'Please enter a valid URL'"
					                   [urlField]="true"
					></bg-formfield-text>
				</fieldset>
	
				<div class="l-childrenhorizontal l-childrenhorizontal-small l-childrenhorizontal-right">
					<button type="button" class="button button-primaryghost" (click)="cancelCreating()" [disabled-when-requesting]="true">Cancel</button>
					<button type="submit" class="button" (click)="validateCreateForm($event)" [disabled-when-requesting]="true">Save</button>
				</div>
			</form>
		</div>
	</div>
	
	<!-- Add Child when Root button -->
	<button class="button" (click)="beginAddingChild()" *ngIf="isRootElement && hasChildElementRequirements && ! isAddingChild">Add Child</button>
	`
})
export class PathwayElementComponent {
	@Input() pathwayComponent: PathwayDetailComponent;

	@Input() isRootElement: boolean;
	@Input() elementDisplayDepth: number = 0;

	@Input() pathwayElement: LearningPathwayElement;

	constructor(
		protected formBuilder: FormBuilder,
		protected messageService: MessageService,
		protected badgeManager: BadgeClassManager,
		protected router: Router
	) {
		this.setupCreateForm();
	}

	get issuer() { return this.pathwayComponent.issuer }

	get issuerSlug() { return this.pathwayComponent.issuerSlug }

	get pathwaySlug() { return this.pathwayComponent.pathwaySlug }

	private badgeNameForRef(badgeRef: BadgeClassRef | BadgeClassUrl) {
		let badge = this.badgeManager.loadedBadgeByRef(badgeRef);
		return badge ? badge.name : 'this badge';
	}

	private badgeNameForSlug(badgeSlug: BadgeClassSlug) {
		let badge = this.badgeManager.loadedBadgeByIssuerIdAndSlug(this.issuer.issuerUrl, badgeSlug);
		return badge ? badge.name : 'this badge';
	}

	private saveElement(
		element: LearningPathwayElement,
		successMessage: string,
		failureMessage: string
	) {
		element.save().then(
			success => this.messageService.reportMinorSuccess(successMessage),
			failure => this.messageService.reportAndThrowError(failureMessage)
		)
	}


	////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
	// Completion Badge Management

	get completionBadgeRef() { return this.pathwayElement.completionBadge.entityRef; }

	set completionBadgeRef(ref: BadgeClassRef) {
		this.pathwayElement.completionBadge.entityRef = ref;

		this.saveElement(this.pathwayElement,
			`Updated completion badge for ${this.pathwayElement.name}`,
			`Failed to update completion badge for ${this.pathwayElement.name}`);
	}

	openCompletionBadgeDialog() {
		var dialogOptions: BadgeSelectionDialogOptions = {
			dialogId: "pathwayCompletionBadge",
			dialogTitle: "Select Completion Badge",
			multiSelectMode: false,
			restrictToIssuerId: this.issuer.issuerUrl
		};

		const assignSelection = selection => this.completionBadgeRef = selection.length ? selection[ 0 ].ref : null;

		if (this.completionBadgeRef) {
			this.badgeManager.badgeByRef(this.completionBadgeRef).then(
				badge => this.pathwayComponent.badgeSelectionDialog.openDialog(
					Object.assign(dialogOptions, { selectedBadges: [ badge ] })
				).then(assignSelection),
				err => this.messageService.reportAndThrowError(`Failed to load completion badge: ${this.completionBadgeRef}`)
			)
		} else {
			this.pathwayComponent.badgeSelectionDialog
				.openDialog(dialogOptions)
				.then(assignSelection)
		}
	}

	removeCompletionBadge() {
		this.pathwayComponent.confirmDialog
			.openResolveRejectDialog({
				dialogTitle: "Remove Completion Badge?",
				dialogBody: `Are you sure you want to remove ${this.badgeNameForRef(this.completionBadgeRef)} as the completion badge from ${this.pathwayElement.name}?`,
				resolveButtonLabel: "Remove Completion Badge",
				rejectButtonLabel: "Cancel"
			})
			.then(() => {
				this.pathwayElement.completionBadge.entityRef = null;
				this.saveElement(
					this.pathwayElement,
					`Removed completion badge from ${this.pathwayElement.name}`,
					`Failed to remove completion badge from ${this.pathwayElement.name}`
				);
			}, _ => false /* Canceled */);
	}


	////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
	// Requirement Management
	get isRequiredForParentCompletion(): boolean {
		return this.pathwayElement.requiredForParentCompletion;
	}

	get hasBadgeRequirements(): boolean {
		return (this.requiredBadgeIds || []).length > 0;
	}

	get hasChildElementRequirements(): boolean {
		return this.pathwayElement.children.length > 0
	}

	get hasMultipleRequirements(): boolean {
		return (
				this.pathwayElement.requirements.requiredBadgeIds
				|| this.pathwayElement.requirements.requiredElementIds
				|| []
			).length > 1;
	}

	get hasRequirements(): boolean {
		return this.hasBadgeRequirements || this.hasChildElementRequirements;
	}

	get requirementJunctionType() { return this.pathwayElement.requirements.junctionType }

	set requirementJunctionType(type: ApiElementRequirementJunctionType) {
		this.pathwayElement.requirements.junctionType = type;
		this.saveElement(this.pathwayElement,
			`Updated requirements for ${this.pathwayElement.name}`,
			`Failed to update requirements for ${this.pathwayElement.name}`);
	}

	get requiredBadgeIds() { return this.pathwayElement.requirements.requiredBadgeIds; }

	set requiredBadgeIds(ids: BadgeClassUrl[]) {
		this.pathwayElement.requirements.requiredBadgeIds = ids;
		this.saveElement(this.pathwayElement,
			`Updated required badges for ${this.pathwayElement.name}`,
			`Failed to update required badges for ${this.pathwayElement.name}`);
	}

	removeRequiredBadgeId(badgeId: BadgeClassUrl) {
		return this.removeRequiredBadge(badgeId);
	}

	set isRequiredForParentCompletion(required: boolean) {
		if (required != this.isRequiredForParentCompletion) {
			if (required) {
				this.pathwayElement.requiredForParentCompletion = true;
				this.saveElement(
					this.pathwayElement.parentElement,
					`Marked ${this.pathwayElement.name} as required`,
					`Failed to mark ${this.pathwayElement.name} as required`
				);
			} else {
				this.pathwayElement.requiredForParentCompletion = false;
				this.saveElement(
					this.pathwayElement.parentElement,
					`Marked ${this.pathwayElement.name} as not required`,
					`Failed to mark ${this.pathwayElement.name} as not required`
				);
			}
		}
	}

	removeRequiredBadge(badgeId: BadgeClassUrl) {
		this.pathwayComponent.confirmDialog
			.openResolveRejectDialog({
				dialogTitle: "Remove Required Badge?",
				dialogBody: `Are you sure you want to remove ${this.badgeNameForRef(badgeId)} as a requirement from ${this.pathwayElement.name}?`,
				resolveButtonLabel: "Remove Badge",
				rejectButtonLabel: "Cancel"
			})
			.then(() => {
				this.requiredBadgeIds.splice(this.requiredBadgeIds.indexOf(badgeId), 1);
				this.saveElement(this.pathwayElement,
					`Updated required badges for ${this.pathwayElement.name}`,
					`Failed to update required badges for ${this.pathwayElement.name}`);
			}, _ => false /* Canceled */)
	}

	openRequiredBadgeDialog() {
		this.badgeManager.badgesByUrls(
			this.requiredBadgeIds
		).then(
			badges => this.pathwayComponent.badgeSelectionDialog.openDialog(
				{
					dialogId: "pathwayRequiredBadges",
					dialogTitle: "Select Required Badges",
					multiSelectMode: true,
					omittedBadges:badges
				}
			).then(selectedBadges => this.requiredBadgeIds = [].concat(badges,selectedBadges).map(b => b.badgeUrl)),
			err => this.messageService.reportAndThrowError(`Failed to load required badges: ${this.requiredBadgeIds}`)
		)
	}

	////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
	// Element Deletion
	deleteElement() {
		this.pathwayComponent.confirmDialog
			.openResolveRejectDialog(
				this.hasChildElementRequirements ? {
					dialogTitle: `Delete Element ${this.pathwayElement.name} and All Children?`,
					dialogBody: `Are you sure you want to delete element ${this.pathwayElement.name} and all it's child elements? This action cannot be undone.`,
					resolveButtonLabel: `Delete Element and Children`,
					rejectButtonLabel: "Cancel"
				} : {
					dialogTitle: `Delete Element ${this.pathwayElement.name}?`,
					dialogBody: `Are you sure you want to delete element ${this.pathwayElement.name}? This action cannot be undone.`,
					resolveButtonLabel: `Delete Element`,
					rejectButtonLabel: "Cancel"
				}
			)
			.then(() => {
				this.pathwayElement
					.deleteElement()
					.then(
						newChild => this.messageService.reportMinorSuccess(
							`Deleted '${this.pathwayElement.name}' from '${this.pathwayElement.parentElement.name}'`
						),
						failure => this.messageService.reportAndThrowError(
							`Failed to delete element '${this.pathwayElement.name}'`, failure
						)
					);
			}, _ => false /* Canceled */);
	}

	////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
	// Child Creation
	isAddingChild: boolean = false;
	elementCreateForm: FormGroup;

	private setupCreateForm() {
		this.elementCreateForm = this.formBuilder.group({
			element_name: [ '', Validators.required ],
			element_description: [ '', Validators.required ],
			alignment_url: [ '', Validators.compose([ UrlValidator.validUrl ]) ]
		} as PathwayElementForm<any[]>);
	}

	get createControls(): PathwayElementForm<FormControl> {
		return this.elementCreateForm.controls as any;
	}

	beginAddingChild() {
		this.setupCreateForm();
		this.isAddingChild = true;
	}

	cancelCreating() {
		this.isAddingChild = false;
	}

	submitCreate(formState: PathwayElementForm<string>) {
		this.pathwayElement
			.addChild({
				name: formState.element_name,
				description: formState.element_description,
				alignmentUrl: (formState.alignment_url && formState.alignment_url.length)
					? formState.alignment_url
					: null
			})
			.then(
				newChild => {
					this.messageService.reportMinorSuccess(
						`Created '${newChild.name}' as a child of '${this.pathwayElement.name}'`
					);
					this.isAddingChild = false;

					this.setupCreateForm();
				},
				failure => this.messageService.reportAndThrowError(
					`Failed to create new child '${formState.element_name}'`, failure
				)
			);
	}

	validateCreateForm(ev) {
		if (!this.elementCreateForm.valid) {
			ev.preventDefault();
			markControlsDirty(this.elementCreateForm);
		}
	}

	postProcessCreateUrl() {
		UrlValidator.addMissingHttpToControl(this.createControls.alignment_url);
	}

	////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
	// Element Moving
	get isThisElementMoving() {
		return this.pathwayComponent && this.pathwayComponent.movingElement == this.pathwayElement;
	}

	get isMoveInProgress() {
		return this.pathwayComponent && this.pathwayComponent.isElementMoving;
	}

	isValidMoveTarget(afterElem: LearningPathwayElement) {
		return this.pathwayComponent && !this.hasBadgeRequirements && this.pathwayComponent.checkValidMoveTarget(this.pathwayElement,
				afterElem);
	}

	startElementMove() {
		this.pathwayComponent.startElementMove(this.pathwayElement);
	}

	cancelElementMove() {
		this.pathwayComponent.cancelElementMove();
	}

	moveElementAfterChild(child: LearningPathwayElement) {
		this.pathwayComponent.doElementMove(this.pathwayElement, child)
	}
}

interface PathwayElementForm<T> {
	element_name: T;
	element_description: T;
	alignment_url: T;
}
