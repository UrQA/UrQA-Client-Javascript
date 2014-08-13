var express = require('express');
var Client = require('node-rest-client').Client;
var client = new Client();

var server = express(); // better instead

server.configure(function(){
	server.use("/lib", express.static(__dirname + '/../common_lib'));
	server.use(express.static(__dirname + '/public'));
	server.set("jsonp callback", true);
    server.use(express.bodyParser());
});

server.get( '/getheader' , function( req, res ) {

	var header = req.header( 'user-agent' );

});

server.get( '/urqa_wrapper', function( req, res ){

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

server.listen(3000);