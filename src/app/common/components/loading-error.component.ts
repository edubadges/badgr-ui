import {Component, Input} from "@angular/core";

@Component({
    selector: 'loading-error',
    host: {
        "class": "loadingerror {{className}}"
    },
    template: `
    <article class="emptyillustration l-containervertical">
        <h1 class="title title-bold title-center title-is-smallmobile title-line-height-large emptyillustration-x-no-margin-bottom">{{errorMessage}}</h1>
        <img [src]="unavailableImageSrc">
    </article>
`
})
export class LoadingErrorComponent {
    @Input() errorMessage: string;
    @Input() className: string;

    readonly unavailableImageSrc = require("../../../breakdown/static/images/badgr-unavailable.svg");
}
