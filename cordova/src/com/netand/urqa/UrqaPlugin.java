package com.netand.urqa;

import org.apache.cordova.CordovaPlugin;
import org.apache.cordova.PluginResult;
import org.apache.cordova.CallbackContext;
import org.json.JSONArray;
import org.json.JSONException;
import org.json.JSONObject;

import com.urqa.clientinterface.*;
import com.urqa.rank.*;

import org.apache.cordova.*;


// cordova plugin 구조
//// https://github.com/don/cordova-plugin-hello
//// http://www.plotprojects.com/developing-a-cordova-phonegap-plugin-for-android/

// javascript tracing function 부분 라이브러리
////  https://github.com/ebobby/tracing.js
////  https://github.com/stacktracejs/stacktrace.js

// Android urqa 라이브러리
//// https://github.com/sseo0317/urqa-library-android

// javascript 의 Error 객체에서 Call Stack을 받아서, 자체 Exception을 작성 하고, 그 객체를 send 하는 방식으로 하는건?
// 그래서 javascript 단에서 try{}catch(e){ var ex = new Error(e); ... };  
// 이런식으로 하면 javascript 어느 부분에서 에러가 났는지 URQA를 통해서 받아 볼 수 있겟지?
// 이걸 git hub에 올리자.

// V Step 1.  Exception 을 자체 개발 하여, 원하는 형태로 Exception을 던져서 잘 가는지 확인
// Step 2.  javascript  에서  Exception을 발생 시키고, Error 객체를 만들어서 던지기 (  그냥 catch 의 e 를 받아 봐서 확인 해봅시다 !! )

public class UrqaPlugin extends CordovaPlugin {

	public static void UrqaInit( CordovaActivity activity, String apikey ){
		URQAController.InitializeAndStartSession( activity.getApplicationContext(), apikey );
	}

	/**
	 * [convertToRank description]
	 * @param  rank_str [description]
	 * @return          [description]
	 */
	private ErrorRank convertToRank( String rank_str ){

		int rank = Integer.parseInt( rank_str );
	
		switch( rank ){
			case 0:
				return ErrorRank.Unhandle;
			case 1:
				return ErrorRank.Native;
			case 2:
				return ErrorRank.Critical;
			case 3:
				return ErrorRank.Major;
			default:
				return ErrorRank.Nothing;
		}
	}

	public boolean execute(String action, JSONArray args, CallbackContext callbackContext) throws JSONException {

		if( action.equals("exception") ){

			String title = args.getString(0);
			String stacktrace = args.getString(1);

			String errname 		= args.getString(2);
			String rank_str 	= args.getString(3);
			String tag 			= args.getString(4);
			int    rank 		= 2;

			if(errname == null ) 		errname = "";
			if( rank_str == null ) 		rank_str = "2";
			if(tag == null )			tag = "";
			
			URQAController.SendException(new UrqaException(title, stacktrace) , tag, convertToRank( rank_str ) );
			
			callbackContext.success("Success");
			return true;
		}
		return false;
	}

}
