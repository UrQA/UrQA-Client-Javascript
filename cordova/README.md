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
<script type="text/javascript" src="js/urqa/urqa_core.js"></script>
<script type="text/javascript" src="js/urqa/urqa_cordova.js"></script>

<script type="text/javascript">

    app.initialize();

    function ttt(){
        try{
            var te = null;
            te.toString();
        }catch(err){
            urqa.send_e( err, { errname: "hhh test error", rank : 0,  tag: "cordova" } );    
        }
    };
    function ttt2(){
        urqa.send_l( "This is Test Msg", { errname: "hhh test error", rank : 1,  tag: "cordova" }  );
    }

    ttt();
    ttt2();
</script>
```

