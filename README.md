# Badgr UI
An Angular 2 based front end for Badgr-server. Uses TypeScript with ES6 style module loading and a webpack-based build process. This is the browser UI for [badgr-server](https://github.com/concentricsky/badgr-server-prerelease).

### About the Badgr Project
[Badgr](https://badgr.org) was developed by Concentric Sky, starting in 2015 to serve as an open source reference implementation of the Open Badges Specification. It provides functionality to issue portable, verifiable Open Badges as well as to allow users to manage badges they have been awarded by any issuer that uses this open data standard. Since 2015, Badgr has grown to be used by hundreds of educational institutions and other people and organizations worldwide.

## Install Instructions (for developers)

## System-wide prerequisites (OS X):
* node and npm: see [Installing Node](https://docs.npmjs.com/getting-started/installing-node)
* (optional) [nvm](https://github.com/creationix/nvm) - node version manager: In order to work with multiple projects on your development environment that have diverse dependencies, you may want to have multiple versions of node installed. NVM allows you to do this. If this applies to you, consider using nvm to manage your node environments. `nvm use` in a project directory with a `.nvmrc` file will use the recommended node version. Make sure to `nvm use [VERSION]` the correct version before any `npm install` steps.

### Install and configure project
* Install and run  [badgr-server](https://github.com/concentricsky/badgr-server-prerelease), the API that this application connects to.
* Install node/npm version using nvm: `nvm use && nvm install`
* Install project-specific node dependencies. `npm install`


### Run project in your browser

Start webpack in dev mode: `npm run server`

Badgr should now be loaded in your browser. If your browser didn't start automatically, navigate to http://localhost:4000


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
