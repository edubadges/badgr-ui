import { Injectable } from "@angular/core";
import { Http, Headers, Response, RequestOptionsArgs } from "@angular/http";
import "rxjs/add/operator/map";
import "rxjs/add/operator/switchMap";
//import { LoginService } from "../../auth/auth.service";
import { AuthorizationToken, SessionService } from "./session.service";
import { SystemConfigService } from "./config.service";
import { MessageService } from "./message.service";

export class BadgrApiError extends Error {
	constructor(
		public message: string,
		public response: Response
	) {
		super(message);
	}
}

@Injectable()
export abstract class BaseHttpApiService {
	baseUrl: string;
	login: boolean;

	constructor(
		//protected sessionService: LoginService,
		protected sessionService: SessionService,
		protected http: Http,
		protected configService: SystemConfigService,
		protected messageService: MessageService
	) {
		this.baseUrl = this.configService.apiConfig.baseUrl;
		this.login = true;
	}

	setNoLogin(){
		this.login = false;
	}

	get(
		path: string,
		queryParams: URLSearchParams | string | {[name: string]: string | string[]} | null = null,
		requireAuth: boolean = this.login,
		useAuth: boolean = this.login,
		headers: Headers = new Headers()
	): Promise<Response> {
		const endpointUrl = path.startsWith("http") ? path : this.baseUrl + path;

		if (useAuth && (requireAuth || this.sessionService.isLoggedIn))
			this.addAuthTokenHeader(headers, this.sessionService.requiredAuthToken);

		this.addJsonResponseHeader(headers);
		this.messageService.incrementPendingRequestCount();

		return this.http
			.get(endpointUrl, { headers: headers, params: queryParams })
			.toPromise()
			.then(r => this.onRequestSuccess(r), e => this.onRequestFailure(e))
			.then(r => this.handleHttpErrors(r, false), r => this.handleHttpErrors(r, true))
			.then(this.addTestingDelay<Response>());
	}

	private onRequestSuccess<T>(response: T): T {
		this.messageService.decrementPendingRequestCount();
		return response;
	}

	private onRequestFailure(error: any) {
		this.messageService.decrementPendingRequestCount();
		throw error;
	}

	post(
		path: string,
		payload: any,
		queryParams: URLSearchParams | string | {[name: string]: string | string[]} | null = null,
		headers: Headers = new Headers()
	): Promise<Response> {
		const endpointUrl = path.startsWith("http") ? path : this.baseUrl + path;

		this.addAuthTokenHeader(headers, this.sessionService.requiredAuthToken);
		this.addJsonRequestHeader(headers);
		this.addJsonResponseHeader(headers);
		this.messageService.incrementPendingRequestCount();

		return this.http.post(endpointUrl, JSON.stringify(payload), { headers: headers, params: queryParams })
			.toPromise()
			.then(this.addTestingDelay<Response>())
			.then(r => this.onRequestSuccess(r), e => this.onRequestFailure(e))
			.then(r => this.handleHttpErrors(r, false), r => this.handleHttpErrors(r, true));
	}

	put(
		path: string,
		payload: any,
		queryParams: URLSearchParams | string | {[name: string]: string | string[]} | null = null,
		headers: Headers = new Headers()
	): Promise<Response> {
		const endpointUrl = path.startsWith("http") ? path : this.baseUrl + path;

		this.addAuthTokenHeader(headers, this.sessionService.requiredAuthToken);
		this.addJsonRequestHeader(headers);
		this.addJsonResponseHeader(headers);
		this.messageService.incrementPendingRequestCount();

		return this.http.put(endpointUrl, JSON.stringify(payload), { headers: headers, params: queryParams }).toPromise()
			.then(this.addTestingDelay<Response>())
			.then(r => this.onRequestSuccess(r), e => this.onRequestFailure(e))
			.then(r => this.handleHttpErrors(r, false), r => this.handleHttpErrors(r, true));
	}

	delete(
		path: string,
		payload: any = null,
		queryParams: URLSearchParams | string | {[name: string]: string | string[]} | null = null,
		headers: Headers = new Headers()
	): Promise<Response> {
		const endpointUrl = path.startsWith("http") ? path : this.baseUrl + path;
		this.addAuthTokenHeader(headers, this.sessionService.requiredAuthToken);
		this.addJsonRequestHeader(headers);
		this.addJsonResponseHeader(headers);
		this.messageService.incrementPendingRequestCount();

		const options: RequestOptionsArgs = { headers: headers, params: queryParams };
		if (payload) {
			options['body'] = JSON.stringify(payload)
		}
		return this.http.delete(endpointUrl, options).toPromise()
			.then(this.addTestingDelay<Response>())
			.then(r => this.onRequestSuccess(r), e => this.onRequestFailure(e))
			.then(r => this.handleHttpErrors(r, false), r => this.handleHttpErrors(r, true));
	}

	private addJsonRequestHeader(headers: Headers) {
		headers.append('Content-Type', "application/json");
	};

	private addJsonResponseHeader(headers: Headers) {
		headers.append('Accept', 'application/json');
	};

	private addAuthTokenHeader(
		headers: Headers,
		token: AuthorizationToken
	) {
		headers.append('Authorization', 'Bearer ' + token.access_token);
	};

	private addTestingDelay<T>(): (result: T) => (Promise<T> | T) {
		return BaseHttpApiService.addTestingDelay<T>(this.configService);
	}

	static addTestingDelay<T>(configService: SystemConfigService): (result: T) => (Promise<T> | T) {
		let delayRange = configService.apiConfig.debugDelayRange;

		if (delayRange) {
			let delayMs = Math.floor(delayRange.minMs + (delayRange.maxMs - delayRange.minMs) * Math.random());

			return (result: T) => (
				console.warn(`Delaying API response by ${delayMs}ms for debugging`, result),
				new Promise<T>(resolve => setTimeout(() => resolve(result), delayMs))
			);
		} else {
			return r => r;
		}
	}

	handleHttpErrors(
		response: any,
		isError: boolean
	): Response {
		if (response && response.status < 200 || response.status >= 300) {
			if (response.status === 401 || response.status === 403) {
				this.sessionService.logout();
				window.location.assign(`/auth/login?authError=${encodeURIComponent("Your session has expired. Please log in to Badgr to continue.")}`);
			}
			else if (response.status === 0) {
				this.messageService.reportFatalError(`Badgr Server Unavailable`);
			}
			else {
				throw new BadgrApiError(
					`Expected 2xx response; got ${response.status}`,
					response
				);
			}

		}

		if (isError) {
			throw response;
		} else {
			return response;
		}
	}
}
