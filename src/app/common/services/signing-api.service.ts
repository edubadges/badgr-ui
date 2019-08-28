import { Injectable } from "@angular/core";
import { Http } from "@angular/http";
import { SystemConfigService } from "./config.service";
import { BaseHttpApiService } from "./base-http-api.service";
import { SessionService } from "./session.service";
import { MessageService } from "./message.service";
import { EventsService } from "./events.service";


export interface SymmetricKey {
	password_hash: string
}

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

	addPasswordForSigning(password: string): Promise<SymmetricKey> {
		return this.post('/signing/add-password', { 'password': password })
			.then(r => r.json());
	}
}

