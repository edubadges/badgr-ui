import { Component, Input } from "@angular/core";
import { BadebookLti1Integration } from "./models/app-integration.model";
import { AppIntegrationDetailComponent } from "./app-integration-detail.component";
import { SessionService } from "../common/services/session.service";
import { ActivatedRoute, Router } from "@angular/router";
import { Title } from "@angular/platform-browser";
import { MessageService } from "../common/services/message.service";
import { AppIntegrationManager } from "./services/app-integration-manager.service";


@Component({
	selector: 'badgebook-lti1-detail',
	template: `
		<main>
			<form-message></form-message>
		
			<header class="wrap wrap-light l-containerhorizontal l-heading">
				<nav>
					<h1 class="visuallyhidden">Breadcrumbs</h1>
					<ul class="breadcrumb">
						<li>
							<a [routerLink]="['/profile/app-integrations']">App Integrations</a>
						</li>
						<li class="breadcrumb-x-current">Canvas LTI</li>
					</ul>
				</nav>

				<div class="heading">
					<div class="heading-x-image">
						<img [src]="integration?.image" alt="{integration image description}" width="80">
					</div>
					<div class="heading-x-text">
						<h1>Canvas LTI</h1>
						<p>Badgr connects with Canvas to automatically award badges to students as they complete their work.</p>
					</div>
		    </div>
		
		  </header>
		
			<div class="l-containerhorizontal l-containervertical wrap" *bgAwaitPromises="[ integrationPromise ]">
			
				<div class="l-integrations">
		
					<div class="bordered bordered-left bordered-is-desktoponly">
		
						<div class="formfield">
						  <label for="formfield">Your Consumer Key</label>
						  <div class="formfield-x-action">
						    <input id="formfield" type="text" [value]="integration.consumerKey" readonly #consumerKey>
						    <button class="button button-major" type="button" [click-to-copy]="consumerKey">Copy</button>
						  </div>
						</div>
		
						<div class="formfield">
						  <label for="formfield">Your Shared Secret</label>
						  <div class="formfield-x-action">
						    <input id="formfield" type="text" [value]="integration.sharedSecret" readonly #sharedSecret>
						    <button class="button button-major" type="button" [click-to-copy]="sharedSecret">Copy</button>
						  </div>
						</div>
		
						<div class="formfield">
						  <label for="formfield">Config URL</label>
						  <div class="formfield-x-action">
						    <input id="formfield" type="text" [value]="integration.configUrl" readonly #configUrl>
						    <button class="button button-major" type="button" [click-to-copy]="configUrl">Copy</button>
						  </div>
						</div>
		
					</div>
		
					<article class="integration">
					  <h1>Integrating Badgr into Canvas</h1>
					  <ol>
					    <li>Make sure your Badgr account has the <a [routerLink]="['/profile']">email address confirmed</a> that you log into Canvas with.</li>
					    
					    <li>Log into Canvas with your administrator credentials. Go to the desired Canvas account or sub-account, choose Settings in the left-hand menu, and select the Apps tab
					      <ol>
					        <li integration-image="{{externalAppsBadgrImageUrl}}"
					            caption="External Apps">
					        </li>
					      </ol>
					    </li>
					    <li>Select Badgr from the list (if connected with the EduAppCenter) or add a new custom integration
					      <ol>
					        <li>
					          Copy the values for your LTI Shared Secret and Consumer key from Badgr into the dialog

										<ol>
											<li integration-image="{{addAppImageUrl}}"
											    caption="Add App">
						          </li>
					          </ol>
					        </li>
					        <li>
					          If you are not using the EduAppCenter, choose the By URL method and copy the Consumer key and Shared Secret into the dialog, along with the Config URL
					          
										<ol>
											<li integration-image="{{addAppConfigurationTypeUrl}}" 
											    caption="Add App by URL">
						          </li>
					          </ol>
					        </li>
					      </ol>
					    </li>
					    <li>Submit the form and refresh the page</li>
					    <li>Observe that a new Badges tab will appear on your left-side course navigation in all courses on the account</li>
						</ol>
					</article>
		
				</div>
		
			</div>
		
		</main>
`
})
export class BadgebookLti1DetailComponent extends AppIntegrationDetailComponent<BadebookLti1Integration> {
	readonly externalAppsBadgrImageUrl = require('../../breakdown/static/images/screenshots/badgebook-setup/external-apps-badgr.png');
	readonly addAppImageUrl = require('../../breakdown/static/images/screenshots/badgebook-setup/add-app.png');
	readonly addAppConfigurationTypeUrl = require('../../breakdown/static/images/screenshots/badgebook-setup/add-app-configuration-type.png');

	integrationSlug = "canvas-lti1";

	constructor(
		loginService: SessionService,
		route: ActivatedRoute,
		router: Router,
		title: Title,
		messageService: MessageService,
		appIntegrationManager: AppIntegrationManager
	) {
		super(loginService, route, router, title, messageService, appIntegrationManager);
	}
}

@Component({
	selector: "[integration-image]",
	template: `
		<a class="integrationthumb" 
		   href="javascript: void(0)"
		   (click)="imageClick()"
		   data-index="2"
		>
			<span>{{ caption }}<span> (Open Thumbnail)</span></span>
			<img srcset="{{ imagePath }} 2x" 
			     [src]="imagePath" 
			     alt="thumbnail description"
			     #addAppConfigurationImage
			     />
		</a>
`
})
export class IntegrationImageComponent {
	imagePath: string;
	private image: HTMLImageElement;

	@Input()
	caption: string;

	@Input("integration-image")
	set inputSrc(src: string) {
		this.imagePath = src;
		this.image = new Image();
		this.image.src = src;
	}

	imageClick() {
		let width = this.image && (this.image.width/2) || 640;
		let height = this.image && (this.image.height/2) || 480;

		window.open(
			this.imagePath,
			"_blank",
			`width=${width},height=${height}`
		);
	}
}