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

// Validana smart contract interface model
export interface ValidanaContractJson {
	type: string;
	hash: string;
	version: string;
	description: string;
	template: {
		[fieldType: string]: ValidanaFieldTypeJSON;
	};
}

// Validana smart contract field types
export interface ValidanaFieldTypeJSON {

	//Field Type
	type: string;

	//Field suggested description
	description: string;
	
	//Field suggested name
	name: string;
}

export interface ValidanaAddressInfo {

	// Address as string
	addr: string;

	// Known names that were associated with this address
	names: {

		// Name of the entity / institution
		name: string;

		// Time the entity / institution started using this name
		startTime: number;

		// End time the entity / institution used this name (null if not set)
		endTime: number | null;
	}[];

	name: string;

	// Parent item for this address
	parent: string | undefined;

	// When the address was revoked (or null if not revoked)
	revokedTime: number | null;

	// Is this address currently withdrawn?
	withdrawn: boolean;

	// Type of the address
	type: 'entity' | 'institution' | 'processor';
}

export interface ValidanaEndorsers {

	// ID of the endorsement
	id: number;

	// Entity that endorsed the badge
	entity: string;

	// Isuued on 
	issued_on: number;
}