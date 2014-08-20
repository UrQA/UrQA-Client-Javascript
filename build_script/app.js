var compressor = require('node-minify');
var fs = require('fs');
var mkdirp = require('mkdirp');


/**
 * path 
 * @param  {[type]} path [description]
 * @return {[type]}      [description]
 */
function get_abspath( path ){
	return process.cwd() + "/../" +  path;
}

/**
 * ger version
 * @return {[type]} [description]
 */
function get_version(){
	return fs.readFileSync( get_abspath( 'version' ) );
}

/**
 * Step 1 merge
 * @param  string target_filename 	merge file name
 * @param  string[] files 	src files
 * @return {[type]}         [description]
 */
function merge( target_filename, files ){



	new compressor.minify({
		type: 'no-compress',
		fileIn: files,
		fileOut: target_filename ,
		callback: function( err, min ){
			if(null == err ){
				console.log( "merge success");
			}else{
				console.log( "merge fail : " + err );
			}
		}
	});

};

/**
 * js minify
 * @param  {[type]} src_filename    [description]
 * @param  {[type]} target_filename [description]
 * @return {[type]}                 [description]
 */
function minify( src_filename, target_filename){

	new compressor.minify({
		type: 'gcc',
		fileIn: src_filename ,
		fileOut: target_filename ,
		callback: function( err, min ){
			if(null == err ){
				console.log( "minify success");
			}else{
				console.log( "minify : " + err );
			}
		}
	});

};


var version = get_version();
var release_dir = get_abspath( "release/" + version + "/" );

/**
 * build
 * @param  {[type]} name  [description]
 * @param  {[type]} files [description]
 * @return {[type]}       [description]
 */
function build( name, files ){
	var release_file_header = release_dir + "urqa-" + name + "-" + version ;
	var release_file_name = release_file_header + ".js";
	var release_min_file_name = release_file_header + ".min.js";


	// change to abspath
	for( var i = 0 ; i < files.length ; ++ i ){
		files[i] = get_abspath( files[i] );
	}

	merge( release_file_name, files );

	minify( release_file_name, release_min_file_name );
}

// make release folder
var release_dir_exists = false;

console.log( "release directory " + release_dir );
try { release_dir_exists = fs.statSync(release_dir).isDirectory() }
catch (er) { release_dir_exists = false }

if( !release_dir_exists &&
	!mkdirp.sync( release_dir ) ){
	console.log( "release directory create fail... " + release_dir );
	process.exit(-1);
}


// build - web
build( 'web', [
		 "common_lib/stacktrace/stacktrace.js",
		 "common_lib/browser/browser.js",
		 "common_lib/urqa/dateformat.js",
		 "common_lib/urqa/urqa_core.js",
		 "common_lib/console/console.js",
		 "common_lib/urqa/urqa_web.js"
		 ] );

// build - cordova
build( 'cordova', [
		 "common_lib/stacktrace/stacktrace.js",
		 "common_lib/browser/browser.js",
		 "common_lib/urqa/dateformat.js",
		 "common_lib/urqa/urqa_core.js",
		 "common_lib/console/console.js",
		 "common_lib/urqa/urqa_cordova.js"
		 ] );