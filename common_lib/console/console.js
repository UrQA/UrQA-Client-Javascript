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