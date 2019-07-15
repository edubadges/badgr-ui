import { Component, ViewEncapsulation } from "@angular/core";
import { SystemConfigService } from "../common/services/config.service";
@Component({
  template: `
  
  <style>
		#privacy-policy  h1 {
			font-size: 29px;
			margin: 0px 0px 30px 0px;
		}
		#privacy-policy  h2 {
			font-size: 26px;
			margin: 20px 0px 20px 0px;
		}
		#privacy-policy  h3 {
			font-size: 23px;
			margin: 15px 0px 15px 0px;
		}
		#privacy-policy  h4 {
			font-size: 20px;
			margin: 15px 0px 15px 0px;
		}
		#privacy-policy  li {
			list-style-type: square;
			list-style-position: inside;
			padding-left: 30px;
			margin: 5px 0px 5px 0px;
		}
		#privacy-policy  span, li, table {
			color: #6c6b80;
			font-family: "Open Sans", sans-serif;
			line-height: 130%;
		}
		#privacy-policy  table {
			width: 100%;
			border-width: 1px;
			border-color: #a9c6c9;
			border-collapse: collapse;
			margin: 10px 0px 10px 0px;
		}
		#privacy-policy  table th {
			font-size: 20px;
			border-width: 1px;
			padding: 8px;
			border-style: solid;
			border-color: #a9c6c9;
		}
		#privacy-policy  table td {
			border-width: 1px;
			padding: 8px;
			border-style: solid;
			border-color: #a9c6c9;
		}  
  </style>
  
  <div class="wrap wrap-light l-containerhorizontal" >
    <br><br><br>
		<button class="button" (click)="switchLanguage">{{ switchLanguageText }}</button>
		<br><br><br>
		<div [innerHTML]="getPrivacyPolicy|MarkdownToHtml" id="privacy-policy"></div>
		<br><br><br>
  </div>
  `,
	encapsulation: ViewEncapsulation.None,
})
export class PublicPrivacyPolicyComponent{

	currentLangNl = true;
	switchLanguageText = 'Bekijk in het Nederlands'

	get currentTheme(): any {
		return this.configService.currentTheme;
	}

	get getPrivacyPolicy(): any{
		if(this.currentLangNl) {
			this.switchLanguageText = 'View in English';
			return this.configService.currentTheme.privacy_statement;
		}
		else{
			this.switchLanguageText = 'Bekijk in het Nederlands';
			return this.configService.currentTheme.privacy_statement_en;
		}
	}

	get switchLanguage():boolean {
		this.currentLangNl = !this.currentLangNl
		return true;

	}

	constructor(
		private configService: SystemConfigService,

	)
	{
		this.configService = configService;
		this.currentLangNl = this.currentTheme.dutch_language_codes.includes(this.currentTheme.language_detected);

	}
}