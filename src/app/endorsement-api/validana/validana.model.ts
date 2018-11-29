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

