var express = require('express');
var Client = require('node-rest-client').Client;
var client = new Client();

var app = express(); // better instead

app.configure(function(){
	app.use("/lib", express.static(__dirname + '/../common_lib'));
	app.use("/lib_min", express.static(__dirname + '/../release'));
	app.use(express.static(__dirname + '/public'));
	app.set("jsonp callback", true);
    app.use(express.bodyParser());
});

app.get( '/getheader' , function( req, res ) {

	var header = req.header( 'user-agent' );

});

app.get( '/urqa_wrapper', function( req, res ){

	//console.log('params: ' + JSON.stringify(req.params));
	//console.log('body: ' + JSON.stringify(req.body));
	//console.log('query: ' + JSON.stringify(req.query));
	
	var uri = req.query.uri;
	var data = req.query.data;

	console.log( data );

	args = {
        data:data,
        headers:{"Content-Type": "application/json; charset=utf-8"}
    };

    console.log(uri);

	client.post( uri, args, function(data, response){

        // parsed response body as js object
        console.log(data);

        // raw response
		res.header('Content-type','application/json');
		res.header('Charset','utf8');

        res.jsonp( data );

	});

});

//server.listen(3000);


// HTTP & HTTPS support
var https = require('https');
var http = require('http');
var fs = require('fs');

var https_options = {
  key: fs.readFileSync(__dirname + '/config/https/server.key'),
  cert: fs.readFileSync(__dirname + '/config/https/server.crt')
};

// Create an HTTP service.
http.createServer(app).listen(80);
// Create an HTTPS service identical to the HTTP service.
https.createServer(https_options, app).listen(443);
