# Badgr UI
An Angular 2 based front end for Badgr-server. Uses TypeScript with ES6 style module loading and a webpack-based build process.

### About the Badgr Project
Badgr was developed by Concentric Sky, starting in 2015 to serve as an open source reference implementation of the Open Badges Specification. It provides functionality to issue portable, verifiable Open Badges as well as to allow users to manage badges they have been awarded by any issuer that uses this open data standard. Since 2015, Badgr has grown to be used by hundreds of educational institutions and other people and organizations worldwide. 

## Install Instructions (for developers)

## System-wide prerequisites (OS X):
* node and npm: see https://docs.npmjs.com/getting-started/installing-node

### Install and configure project
* Install node/npm version using nvm: `nvm install && nvm use`
* Install project-specific node dependencies. `npm install` 


### Run project in your browser

Start webpack in dev mode: `npm run server`

Badgr should now be loaded in your browser. If not, navigate to http://localhost:4000


### Run Tests

Run the test suite with `npm run test:debug`

Run the e2e tests with `npm run e2e`


### Run Styleguide

Build and serve the styleguide with `npm run styleguide:serve`

Then view it at http://localhost:8080/styleguide/


## Build Instructions (for deployment)

### Building

Build the packaged files for deployment with `npm run build:prod`

Run the tests with `npm run test:ci`

All files in `dist` constitute the build artifact. A config.js must be included as well for the app to function. 
An example can be found in `src/configs/config.local.js`

### Release Branching and Tagging

Badgr UI release branches follow the `release/vA.B.x` format, with a separate branch for each minor version, and a
tag for each patch release (e.g. `v2.3.1`).

To create a release branch, simply run e.g. `git checkout -b release/v6.5.x`

To create a tag for a specific version, including the first tag, run `node tag-branch.js` which will also push the tag