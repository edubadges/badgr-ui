import {Component, Input} from "@angular/core";

@Component({
    selector: 'loading-error',
    host: {
        "class": "loadingerror {{className}}"
    },
    template: '<p>{{ errorMessage }}</p>'
})
export class LoadingErrorComponent {
    @Input() errorMessage: string;
    @Input() className: string;
}
