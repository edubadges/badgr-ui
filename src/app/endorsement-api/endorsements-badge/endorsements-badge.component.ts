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

// Imports
import { ChangeDetectorRef, Component, Input, OnDestroy, OnInit, Optional, ViewEncapsulation } from "@angular/core";
import { FormBuilder, FormGroup } from '@angular/forms';
import { CommonDialogsService } from 'app/common/services/common-dialogs.service';
import { IssuerApiService } from 'app/issuer/services/issuer-api.service';
import { PublicApiBadgeAssertionWithBadgeClass } from 'app/public/models/public-api.model';
import { RecipientBadgeInstance } from 'app/recipient/models/recipient-badge.model';
import { MessageService } from '../../common/services/message.service';
import { PublicApiService } from '../../public/services/public-api.service';
import { Endorsement, ValidanaAddressInfo, ValidanaEndorsers } from '../validana/validana.model';
import { ValidanaBlockchainService } from './../validana/validanaBlockchain.service';

@Component({
    selector: 'endorsements-badge',
    templateUrl: './endorsements-badge.component.html',
    styles: [
        'button[disabled] { background-color: #998d8e !important; }',
        '.button.small { padding: 3px 6px; }',
        '.validana-logo { height: 20px; }',
        '.dialog-confirm { width: 800px !important; }',
        '.endorse-input { min-width: 400px; margin-top: 10px; padding: 10px; border: 2px solid red; border-radius: 5px; }',
        '.spacer { display:block; clear:both; } ',
        'h2 { margin-bottom: 10px; margin-top: 20px; }'
    ],
    encapsulation: ViewEncapsulation.None
})
export class EndorsementsBadgeComponent implements OnDestroy, OnInit {
    readonly validanaImage = require('../../../breakdown/static/images/logo-validana-sm.png');

    // The Badge class
    @Input() set badge(badge: RecipientBadgeInstance | PublicApiBadgeAssertionWithBadgeClass) {
        if (badge instanceof RecipientBadgeInstance) {
            this.badgeURI = badge.shareUrl;
        } else {
            this.badgeURI = badge.id
        }

    };

    // Badge class uri
    protected badgeURI: string;

    // List of active endorsers
    public endorsersActive: endorsementInfo[] = [];

    // Parent objects (institutes) of current endorsers
    public parents: { [name: string]: ValidanaAddressInfo } = {};

    // Identifier of update timer
    public updateTimer = undefined;

    // Helper to check if we have endorsed the badgeclass
    public hasEndorsedBadge = false;

    // Is the endorse button enabled?
    public submitEnabled = true;

    // Toggle submit state
    public submitActive = false;

    // Should we display endorsements for this badge?
    public endorsementsEnabled = true;

    // Input Form element
    public inputForm: FormGroup;

    /**
     * Create new endorsements component for badgeclasses
     * @param validanaService Validana Service
     * @param messageService Badgr Message Service
     * @param apiService Badgr API service
     */
    constructor(
        public validanaService: ValidanaBlockchainService,
        public messageService: MessageService,
        public apiService: PublicApiService,
        public formBuilder: FormBuilder,
        public cd: ChangeDetectorRef,
        public dialog: CommonDialogsService,
        @Optional() public issuers: IssuerApiService) {

        // Setup form element for WIF input
        this.inputForm = this.formBuilder.group({

            // WIF private key input
            comment: ['', []]
        } as inputFormControls<any[]>);
    }

    /**
     * Executed on component destroy
     */
    ngOnDestroy() {

        // Clear interval timer
        clearInterval(this.updateTimer);
    }

    public endorsementDialog(obj: Endorsement) {
        this.dialog.confirmDialog.openResolveRejectDialog({
            dialogTitle: 'Endorsement',
            dialogBody: '<h3>Endorsement JSON</h3><br /><pre>' + JSON.stringify(obj, undefined, 2) + '</pre><br />'
                + '<p><a href="' + obj.id + '" target="_blank"><img class="validana-logo" src="' + this.validanaImage + '" alt="Validana" /> Verified Endorsement</a></p>',
            resolveButtonLabel: 'Close',
            showRejectButton: false
        });
    }

    /**
     * Executed on component init
     */
    async ngOnInit() {

        // Update endorsers table on load
        this.endorsementsEnabled = true;
        this.updateEndorsers(false);
    }

    /**
     * Toggle submit state
     */
    public toggleSubmitActive() {
        if (this.hasEndorsedBadge) {
            this.registerEndorsement();
            this.submitActive = false;
        } else {
            this.submitActive = !this.submitActive;
        }
    }

    /**
     * Toggle the withdrawstate for this entity
     */
    public registerEndorsement(comment = '') {

        // Disable submit button
        this.submitEnabled = false;
        this.submitActive = false;

        setTimeout(() => {

            // Send endorsement of badge class to blockchain
            this.validanaService.endorseBadgeByID(this.badgeURI, comment)

                // Endorsement was accepted
                .then(async () => {

                    // Update table with endorsers
                    this.hasEndorsedBadge = true;
                    await this.updateEndorsers(false);
                    this.cd.detectChanges();

                    // disable submit button
                    this.submitEnabled = false;

                })

                // Endorsement was rejected
                .catch((e: Error) => {
                    this.messageService.reportHandledError(
                        e.message + ' Please review Account -> Validana', undefined, true
                    );

                    // Enable submit button
                    this.submitEnabled = true;
                });
        }, 1);
    }

    /**
     * Helper to update the list of endorsers
     */
    public async updateEndorsers(quickFail = true) {

        // Reset
        this.endorsersActive = [];
        this.parents = {};

        // Check the endorsers for this badge class on the blockchain
        const data: ValidanaEndorsers[] = await this.validanaService.query('endorsersbadge', this.badgeURI, quickFail) || [];

        if (data.length > 0) {

            // List of endorsers
            const endorsersAddrs: string[] = [];

            // Check if we endorsed this badgeclass
            this.hasEndorsedBadge = false;
            for (let e = 0; e < data.length; e++) {

                // Store addr in list                
                endorsersAddrs.push(data[e].entity);

                // Store info
                this.endorsersActive.push({
                    entity: data[e],
                    info: {} as any
                });

                // If we have endorsed this badgeclass ourselves
                if (data[e].entity === this.validanaService.getAddress()) {
                    this.hasEndorsedBadge = true;
                }
            }

            // Obtain information about addresses of endorsers
            const endorsers = await this.validanaService.getMultipleAddressInfo(endorsersAddrs, quickFail);
            for (let adr of endorsers) {

                // Fill in active endorsers
                for (let itm of this.endorsersActive) {
                    if (adr.addr === itm.entity.entity) {
                        itm.info = adr;
                    }
                }
            }

            // Helper variable to lookup parents (institutes) of endorsers
            let parentsToFind = [];

            // Obtain the parents
            for (let i = 0; i < this.endorsersActive.length; i++) {
                parentsToFind.push(this.endorsersActive[i].info.parent);
            }

            // Launch search for parent address objects (only search for unique addresses)
            const pData = await this.validanaService.getMultipleAddressInfo(Array.from(new Set(parentsToFind)), quickFail);
            for (let j = 0; j < pData.length; j++) {

                // Store the information of the parents
                this.parents[pData[j].addr] = pData[j];
            }
        }
    }
}

/**
 * Endorsement info interface
 */
interface endorsementInfo {
    entity: ValidanaEndorsers;
    info?: ValidanaAddressInfo;
}

/**
 * Interface for the input form fields and types
 */
interface inputFormControls<T> {
    comment: T;
}