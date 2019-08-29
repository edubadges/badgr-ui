import { Injectable } from "@angular/core";
import { ConfirmDialog } from "../dialogs/confirm-dialog.component";
import { ShareSocialDialog } from "../dialogs/share-social-dialog.component";
import { NewTermsDialog } from "../dialogs/new-terms-dialog.component";
import { EduIDFailureDialog } from "../dialogs/eduid-failure-dialog.component";
import { EnrollmentConsentDialog } from './../dialogs/enrollment-consent-dialog.component';
import { EnterPasswordDialog } from './../dialogs/enter-password-dialog.component';


@Injectable()
export class CommonDialogsService {
	confirmDialog: ConfirmDialog;
	shareSocialDialog: ShareSocialDialog;
	newTermsDialog: NewTermsDialog;
	eduIDFailureDialog: EduIDFailureDialog;
	enrollmentConsentDialog: EnrollmentConsentDialog;
	enterPasswordDialog: EnterPasswordDialog;


	constructor(){}

	init(
		confirmDialog: ConfirmDialog,
		shareSocialDialog: ShareSocialDialog,
		newTermsDialog: NewTermsDialog,
		eduIDFailureDialog: EduIDFailureDialog,
		enrollmentConsentDialog: EnrollmentConsentDialog,
		enterPasswordDialog: EnterPasswordDialog,
	) {
		this.confirmDialog = confirmDialog;
		this.shareSocialDialog = shareSocialDialog;
		this.newTermsDialog = newTermsDialog;
		this.eduIDFailureDialog = eduIDFailureDialog;
		this.enrollmentConsentDialog = enrollmentConsentDialog;
		this.enterPasswordDialog = enterPasswordDialog;
	}
}