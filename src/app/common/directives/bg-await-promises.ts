import { Directive, ViewContainerRef, TemplateRef, Input, ComponentFactoryResolver } from "@angular/core";
import { LoadingDotsComponent } from "../components/loading-dots.component";
import { LoadingErrorComponent } from "../components/loading-error.component";

/**
 *
 *
 * ### Example
 *
 * ```
 * <div *bgAwaitPromises="[promise1, promise2]">
 *     <!-- content to be displayed when promise1 and promise2 are complete -->
 *     <!-- otherwise LoadingDotComponent appears -->
 * </div>
 *
 */


@Directive({
	selector: '[bgAwaitPromises]'
})
export class BgAwaitPromises {
	currentPromise: Promise<any>;
	indicatorClassName: string;

	constructor(
		private viewContainer: ViewContainerRef,
		private template: TemplateRef<any>,
		private componentResolver: ComponentFactoryResolver
	) {
	}

	@Input() set bgAwaitPromises(newValue: Array<Promise<any> | {loadedPromise: Promise<any>}> | Promise<any> | {loadedPromise: Promise<any>}) {
		let newPromises: Array<Promise<any>> = [];

		if (Array.isArray(newValue)) {
			newPromises = newValue
				.filter(p => !! p)
				.map((value: any) => ("loadedPromise" in value) ? value["loadedPromise"] : value);

		} else if (newValue && "loadedPromise" in newValue) {
			newPromises = [(newValue as any)["loadedPromise"]]
		} else if (newValue) {
			newPromises = [newValue as any];
		}


		if (newPromises.length > 0) {
			// promises to wait for, display loading dots
			this.showLoadingAnimation();
			this.currentPromise = Promise.all(newPromises).then(
				() => this.showTemplate(),
				error => this.showError(error)
			)
		} else {
			// no promises given, display template
			this.showTemplate();
		}
	}

	@Input() set bgAwaitClass(newClassName: string) {
		this.indicatorClassName = newClassName;
	}

	private showTemplate(): void {
		this.viewContainer.clear();
		this.viewContainer.createEmbeddedView(this.template);
	}

	private showError(error: any) {
		let factory = this.componentResolver.resolveComponentFactory(LoadingErrorComponent);

		this.viewContainer.clear();

		let componentRef = this.viewContainer.createComponent(factory);
		componentRef.instance.className = this.indicatorClassName;
		componentRef.instance.errorMessage = error["message"] || error;
	}

	private showLoadingAnimation(): void {
		let factory = this.componentResolver.resolveComponentFactory(LoadingDotsComponent);

		this.viewContainer.clear();
		let componentRef = this.viewContainer.createComponent(factory);
		componentRef.instance.className = this.indicatorClassName;
	}
}