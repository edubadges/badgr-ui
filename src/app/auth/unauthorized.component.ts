import { Component, OnInit} from "@angular/core";
import { ActivatedRoute, Router } from "@angular/router";
import { Title } from "@angular/platform-browser";

import { SessionService } from "../common/services/session.service";
import { BaseAuthenticatedRoutableComponent } from "../common/pages/base-authenticated-routable.component";

@Component({
	selector: 'issuer-list',
	template: `
		<main>
     <form-message></form-message>
     <div class="l-containerhorizontal l-containervertical l-childrenvertical wrap">
       <article class="emptyillustration">
         <div>
           You are not authorized to view this page.
         </div>
       </article>
     </div>
		</main>
	`,
})
export class UnauthorizedComponent extends BaseAuthenticatedRoutableComponent implements OnInit {
  constructor(
    loginService: SessionService,
		router: Router,
		route: ActivatedRoute,
    protected title: Title,
  ) {
    super(router, route, loginService);
    title.setTitle("Unauthorized - Badgr");
  }
}
