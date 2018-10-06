import { Component, OnInit} from "@angular/core";
import { BaseLoginComponent } from "./base-login.component";


@Component({
	selector: 'login',
	template: `
	<main *bgAwaitPromises="[ initFinished ]">
		<form-message></form-message>
		
		<div class="l-auth">
			<h3 class="l-auth-x-title title title-bold" id="heading-form">{{ currentTheme.welcomeMessage }}</h3>
			<br>
			<p class="l-auth-x-text text text-quiet">
				Login for students
			</p>
			
			<div class="formfield">
				<p class="formfield-x-label">Sign In With</p>
				<div class="l-authbuttons">
						<button type="button"
						class="buttonauth buttonauth-{{ provider.slug }}"
						(click)="sessionService.initiateUnauthenticatedExternalAuth(provider)"
						>{{ provider.name }}
						</button>
				</div>
			</div>

		</div>
	</main>
	`
})
export class LoginComponent extends BaseLoginComponent implements OnInit {
	ngOnInit() {
		super.ngOnInit();
    for (let provider of this.sessionService.enabledExternalAuthProviders){
      if (provider.name == 'EduID') {
        this.provider = provider
      }
    }  
	}
}
