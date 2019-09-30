import { Component, ElementRef, Renderer2 } from "@angular/core";
import { FormBuilder, FormGroup, Validators } from "@angular/forms";

import { SystemConfigService } from "../services/config.service";
import { BaseDialog } from './base-dialog';
import { SessionService } from "../services/session.service";
import { SocialAccountProviderInfo } from "../model/user-profile-api.model";
import { markControlsDirty } from "../../common/util/form-util";


@Component({
	selector: 'enter-password-dialog',
	template: `
		<dialog class="dialog dialog-large dialog-confirm">
			<div class="l-containervertical" style="margin: 0px 20px 0px 20px;">
				<form (ngSubmit)="onSubmit(passwordForm.value)" novalidate>
					<div class="l-formsection wrap wrap-well" role="group">
						<fieldset>
							<bg-formfield-text 	[control]="passwordForm.controls.password"
																	[label]="'Please enter your password.'"
																	[errorMessage]="{required:'Please enter your password'}"
																	fieldType="password"
																	[autofocus]="true"
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
export class EnterPasswordDialog extends BaseDialog {


	static defaultOptions = {
		dialogBody: '',
		rejectButtonLabel: "Cancel",
		resolveButtonLabel: "Ok",
		showCloseBox: true,
		showRejectButton: true
	};

	options = EnterPasswordDialog.defaultOptions;
	sessionService;
	provider: SocialAccountProviderInfo;
	loggedIn: boolean = false;
	parentComponentFormState: object;
	passwordForm: FormGroup;

	resolveFunc: () => void;
	rejectFunc: () => void;
	get currentTheme() { return this.configService.currentTheme }

	constructor(
		private configService: SystemConfigService,
		protected formBuilder: FormBuilder,
		sessionService: SessionService,
		componentElem: ElementRef,
		renderer: Renderer2,
	) {
		super(componentElem, renderer);
		this.sessionService = sessionService;
		this.passwordForm = this.formBuilder.group({
			'password': [ '',
										Validators.compose([Validators.required, 
																				Validators.maxLength(1024)])
									]
		})
	}

	openDialog(parentComponentFormState): Promise<void> {
		let options = {dialogBody: this.currentTheme.consent_apply_badge};
		this.options = Object.assign(this.options, options);
		this.parentComponentFormState = parentComponentFormState

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
		this.parentComponentFormState['password'] = formState.password
		this.closeDialog(true)
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
