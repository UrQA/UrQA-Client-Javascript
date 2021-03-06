/**
 *
 * create cordova environment object
 * 
 * @return {object} cordova environment object
 */
var createUrqa_cordova = function(){

	/**
	 * cordova_environment_object
	 *
	 * @constructor
	 * @type {Object}
	 */
	var cordova_environment_obj = new Object();

	ret_obj.exec = cordova.require('cordova/exec'); 

	/**
	 * Initialize cordova environment object 
	 * 
	 * @param {object} init_value json object
	 */
	cordova_environment_obj.Init = function( init_value ){

		// add global event
		var before_onerror = window.onerror;
		window.onerror = function(exception, url, line, column, errorobj) {

    		urqa.send_e( exception, { errname: "" + errorobj }  );

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
	cordova_environment_obj.send_e = function( error, additional_info ){

		this.exec( 
	        function(result){ 
	        	//writelog(result);
	        }, 
	        function(error){ 
	        	//writelog("error");
	        }, 
	        "UrqaPlugin", "exception", [  additional_info.errname, 
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
	cordova_environment_obj.send_l = function( log_text, trace, additional_info ){

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