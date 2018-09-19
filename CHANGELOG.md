# Changelog
All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](http://keepachangelog.com/en/1.0.0/)
and this project adheres to [Semantic Versioning](http://semver.org/spec/v2.0.0.html).


## [2.17.1] - 2018-09-19
 - Change in primary address now reflected after change
 - Use file-saver library for downloading badges
 - Include a confirmation message when adding a badge via URL
 - Improve error message when adding an email address that already exists to an account
 - Improve error message when trying to remove all linked SSO accounts when created via SSO
 - Display SVG badge images correctly when grouped by issuer in firefox
 - fix broken link on empty state for backpack


## [2.16.1] - 2018-08-14
 - enable SSO for Microsoft Azure
 - bugfix: disable next button on assertions table when on last page

## [2.15.5] - 2018-07-20

### Changes
 - Previous/next page buttons for assertions on BadgeClassDetail
 - Add Share to Pinterest 
 - Remove Share to Portfolium 

### Bugfixes
 - Issuer Entity ID is displaying instead of name on Bulk Import Members screen
 - Descenders in the text for the newsletter copy are cut off
 - ToS dialog doesn't display correctly when coming from OAuth
 - Contact Email dropdown not populated correctly when Create Issuer immediately after confirming email
    
## [2.14.0] - 2018-06-18
 - implement privacy policy agreement notices on signup and when badgr-server publishes a new version
 - change "My Badges" to "Backpack"

## [2.13.0] - 2018-06-05
 - Use paginated assertions endpoint for Badge Class Detail page

### Bug Fixes
 - Twitter share is missing copy
 - The share dialog for collections displays incorrectly after viewing a badge share dialog
 - Collection: Clicking on badge takes user to My Badges


