Urqa-Cordova-Plugin
===================

Urqa-Cordova-Plugin V 0.1

# Menual Install

## js file copy

```sh
cp -f ../Urqa-Cordova-Plugin/www/js/stacktrace.js ./www/js/stacktrace.js
cp -f ../Urqa-Cordova-Plugin/www/js/urqaplugin.js ./www/js/urqaplugin.js
```

## src file copy

```sh
cp -rf ../Urqa-Cordova-Plugin/src/* ./platforms/android/src/
cp -rf ../Urqa-Cordova-Plugin/libs/* ./platforms/android/libs/
```

## write plugin code to ./www/config.xml  

```
	<feature name="UrqaPlugin">
        <param name="android-package"
               value="com.netand.urqa.UrqaPlugin" />
    </feature>
```

## write to init code to mainActivity.java

```java
 @Override
    public void onCreate(Bundle savedInstanceState)
    {
        super.onCreate(savedInstanceState);
        super.init();

        UrqaPlugin.UrqaInit( this, "10EB2BF7" );	//  add this line ( second param is apikey )

        // Set by <content src="index.html" /> in config.xml
        super.loadUrl(Config.getStartUrl());

    }
```


# Sample index.html

```html
<script type="text/javascript" src="cordova.js"></script>
<script type="text/javascript" src="js/index.js"></script>
<script type="text/javascript" src="js/stacktrace.js"></script>
<script type="text/javascript" src="js/urqaplugin.js"></script>
<script type="text/javascript">

    //var cordova = require('cordova');
    //cordova.exec = cordova.exec || require('cordova/exec');
    
    var writelog = function( log_msg ){
        document.getElementById("test_log").value = log_msg;
    };

    writelog( "zero" );

    app.initialize();

    writelog( "first " + cordova );

    var urqa = createUrqa();
    
    writelog( "second " + urqa.send_error );
    function ttt(){
        try{
            var te = null;
            te.toString();
        }catch(err){
            urqa.send_error( err );    
        }
    };

    ttt();

    function ttt2(){
        urqa.send_msg( "This is Test Msg" );
    }

    ttt2();

    writelog( "end ");

</script>
```

#Links

Stacktrace.js : http://stacktracejs.com/
