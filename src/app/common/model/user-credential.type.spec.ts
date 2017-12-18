import { TestBed, inject } from "@angular/core/testing";
import { UserCredential } from "./user-credential.type";


describe('UserCredential', () => {
	it('has the username given in the constructor', function () {
		var userCredential: UserCredential;

		userCredential = new UserCredential('username@example.com', 'none');
		expect(userCredential.username).toEqual('username@example.com');
	});

	it('has the password given in the constructor', function () {
		var userCredential: UserCredential;

		userCredential = new UserCredential('none', 'password');
		expect(userCredential.password).toEqual('password');
	});
})
