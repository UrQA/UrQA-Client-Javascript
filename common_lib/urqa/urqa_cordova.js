// require   -   js/stacktrace.js 

var createUrqa_cordova = function(){

	var ret_obj = new Object();

	ret_obj.exec = cordova.require('cordova/exec'); 


	/**
	 * thorow exception 
	 * 
	 * @param  {error}  error            exception error object
	 * @param  {object} additional_info  { errname:string, rank:int, tag:string }
	 * @return {none}
	 */
	ret_obj.send_e = function( error, additional_info ){

		this.exec( 
	        function(result){ 
	        	//writelog(result);
	        }, 
	        function(error){ 
	        	//writelog("error");
	        }, 
	        "UrqaPlugin", "exception", [ 'Exception', 
	        								  error, 
	        								  additional_info.errname,
	        								  additional_info.rank,
	        								  additional_info.tag ] );
	};

	/**
	 * send log to urqa
	 * 
	 * @param  {String} log_text        [description]
	 * @param  {object} trace 			[description]
	 * @param  {object} additional_info [description]
	 * @return {none}                 
	 */
	ret_obj.send_l = function( log_text, trace, additional_info ){

		this.exec( 
	        function(result){ 
	        	//writelog(result);
	        }, 
	        function(error){ 
	        	//writelog("error");
	        }, 
	        "UrqaPlugin", "exception", [ log_text, 
	        								  trace, 
	        								  additional_info.errname,
	        								  additional_info.rank,
	        								  additional_info.tag ] );

	}


	return ret_obj;

};

// add to urqa object
urqa.setEnvObj( createUrqa_cordova() );