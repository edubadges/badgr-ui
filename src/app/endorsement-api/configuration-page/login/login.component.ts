/**
 * @license
 * Copyright Coinversable B.V. All Rights Reserved.
 *
 * Use of this source code is governed by a AGPLv3-style license that can be
 * found in the LICENSE file at https://coinversable.com/agplv3-license/
 * 
 * For more information about the Validana blockchain visit 
 * https://validana.io
 */

// Angular imports
import { Component, OnInit } from "@angular/core";
import { AbstractControl, FormBuilder, FormGroup, ValidatorFn, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';

// Badgr imports
import { BaseAuthenticatedRoutableComponent } from "../../../common/pages/base-authenticated-routable.component";
import { MessageService } from '../../../common/services/message.service';
import { SessionService } from '../../../common/services/session.service';
import { markControlsDirty } from "../../../common/util/form-util";
import { ValidanaBlockchainService } from '../../validana/validanaBlockchain.service';


/**
 * Interface for the input form fields and types
 */
interface inputFormControls<T> {
	privateKey: T;
}

@Component({
    selector: 'validana-login',
    templateUrl: './login.component.html'
})
export class LoginComponent extends BaseAuthenticatedRoutableComponent implements OnInit {

    // Input Form element
    public inputForm: FormGroup;

    // Boolean that indicates if submit buttons in this component are enabled
    public submitEnabled = true;

    /**
     * Create a new login component
     * This component manages user logins with WIF private key
     * Please note that the private key will never leave the browser environment!
     * 
     * @param router Angular Router
     * @param route Angular Activated Route
     * @param sessionService Badgr Session Service
     * @param formBuilder Angular Form Builder
     * @param messageService Badgr Message Service
     * @param validanaService Validana Blockchain Service
     */
    constructor(
        public router: Router,
		public route: ActivatedRoute,
        public sessionService: SessionService,
        
		public formBuilder: FormBuilder,
		public messageService: MessageService,
        public validanaService: ValidanaBlockchainService) {
            super(router, route, sessionService);

            // Setup form element for WIF input
            this.inputForm = this.formBuilder.group({

                // WIF private key input
                privateKey: [ '', [
                    
                    // Private key field is required
                    Validators.required,
                
                    // Private key field should contain private key
                    this.regexValidator(/^[5KLHJ][1-9A-HJ-NP-Za-km-z]{50,51}$/)
                    ] ]
            } as inputFormControls<any[]>);
    }

    /**
     * Submit the form
     * @param formState The form state to submit
     */
	public submitForm(formState: inputFormControls<string>) {

        // Disable button in UI
        this.submitEnabled = false;
        
        // Obtain private key from input form
        const privKey = formState.privateKey;
        this.inputForm.controls.privateKey.reset();
        
        // Store private key
        this.validanaService.userLogin(privKey)
            .then(() => { 

                // Re-enable button in UI
                this.submitEnabled = true; 
            })
            .catch(() => {
                
                // Re-enable button in UI
                this.submitEnabled = true;
            });
    }

    /**
     * Custom validator based on regular expressions
     * @param checkRE The regex to check the input against
     */
    public regexValidator(checkRE: RegExp): ValidatorFn {
        return (control: AbstractControl): {[key: string]: any} => {
          const accepted = checkRE.test(control.value);
          return accepted ? null : {'regex': {value: control.value}} ;
        };
    }
    
    /**
     * Validate The input form
     */
	public validateInputForm(ev) {
		if (! this.inputForm.valid) {
			ev.preventDefault();
			markControlsDirty(this.inputForm);
		}
    }

}
