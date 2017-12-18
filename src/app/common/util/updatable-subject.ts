import { Subject } from "rxjs/Subject";
import { Subscriber } from "rxjs/Subscriber";

/**
 * A Subject for objects that will be loaded at some point and may be subsequently updated. Acts like a promise with updates:
 * - Subscribers get the current value upon subscription if it is available
 * - Subscribers get any future updates to the value when such updates occur
 *
 * @class UpdatableSubject<T>
 */
export class UpdatableSubject<T> extends Subject<T> {
	private _value: T;
	private _valueSet: boolean = false;

	private hasFirstSubscriber = false;

	/**
	 * @param onFirstSubscription Callback to be invoked upon the first subscription to this subject. Allows
	 * initialization actions to be deferred until something is interested in the subject.
	 */
	constructor(
		private onFirstSubscription: () => void = () => {}
	) {
		super();
	}

	getValue(): T {
		if (this.hasError) {
			throw this.thrownError;
		} else {
			return this._value;
		}
	}

	get value(): T {
		return this.getValue();
	}

	get isLoaded(): boolean {
		return this._valueSet;
	}

	protected _subscribe(
		subscriber: Subscriber<T>
	) {
		const subscription = super._subscribe(subscriber);

		if (!this.hasFirstSubscriber) {
			this.onFirstSubscription();
			this.hasFirstSubscriber = true;
		}

		if (this._valueSet && subscription) {
			subscriber.next(this._value);
		}

		return subscription;
	}

	public next(value: T): void {
		this._valueSet = true;
		super.next(this._value = value);
	}

	public error(err: any): void {
		this.hasError = true;
		super.error(this.thrownError = err);
	}

	safeNext(value: T): void {
		// TODO: Will next() work without a subscription check?
		this.next(value);
	}

	reset() {
		this._value = null;
		this._valueSet = false;
	}
}

export class LoadableValueSubject<T> extends UpdatableSubject<T> {
	constructor(
		private fetchData: () => Promise<T>
	) {
		super(() => this.update);
	}

	public update(): Promise<T> {
		return this.fetchData().then(
			data => (this.safeNext(data), data)
		)
	}
}