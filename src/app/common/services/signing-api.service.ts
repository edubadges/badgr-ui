import { Injectable } from "@angular/core";
import { Http } from "@angular/http";
import { SystemConfigService } from "./config.service";
import { BaseHttpApiService } from "./base-http-api.service";
import { SessionService } from "./session.service";
import { MessageService } from "./message.service";
import { EventsService } from "./events.service";
import { Issuer, IssuerStaffMember } from "../../issuer/models/issuer.model";

@Injectable()
export class SigningApiService extends BaseHttpApiService {
	constructor(
		protected sessionService: SessionService,
		protected http: Http,
		protected configService: SystemConfigService,
		protected messageService: MessageService,
		protected eventsService: EventsService
	) {
		super(sessionService, http, configService, messageService);
	}

	addPasswordForSigning(password: string): Promise<any> {
		return this.post('/signing/add-password', { 'password': password })
			.then(r => r.json());
	}

	updatePasswordForSigning(password: string, old_password: string): Promise<any> {
		return this.put('/signing/update-password', { 'password': password, 'old_password': old_password })
			.then(r => r.json());
	}

	setNewSigner(	issuer: Issuer, new_signer: IssuerStaffMember): Promise<any> {
			return this.put('/signing/set-signer', {'issuer_slug': issuer.slug, 'signer_email': new_signer.email, 'action': 'add'})
			.then(r => r.json());
	}

	unSetSigner(issuer: Issuer, signer_to_remove: IssuerStaffMember): Promise<any> {
		return this.put('/signing/set-signer', { 'issuer_slug': issuer.slug, 'signer_email': signer_to_remove.email, 'action': 'remove'})
			.then(r => r.json());
	}

	changeSigner(	issuer: Issuer,
								old_signer_password: string, 
								old_signer: IssuerStaffMember, 
								new_signer_password: string, 
								new_signer: IssuerStaffMember): Promise<any> {
		return this.post('/signing/change-signer', 
										{ 'issuer_slug': issuer.slug,
											'old_signer_password': old_signer_password, 
											'old_signer_email': old_signer.email,
											'new_signer_password': new_signer_password,
											'new_signer_email': new_signer.email,
										 })
			.then(r => r.json());
	}

	getSymmetricKeyExistance(): Promise<any> {
		return this.get('/signing/password')
			.then(r => r.json());
	}

}

