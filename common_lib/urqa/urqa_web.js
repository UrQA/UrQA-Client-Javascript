
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
			            console.log( data );
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

		console.loglog( reqobj );

		callUrQA( url, reqobj );
	};

	return ret;

};

// Add to Urqa
urqa.setEnvObj( urqa_web() );