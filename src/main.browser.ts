// Include the reset (it will end up in agnostic-styles.css)
require("breakdown/static/css/reset.css");

declare var ENV: any;


/*
 * Providers provided by Angular
 */
import { platformBrowserDynamic } from '@angular/platform-browser-dynamic';

/*
 * Main Application Module
 */
import { AppModule } from './app/app.module';
import { enableProdMode } from "@angular/core";

export { AppModule };

if ('production' === ENV || window.location.search.indexOf("prod") >= 0) {
	enableProdMode();
}

// Store the location present initially so we can check for query parameters later that get lost by the router because
// of https://stackoverflow.com/questions/39898656/angular2-router-keep-query-string
window["initialLocationHref"] = window.location.href.toString();

platformBrowserDynamic().bootstrapModule(AppModule);
