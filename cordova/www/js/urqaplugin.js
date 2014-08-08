// require   -   js/stacktrace.js 

var createUrqa = function(){

	var ret_obj = new Object();

	ret_obj.exec = cordova.require('cordova/exec'); 

	var converToJavaTypeException = function( trace ){
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

	ret_obj.send_error = function( err ){

		var trace = printStackTrace({e: err});

		this.exec( 
	        function(result){ 
	        	//writelog(result);
	        }, 
	        function(error){ 
	        	//writelog("error");
	        }, 
	        "UrqaPlugin", "test_exception", ['message', converToJavaTypeException( trace ) ] );

	};

	ret_obj.send_msg = function( message, err ){
		if( null == err ){
			err = new Error();
		}

		var trace = printStackTrace({e: err});

		this.exec( 
	        function(result){ 
	        	
	        }, 
	        function(error){ 
	        	
	        }, 
	        "UrqaPlugin", "test_exception", [ message, converToJavaTypeException( trace ) ] );

	}

	return ret_obj;

};