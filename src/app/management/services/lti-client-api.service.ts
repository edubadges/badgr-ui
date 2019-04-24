import { Injectable } from "@angular/core";
import { Http } from "@angular/http";
import { BaseHttpApiService } from "../../common/services/base-http-api.service";
import { SessionService } from "../../common/services/session.service";
import { SystemConfigService } from "../../common/services/config.service";
import { MessageService } from "../../common/services/message.service";


@Injectable()
export class LTIClientApiService extends BaseHttpApiService {
	constructor(
		protected loginService: SessionService,
		protected http: Http,
		protected configService: SystemConfigService,
		protected messageService: MessageService,
	) {
		super(loginService, http, configService, messageService);
	}

	getLTIClientsWithinScope(): Promise<any[]> {
		return this.get(`/lti_edu/clients`)
		.then(r => r.json())
	}

	// getFaculty(facultySlug: string): Promise<any[]> {
	// 	return this.get(`/institution/faculties/${facultySlug}`)
	// 	.then(r => r.json())
	// }

	// editFaculty(
	// 	facultySlug: string,
	// 	facultyToEdit: object
	// 	): Promise<any> {
	// 		return this.put(`/institution/faculties/${facultySlug}`, facultyToEdit)
	// 			.then(r => r.json())
	// }

	createClient(
		clientToCreate: object
		): Promise<any> {
			return this.post(`/lti_edu/clients`, clientToCreate)
				.then(r => r.json())
	}

}