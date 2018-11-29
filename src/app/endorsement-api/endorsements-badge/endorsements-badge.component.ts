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
import { PublicApiBadgeAssertion } from '../../public/models/public-api.model';
import { ValidanaEndorsers, ValidanaAddressInfo } from '../validana/validana.model';

@Component({
    selector: 'endorsements-badge',
    templateUrl: './endorsements-badge.component.html',
    styles: [
        'button[disabled] { background-color: #998d8e !important; }',
        'h2 { margin-top: 20px; margin-bottom: 15px; }',
        '.spacer { display:block; clear:both; } '
    ],
    encapsulation: ViewEncapsulation.None
})
export class EndorsementsBadgeComponent implements OnDestroy, OnInit {

    // The Badges UUID (slug)
    @Input() assertion: PublicApiBadgeAssertion;

    // Current endorsements
    public endorsements: any[] = [];

    // Parent objects (institutes) of current endorsers
    public parents: { [name: string]: ValidanaAddressInfo } = {};

    // Identifier of update timer
    public updateTimer = undefined;

    // Helper to check if we have endorsed the badge
    public hasEndorsedBadge = false;

    // Is the endorse button enabled?
    public submitEnabled = true;

    /**
     * Create new endorsements component for badges
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
        clearInterval(this.updateTimer);
    }

    /**
     * Executed on component init
     */
    ngOnInit() {

        // Update endorsers table on load
        this.updateEndorsers(false);
    }

    /**
     * Toggle the withdrawstate for this entity
     */
    public toggleWithdrawState() {

        // Disable submit button
        this.submitEnabled = false;

        setTimeout(() => {

            // Send endorsement of badge class to blockchain
            this.validanaService.endorseBadgeByID(this.assertion.id)

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
                        'Unable to store endorsement of this badge. Please review Account -> Blockchain Configuration', undefined, true
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

        // Check the endorsers for this badge class on the blockchain
        const data: ValidanaEndorsers[] = await this.validanaService.query('endorsersbadge', this.assertion.id, quickFail);

        if (data.length > 0) {

            // List of endorsers
            const endorsersList: string[] = [];

            // Check if we endorsed this badge
            this.hasEndorsedBadge = false;
            for (let e = 0; e < data.length; e++) {
                endorsersList.push(data[e].entity);
                if (data[e].entity === this.validanaService.getAddress()) {
                    this.hasEndorsedBadge = true;
                }
            }

            // Obtain information about addresses of endorsers
            const endorsers = await this.validanaService.getMultipleAddressInfo(endorsersList) || [];

            // Store the endorsers
            this.endorsements = endorsers;

            // Helper variable to lookup parents (institutes) of endorsers
            let parentsToFind = [];

            // Obtain the parents
            for (let i = 0; i < endorsers.length; i++) {
                parentsToFind.push(endorsers[i].parent);
            }

            // Launch search for parent address objects (only search for unique addresses)
            const pData = await this.validanaService.getMultipleAddressInfo((Array.from(new Set(parentsToFind))), quickFail) || [];
            for (let j = 0; j < pData.length; j++) {

                // Store the information of the parents
                this.parents[pData[j].addr] = pData[j];
            }

            // Reset endorsements and parents 
        } else {
            this.hasEndorsedBadge = false;
            this.endorsements = [];
            this.parents = {};
        }

    }
}
