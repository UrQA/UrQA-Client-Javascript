UrQA Client Javascript 
===================


# folder Descript

    common-lib
        : Common javascript lib

    cordova
        : Cordova UrQA Client Plugin

    node_urqa_jsonp_wrapper
        : UrQA Server Wrapper ( support jsonp, nodejs )

    release_app
    	: build script ( nodejs )

    release
    	: release result folder


# how to build

	1) install node and npm
	2) run build.sh
	3) check release folder

# javascript Function ( common )


	 * @param {[type]} init_value [description]
	 
## urqa.Init({ Json Object });
	api_key			= api key ( common )
 	app_version 	= app version ( common )
 	wrap_url		= wrap url ( web )

## urqa.send_e( error_text, { errname:string, rank:int ( -1 ~ 4 ) , tag:string } )

	exception send function

## urqa.send_l( log_text, trace_text , { errname:string, rank:int ( -1 ~ 4 ), tag:string } )

	log send function


# sample link

	cordova
		: cordova

	web
		: node_urqa_jsonp_wrapper/public/index.html


# use open source

browser.js 		: https://github.com/ded/bowser
Stacktrace.js 	: http://stacktracejs.com/
