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
import { Component, OnInit, ViewEncapsulation } from "@angular/core";
import { FormGroup } from '@angular/forms';
import { Title } from "@angular/platform-browser";
import { ActivatedRoute, Router } from '@angular/router';

// Badgr imports
import { BaseAuthenticatedRoutableComponent } from "../../common/pages/base-authenticated-routable.component";
import { SessionService } from '../../common/services/session.service';

// Blockchain imports
import { ValidanaBlockchainService } from '../validana/validanaBlockchain.service';


@Component({
    selector: 'validana-configuration-page',
    templateUrl: './configuration-page.component.html',
    styles: [
        'h2 { margin-top: 20px; margin-bottom: 15px; }',
        'form { margin-top: 20px; }',
        'p { margin-top: 10px; }',
        'button[disabled] { background-color: #998d8e !important; }'],
    encapsulation: ViewEncapsulation.None
})
export class ConfigurationPage extends BaseAuthenticatedRoutableComponent implements OnInit {

    // Private key (WIF) input form element
    private wifEditForm: FormGroup;

    // Educational insitute input form element
    private eduEditForm: FormGroup;

    // Current educational institutes
    private eduInstitutes: {
        addr: string,
        name: string,
        parent: string | undefined,
        withdrawn: boolean,
        type: string
    }[];

    // Public address of the user (calculated if private key is set)
    private publicAddress: string;

    // Name associated with this public address (if known on blockchain)
    private publicName: string;

    // Role associated with this public address (if known on blockchain)
    private publicRole: string;

    // Are submitbuttons enabled?
    protected btnsEnabled = true;

    /**
     * Create new blockchain configuration page
     * @param router The angular router
     * @param route The angular route
     * @param sessionService Badgr session service
     * @param validanaService Validana blockchain service
     * @param title Badgr title service
     */
    constructor(
        router: Router,
		route: ActivatedRoute,
        sessionService: SessionService,
        protected validanaService: ValidanaBlockchainService,        
		protected title: Title) {
            super(router, route, sessionService);

            // Set page title
            title.setTitle("Blockchain Configuration - Badgr");

    }

}