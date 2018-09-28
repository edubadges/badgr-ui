import { Injectable} from "@angular/core";
import { BaseHttpApiService } from "../../common/services/base-http-api.service";
import { Http, Response } from "@angular/http";
import { SessionService } from "../../common/services/session.service";
import { CommonEntityManager } from "../../entity-manager/common-entity-manager.service";
import { SystemConfigService } from "../../common/services/config.service";
import { MessageService } from "../../common/services/message.service";

@Injectable()
export class StudentsEnrolledApiService extends BaseHttpApiService {
  constructor(
		protected loginService: SessionService,
		protected http: Http,
		protected configService: SystemConfigService,
		protected messageService: MessageService
	) {
		super(loginService, http, configService, messageService);
	}

  enrollStudent(eduID: string, email: string, badgeClassSlug: string): Promise<any> {
    return this.post(`/lti_edu/enroll`, {edu_id: eduID, email: email, badgeclass_slug: badgeClassSlug})
  }

  getEnrolledStudents(badgeClassSlug: string): Promise<any> {
    return this.get('lti_edu/studentsenrolled', {badgeclass_slug: badgeClassSlug})
  }

}
