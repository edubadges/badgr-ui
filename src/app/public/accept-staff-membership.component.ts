import { Component, Injector } from "@angular/core";
import { ActivatedRoute } from "@angular/router";
import { IssuerApiService } from 'app/issuer/services/issuer-api.service';

@Component({
	template: `
	

	<header class="wrap wrap-light l-containerhorizontal l-heading ">

	<div class="heading">
		<div *ngIf='success' class="heading-x-text">
			<h1>
				Success!
			</h1>
			<h2>
				{{this.message}}
			</h2>
		</div>
		<div *ngIf='!success' class="heading-x-text">
			<h1>
				Failure
			</h1>
			<h2>
				{{this.message}}
			</h2>
		</div>
	</div>

</header>




	`
})
export class AcceptStaffMembershipComponent {

	acceptanceLoaded: Promise<any>;
	message: string;
	success: boolean;

	constructor(
		private route: ActivatedRoute,
		private injector: Injector,
	) {
		const service: IssuerApiService = injector.get(IssuerApiService);
		this.acceptanceLoaded = service.acceptStaffMemberShip(this.code)
			.then(acceptance => {
				this.success = true
				this.message = acceptance
			})
			.catch(error => {
				this.success = false
				this.message = JSON.parse(error.response._body)[0]
			}) 
	}

	get code() {
		return this.route.snapshot.params[ 'code' ];
	}

}