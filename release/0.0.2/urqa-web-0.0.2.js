// Domain Public by Eric Wendelin http://eriwen.com/ (2008)
//                  Luke Smith http://lucassmith.name/ (2008)
//                  Loic Dachary <loic@dachary.org> (2008)
//                  Johan Euphrosine <proppy@aminche.com> (2008)
//                  Oyvind Sean Kinsey http://kinsey.no/blog (2010)
//                  Victor Homyakov <victor-homyakov@users.sourceforge.net> (2010)
/*global module, exports, define, ActiveXObject*/
(function(global, factory) {
    if (typeof exports === 'object') {
        // Node
        module.exports = factory();
    } else if (typeof define === 'function' && define.amd) {
        // AMD
        define(factory);
    } else {
        // Browser globals
        global.printStackTrace = factory();
    }
}(this, function() {
    /**
     * Main function giving a function stack trace with a forced or passed in Error
     *
     * @cfg {Error} e The error to create a stacktrace from (optional)
     * @cfg {Boolean} guess If we should try to resolve the names of anonymous functions
     * @return {Array} of Strings with functions, lines, files, and arguments where possible
     */
    function printStackTrace(options) {
        options = options || {guess: true};
        var ex = options.e || null, guess = !!options.guess;
        var p = new printStackTrace.implementation(), result = p.run(ex);
        return (guess) ? p.guessAnonymousFunctions(result) : result;
    }

    printStackTrace.implementation = function() {
    };

    printStackTrace.implementation.prototype = {
        /**
         * @param {Error} [ex] The error to create a stacktrace from (optional)
         * @param {String} [mode] Forced mode (optional, mostly for unit tests)
         */
        run: function(ex, mode) {
            ex = ex || this.createException();
            mode = mode || this.mode(ex);
            if (mode === 'other') {
                return this.other(arguments.callee);
            } else {
                return this[mode](ex);
            }
        },

        createException: function() {
            try {
                this.undef();
            } catch (e) {
                return e;
            }
        },

        /**
         * Mode could differ for different exception, e.g.
         * exceptions in Chrome may or may not have arguments or stack.
         *
         * @return {String} mode of operation for the exception
         */
        mode: function(e) {
            if (e['arguments'] && e.stack) {
                return 'chrome';
            }

            if (e.stack && e.sourceURL) {
                return 'safari';
            }

            if (e.stack && e.number) {
                return 'ie';
            }

            if (e.stack && e.fileName) {
                return 'firefox';
            }

            if (e.message && e['opera#sourceloc']) {
                // e.message.indexOf("Backtrace:") > -1 -> opera9
                // 'opera#sourceloc' in e -> opera9, opera10a
                // !e.stacktrace -> opera9
                if (!e.stacktrace) {
                    return 'opera9'; // use e.message
                }
                if (e.message.indexOf('\n') > -1 && e.message.split('\n').length > e.stacktrace.split('\n').length) {
                    // e.message may have more stack entries than e.stacktrace
                    return 'opera9'; // use e.message
                }
                return 'opera10a'; // use e.stacktrace
            }

            if (e.message && e.stack && e.stacktrace) {
                // e.stacktrace && e.stack -> opera10b
                if (e.stacktrace.indexOf("called from line") < 0) {
                    return 'opera10b'; // use e.stacktrace, format differs from 'opera10a'
                }
                // e.stacktrace && e.stack -> opera11
                return 'opera11'; // use e.stacktrace, format differs from 'opera10a', 'opera10b'
            }

            if (e.stack && !e.fileName) {
                // Chrome 27 does not have e.arguments as earlier versions,
                // but still does not have e.fileName as Firefox
                return 'chrome';
            }

            return 'other';
        },

        /**
         * Given a context, function name, and callback function, overwrite it so that it calls
         * printStackTrace() first with a callback and then runs the rest of the body.
         *
         * @param {Object} context of execution (e.g. window)
         * @param {String} functionName to instrument
         * @param {Function} callback function to call with a stack trace on invocation
         */
        instrumentFunction: function(context, functionName, callback) {
            context = context || window;
            var original = context[functionName];
            context[functionName] = function instrumented() {
                callback.call(this, printStackTrace().slice(4));
                return context[functionName]._instrumented.apply(this, arguments);
            };
            context[functionName]._instrumented = original;
        },

        /**
         * Given a context and function name of a function that has been
         * instrumented, revert the function to it's original (non-instrumented)
         * state.
         *
         * @param {Object} context of execution (e.g. window)
         * @param {String} functionName to de-instrument
         */
        deinstrumentFunction: function(context, functionName) {
            if (context[functionName].constructor === Function &&
                context[functionName]._instrumented &&
                context[functionName]._instrumented.constructor === Function) {
                context[functionName] = context[functionName]._instrumented;
            }
        },

        /**
         * Given an Error object, return a formatted Array based on Chrome's stack string.
         *
         * @param e - Error object to inspect
         * @return Array<String> of function calls, files and line numbers
         */
        chrome: function(e) {
            return (e.stack + '\n')
                .replace(/^[\s\S]+?\s+at\s+/, ' at ') // remove message
                .replace(/^\s+(at eval )?at\s+/gm, '') // remove 'at' and indentation
                .replace(/^([^\(]+?)([\n$])/gm, '{anonymous}() ($1)$2')
                .replace(/^Object.<anonymous>\s*\(([^\)]+)\)/gm, '{anonymous}() ($1)')
                .replace(/^(.+) \((.+)\)$/gm, '$1@$2')
                .split('\n')
                .slice(0, -1);
        },

        /**
         * Given an Error object, return a formatted Array based on Safari's stack string.
         *
         * @param e - Error object to inspect
         * @return Array<String> of function calls, files and line numbers
         */
        safari: function(e) {
            return e.stack.replace(/\[native code\]\n/m, '')
                .replace(/^(?=\w+Error\:).*$\n/m, '')
                .replace(/^@/gm, '{anonymous}()@')
                .split('\n');
        },

        /**
         * Given an Error object, return a formatted Array based on IE's stack string.
         *
         * @param e - Error object to inspect
         * @return Array<String> of function calls, files and line numbers
         */
        ie: function(e) {
            return e.stack
                .replace(/^\s*at\s+(.*)$/gm, '$1')
                .replace(/^Anonymous function\s+/gm, '{anonymous}() ')
                .replace(/^(.+)\s+\((.+)\)$/gm, '$1@$2')
                .split('\n')
                .slice(1);
        },

        /**
         * Given an Error object, return a formatted Array based on Firefox's stack string.
         *
         * @param e - Error object to inspect
         * @return Array<String> of function calls, files and line numbers
         */
        firefox: function(e) {
            return e.stack.replace(/(?:\n@:0)?\s+$/m, '')
                .replace(/^(?:\((\S*)\))?@/gm, '{anonymous}($1)@')
                .split('\n');
        },

        opera11: function(e) {
            var ANON = '{anonymous}', lineRE = /^.*line (\d+), column (\d+)(?: in (.+))? in (\S+):$/;
            var lines = e.stacktrace.split('\n'), result = [];

            for (var i = 0, len = lines.length; i < len; i += 2) {
                var match = lineRE.exec(lines[i]);
                if (match) {
                    var location = match[4] + ':' + match[1] + ':' + match[2];
                    var fnName = match[3] || "global code";
                    fnName = fnName.replace(/<anonymous function: (\S+)>/, "$1").replace(/<anonymous function>/, ANON);
                    result.push(fnName + '@' + location + ' -- ' + lines[i + 1].replace(/^\s+/, ''));
                }
            }

            return result;
        },

        opera10b: function(e) {
            // "<anonymous function: run>([arguments not available])@file://localhost/G:/js/stacktrace.js:27\n" +
            // "printStackTrace([arguments not available])@file://localhost/G:/js/stacktrace.js:18\n" +
            // "@file://localhost/G:/js/test/functional/testcase1.html:15"
            var lineRE = /^(.*)@(.+):(\d+)$/;
            var lines = e.stacktrace.split('\n'), result = [];

            for (var i = 0, len = lines.length; i < len; i++) {
                var match = lineRE.exec(lines[i]);
                if (match) {
                    var fnName = match[1] ? (match[1] + '()') : "global code";
                    result.push(fnName + '@' + match[2] + ':' + match[3]);
                }
            }

            return result;
        },

        /**
         * Given an Error object, return a formatted Array based on Opera 10's stacktrace string.
         *
         * @param e - Error object to inspect
         * @return Array<String> of function calls, files and line numbers
         */
        opera10a: function(e) {
            // "  Line 27 of linked script file://localhost/G:/js/stacktrace.js\n"
            // "  Line 11 of inline#1 script in file://localhost/G:/js/test/functional/testcase1.html: In function foo\n"
            var ANON = '{anonymous}', lineRE = /Line (\d+).*script (?:in )?(\S+)(?:: In function (\S+))?$/i;
            var lines = e.stacktrace.split('\n'), result = [];

            for (var i = 0, len = lines.length; i < len; i += 2) {
                var match = lineRE.exec(lines[i]);
                if (match) {
                    var fnName = match[3] || ANON;
                    result.push(fnName + '()@' + match[2] + ':' + match[1] + ' -- ' + lines[i + 1].replace(/^\s+/, ''));
                }
            }

            return result;
        },

        // Opera 7.x-9.2x only!
        opera9: function(e) {
            // "  Line 43 of linked script file://localhost/G:/js/stacktrace.js\n"
            // "  Line 7 of inline#1 script in file://localhost/G:/js/test/functional/testcase1.html\n"
            var ANON = '{anonymous}', lineRE = /Line (\d+).*script (?:in )?(\S+)/i;
            var lines = e.message.split('\n'), result = [];

            for (var i = 2, len = lines.length; i < len; i += 2) {
                var match = lineRE.exec(lines[i]);
                if (match) {
                    result.push(ANON + '()@' + match[2] + ':' + match[1] + ' -- ' + lines[i + 1].replace(/^\s+/, ''));
                }
            }

            return result;
        },

        // Safari 5-, IE 9-, and others
        other: function(curr) {
            var ANON = '{anonymous}', fnRE = /function(?:\s+([\w$]+))?\s*\(/, stack = [], fn, args, maxStackSize = 10;
            var slice = Array.prototype.slice;
            while (curr && stack.length < maxStackSize) {
                fn = fnRE.test(curr.toString()) ? RegExp.$1 || ANON : ANON;
                try {
                    args = slice.call(curr['arguments'] || []);
                } catch (e) {
                    args = ['Cannot access arguments: ' + e];
                }
                stack[stack.length] = fn + '(' + this.stringifyArguments(args) + ')';
                try {
                    curr = curr.caller;
                } catch (e) {
                    stack[stack.length] = 'Cannot access caller: ' + e;
                    break;
                }
            }
            return stack;
        },

        /**
         * Given arguments array as a String, substituting type names for non-string types.
         *
         * @param {Arguments,Array} args
         * @return {String} stringified arguments
         */
        stringifyArguments: function(args) {
            var result = [];
            var slice = Array.prototype.slice;
            for (var i = 0; i < args.length; ++i) {
                var arg = args[i];
                if (arg === undefined) {
                    result[i] = 'undefined';
                } else if (arg === null) {
                    result[i] = 'null';
                } else if (arg.constructor) {
                    // TODO constructor comparison does not work for iframes
                    if (arg.constructor === Array) {
                        if (arg.length < 3) {
                            result[i] = '[' + this.stringifyArguments(arg) + ']';
                        } else {
                            result[i] = '[' + this.stringifyArguments(slice.call(arg, 0, 1)) + '...' + this.stringifyArguments(slice.call(arg, -1)) + ']';
                        }
                    } else if (arg.constructor === Object) {
                        result[i] = '#object';
                    } else if (arg.constructor === Function) {
                        result[i] = '#function';
                    } else if (arg.constructor === String) {
                        result[i] = '"' + arg + '"';
                    } else if (arg.constructor === Number) {
                        result[i] = arg;
                    } else {
                        result[i] = '?';
                    }
                }
            }
            return result.join(',');
        },

        sourceCache: {},

        /**
         * @return {String} the text from a given URL
         */
        ajax: function(url) {
            var req = this.createXMLHTTPObject();
            if (req) {
                try {
                    req.open('GET', url, false);
                    //req.overrideMimeType('text/plain');
                    //req.overrideMimeType('text/javascript');
                    req.send(null);
                    //return req.status == 200 ? req.responseText : '';
                    return req.responseText;
                } catch (e) {
                }
            }
            return '';
        },

        /**
         * Try XHR methods in order and store XHR factory.
         *
         * @return {XMLHttpRequest} XHR function or equivalent
         */
        createXMLHTTPObject: function() {
            var xmlhttp, XMLHttpFactories = [
                function() {
                    return new XMLHttpRequest();
                }, function() {
                    return new ActiveXObject('Msxml2.XMLHTTP');
                }, function() {
                    return new ActiveXObject('Msxml3.XMLHTTP');
                }, function() {
                    return new ActiveXObject('Microsoft.XMLHTTP');
                }
            ];
            for (var i = 0; i < XMLHttpFactories.length; i++) {
                try {
                    xmlhttp = XMLHttpFactories[i]();
                    // Use memoization to cache the factory
                    this.createXMLHTTPObject = XMLHttpFactories[i];
                    return xmlhttp;
                } catch (e) {
                }
            }
        },

        /**
         * Given a URL, check if it is in the same domain (so we can get the source
         * via Ajax).
         *
         * @param url {String} source url
         * @return {Boolean} False if we need a cross-domain request
         */
        isSameDomain: function(url) {
            return typeof location !== "undefined" && url.indexOf(location.hostname) !== -1; // location may not be defined, e.g. when running from nodejs.
        },

        /**
         * Get source code from given URL if in the same domain.
         *
         * @param url {String} JS source URL
         * @return {Array} Array of source code lines
         */
        getSource: function(url) {
            // TODO reuse source from script tags?
            if (!(url in this.sourceCache)) {
                this.sourceCache[url] = this.ajax(url).split('\n');
            }
            return this.sourceCache[url];
        },

        guessAnonymousFunctions: function(stack) {
            for (var i = 0; i < stack.length; ++i) {
                var reStack = /\{anonymous\}\(.*\)@(.*)/,
                    reRef = /^(.*?)(?::(\d+))(?::(\d+))?(?: -- .+)?$/,
                    frame = stack[i], ref = reStack.exec(frame);

                if (ref) {
                    var m = reRef.exec(ref[1]);
                    if (m) { // If falsey, we did not get any file/line information
                        var file = m[1], lineno = m[2], charno = m[3] || 0;
                        if (file && this.isSameDomain(file) && lineno) {
                            var functionName = this.guessAnonymousFunction(file, lineno, charno);
                            stack[i] = frame.replace('{anonymous}', functionName);
                        }
                    }
                }
            }
            return stack;
        },

        guessAnonymousFunction: function(url, lineNo, charNo) {
            var ret;
            try {
                ret = this.findFunctionName(this.getSource(url), lineNo);
            } catch (e) {
                ret = 'getSource failed with url: ' + url + ', exception: ' + e.toString();
            }
            return ret;
        },

        findFunctionName: function(source, lineNo) {
            // FIXME findFunctionName fails for compressed source
            // (more than one function on the same line)
            // function {name}({args}) m[1]=name m[2]=args
            var reFunctionDeclaration = /function\s+([^(]*?)\s*\(([^)]*)\)/;
            // {name} = function ({args}) TODO args capture
            // /['"]?([0-9A-Za-z_]+)['"]?\s*[:=]\s*function(?:[^(]*)/
            var reFunctionExpression = /['"]?([$_A-Za-z][$_A-Za-z0-9]*)['"]?\s*[:=]\s*function\b/;
            // {name} = eval()
            var reFunctionEvaluation = /['"]?([$_A-Za-z][$_A-Za-z0-9]*)['"]?\s*[:=]\s*(?:eval|new Function)\b/;
            // Walk backwards in the source lines until we find
            // the line which matches one of the patterns above
            var code = "", line, maxLines = Math.min(lineNo, 20), m, commentPos;
            for (var i = 0; i < maxLines; ++i) {
                // lineNo is 1-based, source[] is 0-based
                line = source[lineNo - i - 1];
                commentPos = line.indexOf('//');
                if (commentPos >= 0) {
                    line = line.substr(0, commentPos);
                }
                // TODO check other types of comments? Commented code may lead to false positive
                if (line) {
                    code = line + code;
                    m = reFunctionExpression.exec(code);
                    if (m && m[1]) {
                        return m[1];
                    }
                    m = reFunctionDeclaration.exec(code);
                    if (m && m[1]) {
                        //return m[1] + "(" + (m[2] || "") + ")";
                        return m[1];
                    }
                    m = reFunctionEvaluation.exec(code);
                    if (m && m[1]) {
                        return m[1];
                    }
                }
            }
            return '(?)';
        }
    };

    return printStackTrace;
}));


/*!
* Bowser - a browser detector
* https://github.com/ded/bowser
* MIT License | (c) Dustin Diaz 2014
*/

var getBrowser = function() {
    /**
     * See useragents.js for examples of navigator.userAgent
     */
    var t = true

    function detect(ua) {
        function getFirstMatch(regex) {
            var match = ua.match(regex);
            return (match && match.length > 1 && match[1]) || '';
        }
        var iosdevice = getFirstMatch(/(ipod|iphone|ipad)/i).toLowerCase(),
            likeAndroid = /like android/i.test(ua),
            android = !likeAndroid && /android/i.test(ua),
            versionIdentifier = getFirstMatch(/version\/(\d+(\.\d+)?)/i),
            tablet = /tablet/i.test(ua),
            mobile = !tablet && /[^-]mobi/i.test(ua),
            result
        if (/opera|opr/i.test(ua)) {
            result = {
                name: 'Opera',
                opera: t,
                version: versionIdentifier || getFirstMatch(/(?:opera|opr)[\s\/](\d+(\.\d+)?)/i)
            }
        } else if (/windows phone/i.test(ua)) {
            result = {
                name: 'Windows Phone',
                windowsphone: t,
                msie: t,
                version: getFirstMatch(/iemobile\/(\d+(\.\d+)?)/i)
            }
        } else if (/msie|trident/i.test(ua)) {
            result = {
                name: 'Internet Explorer',
                msie: t,
                version: getFirstMatch(/(?:msie |rv:)(\d+(\.\d+)?)/i)
            }
        } else if (/chrome|crios|crmo/i.test(ua)) {
            result = {
                name: 'Chrome',
                chrome: t,
                version: getFirstMatch(/(?:chrome|crios|crmo)\/(\d+(\.\d+)?)/i)
            }
        } else if (iosdevice) {
            result = {
                name: iosdevice == 'iphone' ? 'iPhone' : iosdevice == 'ipad' ? 'iPad' : 'iPod'
            }
            // WTF: version is not part of user agent in web apps
            if (versionIdentifier) {
                result.version = versionIdentifier
            }
        } else if (/sailfish/i.test(ua)) {
            result = {
                name: 'Sailfish',
                sailfish: t,
                version: getFirstMatch(/sailfish\s?browser\/(\d+(\.\d+)?)/i)
            }
        } else if (/seamonkey\//i.test(ua)) {
            result = {
                name: 'SeaMonkey',
                seamonkey: t,
                version: getFirstMatch(/seamonkey\/(\d+(\.\d+)?)/i)
            }
        } else if (/firefox|iceweasel/i.test(ua)) {
            result = {
                name: 'Firefox',
                firefox: t,
                version: getFirstMatch(/(?:firefox|iceweasel)[ \/](\d+(\.\d+)?)/i)
            }
            if (/\((mobile|tablet);[^\)]*rv:[\d\.]+\)/i.test(ua)) {
                result.firefoxos = t
            }
        } else if (/silk/i.test(ua)) {
            result = {
                name: 'Amazon Silk',
                silk: t,
                version: getFirstMatch(/silk\/(\d+(\.\d+)?)/i)
            }
        } else if (android) {
            result = {
                name: 'Android',
                version: versionIdentifier
            }
        } else if (/phantom/i.test(ua)) {
            result = {
                name: 'PhantomJS',
                phantom: t,
                version: getFirstMatch(/phantomjs\/(\d+(\.\d+)?)/i)
            }
        } else if (/blackberry|\bbb\d+/i.test(ua) || /rim\stablet/i.test(ua)) {
            result = {
                name: 'BlackBerry',
                blackberry: t,
                version: versionIdentifier || getFirstMatch(/blackberry[\d]+\/(\d+(\.\d+)?)/i)
            }
        } else if (/(web|hpw)os/i.test(ua)) {
            result = {
                name: 'WebOS',
                webos: t,
                version: versionIdentifier || getFirstMatch(/w(?:eb)?osbrowser\/(\d+(\.\d+)?)/i)
            };
            /touchpad\//i.test(ua) && (result.touchpad = t)
        } else if (/bada/i.test(ua)) {
            result = {
                name: 'Bada',
                bada: t,
                version: getFirstMatch(/dolfin\/(\d+(\.\d+)?)/i)
            };
        } else if (/tizen/i.test(ua)) {
            result = {
                name: 'Tizen',
                tizen: t,
                version: getFirstMatch(/(?:tizen\s?)?browser\/(\d+(\.\d+)?)/i) || versionIdentifier
            };
        } else if (/safari/i.test(ua)) {
            result = {
                name: 'Safari',
                safari: t,
                version: versionIdentifier
            }
        } else result = {}
            // set webkit or gecko flag for browsers based on these engines
        if (/(apple)?webkit/i.test(ua)) {
            result.name = result.name || "Webkit"
            result.webkit = t
            if (!result.version && versionIdentifier) {
                result.version = versionIdentifier
            }
        } else if (!result.opera && /gecko\//i.test(ua)) {
            result.name = result.name || "Gecko"
            result.gecko = t
            result.version = result.version || getFirstMatch(/gecko\/(\d+(\.\d+)?)/i)
        }
        // set OS flags for platforms that have multiple browsers
        if (android || result.silk) {
            result.android = t
        } else if (iosdevice) {
            result[iosdevice] = t
            result.ios = t
        }
        // OS version extraction
        var osVersion = '';
        if (iosdevice) {
            osVersion = getFirstMatch(/os (\d+([_\s]\d+)*) like mac os x/i);
            osVersion = osVersion.replace(/[_\s]/g, '.');
        } else if (android) {
            osVersion = getFirstMatch(/android[ \/-](\d+(\.\d+)*)/i);
        } else if (result.windowsphone) {
            osVersion = getFirstMatch(/windows phone (?:os)?\s?(\d+(\.\d+)*)/i);
        } else if (result.webos) {
            osVersion = getFirstMatch(/(?:web|hpw)os\/(\d+(\.\d+)*)/i);
        } else if (result.blackberry) {
            osVersion = getFirstMatch(/rim\stablet\sos\s(\d+(\.\d+)*)/i);
        } else if (result.bada) {
            osVersion = getFirstMatch(/bada\/(\d+(\.\d+)*)/i);
        } else if (result.tizen) {
            osVersion = getFirstMatch(/tizen[\/\s](\d+(\.\d+)*)/i);
        }
        if (osVersion) {
            result.osversion = osVersion;
        }
        // device type extraction
        var osMajorVersion = osVersion.split('.')[0];
        if (tablet || iosdevice == 'ipad' || (android && (osMajorVersion == 3 || (osMajorVersion == 4 && !mobile))) || result.silk) {
            result.tablet = t
        } else if (mobile || iosdevice == 'iphone' || iosdevice == 'ipod' || android || result.blackberry || result.webos || result.bada) {
            result.mobile = t
        }
        // Graded Browser Support
        // http://developer.yahoo.com/yui/articles/gbs
        if ((result.msie && result.version >= 10) ||
            (result.chrome && result.version >= 20) ||
            (result.firefox && result.version >= 20.0) ||
            (result.safari && result.version >= 6) ||
            (result.opera && result.version >= 10.0) ||
            (result.ios && result.osversion && result.osversion.split(".")[0] >= 6)
        ) {
            result.a = t;
        } else if ((result.msie && result.version < 10) ||
            (result.chrome && result.version < 20) ||
            (result.firefox && result.version < 20.0) ||
            (result.safari && result.version < 6) ||
            (result.opera && result.version < 10.0) ||
            (result.ios && result.osversion && result.osversion.split(".")[0] < 6)
        ) {
            result.c = t
        } else result.x = t
        return result
    }
    var bowser = detect(typeof navigator !== 'undefined' ? navigator.userAgent : '')
        /*
         * Set our detect method to the main bowser object so we can
         * reuse it to test other user agents.
         * This is needed to implement future tests.
         */
    bowser._detect = detect;
    return bowser
}

/*
 * Date Format 1.2.3
 * (c) 2007-2009 Steven Levithan <stevenlevithan.com>
 * MIT license
 *
 * Includes enhancements by Scott Trenda <scott.trenda.net>
 * and Kris Kowal <cixar.com/~kris.kowal/>
 *
 * Accepts a date, a mask, or a date and a mask.
 * Returns a formatted version of the given date.
 * The date defaults to the current date/time.
 * The mask defaults to dateFormat.masks.default.
 */

var dateFormat = function () {
    var token = /d{1,4}|m{1,4}|yy(?:yy)?|([HhMsTt])\1?|[LloSZ]|"[^"]*"|'[^']*'/g,
        timezone = /\b(?:[PMCEA][SDP]T|(?:Pacific|Mountain|Central|Eastern|Atlantic) (?:Standard|Daylight|Prevailing) Time|(?:GMT|UTC)(?:[-+]\d{4})?)\b/g,
        timezoneClip = /[^-+\dA-Z]/g,
        pad = function (val, len) {
            val = String(val);
            len = len || 2;
            while (val.length < len) val = "0" + val;
            return val;
        };

    // Regexes and supporting functions are cached through closure
    return function (date, mask, utc) {
        var dF = dateFormat;

        // You can't provide utc if you skip other args (use the "UTC:" mask prefix)
        if (arguments.length == 1 && Object.prototype.toString.call(date) == "[object String]" && !/\d/.test(date)) {
            mask = date;
            date = undefined;
        }

        // Passing date through Date applies Date.parse, if necessary
        date = date ? new Date(date) : new Date;
        if (isNaN(date)) throw SyntaxError("invalid date");

        mask = String(dF.masks[mask] || mask || dF.masks["default"]);

        // Allow setting the utc argument via the mask
        if (mask.slice(0, 4) == "UTC:") {
            mask = mask.slice(4);
            utc = true;
        }

        var _ = utc ? "getUTC" : "get",
            d = date[_ + "Date"](),
            D = date[_ + "Day"](),
            m = date[_ + "Month"](),
            y = date[_ + "FullYear"](),
            H = date[_ + "Hours"](),
            M = date[_ + "Minutes"](),
            s = date[_ + "Seconds"](),
            L = date[_ + "Milliseconds"](),
            o = utc ? 0 : date.getTimezoneOffset(),
            flags = {
                d:    d,
                dd:   pad(d),
                ddd:  dF.i18n.dayNames[D],
                dddd: dF.i18n.dayNames[D + 7],
                m:    m + 1,
                mm:   pad(m + 1),
                mmm:  dF.i18n.monthNames[m],
                mmmm: dF.i18n.monthNames[m + 12],
                yy:   String(y).slice(2),
                yyyy: y,
                h:    H % 12 || 12,
                hh:   pad(H % 12 || 12),
                H:    H,
                HH:   pad(H),
                M:    M,
                MM:   pad(M),
                s:    s,
                ss:   pad(s),
                l:    pad(L, 3),
                L:    pad(L > 99 ? Math.round(L / 10) : L),
                t:    H < 12 ? "a"  : "p",
                tt:   H < 12 ? "am" : "pm",
                T:    H < 12 ? "A"  : "P",
                TT:   H < 12 ? "AM" : "PM",
                Z:    utc ? "UTC" : (String(date).match(timezone) || [""]).pop().replace(timezoneClip, ""),
                o:    (o > 0 ? "-" : "+") + pad(Math.floor(Math.abs(o) / 60) * 100 + Math.abs(o) % 60, 4),
                S:    ["th", "st", "nd", "rd"][d % 10 > 3 ? 0 : (d % 100 - d % 10 != 10) * d % 10]
            };

        return mask.replace(token, function ($0) {
            return $0 in flags ? flags[$0] : $0.slice(1, $0.length - 1);
        });
    };
}();

// Some common format strings
dateFormat.masks = {
    "default":      "ddd mmm dd yyyy HH:MM:ss",
    shortDate:      "m/d/yy",
    mediumDate:     "mmm d, yyyy",
    longDate:       "mmmm d, yyyy",
    fullDate:       "dddd, mmmm d, yyyy",
    shortTime:      "h:MM TT",
    mediumTime:     "h:MM:ss TT",
    longTime:       "h:MM:ss TT Z",
    isoDate:        "yyyy-mm-dd",
    isoTime:        "HH:MM:ss",
    isoDateTime:    "yyyy-mm-dd'T'HH:MM:ss",
    isoUtcDateTime: "UTC:yyyy-mm-dd'T'HH:MM:ss'Z'"
};

// Internationalization strings
dateFormat.i18n = {
    dayNames: [
        "Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat",
        "Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"
    ],
    monthNames: [
        "Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
        "January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"
    ]
};

// For convenience...
Date.prototype.format = function (mask, utc) {
    return dateFormat(this, mask, utc);
};
var urqa = function( ){

	/**
	 * Enviroment Object
	 *
	 * require method
	 * 	.send_e( error_text, { errname:string, rank:int ( -1 ~ 4 ) , tag:string } )
	 * 	.send_l( log_text, trace_text , { errname:string, rank:int ( -1 ~ 4 ), tag:string } )
	 * 	
	 */
	var env_obj = null;

	var consoleLogObj = null;


	var ret = {};

	/**
	 * Inittialize value
	 * 
	 * @param {[type]} init_value [description]
	 *        .api_key		= api key ( common )
	 *        .app_version 	= app version ( common )
	 *        .wrap_url		= wrap url ( web )
	 *        .console_debug_enable = ( web )
	 */
	ret.Init = function( init_value ){
		env_obj.Init( init_value );

		if(init_value.console_debug_enable){
			consoleLogObj.enable( true );
		}
	}

	/**
	 * set Enviroment Object
	 */
	ret.setEnvObj = function( _env_obj ){
		env_obj = _env_obj;
		// check ~!
	};


	/**
	 * console obj 
	 *
	 * log memoryer
	 * 
	 * @param {[type]} _console_obj [description]
	 */
	ret.setConsoleLogObj = function( _console_obj ){
		consoleLogObj = _console_obj;
	};


	/**
	 * thorow exception 
	 * 
	 * @param  {error}  error            exception error object
	 * @param  {object} additional_info  { errname:string, rank:int, tag:string }
	 * @return {none}
	 */
	ret.send_e = function( error, additional_info ){

		if( null == env_obj){
			alert( "Environment object is null" );
			return;
		}

		// first set default additional_info
		additional_info = process_additional_info( additional_info );

		// parse error
		var trace = printStackTrace({e: error});
		var trace_javatype = converToJavaTypeException( trace );

		// send to environment obj
		return env_obj.send_e( trace_javatype, additional_info );
	};

	/**
	 * send log to urqa
	 * 
	 * @param  {String} log_text        [description]
	 * @param  {object} additional_info [description]
	 * @return {none}                 
	 */
	ret.send_l = function( log_text, additional_info ){

		if( null == env_obj){
			alert( "Environment object is null" );
			return;
		}

		// first set default additional_info
		additional_info = process_additional_info( additional_info );		

		// Make and parse error
		var err = new Error();
		var trace = printStackTrace({e: err});
		var trace_javatype = converToJavaTypeException( trace );

		// send to environment obj
		return env_obj.send_l( log_text, trace_javatype, additional_info );

	}


	/**
	 * 
	 * setting additional_info default value
	 * 
	 * @param  {[type]} additional_info [description]
	 * @return {[type]}                 [description]
	 */
	function process_additional_info( additional_info ){
		
		additional_info = additional_info || {};
		//additional_info.errname = additional_info.errname || 'untitle';
		additional_info.rank = additional_info.rank || 2;
		additional_info.tag = additional_info.tag || '';

		// add logs
		if( consoleLogObj ) {
			additional_info.logs = consoleLogObj.getLogs();
		}else{
			additional_info.logs = [];
		}

		return additional_info;
	}


	/**
	 * 
	 * change javascript error String to java type Error String
	 * 
	 * @param  {[type]} trace [description]
	 * @return {[type]}       [description]
	 */
	function converToJavaTypeException( trace ){
		var ret = trace.join('\n\t');

		try{

			var msg = "";
			for( var i in trace ){
				var tmp = trace[i].split('@');
				tmp[0] = tmp[0].replace( '()', '' );
				msg = msg + '\tat ' + tmp[0] + '(' + tmp[1] + ')' + '\n';
			}

			return msg;
		}catch(err){}

		return ret;
	} 


	return ret;

}();
(function(){

	var before_enabled 	= false;
	var maxlogcnt 		= 5;
	var ret = {};
	var recent_logs = [];
	var before_console = {
		log :function(){},
		warn : function() {},
		error : function() {},
		info : function(){}
	};

	/**
	 * Log Pushing
	 * @param  {[type]} type [description]
	 * @param  {[type]} msg  [description]
	 * @return {[type]}      [description]
	 */
	var push_log = function( type, _arguments ){

		var args = Array.prototype.slice.call(_arguments);

		// log type
		// 		datetime	type	msg
		var now = new Date();
		var datetime = now.format("yyyy-mm-dd HH:MM:ss");

		var msg = args.join(', ').replace(/[\r|\n]/g, ' ');

		if( msg.length > 100 ){
			msg = msg.substring( 0, 100 );	// cut msg one line maximum is 100 
		}

		var log = datetime + "\t" + type + "\t" + msg;

		recent_logs.push( log );

		if( recent_logs.length > maxlogcnt ){
			recent_logs.splice( 0, recent_logs.length - maxlogcnt );
		}

	};

	ret.log = function( ){

		push_log( "log", arguments );
		//Function.prototype.apply.call( before_console.log, console, [arguments.toString()] );
		Function.prototype.apply.call( before_console.log, console, arguments );
	};

	ret.warn = function( ){
		push_log( "warn", arguments );
		Function.prototype.apply.call( before_console.warn, console, arguments );
	};
	
	ret.error = function( ){
		push_log( "error", arguments );
		Function.prototype.apply.call( before_console.error, console, arguments );
	};

	ret.info = function(){
		push_log( "info", arguments );
		Function.prototype.apply.call( before_console.info, console, arguments );
	};

	/**
	 * get recently logs
	 * @return {[type]} [description]
	 */
	ret.getLogs = function(){
		return recent_logs;
	}


	/**
	 * Copy log object
	 * @param  {[type]} src [description]
	 * @param  {[type]} dst [description]
	 * @return {[type]}     [description]
	 */
	function logcopyer( src, dst ){
		dst.log = src.log;
		dst.warn = src.warn;
		dst.error = src.error;
		dst.info = src.info;
	}

	// initialize
	ret.enable = function( enabled ){

		console.loglog = console.log;

		if( !enabled && before_enabled ){

			if( console ){
				logcopyer( before_console, console );
			}
			else if( window.console ){
				logcopyer( before_console, window.console );
			}

		}else{

			if( console ){
				logcopyer( console, before_console );
				logcopyer( ret, console );
			}
			else if( window.console ){
				logcopyer( window.console, before_console );
				logcopyer( ret, window.console );
			}else{
				// ie or not supported browser mode
				console = ret;
				window.console = ret;
			}

		}

		before_enabled = enabled;
	}

	urqa.setConsoleLogObj( ret );	


	// test code 
	//ret.init();

	//console.log("test", 'aaaa', 1234 );
	//console.warn("test", 'aaaa', 1234 );
	//console.error("test", 'aaaa', 1234 );
	//console.info("test", 'aaaa', 1234 );

})();

/**

 비 동기 방식으로 처리 되므로, 큐잉 로직이 들어가야 할 듯 ~~!!
 브라우져 종료도 인지 해야 하고... ^^;;
 쿠키를 사용해서 세션 유지도 확인 해야 하고 ~~ 할일이 많구만 ~~!
*/
var urqa_web = function( ){
	
	var URQA_URL = "http://ur-qa.com";
	//var URQA_URL = "http://www.urqa.io";
	//var URQA_URL = "http://125.209.194.101:49999";
	var api_key = "";
	var version= "";
	var session_key = "";
	var wrapping_server = null;
	var browser = null;
	var l_lang = 'en';
	var country = 'US';

	var ret = {};

	/**
	 *
	 * Browser Screen size getter~!
	 * @return  return brwoser.x
	 */
	var getBrowserSize = function(){
		var b = {};

		try{
			var w = window,
			    d = document,
			    e = d.documentElement,
			    g = d.getElementsByTagName('body')[0],
			    x = w.innerWidth || e.clientWidth || g.clientWidth,
			    y = w.innerHeight|| e.clientHeight|| g.clientHeight;

			b.x = x;
			b.y = y;
		}catch( err ){
			b.x = 0;
			b.y = 0;
		}

		return b;
	};

	/**
	 * init
	 * @param {[type]} init_value [description]
	 */
	ret.Init = function( init_value ){
		api_key 		= init_value.api_key;
		version 		= init_value.app_version;
		wrapping_server = init_value.wrap_url;

		// Load Browser Information ( add event )
		// 	V screen size
		// 	V Browser version
		// 	V locale
		// 	etc...
		browser = getBrowser();

		// get locale
		if (navigator.userLanguage) // Explorer
			l_lang = navigator.userLanguage;
		else if (navigator.language) // FF
			l_lang = navigator.language;
		else
		    l_lang = "en-US";

		if(l_lang.length > 5 ){
			country = l_lang.substring( 3 );
		}
		
		// add global event
		var before_onerror = window.onerror;
		window.onerror = function(exception, url, line, column, errorobj) {
			urqa.send_e( errorobj, { errname: "Global Exception" }  );

			try{
				if( undefined != before_onerror && null == before_onerror ){
					return before_onerror( exception, url, line, column, errobj );
				}
			}catch(err){}

		    return false;
		};

	}


	/**
	 * thorow exception 
	 * 
	 * @param  {error}  error            exception error object
	 * @param  {object} additional_info  { errname:string, rank:int, tag:string }
	 * @return {none}
	 */
	ret.send_e = function( error, additional_info ){

		/*
		{ errname:string, rank:int, tag:string }
		 */

		send_exception( error.replace(/\n/g, '\\n').replace(/\t/g, '\\t' ),
							additional_info.errname,
							additional_info.rank,
							additional_info.tag,
							additional_info.logs
							 );

	};

	/**
	 * send log to urqa
	 * 
	 * @param  {String} log_text        [description]
	 * @param  {object} additional_info [description]
	 * @return {none}                 
	 */
	ret.send_l = function( log_text, additional_info ){

		
	}

	var callUrQA = function( uri, data ){

		if( null == wrapping_server ){
			alert( "Not Support Direct Connect.\nPlease use a wrapping server.");
		}else{

			$.ajax({
			    url : wrapping_server + "?callback=?",
			    data: { uri:uri ,data:data },
			    dataType : "jsonp",
			    jsonp : "callback",
			    success: function(data) {
			        if(data != null){
			        	if(uri == URQA_URL + "/urqa/client/connect" ){
			        		session_key = jQuery.parseJSON(data).idsession;
			        		//console.log( "it's a get datasession " +  );
			        	}
			            //console.log( data );
			        }
			    }
			});

		}

	};


	/**
	 * [send_exception description]
	 * @param  {[type]} err       [description]
	 * @param  {[type]} errorname [description]
	 * @param  {[type]} rank      [description]
	 * @param  {[type]} tag       [description]
	 * @param  {[type]} logs      Array[String]
	 * @return {[type]}           [description]
	 */
	function send_exception( err, errorname, rank, tag, logs ){

		// value init
		errorname = errorname || err;
		rank = rank || 2;
		tag = tag || '';

		var b = getBrowserSize();
	
		var now = new Date();
		var now_date_string = now.format("yyyy-mm-dd HH:MM:ss");
		var utc_now = new Date(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate(),  now.getUTCHours(), now.getUTCMinutes(), now.getUTCSeconds(), now.getUTCMilliseconds());

		var url = URQA_URL + "/urqa/client/send/exception";
		var reqobj = '{' +
						'"exception": { ' +
							'"sdkversion": "0.95", '+  	// 나중에 브라우져 버전? 
							'"locale": "'+l_lang+'", ' +
							'"tag": "'+tag+'", '+
							'"rank": '+rank+', '+
							'"callstack": "' + err +'", '+
							'"apikey": "'+api_key+'", '+
							'"datetime": "'+now_date_string+'", '+
							'"device": "'+browser.name +' ' +browser.version +'", '+
							'"country": "'+country+'", '+ //지역
							'"errorname": "' + errorname + '", '+
							'"errorclassname": "'+errorname+'", '+
							'"linenum": 0, '+
							'"appversion": "' + version + '",  '+		// Android Application App Version
							'"osversion": "'+browser.version+'", '+ 	// 나중엔 브라우져?? 버전
							'"gpson": 0, '+ // GPS on(value 1), off(value 0) 
							'"wifion": 1, '+ // WiFi on(value 1), off(value 0) 
							'"mobileon": 0, '+ // MobileNetwor(3G) on(value 1), off(value 0) 
							'"scrwidth": '+b.x+', '+ 
							'"scrheight": '+b.y+', '+ 
							'"batterylevel": 50, '+
							'"availsdcard": 0, '+
							'"rooted": 0, '+
							'"appmemtotal": 0, '+ // iOS Memory total
							'"appmemfree": 0, '+ // iOS Memory free
							'"appmemmax": 0, '+ // iOS Memory usage
							'"kernelversion": "'+browser.version+'", '+ 
							'"xdpi": '+b.x+', '+ 
							'"ydpi": '+b.y+', '+ 
							'"scrorientation": 0, '+ 
							'"sysmemlow": 0, '+ 
							'"lastactivity": "it.is.browser", ' +
							'"eventpaths": [] '+
						'},' +
						'"console_log" : { '+
							'"data" : "'+ logs.join( '\\n' ).replace(/[\t]/g, '\\t').replace(/['"]/g, "") +'" '+ // Android Console Log
						'}, ' + 
						'"instance": { ' +
        					'"id": ' + utc_now.getTime() + ' ' +
    					'},' +
    					'"version": "0.95" '+
					 '}';

		//console.loglog( reqobj );

		callUrQA( url, reqobj );
	};

	return ret;

};

// Add to Urqa
urqa.setEnvObj( urqa_web() );