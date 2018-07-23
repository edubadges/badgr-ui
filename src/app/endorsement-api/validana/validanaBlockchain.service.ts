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
import { EventEmitter, Injectable } from '@angular/core';

// Validana imports
import { Client, Connected, PrivateKey, VObservable, VObserver } from 'validana-client';
import { VALIDANA_API_CONFIG } from './../validana-api.config';
import { ValidanaContractJson } from './validana.model';

// Badgr imports
import { MessageService } from '../../common/services/message.service';
import { BadgeClass } from '../../issuer/models/badgeclass.model';
import { PublicApiService } from '../../public/services/public-api.service';


/**
 * This is bridge between the UI service and the Coinversable Validana Blockchain API.
 * This service should be a singleton, please include it in your main app.module.ts file
 * and register it as a provider by adding it to the providers: [ ValidanaBlockchainService ] array.
 */
@Injectable()
export class ValidanaBlockchainService implements VObserver<Connected> {

  // Connection change event listener
  // Emits true|false events on connection state change
  public connected = new EventEmitter<boolean>();

  // The coinversable Validana API service
  protected validana: Client;

  // The last connection response from the Validana API connection manager
  protected validanaConnected = false;

  // Do we have a valid wif / login to perform user actions with?
  protected validanaValidUser = false;

  // Last known name of login attempt
  protected validanaLastKnownName: string = undefined;

  // Last known role of login attempt
  protected validanaLastKnownRole: string = undefined;

  // Last known status of current login
  protected validanaLastKnownIsWithdrawn: boolean = undefined;

  /**
   * Construct new Validana blockchain service for Badgr
   * @param apiService The Badgr api service
   * @param messageService The Badgr message service
   */
  constructor(
    protected apiService: PublicApiService,
    protected messageService: MessageService) {

    // Instantiate the Coinversable service (singleton)
    this.validana = Client.get();

    // Connect blockchain service to remote (if not already connected)
    this.connectRemote(
      VALIDANA_API_CONFIG.signPrefix, 
      VALIDANA_API_CONFIG.serviceUrl);

    // Start heartbeat service
    setInterval(() => { this.heartbeat(); }, 5000);

  }

  /**
   * Store badge class on blockchain (in V2.0 format)
   * @param badgeClass The badgeclass to store on the blockchain
   */
  public storeBadgeClass(badgeClass:BadgeClass): Promise<any> {
    return new Promise<any>((resolve,reject) => {

      // If the user is no entity, do not even attempt to send data to blockchain
      if( this.getLastKnownRole() !== 'entity') {
        reject('Please login with WIF of entity before adding badge class'); return;
      }

      // Show user that badgeclass is send to the blockchain
      setTimeout(() => {
        this.messageService.reportMajorSuccess(
          'BadgeClass is sent to the blockchain', true
        );
      },0);

      // Attempt to obain model JSON from badgeclass (present after class was send to server)
      let jsonString:string = (<any>badgeClass)._apiModelJson ? (<any>badgeClass)._apiModelJson : '';

      // This is tue URL identifier to send to the blockchain
      let uriID = badgeClass.badgeUrl || badgeClass.url;

      if(jsonString) {

        // JSON string was found in badgeClass, send it to blockchain
        this.sendBadgeClassStringToBlockchain(uriID, jsonString).then(resolve).catch(reject);
      } else {

        // Obtain JSON string from api endpoint
        this.apiService.getBadgeClass(badgeClass.slug).then((val) => {
          this.sendBadgeClassStringToBlockchain( uriID, JSON.stringify(val) ).then(resolve).catch(reject);
        }).catch(reject);
      }
        
    });
  }

  /**
   * This method is executed every 5 seconds
   * It updates the name, role and withdrawstate for users if they are logged in
   */
  private heartbeat() {
    try {

      // Obtain current address (if set)
      const addr = this.getAddress();
      if( addr ) {

        // Check if there are updates to our address on the blockchain
        this.query('addrInfo',[addr], true).then((data:any[]) => {
          if(data.length === 1) {

            // Store last known name and role
            this.validanaLastKnownName = data[0].name;
            this.validanaLastKnownRole = data[0].type;

            // If role is 'entity' check if institution (parent) is not withdrawn
            if( this.validanaLastKnownRole === 'entity' ) {

              // If this entity is withdrawn, set withdrawn state
              if(data[0].withdrawn === true) {
                this.validanaLastKnownIsWithdrawn = data[0].withdrawn;
              
              // Entity is not withdrawn, or state is unknown. Check institute
              } else {

                // Obtain information about the parent
                this.query('addrInfo',[data[0].parent],true).then((parentD:any[]) => {
                  if(parentD.length === 1) {
                    
                    // Child (entity) has the withdrawnstate of the parent (institute)
                    this.validanaLastKnownIsWithdrawn = parentD[0].withdrawn;
                  }
                }).catch(() => {});
              }

            // Use current withdrawn state
            } else {
              this.validanaLastKnownIsWithdrawn = data[0].withdrawn;
            }
          }
        }).catch(() => {});
      }
    } catch {

    }
  }

  /**
   * Obtain the current private key
   * @return The private key of the user or undefined if not set
   */
  public getPrivateKey():PrivateKey {
    const storageKey = localStorage.getItem('privateKey');
    
    // Check if WIF is valid, return private key or null
    return PrivateKey.isValidWIF(storageKey)? PrivateKey.fromWIF(storageKey) : undefined;
  }

  /**
   * Obtain the current public address
   * @return The current public address of the user or undefined if not set
   */
  public getAddress():string {
    return this.getPrivateKey() ? (this.getPrivateKey().getAddress()) : undefined;
  }

  /**
   * Obtain the last known name
   * This is updated after each login attempt
   * @return The last known name of the user or undefined
   */
  public getLastKnownName():string {
    return this.validanaLastKnownName;
  }

  /**
   * Obtain the last known role
   * This is updated after each login attempt
   * @return The last known role of the user or undefined
   */
  public getLastKnownRole(): string {
    return this.validanaLastKnownRole;
  }

  /**
   * Obtain the last information about the withdrawn state
   * This is updated after each login attempt
   * @return The last known withdrawn state (true == withdrawn) or undefined
   */
  public getLastKnownWithdrawn(): boolean {
    return this.validanaLastKnownIsWithdrawn;
  }

  /**
   * Get all currently active smart contracts on the Validana blockchain
   */
  public getSmartContracts():Promise<ValidanaContractJson[]> {
    return new Promise<ValidanaContractJson[]>((resolve,reject) => {
      this.query('contracts').then(resolve).catch(reject);
    });
    
  }

  /**
   * Execute smart contract on the Validana blockchain.
   * 
   * @param contractName The contract name on the blockchain to execute (will auto select the latest version)
   * @param contractParams The parameters of the contract
   * @param showMessages Report blockchain success and failure responses to the user?
   */
  protected executeSmartContract(contractName:string, contractParams: {}, showMessages=false):Promise<any> {
    return new Promise<any>((resolve,reject) => {
      const privateKey = this.getPrivateKey();
      if ( privateKey ) {

        // Process TX on validana blockchain
        this.validana.processTx(this.getPrivateKey(), contractName, contractParams).then((data) => {

          // Check if the transaction status is 'new'
          // This means it is pending to be processed
          if(data.status === 'new') {
            if(showMessages) {
              this.messageService.reportMajorSuccess(
                'Data request has been send to the blockchain for processing',
                true
              );
            }
          }

          // Check if the transaction status is 'invalid'
          // This should normally not happen; e.g. bad signature format
          if(data.status === 'invalid') {

            // Report error to the user
            if(showMessages) {
              this.messageService.reportHandledError(
                'Invalid data was send to blockchain: ' + data.message,
                undefined, true
              );
            }

            console.error('[Validana] transaction invalid: ' + data.message);
            reject();
          }

          // Check if the transaction has status 'rejected'
          // This could easily happen if smart contract logic rejects the users request
          if (data.status === 'rejected') {
            
            // Report error to the user
            if (showMessages) {
              this.messageService.reportHandledError(
                `Your blockchain data request has been rejected.
                Please ensure you provided the correct private key in Account -> Blockchain Configuration `,
                undefined, true
              );
            }

            console.error('[Validana] transaction rejected: ' + data.message);
            reject();
          }

          // Check if the transaction has status 'accepted'
          // The transaction was processed and resides in a block on the blockchain
          if (data.status === 'accepted') {

            // Report success to the user
            if (showMessages) {
              this.messageService.reportMajorSuccess(
                'Data has been successfully saved to the blockchain', 
                true
              );
            }
            resolve();
          }

        }).catch(reject);

      } else {
        reject();
      }
    });
  }

  /**
   * Send badge class string to store on blockchain
   * @param uriID The badge class URI identifier
   * @param badgeString Stringified JSON for provided badge class uri
   */
  public sendBadgeClassStringToBlockchain(uriID:string, badgeString:string): Promise<any> {
    return new Promise<any>((resolve,reject) => {

      // Attempt to send badge class endorsement to blockchain
      this.executeSmartContract('Badge Class', {
        badgeClass: uriID,
        endorse: true
      }).then(() => {

        // Attempt to add Metadata on blockchain
        this.executeSmartContract('Metadata',{
          badgeClass: uriID,
          metadata: badgeString
        }).then(resolve).catch(reject);
      
      }).catch(reject);

    });
  }

  /**
   * Send badge class endorsement
   * @param uriID The badgeclass URI to endorse
   * @param endorsement The new endorsement status
   */
  public setBadgeClassEndorsement(uriID:string, endorsement:boolean): Promise<any> {
    return new Promise<any>((resolve,reject) => {

      // Attempt to send badge class endorsement to blockchain
      this.executeSmartContract('Badge Class', {
        badgeClass: uriID,
        endorse: endorsement
      }).then(resolve).catch(reject);

    });
  }

  /**
   * Endorse a badge on the blockchain.
   * Badge endorsements can not be withdrawn
   * @param uriID The badge URI id to endorse
   */
  public endorseBadgeByID(uriID:string): Promise<any> {
    return new Promise<any>((resolve,reject) => {

      // Attempt to send badge class endorsement to blockchain
      this.executeSmartContract('Badge', {
        badge: uriID
      }).then(resolve).catch(reject);

    });
  }

  /**
   * Attempt to add an educational institute on the blockchain.
   * Will only succeed if user has the correct private key to sign this TX.
   * @param institutePublicAddress The public address of the educational institute
   * @param institutePublicName The public name of the educational institute
   * @param instituteEnabled Should the edu institute be enabled on blockchain (set to false to withdraw)
   */
  public setEducationalInstitute(institutePublicAddress:string, institutePublicName: string, instituteEnabled:boolean): Promise<any> {
    return new Promise<any>((resolve,reject) => {

      // Attempt to execute smart contract on the blockchain
      this.executeSmartContract('Institutution',{
        receiver: institutePublicAddress,
        name: institutePublicName,
        allow: instituteEnabled
      }).then(resolve).catch(reject);

    });
  }

  /**
   * Attempt to add an educational entity for an institute on the blockchain.
   * Will only succeed if user has the correct private key to sign this TX.
   * @param entityPublicAddress The public address of the educational entity
   * @param entityPublicName The public name of the educational institute
   * @param entityEnabled Should the edu institute be enabled on blockchain (set to false to withdraw)
   */
  public setEducationalEntity(entityPublicAddress:string, entityPublicName: string, entityEnabled:boolean): Promise<any> {
    return new Promise<any>((resolve,reject) => {

      // Attempt to execute smart contract on the blockchain
      this.executeSmartContract('Entity',{
        receiver: entityPublicAddress,
        name: entityPublicName,
        allow: entityEnabled
      }).then(resolve).catch(reject);

    });
  }

  /**
   * Connect to remote source based on environment variables
   * @param signPrefix (string) The blockchain signature prefix
   * @param serviceUrl (string) The remote service url
   */
  protected connectRemote(signPrefix: string, serviceUrl: string):void {

    // Only execute if we are not already connected
    if ( ! this.isConnected() ) {

      // Register ourselves as an observer
      if ( !this.validana.hasObserver(this)) {
        this.validana.addObserver(this);
      }

      // Initialize remote connection based on environment variables
      this.validana.init( signPrefix, serviceUrl );
    }

  }

  /**
   * Attempt to 'login' the user. This method will do the following
   * - Store the WIF locally for all further TX that need to be signed.
   * - Calculate the public address based on the WIF input.
   * - Request the name and role from the blockchain for the public address.
   * - resolve with name and role if present.
   * - reject if public address was not registered on blockchain.
   * @param wif The private key to use
   */
  public userLogin(wif:string): Promise<{pub:string,name:string,role:string}> {

    // Store private key in local storage
    localStorage.setItem('privateKey', wif);

    // Reset last known name and role
    this.validanaLastKnownName = undefined;
    this.validanaLastKnownRole = undefined;
    this.validanaLastKnownIsWithdrawn = undefined;

    // Return promise which resolves public information
    return new Promise<{pub:string,name:string,role:string}>((resolve,reject) => {

      try {
        const privateKey = PrivateKey.fromWIF(wif);
        const publicAddress = privateKey.getAddress();

        // Query the validana blockchain API with public address
        // to see if public name and role are known
        this.query('addrInfo',[publicAddress]).then((data:any[]) => {
          if(data.length === 1) {

            // Store last known name, role and withdrawn state
            this.validanaLastKnownName = data[0].name;
            this.validanaLastKnownRole = data[0].type;
            this.validanaLastKnownIsWithdrawn = data[0].withdrawn;

            // Address was registered on blockchain
            resolve({pub:publicAddress,name:data[0].name,role:data[0].type});

          } else {

            // Address was not found on the blockchain
            reject(`This identity is not known or revoked on the blockchain. You will not be able to do blockchain transactions.`);
          }

        // Could not query validana API
        }).catch((error) => { 
          reject(`Could not reach blockchain to lookup identity`);
        });

      } catch (e) {
        reject(`Invalid private key format`);
      }

    });

  }

  /**
   * Query the validana server backend
   * @param type The type of the remote query
   * @param data The data to send with the query
   * @param quickFail Should we stop directy if connection is lost? (default false: place it in waiting list)
   */
  public query(type:string, data?: any, quickFail:boolean = false): Promise<any> {

    // Return promise for query resolution
    return new Promise<any>((resolve,reject) => {

      // Query the validana blockchain
      this.validana.query(type, data, quickFail)
        .then(resolve).catch(reject);

    });
    
  }

  /**
   * Called from the Coinversable API with connection status updates
   * @param o The Coinversable observable instance
   * @param arg The connection status
   */
  public update(o: VObservable<Connected>, arg: Connected): void {

    // Store connection status
    this.validanaConnected = ( arg === Connected.Yes );

    if (arg === Connected.Yes) {

      // Check if user is authenticated with correct private key
      this.userLogin( localStorage.getItem('privateKey') ).then(() => {
        this.validanaValidUser = true;
      }).catch(() => { 
        this.validanaValidUser = false; 
      });
    }

    // Tell subscribers the connection status
    this.connected.emit( this.validanaConnected );
  }

  /**
   * Check if we are connected to Coinversable remote API at the moment of calling
   */
  public isConnected() {
    return this.validanaConnected;
  }

}
