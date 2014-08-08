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

	public boolean execute(String action, JSONArray args, CallbackContext callbackContext) throws JSONException {

		if( action.equals("test_exception") ){

			String title = args.getString(0);
			String stacktrace = args.getString(1);
			
			URQAController.SendException(new UrqaException(title, stacktrace) , "test", ErrorRank.Major);
			
			callbackContext.success("Success");
			return true;
		}
		return false;
	}

}
