# Changelog
All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](http://keepachangelog.com/en/1.0.0/)
and this project adheres to [Semantic Versioning](http://semver.org/spec/v2.0.0.html).

## [1.0.2] - 2019-02-19
  - added theming
  - removed editing/create/remove/award and revoke functionality if the
  logged in user does not have the proper rights
  - changed 'Enroll' to 'Request badge' throughout the site
  - added badge extension to student and public pages
  - added badge extension to student and public pages
  
## [1.0.1] - 2019-01-08
 - Bumped webpack-dev-server to 3.1.14
 - adds enrollment popup also when not logged in
 - creates better error message when enrollment fails
 - improves revokation without permission errormessage
 - instantly updates email in profile view after setting new primary email
 - sends correct url to badgecheck
 - adds student email to assertion list in badgeclass detail
 - adds student name to assertions list at badgeclass detail view
 - adds student email to enrollments in award view
 - extension capitalization
 - new permissions for issuer viewing and creation in frontend
 - show denial status in enrollment list
 - adds denial of enrollment
 - fixes public badgeclass page enrollment button position
 - Enable endorsements of badges using Validana
 - fixes some styling issues resulting from long text fields
 - adds revokation status to enrollment list for students
 - removes dowloading of v1 assertion at pulic assertion page
 - removes assertion share option for teachers at badgclass detail component
 - adds enrollment removal possibility in assertion award view
 - removes link to bulk award functionality from badgeclass-issue.component
 - adds enrollment consent message

## [1.0.0]
 - Initial version
