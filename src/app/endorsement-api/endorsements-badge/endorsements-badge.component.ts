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
    protected endorsements: any[] = [];

    // Parent objects (institutes) of current endorsers
    protected parents: { [name:string] : any } = {};

    // Identifier of update timer
    protected updateTimer = undefined;

    // Helper to check if we have endorsed the badge
    protected hasEndorsedBadge = false;

    // Is the endorse button enabled?
    protected submitEnabled = true;

    /**
     * Create new endorsements component for badges
     * @param validanaService Validana Service
     * @param messageService Badgr Message Service
     * @param apiService Badgr API service
     */
    constructor(
        protected validanaService: ValidanaBlockchainService,
        protected messageService: MessageService,
        protected apiService: PublicApiService) {

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
    }

    /**
     * Toggle the withdrawstate for this entity
     */
    protected toggleWithdrawState() {

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
        },1);
    }

    /**
     * Helper to update the list of endorsers
     */
    protected async updateEndorsers(quickFail=true) {

        // Check the endorsers for this badge class on the blockchain
        this.validanaService.query('endorsersBadge', this.assertion.id, quickFail).then((data:string[]) => {
            if(data.length>0) {

                // Check if we endorsed this badge
                this.hasEndorsedBadge = false;
                for(let e=0; e< data.length; e++) {
                    if(data[e] === this.validanaService.getAddress()) {
                        this.hasEndorsedBadge = true;
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
                this.hasEndorsedBadge = false;
                this.endorsements = [];
                this.parents = {};
            }

        // Something went wrong, log error
        }).catch((error) => {
            console.log('[Validana] ' + error);
        });

    }
}
