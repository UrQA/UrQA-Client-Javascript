/**
 * Console Wrapper Create function
 */
var console_wrapper_create = function(){

	var before_enabled 	= false;
	var maxlogcnt 		= 5;
	var recent_logs = [];
	var before_console = {
		log :function(){},
		warn : function() {},
		error : function() {},
		info : function(){}
	};


	/**
	 * Console Log Wrapping Object
	 * 
	 * @constructor
	 * @type {Object}
	 */
	var ConsoleLogWrapper = {};

	/**
	 * Log Pushing
	 * @param  {string} type log type ( wran, info, log, err )
	 * @param  {string} msg  log message
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

	/**
	 * log 
	 */
	ConsoleLogWrapper.log = function( ){

		push_log( "log", arguments );
		//Function.prototype.apply.call( before_console.log, console, [arguments.toString()] );
		Function.prototype.apply.call( before_console.log, console, arguments );
	};


	/**
	 * warn 
	 */
	ConsoleLogWrapper.warn = function( ){
		push_log( "warn", arguments );
		Function.prototype.apply.call( before_console.warn, console, arguments );
	};
	
	/**
	 * error
	 */
	ConsoleLogWrapper.error = function( ){
		push_log( "error", arguments );
		Function.prototype.apply.call( before_console.error, console, arguments );
	};

	/**
	 * info
	 */
	ConsoleLogWrapper.info = function(){
		push_log( "info", arguments );
		Function.prototype.apply.call( before_console.info, console, arguments );
	};

	/**
	 * get recently logs
	 * @return {string array} stored logs
	 */
	ConsoleLogWrapper.getLogs = function(){
		return recent_logs;
	}


	/**
	 * Copy log object
	 * @param  {object} src console or console wrapper
	 * @param  {[object]} dst console wrapper
	 */
	function logcopyer( src, dst ){
		dst.log = src.log;
		dst.warn = src.warn;
		dst.error = src.error;
		dst.info = src.info;
	}

	/**
	 * enable or disable function 
	 * 
	 * @param  {boolean} enabled true : enable, false : disable
	 */
	ConsoleLogWrapper.enable = function( enabled ){

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

};
console_wrapper_create();