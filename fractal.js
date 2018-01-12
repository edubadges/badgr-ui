'use strict';

/* Create a new Fractal instance and export it for use elsewhere if required */
const fractal = module.exports = require('@frctl/fractal').create();

// https://www.npmjs.com/package/handlebars-helpers
const helpers = require('handlebars-helpers')();
const hbs = require('@frctl/handlebars')({helpers: helpers});

fractal.components.engine(hbs);
fractal.docs.engine(hbs);

const mandelbrot = require('@frctl/mandelbrot'); // require the Mandelbrot theme module
const staticDir = __dirname + '/src/breakdown/static';

const dist = __dirname + '/dist/styleguide/';

/* Set the title & version of the project */
const fs = require('fs');
const packageJson = JSON.parse(fs.readFileSync(__dirname + '/package.json'));
fractal.set('project.title', `${packageJson.description} v${packageJson.version}`);
fractal.set('project.version', packageJson.version);

/* Tell Fractal where the patterns will live */
fractal.components.set('path', staticDir +'/scss');

/* Tell Fractal where the documentation pages will live */
fractal.docs.set('path', staticDir +'/scss/docs');

/* Tell Fractal where the static assets live */
fractal.web.set('static.path', "temp");

/* Tell Fractal the default preview wrapper to use */
fractal.components.set('default.preview', '@preview');

/* Tell Fractcal where to build the static directory */
fractal.web.set('builder.dest', dist);

/* We refer to them as patterns instead of components */
fractal.components.set('label', 'Patterns'); // default is 'Components'
fractal.components.set('title', 'Patterns'); // default is 'Components'

/* Custom theme for the Web UI */
const mandelbrotBlack = mandelbrot({
	skin: "red"
});

fractal.web.theme(mandelbrotBlack);
/* Set maximum constraints for the preview window */

fractal.components.set('default.display', {
	'min-width': '320px'
});

// const instance = fractal.components.engine();
//
// instance.handlebars.registerHelper('log', function(context) {
// 	console.log("fractal :: log :: ",context);
// 	return context;
// });
