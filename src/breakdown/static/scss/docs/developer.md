# Handelbar helpers

Badger UI takes advantage of the handlebar-helpers library. The primary reason for using the handlebar-helpers library
is to add some logic to handlebars. Using helpers like 'is' allows the developer to test the value of a property rather 
then only the existence  of a property, removing the necessity of using properties in the context object as flags for
logic.

Docs | https://github.com/helpers/handlebars-helpers

## Installing handelBar helpers

### Install with npm
     $ npm install --save handlebars-helpers

### Add the following the code to fracal.js 

    const helpers = require('handlebars-helpers')();
    const hbs = require('@frctl/handlebars')({helpers: helpers});
    fractal.components.engine(hbs);
    fractal.docs.engine(hbs);




