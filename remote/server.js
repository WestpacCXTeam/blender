/*! blender-stack - v0.0.1 */
/***************************************************************************************************************************************************************
 *
 * Westpac GUI blender
 *
 **************************************************************************************************************************************************************/

'use strict';



//--------------------------------------------------------------------------------------------------------------------------------------------------------------
// Dependencies
//--------------------------------------------------------------------------------------------------------------------------------------------------------------
const Fs = require('fs');
const Http = require('http');
const Path = require('path');
const Chalk = require('chalk');
const _ = require('underscore');
const CFonts = require('cfonts');
const Express = require('express');
const BodyParser = require('body-parser');


let Blender = (function Application() {

	return {
		//----------------------------------------------------------------------------------------------------------------------------------------------------------
		// Settings
		//----------------------------------------------------------------------------------------------------------------------------------------------------------
		DEBUG: false, //debugging infos
		GELRURL: 'http://gel.westpacgroup.com.au/',
		GUIRURL: 'http://gel.westpacgroup.com.au/' + 'GUI/',
		GUIPATH: Path.normalize(__dirname + '/../../GUI-docs/GUI-source-master/'), //debug only
		// GUIPATH: Path.normalize(__dirname + '/../../GUI-source-master/'),
		TEMPPATH: Path.normalize(__dirname + '/._template/'),
		GELPATH: Path.normalize(__dirname + '/../../../'),
		GUICONFIG: Path.normalize(__dirname + '/../.guiconfig'),
		JQUERYPATH: '_javascript-helpers/1.0.1/_core/js/010-jquery.js',
		SLACKURL: 'https://hooks.slack.com/services/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',
		SLACKICON: 'http://gel.westpacgroup.com.au/GUI/blender/remote/assets/img/blender-icon.png',
		LOG: Path.normalize(__dirname + '/blender.log'),
		FUNKY: [
			{
				name: 'James Bond',
				var: 'includeBond',
				file: Path.normalize(__dirname + '/assets/img/bond.png'),
				zip: '/bond.png'
			},
			{
				name: 'Star Wars',
				var: 'includeStarWars',
				file: Path.normalize(__dirname + '/assets/img/starwars[Brand].jpg'),
				zip: '/starwars.png'
			},
			{
				name: 'David Bowie',
				var: 'includeBowie',
				file: Path.normalize(__dirname + '/assets/img/bowie.png'),
				zip: '/bowie.png'
			}
		],


		//----------------------------------------------------------------------------------------------------------------------------------------------------------
		// Initiate blender
		//----------------------------------------------------------------------------------------------------------------------------------------------------------
		init: function Init() {
			if( Blender.DEBUG ) Blender.debugging( ' DEBUGGING| INFORMATION', 'headline' );

			Blender.GUI = JSON.parse( Fs.readFileSync( Blender.GUIPATH + 'GUI.json', 'utf8') );
			let blender = Express();

			//starting server
			blender
				.use( BodyParser.urlencoded({ extended: false }) )

				.listen(1337, function PortListener() {
					Blender.debugging( 'Server started on port 1337', 'report' );
				});


			blender.get('*', function GetListener(request, response) {
				response.redirect(301, Blender.GUIRURL);
			});


			//listening to post request
			blender.post('/blender', function PostListener(request, response) {
				Blender.IP = request.headers['x-forwarded-for'] || request.connection.remoteAddress;

				Blender.log.info( 'New request: ' + request.headers['x-forwarded-for'] + ' / ' + request.connection.remoteAddress );

				//the core needs to be in the request and the user agent should be presented
				if(
					typeof request.body['module-_colors'] !== 'undefined'
					&& typeof request.body['module-_fonts'] !== 'undefined'
					&& typeof request.body['module-_text-styling'] !== 'undefined'
					&& typeof request.body['module-_grid'] !== 'undefined'
					&& typeof request.body['module-_javascript-helpers'] !== 'undefined'
					&& typeof request.headers['user-agent'] !== 'undefined'
				) {

					//when debug mode is off disgard "stress-tester"
					if( !Blender.DEBUG && request.headers['user-agent'] !== 'stress-tester' || Blender.DEBUG ) {
						Blender.response = response;
						Blender.POST = request.body;

						Blender.files.init();
					}
					else {
						Blender.log.info( 'Discarded for invalid user-agent (' + request.headers['user-agent'] + ')' );
					}
				}
				else {
					Blender.log.info( 'Discarded for invalid request (core not complete or user-agent empty)' );
				}
			});

		},


		//------------------------------------------------------------------------------------------------------------------------------------------------------------
		// Global vars
		//------------------------------------------------------------------------------------------------------------------------------------------------------------
		response: {}, //server response object
		POST: {}, //POST values from client
		GUI: {}, //GUI.json contents
		IP: '', //Client IP


		//----------------------------------------------------------------------------------------------------------------------------------------------------------
		// Debugging prettiness
		//
		// @param  text  [string]   Text to be printed to debugger
		// @param  code  [string]   The urgency as a string: ['report', 'error', 'interaction', 'send', 'receive']
		//
		// @return  [output]  console.log output
		//----------------------------------------------------------------------------------------------------------------------------------------------------------
		debugging: function Debugging( text, code ) {

			if( code === 'headline' ) {
				if( Blender.DEBUG ) {
					let fonts = new CFonts({
						'text': text,
						'colors': ['white', 'gray'],
						'maxLength': 12,
					});
				}
			}

			if( code === 'report' ) {
				if( Blender.DEBUG ) console.log(Chalk.bgWhite("\n" + Chalk.bold.green(' \u2611  ') + Chalk.black(text + ' ')));
			}

			else if( code === 'error' ) {
				if( Blender.DEBUG ) console.log(Chalk.bgWhite("\n" + Chalk.red(' \u2612  ') + Chalk.black(text + ' ')));
			}

			else if( code === 'interaction' ) {
				if( Blender.DEBUG ) console.log(Chalk.bgWhite("\n" + Chalk.blue(' \u261C  ') + Chalk.black(text + ' ')));
			}

			else if( code === 'send' ) {
				if( Blender.DEBUG ) console.log(Chalk.bgWhite("\n" + Chalk.bold.cyan(' \u219D  ') + Chalk.black(text + ' ')));
			}

			else if( code === 'receive' ) {
				if( Blender.DEBUG ) console.log(Chalk.bgWhite("\n" + Chalk.bold.cyan(' \u219C  ') + Chalk.black(text + ' ')));
			}

		},


		//------------------------------------------------------------------------------------------------------------------------------------------------------------
		// Log to console.log
		//
		// @method  info     Log info to console.log and in extension to node log file
		//          @param   text     string   The sting you want to log
		//          @return  console.log output
		//
		// @method  error    Log error to console.log and in extension to node log file
		//          @param   text     string   The sting you want to log
		//          @return  console.log output
		//------------------------------------------------------------------------------------------------------------------------------------------------------------
		log: {

			info: function LogInfo( text ) {
				console.log( Chalk.bold.black( 'Info  ' ) + new Date().toString() + '  ' + text );
			},

			error: function LogError( text ) {
				console.log( Chalk.bold.red( 'ERROR ' ) + new Date().toString() + '  ' + text );
			},

		},

	}

}());


//run blender
Blender.init();
/***************************************************************************************************************************************************************
 *
 * Files
 *
 * Route to all files for concatenating, compiling and if necessary branding.
 *
 **************************************************************************************************************************************************************/


//--------------------------------------------------------------------------------------------------------------------------------------------------------------
// Dependencies
//--------------------------------------------------------------------------------------------------------------------------------------------------------------
const UglifyJS = require('uglify-js');
const Less = require('less');


(function FilesApp(Blender) {

	let module = {};

	//------------------------------------------------------------------------------------------------------------------------------------------------------------
	// Module init method
	//------------------------------------------------------------------------------------------------------------------------------------------------------------
	module.init = function FilesInit() {
		Blender.debugging( 'Files: new query', 'report' );

		//////////////////////////////////////////////////| PARSING POST
		Blender.files.getPost();

		//////////////////////////////////////////////////| SETTING QUE
		Blender.zip.queuing('css', true);
		Blender.zip.queuing('html', true);

		if( Blender.selectedModules.js ) {
			Blender.zip.queuing('js', true);
		}
		Blender.zip.queuing('assets', true);
		Blender.zip.queuing('build', true);

		Blender.zip.queuing('funky', true);


		//////////////////////////////////////////////////| GENERATING FILES
		Blender.css.get();

		if( Blender.selectedModules.js ) {
			Blender.js.get();
		}

		Blender.build.get();
		Blender.html.get();
		Blender.assets.get();
		Blender.funky.get();
	};


	//------------------------------------------------------------------------------------------------------------------------------------------------------------
	// Saves an array of the selected modules globally so we don't work with the raw data that comes from the client... as that could be a mess ;)
	//------------------------------------------------------------------------------------------------------------------------------------------------------------
	module.getPost = function FilesGetPost() {
		Blender.debugging( 'Files: Parsing POST', 'report' );

		var POST = Blender.POST;
		var fromPOST = {};
		fromPOST.modules = [];
		var _hasJS = false;
		var _hasSVG = false;

		var _includeJquery = POST.includeJquery === 'on';
		var _includeUnminifiedJS = POST.includeUnminifiedJS === 'on';
		var _includeLess = POST.includeLess === 'on';
		var log = '';


		//////////////////////////////////////////////////| ADDING MODULES
		Object.keys( POST ).forEach(function FilesIteratePost( moduleName ) {
			var module = moduleName.substr(5);

			if(
				moduleName.substr(0, 5) === 'tick-' &&
				POST[ moduleName ] === 'on'
			) { //only look at enabled checkboxes

				var json = Blender.modules.getJson( module );
				var version = POST[ 'module-' + module ];

				var newObject = _.extend( json, json.versions[ version ] ); //merge version to the same level
				newObject.version = version;

				if( newObject.js ) {
					_hasJS = true;
				}

				if( newObject.svg ) {
					_hasSVG = true;
				}

				fromPOST.modules.push( newObject );

				log += ', ' + json.ID + ':' + version;
			}
		});


		//////////////////////////////////////////////////| ADDING CORE
		fromPOST.core = [];

		Object.keys( Blender.GUI.modules._core ).forEach(function FilesIterateCore( moduleName ) {
			var module = Blender.GUI.modules._core[moduleName];
			var version = POST[ 'module-' + module.ID ];

			var newObject = _.extend(module, module.versions[ version ]); //merge version to the same level
			newObject.version = POST[ 'module-' + module.ID ];

			fromPOST.core.push(newObject);

			log += ', ' + module.ID + ':' + version;
		});

		Blender.log.info( '             ' + log.substr(2) );


		//////////////////////////////////////////////////| ADDING OPTIONS
		if( _includeJquery ) { //when checkbox is ticked but you don't have any modules with js then don't include jquery... controversial!
			// _hasJS = true;
		}

		fromPOST.js = _hasJS;
		fromPOST.svg = _hasSVG;
		fromPOST.brand = POST.brand;
		fromPOST.includeJquery = _includeJquery;
		fromPOST.includeUnminifiedJS = _includeUnminifiedJS;
		fromPOST.includeLess = _includeLess;

		Blender.log.info( '             brand: ' + POST.brand );
		Blender.log.info( '             jquery: ' + _includeJquery );
		Blender.log.info( '             minify JS: ' + _includeUnminifiedJS );
		Blender.log.info( '             include LESS: ' + _includeLess );


		//////////////////////////////////////////////////| SAVIG GLOBALLY
		Blender.selectedModules = fromPOST;
	};


	Blender.files = module;


}(Blender));
/***************************************************************************************************************************************************************
 *
 * Compile JS files
 *
 **************************************************************************************************************************************************************/


//--------------------------------------------------------------------------------------------------------------------------------------------------------------
// Dependencies
//--------------------------------------------------------------------------------------------------------------------------------------------------------------


(function JsApp(Blender) {

	let module = {};

	//------------------------------------------------------------------------------------------------------------------------------------------------------------
	// Module init method
	//------------------------------------------------------------------------------------------------------------------------------------------------------------
	module.init = function JsInit() {
		Blender.debugging( 'JS: Initiating', 'report' );
	};


	//------------------------------------------------------------------------------------------------------------------------------------------------------------
	// Get all js files and concat them
	//------------------------------------------------------------------------------------------------------------------------------------------------------------
	module.get = function JsGet() {
		Blender.debugging( 'JS: Generating js', 'report' );

		var files = [];
		var file = '';
		var core = '';
		var POST = Blender.POST;
		var jquery = '';
		var _includeJquery = Blender.selectedModules.includeJquery; //POST.hasOwnProperty('jquery');
		var _includeOriginal  = Blender.selectedModules.includeUnminifiedJS; //POST.hasOwnProperty('jsunminified');


		//////////////////////////////////////////////////| JQUERY
		if( _includeJquery ) { //optional include jquery
			jquery = Fs.readFileSync( Blender.GUIPATH + Blender.JQUERYPATH, 'utf8');

			if( _includeOriginal ) {
				Blender.zip.addFile( jquery, '/source/js/010-jquery.js' );
			}
		}


		//////////////////////////////////////////////////| CORE
		if( Blender.selectedModules.js ) {
			core = Fs.readFileSync( Blender.GUIPATH + '_javascript-helpers/' + POST[ 'module-_javascript-helpers' ] + '/js/020-core.js', 'utf8');
			core = Blender.branding.replace(core, ['Debug', 'false']); //remove debugging infos

			var core = UglifyJS.minify( core, { fromString: true });

			if( _includeOriginal ) {
				file = Fs.readFileSync( Blender.GUIPATH + '_javascript-helpers/' + POST[ 'module-_javascript-helpers' ] + '/js/020-core.js', 'utf8');
				file = Blender.branding.replace(file, ['Module-Version', ' Core v' + POST[ 'module-_javascript-helpers' ] + ' ']); //name the current version
				file = Blender.branding.replace(file, ['Debug', 'false']); //remove debugging infos
				Blender.zip.addFile( file, '/source/js/020-core.js' );
			}
		}


		//////////////////////////////////////////////////| MODULES
		Blender.selectedModules.modules.forEach(function JsIterateModules( module ) {
			var _hasJS = module.js; //look if this module has js

			if( _hasJS ) {
				files.push( Blender.GUIPATH + module.ID + '/' + module.version + '/js/' + module.ID + '.js' ); //add js to uglify

				file = Fs.readFileSync( Blender.GUIPATH + module.ID + '/' + module.version + '/js/' + module.ID + '.js', 'utf8');

				if( _includeOriginal ) {
					file = Blender.branding.replace(file, ['Module-Version', ' ' + module.name + ' v' + module.version + ' ']); //name the current version
					Blender.zip.addFile( file, '/source/js/' + module.ID + '.js' );
				}
			}
		});


		//uglify js
		if( files.length > 0 ) {
			var result = UglifyJS.minify( files );
		}
		else {
			result = {};
			result.code = '';
		}

		var source = Blender.banner.attach( jquery + core.code + result.code ); //attach a banner to the top of the file with a URL of this build

		Blender.zip.queuing('js', false); //js queue is done
		Blender.zip.addFile( source, '/assets/js/gui.min.js' ); //add minified file to zip

	};


	Blender.js = module;


}(Blender));
/***************************************************************************************************************************************************************
 *
 * Compile CSS files
 *
 **************************************************************************************************************************************************************/


//--------------------------------------------------------------------------------------------------------------------------------------------------------------
// Dependencies
//--------------------------------------------------------------------------------------------------------------------------------------------------------------


(function CssApp(Blender) {

	let module = {};

	//------------------------------------------------------------------------------------------------------------------------------------------------------------
	// Module init method
	//------------------------------------------------------------------------------------------------------------------------------------------------------------
	module.init = function CssInit() {
		Blender.debugging( 'CSS: Initiating', 'report' );
	};


	//------------------------------------------------------------------------------------------------------------------------------------------------------------
	// Get all less files and compile them
	//------------------------------------------------------------------------------------------------------------------------------------------------------------
	module.get = function CssGet() {
		Blender.debugging( 'CSS: Generating css', 'report' );

		var POST = Blender.POST;
		var lessContents = '';
		var lessIndex = "\n\n" + '/* ---------------------------------------| MODULES |--------------------------------------- */' + "\n";
		var _includeOriginal  = Blender.selectedModules.includeLess; //POST.hasOwnProperty('includeless');


		//////////////////////////////////////////////////| CORE
		Blender.selectedModules.core.forEach(function CssIterateCore( module ) {
			var lessContent = Blender.branding.replace(
				Fs.readFileSync(Blender.GUIPATH + module.ID + '/' + module.version + '/less/module-mixins.less', 'utf8'),
				['Module-Version-Brand', ' ' + module.name + ' v' + module.version + ' ' + POST['brand'] + ' ']
			);

			lessContent = Blender.branding.replace( lessContent, [ 'Brand', POST['brand'] ] );

			if( _includeOriginal && module.less ) {
				lessIndex += '@import \'' + module.ID + '.less\';' + "\n";
				Blender.zip.addFile( lessContent, '/source/less/' + module.ID + '.less' );
			}

			lessContents += lessContent;
		});


		//////////////////////////////////////////////////| MODULES
		Blender.selectedModules.modules.forEach(function CssIterateModules( module ) {
			var lessContent = Blender.branding.replace(
				Fs.readFileSync( Blender.GUIPATH + module.ID + '/' + module.version + '/less/module-mixins.less', 'utf8'),
				['Module-Version-Brand', ' ' + module.name + ' v' + module.version + ' ' + POST['brand'] + ' ']
			);

			lessContent = Blender.branding.replace( lessContent, [ 'Brand', POST['brand'] ] );

			if( _includeOriginal && module.less ) {
				lessIndex += '@import \'' + module.ID + '.less\';' + "\n";
				Blender.zip.addFile( lessContent, '/source/less/' + module.ID + '.less' );
			}

			lessContents += lessContent;
		});

		if( lessIndex && _includeOriginal ) {
			Blender.zip.addFile( Blender.banner.attach( lessIndex ), '/source/less/gui.less' );
		}

		//compile less
		Less.render(lessContents, {
			compress: true
		},
		function CssRenderLess(e, output) {
			//TODO: error handling

			var source = Blender.banner.attach( output.css ); //attach a banner to the top of the file with a URL of this build

			Blender.zip.queuing('css', false); //css queue is done
			Blender.zip.addFile( source, '/assets/css/gui.min.css' );

		});

	};


	Blender.css = module;


}(Blender));

/***************************************************************************************************************************************************************
 *
 * Compile HTML files
 *
 **************************************************************************************************************************************************************/


//--------------------------------------------------------------------------------------------------------------------------------------------------------------
// Dependencies
//--------------------------------------------------------------------------------------------------------------------------------------------------------------


(function HtmlApp(Blender) {

	let module = {};

	//------------------------------------------------------------------------------------------------------------------------------------------------------------
	// Module init method
	//------------------------------------------------------------------------------------------------------------------------------------------------------------
	module.init = function HtmlInit() {
		Blender.debugging( 'HTML: Initiating', 'report' );
	};


	//------------------------------------------------------------------------------------------------------------------------------------------------------------
	// Get all html files
	//------------------------------------------------------------------------------------------------------------------------------------------------------------
	module.get = function HtmlGet() {
		Blender.debugging( 'HTML: Getting all HTML files', 'report' );

		var POST = Blender.POST;
		var index = Fs.readFileSync( Blender.TEMPPATH + 'index.html', 'utf8');
		var _includeOriginalLess  = Blender.selectedModules.includeLess;
		var _includeOriginalJS  = Blender.selectedModules.includeUnminifiedJS;
		var _hasBuild = false;
		var guiconfig = JSON.parse( Fs.readFileSync( Blender.GUICONFIG, 'utf8') ); //getting guiconfig for brands
		var brands = {};

		if( _includeOriginalLess || _includeOriginalJS) {
			_hasBuild = true;
		}

		guiconfig.brands.forEach(function HTMLIterateBrand( brand ) { //add URLs for all other brands
			if( brand.ID !== Blender.selectedModules.brand ) {
				brands[ brand.ID ] = {};
				brands[ brand.ID ].url = Blender.banner.getBlendURL( brand.ID );
				brands[ brand.ID ].name = brand.name;
			}
		});

		var options = { //options for underscore template
			_hasJS: Blender.selectedModules.js,
			_hasSVG: Blender.selectedModules.svg,
			_hasBuild: _hasBuild,
			Brand: POST['brand'],
			brands: brands,
			blendURL: Blender.banner.getBlendURL( Blender.selectedModules.brand ),
			GUIRURL: Blender.GUIRURL + Blender.selectedModules.brand + '/blender/',
		}

		index = _.template( index )( options ); //render the index template

		Blender.zip.queuing('html', false); //html queue is done
		Blender.zip.addFile( index, '/index.html' );

	};


	Blender.html = module;


}(Blender));
/***************************************************************************************************************************************************************
 *
 * Insert build tool
 *
 **************************************************************************************************************************************************************/


//--------------------------------------------------------------------------------------------------------------------------------------------------------------
// Dependencies
//--------------------------------------------------------------------------------------------------------------------------------------------------------------


(function BuildApp(Blender) {

	let module = {};

	//------------------------------------------------------------------------------------------------------------------------------------------------------------
	// Module init method
	//------------------------------------------------------------------------------------------------------------------------------------------------------------
	module.init = function BuildInit() {
		Blender.debugging( 'Build: Initiating', 'report' );
	};


	//------------------------------------------------------------------------------------------------------------------------------------------------------------
	// Returns json object of a specific module.json
	//
	// @param   module  [sting]  ID of module
	//
	// @return  [object]  Json object of module.json
	//------------------------------------------------------------------------------------------------------------------------------------------------------------
	module.get = function BuildGet() {
		Blender.debugging( 'Build: Getting build', 'report' );

		var _includeOriginalLess  = Blender.selectedModules.includeLess;
		var _includeOriginalJS  = Blender.selectedModules.includeUnminifiedJS;

		if( _includeOriginalLess || _includeOriginalJS) {
			Blender.zip.queuing('build', false); //build queue is done

			Blender.zip.addBulk( Blender.TEMPPATH, ['Gruntfile.js', 'package.json'], '/' );
		}
		else {
			Blender.zip.queuing('build', false); //build queue is done
		}
	};


	Blender.build = module;


}(Blender));
/***************************************************************************************************************************************************************
 *
 * Compile symbole files
 *
 **************************************************************************************************************************************************************/


//--------------------------------------------------------------------------------------------------------------------------------------------------------------
// Dependencies
//--------------------------------------------------------------------------------------------------------------------------------------------------------------


(function AssetsApp(Blender) {

	let module = {};

	//------------------------------------------------------------------------------------------------------------------------------------------------------------
	// Module init method
	//------------------------------------------------------------------------------------------------------------------------------------------------------------
	module.init = function AssetsInit() {
		Blender.debugging( 'Assets: Initiating', 'report' );
	};


	//------------------------------------------------------------------------------------------------------------------------------------------------------------
	// Get all assets files
	//------------------------------------------------------------------------------------------------------------------------------------------------------------
	module.get = function AssetsGet() {
		Blender.debugging( 'Assets: Getting all files', 'report' );

		var POST = Blender.POST;
		module.svgfiles.svg = '';
		module.svgfiles.png = '';
		module.svgfiles.fallback = '';


		//////////////////////////////////////////////////| CORE
		Blender.selectedModules.core.forEach(function AssetsIterateCore( module ) {
			if( module.font ) {
				Blender.assets.getFonts( Blender.GUIPATH + module.ID + '/' + module.version + '/_assets/' + POST['brand'] + '/font/' );
			}

			if( module.svg ) {
				Blender.assets.getSVG( Blender.GUIPATH + module.ID + '/' + module.version + '/tests/' + POST['brand'] + '/assets/' );
			}
		});


		//////////////////////////////////////////////////| MODULES
		Blender.selectedModules.modules.forEach(function AssetsIterateModules( module ) {

			if( module.font ) {
				Blender.assets.getFonts( Blender.GUIPATH + module.ID + '/' + module.version + '/_assets/' + POST['brand'] );
			}

			if( module.svg ) {
				Blender.assets.getSVG( Blender.GUIPATH + module.ID + '/' + module.version + '/tests/' + POST['brand'] + '/assets/' );
			}

		});


		//adding files to zip
		Blender.zip.addFile( Blender.assets.svgfiles.svg, '/assets/css/symbols.data.svg.css' );
		Blender.zip.addFile( Blender.assets.svgfiles.png, '/assets/css/symbols.data.png.css' );
		Blender.zip.queuing('assets', false); //assets queue is done
		Blender.zip.addFile( Blender.assets.svgfiles.fallback, '/assets/css/symbols.fallback.css' );

	};


	//------------------------------------------------------------------------------------------------------------------------------------------------------------
	// Get all font files from a specific folder
	//
	// @param  [string]  Path to a folder of the font files
	//------------------------------------------------------------------------------------------------------------------------------------------------------------
	module.getFonts = function AssetsGetFonts( folder ) {
		Blender.debugging( 'Assets: Getting font files', 'report' );

		var files = [
			'*.eot',
			'*.svg',
			'*.ttf',
			'*.woff',
			'*.woff2',
		];

		Blender.zip.addBulk( folder, files, '/assets/font/' );

	};


	//------------------------------------------------------------------------------------------------------------------------------------------------------------
	// Get all svg string and png fallback files from a specific folder
	//
	// @param  [string]  Path to a tests folder
	//------------------------------------------------------------------------------------------------------------------------------------------------------------
	module.getSVG = function AssetsGetSvg( folder ) {
		Blender.debugging( 'Assets: Getting svg files from ' + folder, 'report' );

		//////////////////////////////////////////////////| ADDING PNGs
		Blender.zip.addBulk( folder + 'img/', [ '*.png' ], '/assets/img/' );

		//////////////////////////////////////////////////| BUILDING CSS FILES
		Blender.assets.svgfiles.svg += Fs.readFileSync( folder + 'css/symbols.data.svg.css', 'utf8'); //svg
		Blender.assets.svgfiles.png += Fs.readFileSync( folder + 'css/symbols.data.png.css', 'utf8'); //png
		Blender.assets.svgfiles.fallback += Fs.readFileSync( folder + 'css/symbols.fallback.css', 'utf8'); //fallack

	};


	//------------------------------------------------------------------------------------------------------------------------------------------------------------
	// Global vars
	//------------------------------------------------------------------------------------------------------------------------------------------------------------
	module.svgfiles = {};
	module.svgfiles.svg = '';
	module.svgfiles.png = '';
	module.svgfiles.fallback = '';


	Blender.assets = module;


}(Blender));
/***************************************************************************************************************************************************************
 *
 * Brand all content
 *
 **************************************************************************************************************************************************************/


//--------------------------------------------------------------------------------------------------------------------------------------------------------------
// Dependencies
//--------------------------------------------------------------------------------------------------------------------------------------------------------------


(function BrandingApp(Blender) {

	let module = {};

	//------------------------------------------------------------------------------------------------------------------------------------------------------------
	// Module init method
	//------------------------------------------------------------------------------------------------------------------------------------------------------------
	module.init = function BrandingInit() {
		Blender.debugging( 'Branding: Initiating', 'report' );
	};


	//------------------------------------------------------------------------------------------------------------------------------------------------------------
	// Returns content with elements replaced
	//
	// @param   content  [string]  Content that needs parsing
	// @param   replace  [array]   First element is replaced with second
	//
	// @return  [string]  Finished parsed content
	//------------------------------------------------------------------------------------------------------------------------------------------------------------
	module.replace = function BrandingReplace( content, replace ) {
		Blender.debugging( 'Branding: Replacing "' + replace[0] + '" with "' + replace[1] + '"', 'report' );

		var pattern = new RegExp('\\[(' + replace[0] + ')\\]', 'g');
		return content.replace(pattern, replace[1]);

	};


	Blender.branding = module;


}(Blender));
/***************************************************************************************************************************************************************
 *
 * Get modules infos
 *
 **************************************************************************************************************************************************************/


//--------------------------------------------------------------------------------------------------------------------------------------------------------------
// Dependencies
//--------------------------------------------------------------------------------------------------------------------------------------------------------------


(function ModulesApp(Blender) {

	let module = {};

	//------------------------------------------------------------------------------------------------------------------------------------------------------------
	// Module init method
	//------------------------------------------------------------------------------------------------------------------------------------------------------------
	module.init = function ModulesInit() {
		Blender.debugging( 'Modules: Initiating', 'report' );
	};


	//------------------------------------------------------------------------------------------------------------------------------------------------------------
	// Returns json object of a specific module.json
	//
	// @param   module  [sting]  ID of module
	//
	// @return  [object]  Json object of module.json
	//------------------------------------------------------------------------------------------------------------------------------------------------------------
	module.getJson = function ModulesGetJson( module ) {
		Blender.debugging( 'Modules: Getting JSON for ' + module, 'report' );


		if( Blender.GUImodules === undefined ) { //flatten GUI json and assign to global

			Blender.GUImodules = {};
			Object.keys( Blender.GUI.modules ).forEach(function ModulesIterateCategory( category ) {

				Object.keys( Blender.GUI.modules[ category ] ).forEach(function ModulesIterateModules( mod ) {
					Blender.GUImodules[ mod ] = Blender.GUI.modules[ category ][ mod ];
				});

			});
		}

		return Blender.GUImodules[module];
		// JSON.parse( Fs.readFileSync( Blender.GUIPATH + module + '/module.json', 'utf8') ); //getting from module.json if we want to have a lot of I/O (we don't)

	};


	Blender.modules = module;


}(Blender));
/***************************************************************************************************************************************************************
 *
 * Get banner infos
 *
 **************************************************************************************************************************************************************/


//--------------------------------------------------------------------------------------------------------------------------------------------------------------
// Dependencies
//--------------------------------------------------------------------------------------------------------------------------------------------------------------


(function BannerApp(Blender) {

	let module = {};

	//------------------------------------------------------------------------------------------------------------------------------------------------------------
	// Module init method
	//------------------------------------------------------------------------------------------------------------------------------------------------------------
	module.init = function BannerInit() {
		Blender.debugging( 'Banner: Initiating', 'report' );
	};


	//------------------------------------------------------------------------------------------------------------------------------------------------------------
	// Get the banner text
	//
	// @return  [string]  Content with attached banner
	//------------------------------------------------------------------------------------------------------------------------------------------------------------
	module.get = function BannerGet() {
		Blender.debugging( 'Banner: Generating banner', 'report' );

		return '/* GUI blend ' + Blender.banner.getBlendURL( Blender.selectedModules.brand ) + ' */' + "\n";

	};


	//------------------------------------------------------------------------------------------------------------------------------------------------------------
	// Attach the banner to some content
	//
	// @param   content  [string]  Content the banner needs to be attached to
	//
	// @return  [string]  Content with attached banner
	//------------------------------------------------------------------------------------------------------------------------------------------------------------
	module.attach = function BannerAttach( content ) {
		Blender.debugging( 'Banner: Attaching banner', 'report' );

		if( content.length > 0 ) {
			return Blender.banner.get() + content;
		}
		else {
			return '';
		}

	};


	//------------------------------------------------------------------------------------------------------------------------------------------------------------
	// Get the blend url
	//
	// @param   brand  [string]  The brand for the URL
	//
	// @return  [string]  The URL string to this build
	//------------------------------------------------------------------------------------------------------------------------------------------------------------
	module.getBlendURL = function BannerGetBlenderUrl( brand ) {
		Blender.debugging( 'Banner: Generating blend link', 'report' );

		var url = Blender.GUIRURL + brand + '/blender/#';

		Blender.selectedModules.core.forEach(function BannerIterateCore( module ) { //adding core
			url += '/' + module.ID + ':' + module.version;
		});

		Blender.selectedModules.modules.forEach(function BannerIterateModules( module ) { //adding modules
			url += '/' + module.ID + ':' + module.version;
		});

		return url;
	};


	Blender.banner = module;


}(Blender));
/***************************************************************************************************************************************************************
 *
 * Collect and zip all files
 *
 **************************************************************************************************************************************************************/


//--------------------------------------------------------------------------------------------------------------------------------------------------------------
// Dependencies
//--------------------------------------------------------------------------------------------------------------------------------------------------------------
const Archiver = require('archiver');


(function ZipApp(Blender) {

	let module = {};

	//------------------------------------------------------------------------------------------------------------------------------------------------------------
	// Module init method
	//------------------------------------------------------------------------------------------------------------------------------------------------------------
	module.init = function ZipInit() {
		Blender.debugging( 'Zip: Initiating', 'report' );
	};


	//------------------------------------------------------------------------------------------------------------------------------------------------------------
	// Zip all files up and send to response
	//------------------------------------------------------------------------------------------------------------------------------------------------------------
	module.getZip = function ZipGetZip() {
		Blender.debugging( 'Zip: Compiling zip', 'report' );

		Blender.response.writeHead(200, {
			'Content-Type': 'application/zip',
			'Content-disposition': 'attachment; filename=GUI-blend-' + Blender.selectedModules.brand + '.zip',
		});

		Blender.zip.archive.pipe( Blender.response );

		try {
			Blender.zip.archive.finalize(); //send to server

			Blender.log.info( '             Zip sent!' );

			Blender.slack.post();
		}
		catch( error ) {

			Blender.log.error( '             Zip ERROR' );
			Blender.log.error( error );
		}

		//add new blend to log
		Blender.counter.add();

		//clearning up
		Blender.zip.archive = Archiver('zip'); //new archive
		Blender.zip.files = []; //empty files
		module.queue = {}; // empty queue
	};


	//------------------------------------------------------------------------------------------------------------------------------------------------------------
	// Check if queue is clear
	//------------------------------------------------------------------------------------------------------------------------------------------------------------
	module.readyZip = function ZipReadyZip() {
		Blender.debugging( 'Zip: Readying zip', 'report' );

		if( Blender.zip.isQueuingEmpty() ) { //if queue is clear, add all files to the archive

			Blender.zip.files.forEach(function ZipIterateZipFiles( file ) {
				Blender.zip.archive.append( file.content, { name: file.name } );
			});

			Blender.zip.getZip(); //finalize the zip
		}

	};


	//------------------------------------------------------------------------------------------------------------------------------------------------------------
	// Add a file to the zip archive
	//
	// @param   content      [string]  The content of the file
	// @param   archivePath  [string]  The path this file will have inside the archive
	//------------------------------------------------------------------------------------------------------------------------------------------------------------
	module.addFile = function ZipAddFile( content, archivePath ) {
		Blender.debugging( 'Zip: Adding file: ' + archivePath, 'report' );

		if(typeof content !== 'string') {
			Blender.debugging( 'Zip: Adding file: Content can only be string, is ' + (typeof content), 'error' );
		}
		else {
			if( content.length > 0 ) { //don't need no empty files ;)
				Blender.zip.files.push({ //collect file for later adding
					content: content,
					name: '/GUI-blend' + archivePath,
				});
			}
		}

		Blender.zip.readyZip();
	};


	//------------------------------------------------------------------------------------------------------------------------------------------------------------
	// Add a file to the zip archive
	//
	// @param   path         [string]  The path to the file to be added
	// @param   archivePath  [string]  The path this file will have inside the archive
	//------------------------------------------------------------------------------------------------------------------------------------------------------------
	module.addPath = function ZipAddPath( path, archivePath ) {
		Blender.debugging( 'Zip: Adding file path: ' + path, 'report' );

		if(typeof path !== 'string') {
			Blender.debugging( 'Zip: Adding file path: Path can only be string, is ' + (typeof path), 'error' );
		}
		else {
			if( path.length > 0 ) { //don't need no empty files ;)
				Blender.zip.archive.file(
					path,
					{
						name: '/GUI-blend' + archivePath,
					}
				);
			}
		}

		Blender.zip.readyZip();
	};


	//------------------------------------------------------------------------------------------------------------------------------------------------------------
	// Add a file to the zip archive
	//
	// @param  cwd          [string]  The current working directory to flatten the paths in the archive
	// @param  files        [array]   The file extensions of the files
	// @param  archivePath  [string]  The path these files will have inside the archive
	//------------------------------------------------------------------------------------------------------------------------------------------------------------
	module.addBulk = function ZipAddBulk( cwd, files, archivePath ) {
		Blender.debugging( 'Zip: Adding bluk: ' + cwd + files + ' to: ' + archivePath, 'report' );

		if(typeof files !== 'object') {
			Blender.debugging( 'Zip: Adding files: Path can only be array/object, is ' + (typeof files), 'error' );
		}
		else {

			Blender.zip.archive.bulk({ //add them all to the archive
				expand: true,
				cwd: cwd,
				src: files,
				dest: '/GUI-blend' + archivePath,
				filter: 'isFile',
			});

		}

		Blender.zip.readyZip();
	};


	//------------------------------------------------------------------------------------------------------------------------------------------------------------
	// Add or remove a type to queue so we can wait for all to be finished
	//
	// @param   type           [string]   Identifier for a type of file we are waiting for
	// @param   _isBeingAdded  [boolean]  Whether or not this type is added or removed from the queue
	//------------------------------------------------------------------------------------------------------------------------------------------------------------
	module.queuing = function ZipQueuing( type, _isBeingAdded ) {
		Blender.debugging( 'Zip: Queuing files', 'report' );

		if( _isBeingAdded ) {
			Blender.debugging( 'Zip: Queue: Adding ' + type, 'report' );

			Blender.zip.queue[type] = true;
		}
		else {
			if( Blender.zip.queue[type] ) {
				Blender.debugging( 'Zip: Queue: Removing ' + type, 'report' );

				delete Blender.zip.queue[type];
			}
		}

	};


	//------------------------------------------------------------------------------------------------------------------------------------------------------------
	// Check if the queue is empty
	//
	// @return  [boolean]  Whether or not it is...
	//------------------------------------------------------------------------------------------------------------------------------------------------------------
	module.isQueuingEmpty = function ZipIsQueuingEmpty() {
		Blender.debugging( 'Zip: Checking queue', 'report' );

		for( let prop in Blender.zip.queue ) {
			if( Blender.zip.queue.hasOwnProperty(prop) ) {
				Blender.debugging( 'Zip: Queue: Still things in the queue', 'report' );

				return false;
			}
		}

		Blender.debugging( 'Zip: Queue: Queue is empty', 'report' );
		return true;
	};


	//------------------------------------------------------------------------------------------------------------------------------------------------------------
	// Global vars
	//------------------------------------------------------------------------------------------------------------------------------------------------------------
	module.queue = {}; //global object to hold queue
	module.archive = Archiver('zip'); //class to add files to zip globally
	module.files = []; //an array of all files to be added to the archive


	Blender.zip = module;


}(Blender));
/***************************************************************************************************************************************************************
 *
 * Post to slack
 *
 **************************************************************************************************************************************************************/


//--------------------------------------------------------------------------------------------------------------------------------------------------------------
// Dependencies
//--------------------------------------------------------------------------------------------------------------------------------------------------------------
const Slack = require('node-slack');


(function SlackApp(Blender) {

	let module = {};

	//------------------------------------------------------------------------------------------------------------------------------------------------------------
	// Module init method
	//------------------------------------------------------------------------------------------------------------------------------------------------------------
	module.post = function SlackPost() {
		Blender.debugging( 'Slack: Posting', 'report' );

		var slack = new Slack( Blender.SLACKURL );
		var funky = '';
		var core = '';
		var modules = '';
		var POST = Blender.POST;
		var jquery = Blender.selectedModules.includeJquery ? '`Yes`' : '`No`';
		var unminJS  = Blender.selectedModules.includeUnminifiedJS ? '`Yes`' : '`No`';
		var less  = Blender.selectedModules.includeLess ? '`Yes`' : '`No`';

		var channel = '#testing';
		if( !Blender.DEBUG ) {
			var channel = '#blender';
		}

		for(let i = Blender.FUNKY.length - 1; i >= 0; i--) {
			if( POST[ Blender.FUNKY[i].var ] === 'on' ) {
				funky += '`' + Blender.FUNKY[i].name + '` ';
			}
		}

		if( funky === '' ) {
			funky = '`none`';
		}

		Blender.selectedModules.core.forEach(function CssIterateCore( module ) {
			core += ', `' + module.ID+ ':' + module.version + '`';
		});

		Blender.selectedModules.modules.forEach(function SlackIterateModules( module ) {
			modules += ', `' + module.ID+ ':' + module.version + '`';
		});

		slack.send({
			'text': 'BOOM! ... another blend!',
			'attachments': [{
				'fallback': '_What\'s in it?_',
				'pretext': '_What\'s in it?_',
				'color': '#ffcdd2',
				'mrkdwn_in': [
					'text',
					'pretext',
					'fields',
				],
				'fields': [
					{
						'title': 'Modules',
						'value': '' +
							'_Selected_: `' + Blender.selectedModules.modules.length + '`\n' +
							'_Core_:\n' + core.substr(2) + '\n' +
							'_Modules_:\n' + modules.substr(2) + '\n\n\n',
						'short': false,
					},
					{
						'title': 'Options',
						'value': '' +
							'_Brand_: `' + Blender.selectedModules.brand + '`\n' +
							'_jQuery_: ' + jquery + '\n' +
							'_unmin JS_: ' + unminJS + '\n' +
							'_Less_: ' + less + '\n' +
							'_Funky_: ' + funky + '\n\n\n',
						'short': false,
					},
					{
						'title': 'Client',
						'value': '' +
							'_IP_: `' + Blender.IP + '`',
						'short': false,
					}
				],
			}],
			'channel': channel,
			'username': 'The Blender',
			'icon_url': Blender.SLACKICON,
		});
	};


	Blender.slack = module;


}(Blender));
/***************************************************************************************************************************************************************
 *
 * Funky stuff
 *
 **************************************************************************************************************************************************************/


//--------------------------------------------------------------------------------------------------------------------------------------------------------------
// Dependencies
//--------------------------------------------------------------------------------------------------------------------------------------------------------------


(function FunkyApp(Blender) {

	let module = {};

	//------------------------------------------------------------------------------------------------------------------------------------------------------------
	// Module get method
	//------------------------------------------------------------------------------------------------------------------------------------------------------------
	module.get = function funkyPost() {
		Blender.debugging( 'funky: Getting funky stuff', 'report' );

		var POST = Blender.POST;
		var funkies = 0;
		var funkyLog = '';

		for(let i = Blender.FUNKY.length - 1; i >= 0; i--) {
			if( POST[ Blender.FUNKY[i].var ] === 'on' ) {
				funkies++; //how many funky bits have been requested?
			}
		}

		if( funkies > 0 ) {
			for(let i = Blender.FUNKY.length - 1; i >= 0; i--) {

				if( POST[ Blender.FUNKY[i].var ] === 'on' ) {
					Blender.debugging( 'funky: Getting ' + Blender.FUNKY[i].name + ' reference', 'report' );

					funkies--; //counting down

					if( funkies === 0 ) { //if this is the last one
						Blender.zip.queuing('funky', false);
					}

					var file = Blender.FUNKY[i].file.replace( '[Brand]', POST['brand'] ); //brand path

					Blender.zip.addPath( file, Blender.FUNKY[i].zip ); //add file to zip
					funkyLog += ' ' + Blender.FUNKY[i].name
				}
			}

			Blender.log.info( '             include LESS:' + funkyLog );
		}
		else {
			Blender.zip.queuing('funky', false);
			Blender.zip.readyZip();
		}
	};


	Blender.funky = module;


}(Blender));
/***************************************************************************************************************************************************************
 *
 * Counter
 *
 **************************************************************************************************************************************************************/


//--------------------------------------------------------------------------------------------------------------------------------------------------------------
// Dependencies
//--------------------------------------------------------------------------------------------------------------------------------------------------------------


(function CounterApp(Blender) {

	let module = {};

	//------------------------------------------------------------------------------------------------------------------------------------------------------------
	// Module add method
	//------------------------------------------------------------------------------------------------------------------------------------------------------------
	module.add = function counterPost() {
		Blender.debugging( 'counter: adding new instance', 'report' );

		var counter = 0;

		Fs.readFile( Blender.LOG , function(error, data) { //read the log file
			if( error ) {
				throw error;
			}

			counter = parseInt( data ) + 1; //add this blend

			if(!isNaN( counter )) { //check if the number is a number
				Fs.writeFile( Blender.LOG, counter, function(error) {
					if( error ) {
						throw error;
					}

					Blender.debugging( 'counter: added', 'report' );
				});
			}
			else { //throw error
				Blender.log.error('             Counter number not valid ("' + counter + '"). Leaving it alone for now!');
			}
		});
	};


	Blender.counter = module;


}(Blender));