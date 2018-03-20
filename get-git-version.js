var shell = require('shelljs');

if (! shell.which('git')) {
	shell.echo('Sorry, this script requires git');
	shell.exit(1);
}

var versionInfo = {
	commitHash: shell.exec("git rev-parse --short HEAD", {silent:true}).replace(/\n$/, ""),
	branchName: process.env["GIT_BRANCH"] || shell.exec("git rev-parse --abbrev-ref HEAD", {silent:true}).replace(/\n$/, "").split("\n")[0],
	tags: shell.exec("git tag --points-at HEAD", {silent:true}).split("\n").filter(function(x){ return x.length > 0 }),
};

if (process.argv.indexOf("--txt") >= 0) {
	console.info(versionInfo.tags.length ? versionInfo.tags[0] : versionInfo.commitHash);
} else {
	console.info(JSON.stringify(versionInfo));
}