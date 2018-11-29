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
import { Component, Input, OnDestroy, OnInit, ViewEncapsulation } from "@angular/core";
import { MessageService } from '../../common/services/message.service';
import { PublicApiService } from '../../public/services/public-api.service';
import { ValidanaBlockchainService } from './../validana/validanaBlockchain.service';

@Component({
    selector: 'endorsements-badgeclass',
    templateUrl: './endorsements-badgeclass.component.html',
    styles: [ 
        'button[disabled] { background-color: #998d8e !important; }',
        '.spacer { display:block; clear:both; } '
    ],
    encapsulation: ViewEncapsulation.None
})
export class EndorsementsBadgeClassComponent implements OnDestroy, OnInit {

    // The Badge class URI
    @Input() badgeURI: string;

    // The Badge Class Slug
    @Input() badgeSlug: string;

    // Current endorsements
    public endorsements: any[] = [];

    // Parent objects (institutes) of current endorsers
    public parents: { [name:string] : any } = {};

    // Identifier of update timer
    public updateTimer = undefined;

    // Helper to check if we have endorsed the badgeclass
    public hasEndorsedBadgeClass = false;

    // Is the endorse button enabled?
    public submitEnabled = true;

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
        public apiService: PublicApiService) {

        // Update endorsers table every 5 seconds
        this.updateTimer = setInterval(() => {
            this.updateEndorsers();
        }, 5000);

    }

    /**
     * Executed on component destroy
     */
    ngOnDestroy() {

        // Clear interval timer
        clearInterval( this.updateTimer );
    }

    /**
     * Executed on component init
     */
    ngOnInit() {

        // Update endorsers table on load
        this.updateEndorsers(false);

        // Query blockchain to see if metadata is already stored
        this.validanaService.query('badgeClassInfo',[this.badgeURI]).then((data) => {
            if(data.length === 1) {

                // No metadata on blockchain, and current user is 'owner' / 'creator' of badgeclass
                if(data[0].metadata === null || data[0].firstEndorser === this.validanaService.getAddress()) {
                    this.canSendToBlockchain = true;
                }

            } else {
                this.canSendToBlockchain = true;
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
        this.apiService.getBadgeClass(this.badgeSlug).then((val) => {
            this.validanaService.sendBadgeClassStringToBlockchain( this.badgeURI, JSON.stringify(val) )
                .then(() => {

                    // Badge class metadata was send (/ updated) to blockchain
                    this.messageService.reportMajorSuccess(
                        'BadgeClass metadata (JSON) was stored on blockchain', true
                    );

                    // Re-enable submit button in UI
                    this.submitEnabled = true;

                })
                .catch(() => {

                    // Badge class metadata could not be stored on blockchain
                    this.messageService.reportHandledError(
                        'BadgeClass metadata (JSON) could not be stored on blockchain',
                        undefined, true
                    );

                    // Re-enable submit button in UI
                    this.submitEnabled = true;

                });

        }).catch(() => {

            // Could not obtain badge metadata
            this.messageService.reportHandledError(
                'Could not obtain badgeclass metadata as JSON', undefined, true
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
                .then(() => {

                    // Update table with endorsers
                    this.updateEndorsers(false);

                    // Enable submit button
                    this.submitEnabled = true;

                })

                // Endorsement was rejected
                .catch(() => {
                    this.messageService.reportHandledError(
                        'Unable to store endorsement of this badgeclass. Please review Account -> Blockchain Configuration', undefined, true
                    );
                
                    // Enable submit button
                    this.submitEnabled = true;
                });
        },1);
    }

    /**
     * Helper to update the list of endorsers
     */
    public async updateEndorsers(quickFail=true) {

        // Check the endorsers for this badge class on the blockchain
        this.validanaService.query('endorsersBadgeClass', this.badgeURI, quickFail).then((data:string[]) => {
            if(data.length>0) {

                // Check if we endorsed this badgeclass
                this.hasEndorsedBadgeClass = false;
                for(let e=0; e< data.length; e++) {
                    if(data[e] === this.validanaService.getAddress()) {
                        this.hasEndorsedBadgeClass = true;
                    }
                }

                // Obtain information about addresses of endorsers
                this.validanaService.query('addrInfo', data, quickFail).then((endorsers:any[]) => {

                    // Store the endorsers
                    this.endorsements = endorsers;

                    // Helper variable to lookup parents (institutes) of endorsers
                    let parentsToFind = [];

                    // Obtain the parents
                    for(let i=0;i<endorsers.length;i++) {
                        parentsToFind.push(endorsers[i].parent);
                    }

                    // Launch search for parent address objects (only search for unique addresses)
                    this.validanaService.query('addrInfo', Array.from( new Set(parentsToFind)), quickFail).then((pData) => {
                        for(let j=0; j<pData.length; j++) {

                            // Store the information of the parents
                            this.parents[pData[j].addr] = pData[j];
                        }
                    
                    // Something went wrong, log error
                    }).catch((error) => {
                        console.log('[Validana] ' + error);
                    });

                });

            // Reset endorsements and parents 
            } else {     
                this.hasEndorsedBadgeClass = false;
                this.endorsements = [];
                this.parents = {};
            }

        // Something went wrong, log error
        }).catch((error) => {
            console.log('[Validana] ' + error);
        });

    }
}
