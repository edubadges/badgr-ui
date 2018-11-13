import { Injectable } from "@angular/core";
import { Http } from "@angular/http";
import { SystemConfigService } from "./config.service";
import { BaseHttpApiService } from "./base-http-api.service";
import { SessionService } from "./session.service";
import { MessageService } from "./message.service";
import { EventsService } from "./events.service";
import { ApiUserProfile, ApiUserProfileEmail, ApiUserProfileSocialAccount, ApiUserProfileFaculty } from "../model/user-profile-api.model";


@Injectable()
export class UserProfileApiService extends BaseHttpApiService {
	constructor(
		protected sessionService: SessionService,
		protected http: Http,
		protected configService: SystemConfigService,
		protected messageService: MessageService,
		protected eventsService: EventsService
	) {
		super(sessionService, http, configService, messageService);
	}

	getProfile(): Promise<ApiUserProfile> {
		return this.get('/v1/user/profile').then(r => r.json());
	}

	updatePassword(new_password: string, current_password: string): Promise<ApiUserProfile> {
		return this.put('/v1/user/profile', { 'password': new_password, 'current_password': current_password })
			.then(r => r.json());
	}

	updateProfile(profile: ApiUserProfile): Promise<ApiUserProfile> {
		return this.put('/v1/user/profile', profile)
			.then(r => r.json());
	}

	fetchEmails(): Promise<ApiUserProfileEmail[]> {
		return this.get('/v1/user/emails')
			.then(r => r.json());
	}

	fetchFaculties(): Promise<ApiUserProfileFaculty[]> {
		return this.get('/v1/user/faculties')
		.then(r => r.json());
	}

	fetchSocialAccounts(): Promise<ApiUserProfileSocialAccount[]> {
		return this.get('/v1/user/socialaccounts')
			.then(r => r.json());
	}


	addEmail(email: string): Promise<ApiUserProfileEmail> {
		return this.post('/v1/user/emails', { 'email': email })
			.then(r => r.json());
	}

	removeEmail(email_id: number) {
		return this.delete('/v1/user/emails/' + email_id);
	}

	removeSocialAccount(accountId: string) {
		return this.delete('/v1/user/socialaccounts/' + accountId);
	}

	setPrimaryEmail(email_id: number): Promise<ApiUserProfileEmail> {
		return this.put('/v1/user/emails/' + email_id, { 'primary': true })
			.then(r => r.json());
	}

	resendVerificationEmail(emailIdToVerify: number) {
		return this.put('/v1/user/emails/' + emailIdToVerify, { 'resend': true });
	}
}
