import { UserProfileApiService } from './../common/services/user-profile-api.service';
import { ActivatedRoute, Router } from "@angular/router";
import { Component, OnInit } from "@angular/core";
import { SessionService } from "../common/services/session.service";
import { BaseAuthenticatedRoutableComponent } from "../common/pages/base-authenticated-routable.component";
import { Title } from "@angular/platform-browser";

@Component({
	selector: 'managementUsersList',
	template: `
	<main>
		<header class="wrap wrap-light l-containerhorizontal l-heading">
			<div class="heading">
				<div class="heading-x-text">
					<h1>Users <span *ngIf="users">{{ users?.length }} LTI Clients</span></h1>
				</div>
			</div>
		</header>

		<div class="l-containerhorizontal l-containervertical l-childrenvertical wrap">
			<table class="table" >
				<thead>
					<tr>
						<th scope="col">User</th>
						<th scope="col">Actions</th>
					</tr>
				</thead>
				<tbody *bgAwaitPromises="[usersLoaded]">
					<tr *ngFor="let user of users">
						<th scope="row">
							<div class="l-childrenhorizontal l-childrenhorizontal-small">
								<a [routerLink]="['/management/users/edit', user.slug]">{{user.last_name}}, {{user.first_name}}</a>
							</div>
						</th>
						<td>
							<div class="l-childrenhorizontal l-childrenhorizontal-right">
								<button type="button"
												class="button button-primaryghost"
												[routerLink]="['/management/users/edit', user.slug]"
												[disabled-when-requesting]="true"
								>Edit User
								</button>
							</div>
						</td>
					</tr>
				</tbody>
			</table>
		</div>

	</main>
	`
})
export class ManagementUsersListComponent extends BaseAuthenticatedRoutableComponent implements OnInit {
	
	users: Array<any>;
	usersLoaded: Promise<any>;

	constructor(
		router: Router,
		route: ActivatedRoute,
		sessionService: SessionService,
		protected title: Title,
		protected userProfileApi: UserProfileApiService,
	) {
		super(router, route, sessionService);
		title.setTitle("Management - Users");
		this.usersLoaded = this.userProfileApi.getUsersWithinScope()
		.then((users) => {
			this.users = users
			this.users.sort(this.compareUsers)
		});

	}

	compareUsers(a, b){
		let value = a['last_name'].localeCompare(b['last_name'])
		if (value == 0){
			return a['first_name'].localeCompare(b['first_name'])
		}
		return value
	}

}