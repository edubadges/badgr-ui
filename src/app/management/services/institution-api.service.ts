import { Injectable } from "@angular/core";
import { Http, Response } from "@angular/http";
import { BaseHttpApiService } from "../../common/services/base-http-api.service";
import { SessionService } from "../../common/services/session.service";
import { SystemConfigService } from "../../common/services/config.service";
import { MessageService } from "../../common/services/message.service";


@Injectable()
export class InstitutionApiService extends BaseHttpApiService {
	constructor(
		protected loginService: SessionService,
		protected http: Http,
		protected configService: SystemConfigService,
		protected messageService: MessageService,
	) {
		super(loginService, http, configService, messageService);
	}

	getAllInstitutionFaculties(): Promise<any[]> {
		return this.get(`/institution/faculties`)
		.then(r => r.json())
	}

	getFaculty(facultyID: string): Promise<any[]> {
		return this.get(`/institution/faculties/${facultyID}`)
		.then(r => r.json())
	}

	editFaculty(
		facultyID: string,
		facultyToEdit: object
		): Promise<any> {
			return this.put(`/institution/faculties/${facultyID}`, facultyToEdit)
				.then(r => r.json())
	}

}