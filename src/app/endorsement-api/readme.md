Badgr Blockchain Endorsements
=============================

With this release of the endorsements-api we have shown that Badgr can be extended with endorsements using blockchain technology.
For this proof-of-concept only the Badgr UI was modified. The server was untouched.

The front-end connects with the blockchain over a secure websocket connection.
An user can login with a private key (WIF) in the `Account -> Blockchain Configuration` page.

The following roles are available (each governed by Smart Contracts on the blockchain)
* Processor (trusted context)
* Educational institute (added by the processor)
* Educational entities (added by educational institutes)

Educational entities can endorse badges and badge classes in Badgr if the private key of an educational entity
is provided in the configuration page. Educational institutes can revoke entities.

Configuration
-------------
Please configure the correct endpoint location in the `validana-api.config.ts` file

Development
-----------
* Run `npm install` and `npm run server` to setup the development environment and server.
* Navigate to `localhost:4000` for your local Badgr installation
* (Ensure you have the badgr-server back-end running aswell)

Learn more
----------
Learn more about the permissioned and high-performance Validana blockchain at https://validana.io