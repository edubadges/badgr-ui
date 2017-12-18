import { Component, OnInit } from "@angular/core";
import { ActivatedRoute, Router, } from "@angular/router";
import { SessionService } from "../common/services/session.service";
import { Title } from "@angular/platform-browser";


@Component({
	selector: 'sign-up-success',
	template: `
		<main>
			<form-message></form-message>

			<div class="l-auth">
				<!-- OAuth Banner -->
				<oauth-banner></oauth-banner>
	
				<!-- Title Message -->
				<h3 class="l-auth-x-title title title-bold" id="heading-form">Verify Your Email Address</h3>
				<p class="l-auth-x-text text text-quiet">Welcome to Badgr!</p>
				<p class="l-auth-x-text text text-quiet">
					We have sent a verification email to <strong>{{ email }}</strong>. Follow the link provided to finalize the signup
					process. if you do not receive it within a few minutes, check your Spam or Junk email folders. If you
					still can’t locate the email, please <a href="mailto:help@badgr.io">contact us</a>.
				</p>
			</div>
		</main>
	`,
})
export class SignupSuccessComponent implements OnInit {
	email: string;

	constructor(
		private routeParams: ActivatedRoute,
		private title: Title,
		private sessionService: SessionService,
		private router: Router
	) {
		title.setTitle("Verification - Badgr");
	}

	ngOnInit() {
		// Ensure the user is not logged in here. Per BGR-354, a signup request should supersede any existing badgr session
		this.sessionService.logout();

		this.email = this.routeParams.snapshot.params[ 'email' ];
	}
}
