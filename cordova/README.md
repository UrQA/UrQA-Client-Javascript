Urqa-Cordova-Plugin
===================

Urqa-Cordova-Plugin V 0.1

# Menual Install

## copy to project ( work on UrQA-Client-Javascript folder )

install_cordova.sh [project root]

## write plugin code to ./config.xml  

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
<script type="text/javascript" src="js/stacktrace/stacktrace.js"></script>
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
