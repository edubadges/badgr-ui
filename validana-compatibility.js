/**
 * The Validana-client Angular package was build for a newer version of Angular.
 * Badgr-ui uses an old version of Angular, but is still able to use Validana.
 * 
 * This script modifies the package metadata of validana to Angular module version '3'.
 * This enables the AOT compiler to complete building Badgr-ui without warnings.
 */

const fs = require('fs');
const f = 'node_modules/validana-client/dist/validana-client.metadata.json';

fs.readFile(f, 'utf8', function (err,data) {
  if (err) {
    return console.log(err);
  }
  var result = data.replace(/"version":4/g, '"version":3');

  fs.writeFile(f, result, 'utf8', function (err) {
    if (err) return console.log(err);
  });
});
