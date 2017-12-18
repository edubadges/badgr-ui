import { Component, OnInit } from "@angular/core";

import { Router, ActivatedRoute, } from "@angular/router";
import { MessageService } from "../common/services/message.service";
import { BaseRoutableComponent } from "../common/pages/base-routable.component";
import { Title } from "@angular/platform-browser";

import { SystemConfigService } from "../common/services/config.service";


@Component({
	selector: 'login',
	template: `
		<main>
		  <form-message></form-message>
		  <header class="wrap wrap-light l-containerhorizontal l-heading">
		    <div class="heading">
		    </div>
		  </header>
		
		  <div class="l-containerhorizontal l-containervertical l-childrenvertical wrap">
		    
		  </div>
		</main>
	`
})
export class PublicComponent extends BaseRoutableComponent implements OnInit {


	get currentTheme() { return this.configService.currentTheme }

	constructor(
		private title: Title,
		router: Router,
		private configService: SystemConfigService,
		route: ActivatedRoute
	) {
		super(router, route);
		title.setTitle("Public - Badgr");
	}

	ngOnInit() {
		super.ngOnInit();
	}
}

/**
 * Generates a router link for a given public-object URL so we can avoid reloading the application when navigating
 * between public objects.
 *
 * @param {string} url
 */
export function routerLinkForUrl(url: string) {
	return [ url.replace(/^.*\/\/.*?(?=\/)/, "") ]
}