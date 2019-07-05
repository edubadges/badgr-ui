import { Component, ViewEncapsulation } from "@angular/core";
import { SystemConfigService } from "../common/services/config.service";
@Component({
  template: `
  
  <style>
  h1 {
    font-size: 29px;
    margin: 0px 0px 30px 0px;
  }
  h2 {
    font-size: 26px;
    margin: 20px 0px 20px 0px;
  }
  h3 {
    font-size: 23px;
    margin: 15px 0px 15px 0px;
  }
  h4 {
    font-size: 20px;
    margin: 15px 0px 15px 0px;
  }
  li {
    list-style-type: square;
    list-style-position: inside;
    padding-left: 30px;
    margin: 5px 0px 5px 0px;
  }
  span, li, table {
    color: #6c6b80;
    font-family: "Open Sans", sans-serif;
    line-height: 130%;
  }
  table {
    width: 100%;
  	border-width: 1px;
  	border-color: #a9c6c9;
  	border-collapse: collapse;
    margin: 10px 0px 10px 0px;
  }
  table th {
    font-size: 20px;
  	border-width: 1px;
  	padding: 8px;
  	border-style: solid;
  	border-color: #a9c6c9;
  }
  table td {
  	border-width: 1px;
  	padding: 8px;
  	border-style: solid;
  	border-color: #a9c6c9;
  }  
  </style>
  
  <div class="wrap wrap-light l-containerhorizontal">
    <br><br><br>
		
		<div [innerHTML]="privacyPolicy|MarkdownToHtml"></div>
		<br><br><br>
  </div>
  `,
	encapsulation: ViewEncapsulation.None,
})
export class PublicPrivacyPolicyComponent{

	get currentTheme() {
		return this.configService.currentTheme
	}

	get privacyPolicy(){
		return this.configService.currentTheme.privacy_statement
	}
	constructor(
		private configService: SystemConfigService,

	) {
		this.configService = configService;
	}
}