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
import { Injectable } from '@angular/core';
import { NavigationEnd, Router } from '@angular/router';
import { BehaviorSubject } from 'rxjs';
// Validana imports
import { Client, Connected, PrivateKey, VObservable, VObserver, Log } from 'validana-client';
// Badgr imports
import { MessageService } from '../../common/services/message.service';
import { BadgeClass } from '../../issuer/models/badgeclass.model';
import { PublicApiService } from '../../public/services/public-api.service';
import { VALIDANA_API_CONFIG } from './../validana-api.config';
import { ValidanaAddressInfo, ValidanaContractJson } from './validana.model';




/**
 * This is bridge between the UI service and the Coinversable Validana Blockchain API.
 * This service should be a singleton, please include it in your main app.module.ts file
 * and register it as a provider by adding it to the providers: [ ValidanaBlockchainService ] array.
 */
@Injectable()
export class ValidanaBlockchainService implements VObserver<Connected> {

  // Connection change event listener
  // Emits true|false events on connection state change
  public connected = new BehaviorSubject<boolean>(false);

  // The coinversable Validana API service
  public validana: Client;

  // The last connection response from the Validana API connection manager
  public validanaConnected = false;

  // Do we have a valid wif / login to perform user actions with?
  public validanaValidUser = false;

  // Last known name of login attempt
  public validanaLastKnownName: string = undefined;

  // Last known role of login attempt
  public validanaLastKnownRole: string = undefined;

  // Last known status of current login
  public validanaLastKnownIsWithdrawn: boolean = undefined;

  // Subscribe to receive updates if the endorsement state changes
  public canEndorse = new BehaviorSubject<boolean>(false);

  /**
   * Construct new Validana blockchain service for Badgr
   * @param apiService The Badgr api service
   * @param messageService The Badgr message service
   */
  constructor(
    protected apiService: PublicApiService,
    protected messageService: MessageService,
    protected router: Router) {

    // Instantiate the Coinversable service (singleton)
    this.validana = Client.get();

    // Connect blockchain service to remote (if not already connected)
    this.connectRemote(
      VALIDANA_API_CONFIG.signPrefix,
      VALIDANA_API_CONFIG.serviceUrl);

    // Update validana contents after navigation
    this.router.events.subscribe((event) => {
      if (event instanceof NavigationEnd) {

        // Update blockchain info after navigation complete
        this.heartbeat();
      }
    });

    // Debugging
    // Log.Level = Log.Debug;

  }

  /**
   * Store badge class on blockchain (in V2.0 format)
   * @param badgeClass The badgeclass to store on the blockchain
   */
  public storeBadgeClass(badgeClass: BadgeClass): Promise<any> {
    return new Promise<any>((resolve, reject) => {

      // If the user is no entity, do not even attempt to send data to blockchain
      if (this.getLastKnownRole() !== 'entity') {
        reject('Please login with WIF of entity before adding badge class'); return;
      }

      // Show user that badgeclass is send to the blockchain
      setTimeout(() => {
        this.messageService.reportMajorSuccess(
          'BadgeClass is sent to the blockchain', true
        );
      }, 0);

      // Attempt to obain model JSON from badgeclass (present after class was send to server)
      let jsonString: string = (<any>badgeClass)._apiModelJson ? (<any>badgeClass)._apiModelJson : '';

      // This is tue URL identifier to send to the blockchain
      let uriID = badgeClass.badgeUrl || badgeClass.url;

      if (jsonString) {

        // JSON string was found in badgeClass, send it to blockchain
        this.sendBadgeClassStringToBlockchain(uriID, jsonString).then(resolve).catch(reject);
      } else {

        // Obtain JSON string from api endpoint
        this.apiService.getBadgeClass(badgeClass.slug).then((val) => {
          this.sendBadgeClassStringToBlockchain(uriID, JSON.stringify(val)).then(resolve).catch(reject);
        }).catch(reject);
      }

    });
  }


  /**
   * Obtain info about a single address from the Validana API.
   * Will return undefined if no info was found
   * 
   * @param addr (optional) String address to lookup
   */
  public async getAddressInfo(addr: string = this.getAddress()): Promise<ValidanaAddressInfo> {
    const response: ValidanaAddressInfo[] = await this.query('addrinfo', [addr], true);

    // Ensure we have results
    if (response && response.length === 1) {

      // Store the name and withrdaw state 
      response[0].name = response[0].names ? response[0].names[0].name : undefined;
      response[0].withdrawn = !(response[0].revokedTime === null);

      // Return address info
      return response[0];
    }
  }

  /**
   * Lookup multiple addresses
   * @param addrs The addresses to lookup
   */
  public async getMultipleAddressInfo(addrs: string[], quickFail = true): Promise<ValidanaAddressInfo[]> {
    const response: ValidanaAddressInfo[] = await this.query('addrinfo', addrs, quickFail);

    // Prepare response
    for (const addr of response) {
      addr.name = addr.names ? addr.names[0].name : undefined;
      addr.withdrawn = !(addr.revokedTime === null);
    }

    return response;
  }

  /**
   * This method is executed every 5 seconds
   * It updates the name, role and withdrawstate for users if they are logged in
   */
  private async heartbeat() {

    // Only perform heartbeat if connected
    if (!this.isConnected()) {
      return;
    }

    // Obtain current address (if set)
    const addr = this.getAddress();
    if (addr !== undefined) {

      // Check if there are updates to our address on the blockchain
      const addrInfo = await this.getAddressInfo(addr);
      if (!addrInfo) { return; }

      // Store last known name
      this.validanaLastKnownName = addrInfo.name;

      // And last known role
      this.validanaLastKnownRole = addrInfo.type;

      // If role is 'entity' check if institution (parent) is not withdrawn
      if (this.validanaLastKnownRole === 'entity') {

        // Store withdrawn state
        this.validanaLastKnownIsWithdrawn = (addrInfo.revokedTime !== null);

        // Entity is not withdrawn, or state is unknown. Check institute
        if (!this.validanaLastKnownIsWithdrawn) {

          // Obtain information about the parent
          const parentInfo = await this.getAddressInfo(addrInfo.parent);
          if (parentInfo) {
            this.validanaLastKnownIsWithdrawn = (parentInfo.revokedTime !== null);
          }
        }

        // Use current withdrawn state
      } else {
        this.validanaLastKnownIsWithdrawn = (addrInfo.revokedTime !== null);
      }
    }
  }

  /**
   * Obtain the current private key
   * @return The private key of the user or undefined if not set
   */
  public getPrivateKey(): PrivateKey {
    const storageKey = localStorage.getItem('privateKey');

    // Check if WIF is valid, return private key or null
    return PrivateKey.isValidWIF(storageKey) ? PrivateKey.fromWIF(storageKey) : undefined;
  }

  /**
   * Obtain the current public address
   * @return The current public address of the user or undefined if not set
   */
  public getAddress(): string {
    return this.getPrivateKey() ? (this.getPrivateKey().getAddress()) : undefined;
  }

  /**
   * Obtain the last known name
   * This is updated after each login attempt
   * @return The last known name of the user or undefined
   */
  public getLastKnownName(): string {
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
  public getSmartContracts(): Promise<ValidanaContractJson[]> {
    return new Promise<ValidanaContractJson[]>((resolve, reject) => {
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
  protected executeSmartContract(contractName: string, contractParams: {}, showMessages = false): Promise<any> {
    return new Promise<any>((resolve, reject) => {
      const privateKey = this.getPrivateKey();
      if (privateKey) {

        // Process TX on validana blockchain
        this.validana.processTx(this.getPrivateKey(), contractName, contractParams).then((data) => {

          // Check if the transaction status is 'new'
          // This means it is pending to be processed
          if (data.status === 'new') {
            if (showMessages) {
              this.messageService.reportMajorSuccess(
                'Data request has been send to the blockchain for processing',
                true
              );
            }
          }

          // Check if the transaction status is 'invalid'
          // This should normally not happen; e.g. bad signature format
          if (data.status === 'invalid') {

            // Report error to the user
            if (showMessages) {
              this.messageService.reportHandledError(
                'Invalid data was send to blockchain: ' + data.message,
                undefined, true
              );
            }

            console.error('[Validana] transaction invalid: ' + data.message);
            reject(new Error(data.message));
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
            reject(new Error(data.message));
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

        }).catch((e) => {
          reject(e);
        });

      } else {
        reject(new Error('Private Key not specified'));
      }
    });
  }

  /**
   * Send badge class string to store on blockchain
   * @param badgeString Stringified JSON for provided badge class uri
   */
  public sendBadgeClassStringToBlockchain(uriID: string, badgeString: string): Promise<any> {

    // Attempt to send badge class to blockchain
    return this.executeSmartContract('Badge Class', {
      badgeClass: badgeString,
    });
  }

  /**
   * Send badge class endorsement
   * @param uriID The badgeclass URI to endorse
   * @param endorsement The new endorsement status
   * @param endorsementComment Optional comment data
   */
  public setBadgeClassEndorsement(uriID: string, endorsement: boolean, endorsementComment = ''): Promise<any> {

    // Attempt to send badge class endorsement to blockchain
    return this.executeSmartContract('Badge Class', {
      badgeClass: uriID,
      endorsementComment,
      endorse: endorsement
    });

  }

  /**
   * Endorse a badge on the blockchain.
   * Badge endorsements can not be withdrawn
   * @param uriID The badge URI id to endorse
   * @param endorsementComment Optional comment data
   */
  public endorseBadgeByID(uriID: string, endorsementComment = ''): Promise<any> {

    // Attempt to send badge class endorsement to blockchain
    return this.executeSmartContract('Endorse Badge', {
      badge: uriID,
      endorsementComment
    });
  }

  /**
   * Attempt to add an educational institute on the blockchain.
   * Will only succeed if user has the correct private key to sign this TX.
   * @param institutePublicAddress The public address of the educational institute
   * @param institutePublicName The public name of the educational institute
   * @param instituteEnabled Should the edu institute be enabled on blockchain (set to false to withdraw)
   * @param instituteIRI The IRI identifier of the institute which links to the badge (see https://www.imsglobal.org/sites/default/files/Badges/OBv2p0Final/index.html#Profile)
   */
  public async setEducationalInstitute(institutePublicAddress: string, institutePublicName: string, instituteEnabled: boolean, instituteIRI?: string, ): Promise<any> {

    // Attempt to execute smart contract on the blockchain
    return this.executeSmartContract('Institution', {
      receiver: institutePublicAddress,
      iri: instituteIRI,
      name: institutePublicName,
      allow: instituteEnabled
    });
  }

  /**
   * Attempt to add an educational entity for an institute on the blockchain.
   * Will only succeed if user has the correct private key to sign this TX.
   * @param entityPublicAddress The public address of the educational entity
   * @param entityPublicName The public name of the educational institute
   * @param entityEnabled Should the edu institute be enabled on blockchain (set to false to withdraw)
   */
  public setEducationalEntity(entityPublicAddress: string, entityPublicName: string, entityEnabled: boolean): Promise<any> {
    return new Promise<any>((resolve, reject) => {

      // Attempt to execute smart contract on the blockchain
      this.executeSmartContract('Entity', {
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
  protected connectRemote(signPrefix: string, serviceUrl: string): void {

    // Only execute if we are not already connected
    if (!this.isConnected()) {

      // Register ourselves as an observer
      if (!this.validana.hasObserver(this)) {
        this.validana.addObserver(this);
      }

      // Initialize remote connection based on environment variables
      this.validana.init(signPrefix, serviceUrl);
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
  public async userLogin(wif: string): Promise<{ pub: string, name: string, role: string }> {

    // Store private key in local storage
    localStorage.setItem('privateKey', wif);

    // Reset last known name and role
    this.validanaLastKnownName = undefined;
    this.validanaLastKnownRole = undefined;
    this.validanaLastKnownIsWithdrawn = undefined;

    try {
      const privateKey = PrivateKey.fromWIF(wif);
      const publicAddress = privateKey.getAddress();

      // Query the validana blockchain API with public address
      // to see if public name and role are known
      const addrData = await this.getAddressInfo(publicAddress);

      if (addrData) {

        // Store last known name, role and withdrawn state
        this.validanaLastKnownName = addrData.name;
        this.validanaLastKnownRole = addrData.type;
        this.validanaLastKnownIsWithdrawn = (addrData.revokedTime !== null);

        // Notify listeners if endorsements are now enabled
        this.canEndorse.next(this.validanaLastKnownRole === 'entity');

        // Return results
        return { pub: publicAddress, name: addrData.name, role: addrData.type };

      } else {

        // Notify listeners if endorsements are now disabled
        this.canEndorse.next(false);

        // Address was not found on the blockchain
        throw new Error(`This identity is not known or revoked on the blockchain. You will not be able to do blockchain transactions.`);
      }

    } catch (e) {

      // Notify listeners if endorsements are now disabled
      this.canEndorse.next(false);

      // Key format was not valid
      throw new Error(`Invalid key format.`);

    }

  }

  /**
   * Query the validana server backend
   * @param type The type of the remote query
   * @param data The data to send with the query
   * @param quickFail Should we stop directy if connection is lost? (default false: place it in waiting list)
   */
  public async query(type: string, data?: any, quickFail: boolean = false): Promise<any> {

    // Return promise for query resolution
    return this.validana.query(type, data, quickFail);

  }

  /**
   * Called from the Coinversable API with connection status updates
   * @param o The Coinversable observable instance
   * @param arg The connection status
   */
  public update(o: VObservable<Connected>, arg: Connected): void {

    // Store connection status
    this.validanaConnected = (arg === Connected.Yes);

    if (arg === Connected.Yes) {

      // Check if user is authenticated with correct private key
      this.userLogin(localStorage.getItem('privateKey')).then(() => {
        this.validanaValidUser = true;
      }).catch(() => {
        this.validanaValidUser = false;
      });
    }

    // Tell subscribers the connection status
    this.connected.next(this.validanaConnected);
  }

  /**
   * Check if we are connected to Coinversable remote API at the moment of calling
   */
  public isConnected() {
    return this.validanaConnected;
  }

}
