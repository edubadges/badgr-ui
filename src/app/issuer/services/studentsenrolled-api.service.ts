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

  enrollStudent(eduID: string, email: string, firstName: string, lastName: string, badgeClassSlug: string): Promise<any> {
    return this.post(`/lti_edu/enroll`, {edu_id: eduID, 
                                        email: email, 
                                        first_name: firstName, 
                                        last_name: lastName, 
                                        badgeclass_slug: badgeClassSlug})
  }
  
  withdrawStudent(enrollmentID: string): Promise<any> {
    return this.delete(`/lti_edu/withdraw`, {enrollmentID: enrollmentID})
  }

  getEnrollments(eduID: string): Promise<any> {
    return this.get(`/lti_edu/student/${eduID}/enrollments`)
    .then(r => r.json())
  }

  getEnrolledStudents(badgeClassSlug: string): Promise<any> {
    return this.get(`/lti_edu/enrolledstudents/`+badgeClassSlug)
    .then(r => r.json())
  }
  
  isStudentEnrolled(badgeClassSlug:string, eduID: string) {
    return this.post(`/lti_edu/isstudentenrolled`, {edu_id: eduID, badgeclass_slug: badgeClassSlug})
	}
	
	updateEnrollments(badgeClass: string, enrollment: object) {
		return this.put(`/lti_edu/enrollment`, {badge_class: badgeClass, enrollment: enrollment})
	}

}
