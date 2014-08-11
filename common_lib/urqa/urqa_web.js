
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

	var ret = {};

	/**
	 * init
	 * @param {[type]} init_value [description]
	 */
	ret.Init = function( init_value ){
		api_key 		= init_value.api_key;
		version 		= init_value.app_version;
		wrapping_server = init_value.wrap_url;

		// Load Browser Information ( add event )
		// 	screen size
		// 	Browser version
		// 	etc...
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
							additional_info.tag
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
			            console.log( data );
			        }
			    }
			});

		}

	};


	// Exception 전송
	function send_exception( err, errorname, rank, tag ){

		// value init
		errorname = errorname || err;
		rank = rank || 2;
		tag = tag || '';
	
		var now = new Date();
		var now_date_string = now.format("yyyy-mm-dd HH:MM:ss");
		var utc_now = new Date(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate(),  now.getUTCHours(), now.getUTCMinutes(), now.getUTCSeconds(), now.getUTCMilliseconds());

		var url = URQA_URL + "/urqa/client/send/exception";
		var reqobj = '{' +
						'"exception": { ' +
							'"sdkversion": "0.95", '+  	// 나중에 브라우져 버전? 
							'"locale": "English", ' +
							'"tag": "'+tag+'", '+
							'"rank": '+rank+', '+
							'"callstack": "' + err +'", '+
							'"apikey": "'+api_key+'", '+
							'"datetime": "'+now_date_string+'", '+
							'"device": "Android SDK built for x86", '+
							'"country": "US", '+ //지역
							'"errorname": "' + errorname + '", '+
							'"errorclassname": "unknown", '+
							'"linenum": 0, '+
							'"appversion": "' + version + '",  '+		// Android Application App Version
							'"osversion": "L", '+ 	// 나중엔 브라우져?? 버전
							'"gpson": 0, '+ // GPS on(value 1), off(value 0) 
							'"wifion": 1, '+ // WiFi on(value 1), off(value 0) 
							'"mobileon": 0, '+ // MobileNetwor(3G) on(value 1), off(value 0) 
							'"scrwidth": 320, '+ 
							'"scrheight": 432, '+ 
							'"batterylevel": 50, '+
							'"availsdcard": 0, '+
							'"rooted": 0, '+
							'"appmemtotal": 3, '+ // iOS Memory total
							'"appmemfree": 47, '+ // iOS Memory free
							'"appmemmax": 48, '+ // iOS Memory usage
							'"kernelversion": "3.4.0+", '+ 
							'"xdpi": 160, '+ 
							'"ydpi": 160, '+ 
							'"scrorientation": 0, '+ 
							'"sysmemlow": 0, '+ 
							'"lastactivity": "com.netand.hiauth.mobileotpv2.LogoActivity", ' +
							'"eventpaths": [] '+
						'},' +
						'"console_log" : { '+
							'"data" : "This is Test Message" '+ // Android Console Log
						'}, ' + 
						'"instance": { ' +
        					'"id": ' + utc_now.getTime() + ' ' +
    					'},' +
    					'"version": "0.95" '+
					 '}';

		callUrQA( url, reqobj );
	};

	return ret;

};

// Add to Urqa
urqa.setEnvObj( urqa_web() );