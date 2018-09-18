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
import { ActivatedRoute, Router } from '@angular/router';

// Badgr imports
import { BaseAuthenticatedRoutableComponent } from "../../../common/pages/base-authenticated-routable.component";
import { MessageService } from '../../../common/services/message.service';
import { SessionService } from '../../../common/services/session.service';
import { ValidanaBlockchainService } from '../../validana/validanaBlockchain.service';


@Component({
    selector: 'validana-info-entity',
    templateUrl: './info-entity.component.html'
})
export class InfoEntityComponent extends BaseAuthenticatedRoutableComponent implements OnInit {

    // The 'parent' ( institute ) to which this entity belongs
    protected parentInfo:{
        addr?: string,
        name?: string,
        parent?: string,
        type?: string,
        withdrawn?: boolean
    } = {};

    /**
     * Create a new entity component
     * This component manages new and existing entitys on the blockchain
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
		public messageService: MessageService,
        public validanaService: ValidanaBlockchainService) {
            super(router, route, sessionService);

    }

    /**
     * Called upon initialization of this component
     */
    ngOnInit() {

        // Obtain information about our own (enity) address
        this.validanaService.query('addrInfo',[this.validanaService.getAddress()]).then((data) => {
            if(data.length===1) {

                // Obtain information about the parent (institute)
                this.validanaService.query('addrInfo',[data[0].parent]).then((parentData) => {
                    if(parentData.length===1) {
                        this.parentInfo = parentData[0];
                    }
                });
            }
        });
    }

}
