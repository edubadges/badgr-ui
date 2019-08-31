import { Response } from "@angular/http";
import { BadgrApiError } from "./base-http-api.service";

export class BadgrApiFailure {
	private readonly payload: Response | Error | string;

	static from(error: any): BadgrApiFailure {
		if (error instanceof BadgrApiFailure) {
			return error;
		} else {
			return new BadgrApiFailure(error);
		}
	}

	constructor(
		payload: Response | Error | string
	) {
		this.payload = payload;
	}

	/**
	 * Returns the first field error or the overall error. Useful for cases where only a single error is expected, or
	 * where a single error is needed for display to the user.
	 *
	 * @returns {any}
	 */

	get verboseError(): string | null {
		if (this.payload['response']){
			return this.payload['response']['_body']? this.payload['response']['_body'].slice(0, 120) : this.firstMessage;
		} 
		return this.firstMessage
	}

	get firstMessage(): string | null {
		const overallMessage = this.overallMessage;
		const fieldMessages = this.fieldMessages;

		if (overallMessage) {
			return overallMessage;
		} else if (fieldMessages) {
			return fieldMessages[ Object.keys(fieldMessages)[ 0 ] ];
		} else {
			return null;
		}
	}

	/**
	 * The overall error message, if there is one. If the error is a local javascript exception, it's message is returned.
	 * If the error is a global server error, that is returned. Otherwise, null is returned.
	 *
	 * @returns {any}
	 */
	get overallMessage(): string | null {
		function errorFromJson(json: any): string {
			// Global errors return a single array with the error as the first element
			if (Array.isArray(json) && typeof json[0] === "string") {
				return json.join(" ");
			} else if (typeof(json) === "string") {
				return json;
			}

			// If the response is not an array, it contains field-specific errors
			return null;
		}

		if (this.payload instanceof BadgrApiError) {
			try {
				const json = this.payload.response.json();
				return errorFromJson(json)
			} catch (e) {
				return "Unknown server error";
			}
		} else if (this.payload instanceof Response) {
			try {
				const json = this.payload.json();
				return errorFromJson(json)
			} catch (e) {
				return "Unknown server error";
			}
		} else if (this.payload instanceof Error) {
			return this.payload.message;
		} else if (typeof(this.payload) === "string") {
			return this.payload;
		} else {
			return null;
		}
	}

	/**
	 * The list of field-specific errors from this failure, if there are any, null if there aren't.
	 *
	 * @returns {any}
	 */
	get fieldMessages(): { [name: string]: string } | null {
		function errorFromJson(json) {
			if (Array.isArray(json)) {
				return json.map(a => errorFromJson(a) || {})
					.reduce((a,b) => Object.assign(a, b), {});
			} else if (typeof(json) === "object") {
				const result: { [name: string]: string } = {};

				Object.keys(json).map(key => {
					const value = json[ key ];

					if (typeof(value) === "string") {
						result[ key ] = value;
					} else if (Array.isArray(value)) {
						result[ key ] = value.map(a => JSON.stringify(a)).join(" ");
					}
				});

				return Object.keys(result).length > 0
					? result
					: null;
			} else {
				return null;
			}
		}

		try {
			if (this.payload instanceof BadgrApiError) {
				return errorFromJson(this.payload.response.json());
			} else if (this.payload instanceof Response) {
				return errorFromJson(this.payload.json());
			} else {
				return null;
			}
		} catch (e) {
			return { error: "Unknown server error" };
		}
	}
}
