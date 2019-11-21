![Edubadges](logo.png)
# Edubadges UI
An Angular 2 based front end for the edubadges-server. Uses TypeScript with ES6 style module loading and a webpack-based build process. This is the browser UI for [edubadges-server](https://github.com/edubadges/badgr-server).
This software is based on the Badgr software from [Concentric Sky](https://github.com/concentricsky/).

# Edubadges and microcredentialing
Institutions are looking into the possibilities of using digital certification for (partial) results obtained by their students. In 2019, SURF will work with various institutions to continue to build a digital infrastructure with the purpose to be able to issue such digital certificates, or 'edubadges'.

# Edubadges: tool for flexible education
An increasing number of students have − whether previously or elsewhere − acquired skills and knowledge relevant to their study, and they wish to receive recognition or exemption for this in their study programme. A number of institutions are looking into the possibility of providing courses in accredited units that are smaller than a diploma (micro-credentials). Digital badges are the tools to achieve this. As these badges are issued in an educational context, they are called 'edubadges'.
Read more on [edubadges.nl](https://www.surf.nl/en/edubadges-national-approach-to-badges-in-education).

### About the Badgr Project
[Badgr](https://badgr.org) was developed by Concentric Sky, starting in 2015 to serve as an open source reference implementation of the Open Badges Specification. It provides functionality to issue portable, verifiable Open Badges as well as to allow users to manage badges they have been awarded by any issuer that uses this open data standard. Since 2015, Badgr has grown to be used by hundreds of educational institutions and other people and organizations worldwide.

# EduBadges Install Instructions (Docker on CentOS 7)

Example directory structure to build the eduBadges UI (frontend) Docker container:

    /var/docker/edubadges/

    ├── config
    │   ├── edubadges
    │   └── nginx
    ├── docker-compose.yml
    ├── Dockerfile
    ├── edubadges
    │   └── badgr-ui
    ├── entrypoint
    │   └── supervisord.conf
    └── update_code.sh


## The config directory layout
Create a directory to store the local config files. I.e.:

    /var/docker/edubadges/config/

      ├── edubadges
      │   └── config.local.js
      └── nginx
          ├── certs
          │   ├── <yourhost>.pem
          │   └── <yourhost>.key
          └── nginx.conf
	
	
## config.local.js
Create a config.local.js in the /config/edubadges directory:

    const queryParams = location.search.substr(1).split("&")

      .filter(function(p) { return p.length > 0 })
      .map(function(p) { return p.split('=').map(decodeURIComponent) })
      .reduce(function(o, p) { o[p[0]]=p[1]; return o; }, {});
	
    window.config = {

      api: {
          baseUrl: "https://<yourhost.edubadges-backend.url>",
          integrationEndpoints: ['/v1/badgebook/integrations']
      },
	
      help: {
          email: "<your email>"
      },
	  
      features: {
          pathwayGraph: true,
          alternateLandingRedirect: false,
          socialAccountProviders: ["surf_conext", "edu_id"],
          socialAccountProviderUrls: {"edu_id": "https://<yourhost.edubadges-frontend.url>"}
      },
    };

	
## nginx.conf
Edit the enclosed nginx.conf.sample and change to your situation. 
	
## Build the Docker container
Example build routine using the included Dockerfile and docker-compose.yml:

    $ cd /var/docker/edubadges-ui/edubadges/
    $ git clone --single-branch -b master https://github.com/edubadges/badgr-ui
    $ cp /var/docker/edubadges-ui/config/edubadges/config.local.js /var/docker/edubadges-ui/edubadges/badgr-ui/src/config.js
    $ cd /var/docker/edubadges-ui
    $ docker-compose build
    $ docker-compose up -d


# Install Instructions (for developers - Original tekst from Badgr)

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
