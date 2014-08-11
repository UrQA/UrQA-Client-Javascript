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


	var ret = {};

	/**
	 * Inittialize value
	 * 
	 * @param {[type]} init_value [description]
	 *        .api_key		= api key ( common )
	 *        .app_version 	= app version ( common )
	 *        .wrap_url		= wrap url ( web )
	 */
	ret.Init = function( init_value ){
		env_obj.Init( init_value );
	}

	/**
	 * set Enviroment Object
	 */
	ret.setEnvObj = function( _env_obj ){
		env_obj = _env_obj;
		// check ~!
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