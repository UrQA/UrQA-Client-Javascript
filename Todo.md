
#console wrapper

	http://stackoverflow.com/questions/13815640/a-proper-wrapper-for-console-log-with-correct-line-number

	http://tranbot.net/util/safeConsole/

	http://benalman.com/projects/javascript-debug-console-log/


# javascript minify & release script

	https://www.npmjs.org/package/node-minify


	1) merge js ( web, cordova )
		: filename spec
			urqa-version-type
			-> urqa-1.0.0-web.js
			-> urqa-1.0.0-cordova.js

	2) minify js
		: filename spec
			urqa-version-type.min.js
			-> urqa-1.0.0-web.min.js
			-> urqa-1.0.0-cordova.min.js

	3) copy to release
		: target dir
			/release/version/