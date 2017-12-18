import { Component, Input, } from "@angular/core";

@Component({
	selector: 'markdown-display',
	host: {
	},
	template: `
		<div class="markdowneditor">	
			<div class="markdowneditor-x-display"
				[innerHTML]="value | MarkdownToHtml : {  
					gfm: false,
					tables: false,
					breaks: false,
					pedantic: false,
					sanitize: true,
					smartLists: true,
					smartypants: false
				}">Markdown preview
	        </div>
		</div> 
	`
})
export class MarkdownDisplay {
	@Input() value: string;
	constructor() { }
}