import { Pipe, PipeTransform } from "@angular/core";


@Pipe({
	name: 'ucfirst',
})
export class UcFirstPipe implements PipeTransform {
	transform(value: string) {
		return value.slice(0, 1).toUpperCase() + value.slice(1);
	}
}
