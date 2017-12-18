import { Injectable } from "@angular/core";
import { ConfirmDialog } from "../dialogs/confirm-dialog.component";
import { ShareSocialDialog } from "../dialogs/share-social-dialog.component";


@Injectable()
export class CommonDialogsService {
	confirmDialog: ConfirmDialog;
	shareSocialDialog: ShareSocialDialog;

	constructor(){}

	init(
		confirmDialog: ConfirmDialog,
		shareSocialDialog: ShareSocialDialog
	) {
		this.confirmDialog = confirmDialog;
		this.shareSocialDialog = shareSocialDialog;
	}
}