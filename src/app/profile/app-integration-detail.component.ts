import { OnInit } from "@angular/core";
import { Router, ActivatedRoute } from "@angular/router";
import { MessageService } from "../common/services/message.service";
import { SessionService } from "../common/services/session.service";
import { Title } from "@angular/platform-browser";
import { BaseAuthenticatedRoutableComponent } from "../common/pages/base-authenticated-routable.component";
import { AppIntegration } from "./models/app-integration.model";
import { AppIntegrationManager } from "./services/app-integration-manager.service";

export abstract class AppIntegrationDetailComponent<
	T extends AppIntegration<any>
> extends BaseAuthenticatedRoutableComponent implements OnInit {
	integration: T;
	integrationPromise: Promise<any>;

	constructor(
		loginService: SessionService,
		route: ActivatedRoute,
		router: Router,

		private title: Title,
		private messageService: MessageService,
		private appIntegrationManager: AppIntegrationManager
	) {
		super(router, route, loginService);
		title.setTitle("App Integrations - Badgr");

		this.integrationPromise = appIntegrationManager.appIntegrations.loadedPromise.then(
			list => {
				this.integration = list.entityForSlug(this.integrationSlug) as any;

				if (! this.integration) {
					throw new Error(`Failed to load integration ${this.integrationSlug}`);
				}
			}
		);
	}

	abstract integrationSlug: string;

	ngOnInit() {
		super.ngOnInit();
	}
}
