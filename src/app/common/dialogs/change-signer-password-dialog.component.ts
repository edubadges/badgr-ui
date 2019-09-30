import { MessageService } from './../services/message.service';
import { SigningApiService } from './../services/signing-api.service';
import { Component, ElementRef, Renderer2 } from "@angular/core";
import { FormBuilder, FormGroup, Validators } from "@angular/forms";

import { BadgrApiFailure } from "../../common/services/api-failure";
import { SystemConfigService } from "../services/config.service";
import { BaseDialog } from './base-dialog';
import { SessionService } from "../services/session.service";
import { SocialAccountProviderInfo } from "../model/user-profile-api.model";
import { markControlsDirty } from "../../common/util/form-util";
import { Issuer, IssuerStaffMember } from "../../issuer/models/issuer.model";

@Component({
	selector: 'change-signer-password-dialog',
	template: `
		<dialog class="dialog dialog-large dialog-confirm">
			<div class="l-containervertical" style="margin: 0px 20px 0px 20px;">
				<form (ngSubmit)="onSubmit(passwordForm.value)" novalidate>
					<div class="l-formsection wrap wrap-well" role="group">
						<fieldset>
							<bg-formfield-text 	[control]="passwordForm.controls.old_password"
																	[label]="'Please enter the password belonging to the previous signer.'"
																	[errorMessage]="{required:'Please enter your previous password'}"
																	fieldType="password"
																	[autofocus]="true"
							></bg-formfield-text>
						</fieldset>
						<fieldset>
							<bg-formfield-text 	[control]="passwordForm.controls.new_password"
																	[label]="'Please enter the password belonging to the new signer.'"
																	[errorMessage]="{required:'Please enter your new password'}"
																	fieldType="password"
							></bg-formfield-text>
						</fieldset>
					</div>
					<hr class="rule l-rule">
				</form>
				<div class="l-form-x-offset l-childrenhorizontal l-childrenhorizontal-small l-childrenhorizontal-right">
					<button
						class="button button-primaryghost" 
						(click)="closeDialog(false)">{{ options.rejectButtonLabel }}
					</button>	
					<button
							type="submit"
							class="button"
							(click)="clickSubmit($event)"
					>Submit</button>
				</div>
			</div>
		</dialog>
	`,
})
export class ChangeSignerPasswordDialog extends BaseDialog {


	static defaultOptions = {
		dialogBody: '',
		rejectButtonLabel: "Cancel",
		resolveButtonLabel: "Ok",
		showCloseBox: true,
		showRejectButton: true
	};

	options = ChangeSignerPasswordDialog.defaultOptions;
	sessionService;
	provider: SocialAccountProviderInfo;
	loggedIn: boolean = false;
	passwordForm: FormGroup;
	oldSigner: IssuerStaffMember;
	newSigner: IssuerStaffMember;
	issuer: Issuer;

	resolveFunc: () => void;
	rejectFunc: () => void;
	get currentTheme() { return this.configService.currentTheme }

	constructor(
		private configService: SystemConfigService,
		private signingApiService: SigningApiService,
		protected formBuilder: FormBuilder,
		protected messageService: MessageService,
		sessionService: SessionService,
		componentElem: ElementRef,
		renderer: Renderer2,
	) {
		super(componentElem, renderer);
		this.sessionService = sessionService;
		this.passwordForm = this.formBuilder.group({
			'old_password': ['',
				Validators.compose([Validators.required,
				Validators.maxLength(1024)])
			],
			'new_password': ['',
				Validators.compose([Validators.required,
				Validators.maxLength(1024)])
			]
		})
	}

	openDialog(issuer: Issuer, oldSigner: IssuerStaffMember, newSigner: IssuerStaffMember): Promise<void> {
		let options = { dialogBody: this.currentTheme.consent_apply_badge };
		this.issuer = issuer
		this.oldSigner = oldSigner
		this.newSigner = newSigner
		this.options = Object.assign(this.options, options);

		if (this.isOpen)
			return Promise.reject(new Error("Cannot open dialog, because it is already open."));
		this.showModal();

		return new Promise<any>((resolve, reject) => {
			this.resolveFunc = resolve;
			this.rejectFunc = reject;
		});
	}

	closeDialog(result: boolean) {
		this.closeModal();
		if (result) {
			this.resolveFunc();
		} else {
			this.rejectFunc();
		}
	}

	onSubmit(formState) {
		this.signingApiService.changeSigner(
			this.issuer,
			formState.old_password, 
			this.oldSigner, 
			formState.new_password, 
			this.newSigner)
			.then(r => {
				this.closeDialog(true)
			})
			.catch(error => {
				this.messageService.reportHandledError(`Failed to change signer: ${BadgrApiFailure.from(error).verboseError}`)
				this.closeDialog(false)
			})


	}

	clickSubmit(ev) {
		if (!this.passwordForm.valid) {
			ev.preventDefault();
			markControlsDirty(this.passwordForm);
		} else {
			this.onSubmit(this.passwordForm.value)
		}
	}

}
