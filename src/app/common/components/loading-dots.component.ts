import {Component, Input} from "@angular/core";

@Component({
    selector: 'loading-dots',
    template: '<div class="dots {{className}}"> <div class="dot"></div> <div class="dot"></div> <div class="dot"></div> </div>'
})
export class LoadingDotsComponent {
    @Input() className: string;
}
