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
import { Component, Input, OnDestroy, OnInit, Optional, ViewEncapsulation, ChangeDetectorRef } from "@angular/core";
import { BadgeClass } from 'app/issuer/models/badgeclass.model';
import { IssuerApiService } from 'app/issuer/services/issuer-api.service';
import { PublicApiBadgeClassWithIssuer } from 'app/public/models/public-api.model';
import { MessageService } from '../../common/services/message.service';
import { PublicApiService } from '../../public/services/public-api.service';
import { ValidanaAddressInfo, ValidanaEndorsers } from '../validana/validana.model';
import { ValidanaBlockchainService } from './../validana/validanaBlockchain.service';

@Component({
    selector: 'endorsements-badgeclass',
    templateUrl: './endorsements-badgeclass.component.html',
    styles: [
        'button[disabled] { background-color: #998d8e !important; }',
        '.spacer { display:block; clear:both; } ',
        'h2 { margin-bottom: 10px; margin-top: 20px; }'
    ],
    encapsulation: ViewEncapsulation.None
})
export class EndorsementsBadgeClassComponent implements OnDestroy, OnInit {

    // The Badge class
    @Input() set badgeclass(badgeclass: BadgeClass | PublicApiBadgeClassWithIssuer) {
        if (badgeclass instanceof BadgeClass) {
            this.badgeURI = badgeclass.badgeUrl;
            this.issuerSlug = badgeclass.issuerSlug;
            this.badgeID = badgeclass.slug;
        } else {
            this.badgeURI = badgeclass.id;
        }
    };

    // Allow UI buttons to add endorsements?
    @Input() allowEndorsements = true;

    // Badge class uri
    protected badgeURI: string;

    // Badge class issuer slug
    protected issuerSlug: string;

    // Badge class id
    protected badgeID: string;

    // List of active endorsers
    public endorsersActive: endorsementInfo[] = [];

    // List of history endorsers
    public endorsersHistory: endorsementInfo[] = [];

    // Parent objects (institutes) of current endorsers
    public parents: { [name: string]: ValidanaAddressInfo } = {};

    // Identifier of update timer
    public updateTimer = undefined;

    // Helper to check if we have endorsed the badgeclass
    public hasEndorsedBadgeClass = false;

    // Is the endorse button enabled?
    public submitEnabled = true;

    // Should we display endorsements for this class?
    public endorsementsEnabled = false;

    // Can the user send metadata to the blockchain?
    // For instance, existing badgeclasses which have no endorsements yet
    public canSendToBlockchain = false;

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
        public cd: ChangeDetectorRef,
        @Optional() public issuers: IssuerApiService) {

    }

    /**
     * Executed on component destroy
     */
    ngOnDestroy() {

        // Clear interval timer
        clearInterval(this.updateTimer);
    }

    /**
     * Executed on component init
     */
    async ngOnInit() {

        // Update endorsers table on load
        this.updateEndorsers(false);

        // Query blockchain to see if metadata is already stored
        try {
            const data = await this.validanaService.query('badgeclass', this.badgeURI);

            // Badgeclass was found on blockchain, enable endorsements
            this.endorsementsEnabled = true;

        } catch (e) {
            // Badgeclass is not on blockchain, disable endorsements
            this.endorsementsEnabled = false;
        }

        // Enable send to blockchain button if user can endorse
        this.validanaService.canEndorse.subscribe(async (status) => {
            this.canSendToBlockchain = false;
            if (!this.endorsementsEnabled && this.issuers && status) {
                const issuers = await this.issuers.listIssuers();
                for (const i of issuers) {
                    if (i.slug === this.issuerSlug) {
                        this.canSendToBlockchain = true;
                    }
                }
            }
        });
    }

    /**
     * Send metadata of badge class to blockchain
     */
    public sendMetadataToBlockchain() {

        // Disable buttons in UI
        this.submitEnabled = false;

        // Obtain JSON string from api endpoint
        this.apiService.getBadgeClass(this.badgeID).then((val: PublicApiBadgeClassWithIssuer) => {

            this.validanaService.sendBadgeClassStringToBlockchain(this.badgeURI, JSON.stringify(val))
                .then(() => {

                    // Badge class metadata was send (/ updated) to blockchain
                    this.messageService.reportMajorSuccess(
                        'BadgeClass stored on Validana. Endorsements are now enabled', true
                    );

                    // Re-enable submit button in UI
                    this.submitEnabled = true;

                    // Show endorsements
                    this.endorsementsEnabled = true;

                })
                .catch((e: Error) => {

                    // Badge class metadata could not be stored on blockchain
                    // Could be that the user is logged in with invalid private key
                    this.messageService.reportHandledError(
                        e.message + ' Please review Account -> Validana',
                        e, true
                    );

                    // Re-enable submit button in UI
                    this.submitEnabled = true;

                });

        }).catch((e) => {

            // Could not obtain badge metadata
            this.messageService.reportHandledError(
                'Badgr API unavailable', e, true
            );

            // Re-enable submit button in UI
            this.submitEnabled = true;
        });
    }

    /**
     * Toggle the withdrawstate for this entity
     */
    public toggleWithdrawState() {

        // Disable submit button
        this.submitEnabled = false;

        setTimeout(() => {

            // Send endorsement of badge class to blockchain
            this.validanaService.setBadgeClassEndorsement(this.badgeURI, !this.hasEndorsedBadgeClass)

                // Endorsement was accepted
                .then(async () => {

                    // Update table with endorsers
                    await this.updateEndorsers(false);
                    this.cd.detectChanges();

                    // Enable submit button
                    this.submitEnabled = true;

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
        this.hasEndorsedBadgeClass = false;
        this.endorsersActive = [];
        this.endorsersHistory = [];
        this.parents = {};

        // Check the endorsers for this badge class on the blockchain
        const data: ValidanaEndorsers[] = await this.validanaService.query('endorsersbadgeclass', this.badgeURI, quickFail) || [];
        if (data.length > 0) {

            // List of endorsers
            const endorsersAddrs: string[] = [];
            console.log(data);

            // Check if we endorsed this badgeclass
            this.hasEndorsedBadgeClass = false;
            for (let e = 0; e < data.length; e++) {

                // Store addr in list                
                endorsersAddrs.push(data[e].entity);

                // Endorsement has not been revoked yet
                if (data[e].revoked === null) {

                    // Store info
                    this.endorsersActive.push({
                        entity: data[e],
                        info: {} as any
                    });

                    // If we have endorsed this badgeclass ourselves
                    if (data[e].entity === this.validanaService.getAddress()) {
                        this.hasEndorsedBadgeClass = true;
                    }

                    // Add to endorsement history
                } else {

                    // Store info
                    this.endorsersHistory.push({
                        entity: data[e],
                        info: {} as any
                    });

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

                // Fill in history of endorsers
                for (let itm of this.endorsersHistory) {
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
            } for (let i = 0; i < this.endorsersHistory.length; i++) {
                parentsToFind.push(this.endorsersHistory[i].info.parent);
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

interface endorsementInfo {
    entity: ValidanaEndorsers;
    info?: ValidanaAddressInfo;
}
