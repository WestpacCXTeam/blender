/*! blender - v0.0.2 */
/***************************************************************************************************************************************************************
 *
 * Westpac GUI file server
 *
 **************************************************************************************************************************************************************/

'use strict';



//--------------------------------------------------------------------------------------------------------------------------------------------------------------
// Dependencies
//--------------------------------------------------------------------------------------------------------------------------------------------------------------
var Fs = require('fs');
var Http = require('http');
var Path = require('path');
var Chalk = require('chalk');
var _ = require("underscore");
var CFonts = require('cfonts');
var Express = require('express');
var BodyParser = require('body-parser');


var App = (function Application() {

	//------------------------------------------------------------------------------------------------------------------------------------------------------------
	// Settings
	//------------------------------------------------------------------------------------------------------------------------------------------------------------
	return {
		DEBUG: false, //debugging infos
		GELRURL: 'http://gel.westpacgroup.com.au/',
		GUIRURL: 'http://gel.westpacgroup.com.au/' + 'GUI/',
		// GUIPATH: Path.normalize(__dirname + '/../../GUI-docs/GUI-source-master/'), //debug only
		GUIPATH: Path.normalize(__dirname + '/../../GUI-source-master/'),
		TEMPPATH: Path.normalize(__dirname + '/._template/'),
		GELPATH: Path.normalize(__dirname + '/../../../'),
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
			if( App.DEBUG ) App.debugging( ' DEBUGGING| INFORMATION', 'headline' );

			App.GUI = JSON.parse( Fs.readFileSync( App.GUIPATH + 'GUI.json', 'utf8') );
			var blender = Express();

			//starting server
			blender
				.use( BodyParser.urlencoded({ extended: false }) )

				.listen(8080, function PortListener() {
					App.debugging( 'Server started on port 8080', 'report' );
				});


			blender.get('*', function GetListener(request, response) {
				response.redirect(301, App.GUIRURL);
			});


			//listening to post request
			blender.post('/blender', function PostListener(request, response) {
				App.IP = request.connection.remoteAddress;

				App.log.info( 'New request: ' + request.headers['x-forwarded-for'] + ' / ' + App.IP );

				App.response = response;
				App.POST = request.body;

				App.files.init();
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
				if( App.DEBUG ) {
					var fonts = new CFonts({
						'text': text,
						'colors': ['white', 'gray'],
						'maxLength': 12,
					});
				}
			}

			if( code === 'report' ) {
				if( App.DEBUG ) console.log(Chalk.bgWhite("\n" + Chalk.bold.green(' \u2611  ') + Chalk.black(text + ' ')));
			}

			else if( code === 'error' ) {
				if( App.DEBUG ) console.log(Chalk.bgWhite("\n" + Chalk.red(' \u2612  ') + Chalk.black(text + ' ')));
			}

			else if( code === 'interaction' ) {
				if( App.DEBUG ) console.log(Chalk.bgWhite("\n" + Chalk.blue(' \u261C  ') + Chalk.black(text + ' ')));
			}

			else if( code === 'send' ) {
				if( App.DEBUG ) console.log(Chalk.bgWhite("\n" + Chalk.bold.cyan(' \u219D  ') + Chalk.black(text + ' ')));
			}

			else if( code === 'receive' ) {
				if( App.DEBUG ) console.log(Chalk.bgWhite("\n" + Chalk.bold.cyan(' \u219C  ') + Chalk.black(text + ' ')));
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
				console.log( Chalk.bold.black( 'Info ' ) + new Date().toString() + '  ' + text );
			},

			error: function LogError( text ) {
				console.log( Chalk.bold.red( 'ERROR' ) + new Date().toString() + '  ' + text );
			},

		},

	}

}());


//run blender
App.init();
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
var UglifyJS = require('uglify-js');
var Less = require('less');


(function FilesApp(App) {

	var module = {};

	//------------------------------------------------------------------------------------------------------------------------------------------------------------
	// Module init method
	//------------------------------------------------------------------------------------------------------------------------------------------------------------
	module.init = function FilesInit() {
		App.debugging( 'Files: new query', 'report' );

		//////////////////////////////////////////////////| PARSING POST
		App.files.getPost();

		//////////////////////////////////////////////////| SETTING QUE
		App.zip.queuing('css', true);
		App.zip.queuing('html', true);

		if( App.selectedModules.js ) {
			App.zip.queuing('js', true);
		}
		App.zip.queuing('assets', true);
		App.zip.queuing('build', true);

		App.zip.queuing('funky', true);


		//////////////////////////////////////////////////| GENERATING FILES
		App.css.get();

		if( App.selectedModules.js ) {
			App.js.get();
		}

		App.build.get();
		App.html.get();
		App.assets.get();
		App.funky.get();
	};


	//------------------------------------------------------------------------------------------------------------------------------------------------------------
	// Saves an array of the selected modules globally so we don't work with the raw data that comes from the client... as that could be a mess ;)
	//------------------------------------------------------------------------------------------------------------------------------------------------------------
	module.getPost = function FilesGetPost() {
		App.debugging( 'Files: Parsing POST', 'report' );

		var POST = App.POST;
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

				var json = App.modules.getJson( module );
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

		Object.keys( App.GUI.modules._core ).forEach(function FilesIterateCore( moduleName ) {
			var module = App.GUI.modules._core[moduleName];
			var version = POST[ 'module-' + module.ID ];

			var newObject = _.extend(module, module.versions[ version ]); //merge version to the same level
			newObject.version = POST[ 'module-' + module.ID ];

			fromPOST.core.push(newObject);

			log += ', ' + module.ID + ':' + version;
		});

		App.log.info( '             ' + log.substr(2) );


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


		//////////////////////////////////////////////////| SAVIG GLOBALLY
		App.selectedModules = fromPOST;
	};


	App.files = module;


}(App));
/***************************************************************************************************************************************************************
 *
 * Compile JS files
 *
 **************************************************************************************************************************************************************/


//--------------------------------------------------------------------------------------------------------------------------------------------------------------
// Dependencies
//--------------------------------------------------------------------------------------------------------------------------------------------------------------


(function JsApp(App) {

	var module = {};

	//------------------------------------------------------------------------------------------------------------------------------------------------------------
	// Module init method
	//------------------------------------------------------------------------------------------------------------------------------------------------------------
	module.init = function JsInit() {
		App.debugging( 'JS: Initiating', 'report' );
	};


	//------------------------------------------------------------------------------------------------------------------------------------------------------------
	// Get all js files and concat them
	//------------------------------------------------------------------------------------------------------------------------------------------------------------
	module.get = function JsGet() {
		App.debugging( 'JS: Generating js', 'report' );

		var files = [];
		var file = '';
		var core = '';
		var POST = App.POST;
		var jquery = '';
		var _includeJquery = App.selectedModules.includeJquery; //POST.hasOwnProperty('jquery');
		var _includeOriginal  = App.selectedModules.includeUnminifiedJS; //POST.hasOwnProperty('jsunminified');


		//////////////////////////////////////////////////| JQUERY
		if( _includeJquery ) { //optional include jquery
			jquery = Fs.readFileSync( App.GUIPATH + App.JQUERYPATH, 'utf8');

			if( _includeOriginal ) {
				App.zip.addFile( jquery, '/source/js/010-jquery.js' );
			}
		}


		//////////////////////////////////////////////////| CORE
		if( App.selectedModules.js ) {
			core = Fs.readFileSync( App.GUIPATH + '_javascript-helpers/' + POST[ 'module-_javascript-helpers' ] + '/js/020-core.js', 'utf8');
			core = App.branding.replace(core, ['Debug', 'false']); //remove debugging infos

			var core = UglifyJS.minify( core, { fromString: true });

			if( _includeOriginal ) {
				file = Fs.readFileSync( App.GUIPATH + '_javascript-helpers/' + POST[ 'module-_javascript-helpers' ] + '/js/020-core.js', 'utf8');
				file = App.branding.replace(file, ['Module-Version', ' Core v' + POST[ 'module-_javascript-helpers' ] + ' ']); //name the current version
				file = App.branding.replace(file, ['Debug', 'false']); //remove debugging infos
				App.zip.addFile( file, '/source/js/020-core.js' );
			}
		}


		//////////////////////////////////////////////////| MODULES
		App.selectedModules.modules.forEach(function JsIterateModules( module ) {
			var _hasJS = module.js; //look if this module has js

			if( _hasJS ) {
				files.push( App.GUIPATH + module.ID + '/' + module.version + '/js/' + module.ID + '.js' ); //add js to uglify

				file = Fs.readFileSync( App.GUIPATH + module.ID + '/' + module.version + '/js/' + module.ID + '.js', 'utf8');

				if( _includeOriginal ) {
					file = App.branding.replace(file, ['Module-Version', ' ' + module.name + ' v' + module.version + ' ']); //name the current version
					App.zip.addFile( file, '/source/js/' + module.ID + '.js' );
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

		var source = App.banner.attach( jquery + core.code + result.code ); //attach a banner to the top of the file with a URL of this build

		App.zip.queuing('js', false); //js queue is done
		App.zip.addFile( source, '/assets/js/gui.min.js' ); //add minified file to zip

	};


	App.js = module;


}(App));
/***************************************************************************************************************************************************************
 *
 * Compile CSS files
 *
 **************************************************************************************************************************************************************/


//--------------------------------------------------------------------------------------------------------------------------------------------------------------
// Dependencies
//--------------------------------------------------------------------------------------------------------------------------------------------------------------


(function CssApp(App) {

	var module = {};

	//------------------------------------------------------------------------------------------------------------------------------------------------------------
	// Module init method
	//------------------------------------------------------------------------------------------------------------------------------------------------------------
	module.init = function CssInit() {
		App.debugging( 'CSS: Initiating', 'report' );
	};


	//------------------------------------------------------------------------------------------------------------------------------------------------------------
	// Get all less files and compile them
	//------------------------------------------------------------------------------------------------------------------------------------------------------------
	module.get = function CssGet() {
		App.debugging( 'CSS: Generating css', 'report' );

		var POST = App.POST;
		var lessContents = '';
		var lessIndex = "\n\n" + '/* ---------------------------------------| MODULES |--------------------------------------- */' + "\n";
		var _includeOriginal  = App.selectedModules.includeLess; //POST.hasOwnProperty('includeless');


		//////////////////////////////////////////////////| CORE
		App.selectedModules.core.forEach(function CssIterateCore( module ) {
			var lessContent = App.branding.replace(
				Fs.readFileSync(App.GUIPATH + module.ID + '/' + module.version + '/less/module-mixins.less', 'utf8'),
				['Module-Version-Brand', ' ' + module.name + ' v' + module.version + ' ' + POST['brand']]
			);

			lessContent = App.branding.replace( lessContent, [ 'Brand', POST['brand'] ] );

			if( _includeOriginal ) {
				lessIndex += '@import \'' + module.ID + '.less\';' + "\n";
				App.zip.addFile( lessContent, '/source/less/' + module.ID + '.less' );
			}

			lessContents += lessContent;
		});


		//////////////////////////////////////////////////| MODULES
		App.selectedModules.modules.forEach(function CssIterateModules( module ) {
			var lessContent = App.branding.replace(
				Fs.readFileSync( App.GUIPATH + module.ID + '/' + module.version + '/less/module-mixins.less', 'utf8'),
				['Module-Version-Brand', ' ' + module.name + ' v' + module.version + ' ' + POST['brand'] + ' ']
			);

			lessContent = App.branding.replace( lessContent, [ 'Brand', POST['brand'] ] );

			if( _includeOriginal && module.less ) {
				lessIndex += '@import \'' + module.ID + '.less\';' + "\n";
				App.zip.addFile( lessContent, '/source/less/' + module.ID + '.less' );
			}

			lessContents += lessContent;
		});

		if( lessIndex && _includeOriginal ) {
			App.zip.addFile( App.banner.attach( lessIndex ), '/source/less/gui.less' );
		}

		//compile less
		Less.render(lessContents, {
			compress: true
		},
		function CssRenderLess(e, output) {
			//TODO: error handling

			var source = App.banner.attach( output.css ); //attach a banner to the top of the file with a URL of this build

			App.zip.queuing('css', false); //css queue is done
			App.zip.addFile( source, '/assets/css/gui.min.css' );

		});

	};


	App.css = module;


}(App));

/***************************************************************************************************************************************************************
 *
 * Compile HTML files
 *
 **************************************************************************************************************************************************************/


//--------------------------------------------------------------------------------------------------------------------------------------------------------------
// Dependencies
//--------------------------------------------------------------------------------------------------------------------------------------------------------------


(function HtmlApp(App) {

	var module = {};

	//------------------------------------------------------------------------------------------------------------------------------------------------------------
	// Module init method
	//------------------------------------------------------------------------------------------------------------------------------------------------------------
	module.init = function HtmlInit() {
		App.debugging( 'HTML: Initiating', 'report' );
	};


	//------------------------------------------------------------------------------------------------------------------------------------------------------------
	// Get all html files
	//------------------------------------------------------------------------------------------------------------------------------------------------------------
	module.get = function HtmlGet() {
		App.debugging( 'HTML: Getting all HTML files', 'report' );

		var POST = App.POST;
		var index = Fs.readFileSync( App.TEMPPATH + 'index.html', 'utf8');

		index = _.template( index )({ //render the index template
			_hasJS: App.selectedModules.js,
			_hasSVG: App.selectedModules.svg,
			Brand: POST['brand'],
			blendURL: App.banner.getBlendURL( App.selectedModules.brand ),
			blendURLBOM: App.banner.getBlendURL( 'BOM' ),
			blendURLBSA: App.banner.getBlendURL( 'BSA' ),
			blendURLSTG: App.banner.getBlendURL( 'STG' ),
			blendURLWBC: App.banner.getBlendURL( 'WBC' ),
			GUIRURL: App.GUIRURL + App.selectedModules.brand + '/blender/',
		});

		App.zip.queuing('html', false); //html queue is done
		App.zip.addFile( index, '/index.html' );

	};


	App.html = module;


}(App));
/***************************************************************************************************************************************************************
 *
 * Insert build tool
 *
 **************************************************************************************************************************************************************/


//--------------------------------------------------------------------------------------------------------------------------------------------------------------
// Dependencies
//--------------------------------------------------------------------------------------------------------------------------------------------------------------


(function BuildApp(App) {

	var module = {};

	//------------------------------------------------------------------------------------------------------------------------------------------------------------
	// Module init method
	//------------------------------------------------------------------------------------------------------------------------------------------------------------
	module.init = function BuildInit() {
		App.debugging( 'Build: Initiating', 'report' );
	};


	//------------------------------------------------------------------------------------------------------------------------------------------------------------
	// Returns json object of a specific module.json
	//
	// @param   module  [sting]  ID of module
	//
	// @return  [object]  Json object of module.json
	//------------------------------------------------------------------------------------------------------------------------------------------------------------
	module.get = function BuildGet() {
		App.debugging( 'Build: Getting build', 'report' );

		var _includeOriginalLess  = App.selectedModules.includeLess;
		var _includeOriginalJS  = App.selectedModules.includeUnminifiedJS;

		if( _includeOriginalLess || _includeOriginalJS) {
			App.zip.queuing('build', false); //build queue is done

			App.zip.addBulk( App.TEMPPATH, ['Gruntfile.js', 'package.json'], '/' );
		}
		else {
			App.zip.queuing('build', false); //build queue is done
		}
	};


	App.build = module;


}(App));
/***************************************************************************************************************************************************************
 *
 * Compile symbole files
 *
 **************************************************************************************************************************************************************/


//--------------------------------------------------------------------------------------------------------------------------------------------------------------
// Dependencies
//--------------------------------------------------------------------------------------------------------------------------------------------------------------


(function AssetsApp(App) {

	var module = {};

	//------------------------------------------------------------------------------------------------------------------------------------------------------------
	// Module init method
	//------------------------------------------------------------------------------------------------------------------------------------------------------------
	module.init = function AssetsInit() {
		App.debugging( 'Assets: Initiating', 'report' );
	};


	//------------------------------------------------------------------------------------------------------------------------------------------------------------
	// Get all assets files
	//------------------------------------------------------------------------------------------------------------------------------------------------------------
	module.get = function AssetsGet() {
		App.debugging( 'Assets: Getting all files', 'report' );

		var POST = App.POST;
		module.svgfiles.svg = '';
		module.svgfiles.png = '';
		module.svgfiles.fallback = '';


		//////////////////////////////////////////////////| CORE
		App.selectedModules.core.forEach(function AssetsIterateCore( module ) {
			if( module.font ) {
				App.assets.getFonts( App.GUIPATH + module.ID + '/' + module.version + '/_assets/' + POST['brand'] + '/font/' );
			}

			if( module.svg ) {
				App.assets.getSVG( App.GUIPATH + module.ID + '/' + module.version + '/tests/' + POST['brand'] + '/assets/' );
			}
		});


		//////////////////////////////////////////////////| MODULES
		App.selectedModules.modules.forEach(function AssetsIterateModules( module ) {

			if( module.font ) {
				App.assets.getFonts( App.GUIPATH + module.ID + '/' + module.version + '/_assets/' + POST['brand'] );
			}

			if( module.svg ) {
				App.assets.getSVG( App.GUIPATH + module.ID + '/' + module.version + '/tests/' + POST['brand'] + '/assets/' );
			}

		});


		//adding files to zip
		App.zip.addFile( App.assets.svgfiles.svg, '/assets/css/symbols.data.svg.css' );
		App.zip.addFile( App.assets.svgfiles.png, '/assets/css/symbols.data.png.css' );
		App.zip.queuing('assets', false); //assets queue is done
		App.zip.addFile( App.assets.svgfiles.fallback, '/assets/css/symbols.fallback.css' );

	};


	//------------------------------------------------------------------------------------------------------------------------------------------------------------
	// Get all font files from a specific folder
	//
	// @param  [string]  Path to a folder of the font files
	//------------------------------------------------------------------------------------------------------------------------------------------------------------
	module.getFonts = function AssetsGetFonts( folder ) {
		App.debugging( 'Assets: Getting font files', 'report' );

		var files = [
			'*.eot',
			'*.svg',
			'*.ttf',
			'*.woff',
			'*.woff2',
		];

		App.zip.addBulk( folder, files, '/assets/font/' );

	};


	//------------------------------------------------------------------------------------------------------------------------------------------------------------
	// Get all svg string and png fallback files from a specific folder
	//
	// @param  [string]  Path to a tests folder
	//------------------------------------------------------------------------------------------------------------------------------------------------------------
	module.getSVG = function AssetsGetSvg( folder ) {
		App.debugging( 'Assets: Getting svg files from ' + folder, 'report' );

		//////////////////////////////////////////////////| ADDING PNGs
		App.zip.addBulk( folder + 'img/', [ '*.png' ], '/assets/img/' );

		//////////////////////////////////////////////////| BUILDING CSS FILES
		App.assets.svgfiles.svg += Fs.readFileSync( folder + 'css/symbols.data.svg.css', 'utf8'); //svg
		App.assets.svgfiles.png += Fs.readFileSync( folder + 'css/symbols.data.png.css', 'utf8'); //png
		App.assets.svgfiles.fallback += Fs.readFileSync( folder + 'css/symbols.fallback.css', 'utf8'); //fallack

	};


	//------------------------------------------------------------------------------------------------------------------------------------------------------------
	// Global vars
	//------------------------------------------------------------------------------------------------------------------------------------------------------------
	module.svgfiles = {};
	module.svgfiles.svg = '';
	module.svgfiles.png = '';
	module.svgfiles.fallback = '';


	App.assets = module;


}(App));
/***************************************************************************************************************************************************************
 *
 * Brand all content
 *
 **************************************************************************************************************************************************************/


//--------------------------------------------------------------------------------------------------------------------------------------------------------------
// Dependencies
//--------------------------------------------------------------------------------------------------------------------------------------------------------------


(function BrandingApp(App) {

	var module = {};

	//------------------------------------------------------------------------------------------------------------------------------------------------------------
	// Module init method
	//------------------------------------------------------------------------------------------------------------------------------------------------------------
	module.init = function BrandingInit() {
		App.debugging( 'Branding: Initiating', 'report' );
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
		App.debugging( 'Branding: Replacing "' + replace[0] + '" with "' + replace[1] + '"', 'report' );

		var pattern = new RegExp('\\[(' + replace[0] + ')\\]', 'g');
		return content.replace(pattern, replace[1]);

	};


	App.branding = module;


}(App));
/***************************************************************************************************************************************************************
 *
 * Get modules infos
 *
 **************************************************************************************************************************************************************/


//--------------------------------------------------------------------------------------------------------------------------------------------------------------
// Dependencies
//--------------------------------------------------------------------------------------------------------------------------------------------------------------


(function ModulesApp(App) {

	var module = {};

	//------------------------------------------------------------------------------------------------------------------------------------------------------------
	// Module init method
	//------------------------------------------------------------------------------------------------------------------------------------------------------------
	module.init = function ModulesInit() {
		App.debugging( 'Modules: Initiating', 'report' );
	};


	//------------------------------------------------------------------------------------------------------------------------------------------------------------
	// Returns json object of a specific module.json
	//
	// @param   module  [sting]  ID of module
	//
	// @return  [object]  Json object of module.json
	//------------------------------------------------------------------------------------------------------------------------------------------------------------
	module.getJson = function ModulesGetJson( module ) {
		App.debugging( 'Modules: Getting JSON for ' + module, 'report' );


		if( App.GUImodules === undefined ) { //flatten GUI json and assign to global

			App.GUImodules = {};
			Object.keys( App.GUI.modules ).forEach(function ModulesIterateCategory( category ) {

				Object.keys( App.GUI.modules[ category ] ).forEach(function ModulesIterateModules( mod ) {
					App.GUImodules[ mod ] = App.GUI.modules[ category ][ mod ];
				});

			});
		}

		return App.GUImodules[module];
		// JSON.parse( Fs.readFileSync( App.GUIPATH + module + '/module.json', 'utf8') ); //getting from module.json if we want to have a lot of I/O (we don't)

	};


	App.modules = module;


}(App));
/***************************************************************************************************************************************************************
 *
 * Get banner infos
 *
 **************************************************************************************************************************************************************/


//--------------------------------------------------------------------------------------------------------------------------------------------------------------
// Dependencies
//--------------------------------------------------------------------------------------------------------------------------------------------------------------


(function BannerApp(App) {

	var module = {};

	//------------------------------------------------------------------------------------------------------------------------------------------------------------
	// Module init method
	//------------------------------------------------------------------------------------------------------------------------------------------------------------
	module.init = function BannerInit() {
		App.debugging( 'Banner: Initiating', 'report' );
	};


	//------------------------------------------------------------------------------------------------------------------------------------------------------------
	// Get the banner text
	//
	// @return  [string]  Content with attached banner
	//------------------------------------------------------------------------------------------------------------------------------------------------------------
	module.get = function BannerGet() {
		App.debugging( 'Banner: Generating banner', 'report' );

		return '/* GUI blend ' + App.banner.getBlendURL( App.selectedModules.brand ) + ' */' + "\n";

	};


	//------------------------------------------------------------------------------------------------------------------------------------------------------------
	// Attach the banner to some content
	//
	// @param   content  [string]  Content the banner needs to be attached to
	//
	// @return  [string]  Content with attached banner
	//------------------------------------------------------------------------------------------------------------------------------------------------------------
	module.attach = function BannerAttach( content ) {
		App.debugging( 'Banner: Attaching banner', 'report' );

		if( content.length > 0 ) {
			return App.banner.get() + content;
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
		App.debugging( 'Banner: Generating blend link', 'report' );

		var url = App.GUIRURL + brand + '/blender/#';

		App.selectedModules.core.forEach(function BannerIterateCore( module ) { //adding core
			url += '/' + module.ID + ':' + module.version;
		});

		App.selectedModules.modules.forEach(function BannerIterateModules( module ) { //adding modules
			url += '/' + module.ID + ':' + module.version;
		});

		return url;
	};


	App.banner = module;


}(App));
/***************************************************************************************************************************************************************
 *
 * Collect and zip all files
 *
 **************************************************************************************************************************************************************/


//--------------------------------------------------------------------------------------------------------------------------------------------------------------
// Dependencies
//--------------------------------------------------------------------------------------------------------------------------------------------------------------
var Archiver = require('archiver');


(function ZipApp(App) {

	var module = {};

	//------------------------------------------------------------------------------------------------------------------------------------------------------------
	// Module init method
	//------------------------------------------------------------------------------------------------------------------------------------------------------------
	module.init = function ZipInit() {
		App.debugging( 'Zip: Initiating', 'report' );
	};


	//------------------------------------------------------------------------------------------------------------------------------------------------------------
	// Zip all files up and send to response
	//------------------------------------------------------------------------------------------------------------------------------------------------------------
	module.getZip = function ZipGetZip() {
		App.debugging( 'Zip: Compiling zip', 'report' );

		App.response.writeHead(200, {
			'Content-Type': 'application/zip',
			'Content-disposition': 'attachment; filename=GUI-blend-' + App.selectedModules.brand + '.zip',
		});

		App.zip.archive.pipe( App.response );

		try {
			App.zip.archive.finalize(); //send to server

			App.log.info( '             Zip sent!' );

			App.slack.post();
		}
		catch( error ) {

			App.log.error( '             Zip ERROR' );
			App.log.error( error );
		}

		//add new blend to log
		App.counter.add();

		//clearning up
		App.zip.archive = Archiver('zip'); //new archive
		App.zip.files = []; //empty files
		module.queue = {}; // empty queue
	};


	//------------------------------------------------------------------------------------------------------------------------------------------------------------
	// Check if queue is clear
	//------------------------------------------------------------------------------------------------------------------------------------------------------------
	module.readyZip = function ZipReadyZip() {
		App.debugging( 'Zip: Readying zip', 'report' );

		if( App.zip.isQueuingEmpty() ) { //if queue is clear, add all files to the archive

			App.zip.files.forEach(function ZipIterateZipFiles( file ) {
				App.zip.archive.append( file.content, { name: file.name } );
			});

			App.zip.getZip(); //finalize the zip
		}

	};


	//------------------------------------------------------------------------------------------------------------------------------------------------------------
	// Add a file to the zip archive
	//
	// @param   content      [string]  The content of the file
	// @param   archivePath  [string]  The path this file will have inside the archive
	//------------------------------------------------------------------------------------------------------------------------------------------------------------
	module.addFile = function ZipAddFile( content, archivePath ) {
		App.debugging( 'Zip: Adding file: ' + archivePath, 'report' );

		if(typeof content !== 'string') {
			App.debugging( 'Zip: Adding file: Content can only be string, is ' + (typeof content), 'error' );
		}
		else {
			if( content.length > 0 ) { //don't need no empty files ;)
				App.zip.files.push({ //collect file for later adding
					content: content,
					name: '/GUI-blend' + archivePath,
				});
			}
		}

		App.zip.readyZip();
	};


	//------------------------------------------------------------------------------------------------------------------------------------------------------------
	// Add a file to the zip archive
	//
	// @param   path         [string]  The path to the file to be added
	// @param   archivePath  [string]  The path this file will have inside the archive
	//------------------------------------------------------------------------------------------------------------------------------------------------------------
	module.addPath = function ZipAddPath( path, archivePath ) {
		App.debugging( 'Zip: Adding file path: ' + path, 'report' );

		if(typeof path !== 'string') {
			App.debugging( 'Zip: Adding file path: Path can only be string, is ' + (typeof path), 'error' );
		}
		else {
			if( path.length > 0 ) { //don't need no empty files ;)
				App.zip.archive.file(
					path,
					{
						name: '/GUI-blend' + archivePath,
					}
				);
			}
		}

		App.zip.readyZip();
	};


	//------------------------------------------------------------------------------------------------------------------------------------------------------------
	// Add a file to the zip archive
	//
	// @param  cwd          [string]  The current working directory to flatten the paths in the archive
	// @param  files        [array]   The file extensions of the files
	// @param  archivePath  [string]  The path these files will have inside the archive
	//------------------------------------------------------------------------------------------------------------------------------------------------------------
	module.addBulk = function ZipAddBulk( cwd, files, archivePath ) {
		App.debugging( 'Zip: Adding bluk: ' + cwd + files + ' to: ' + archivePath, 'report' );

		if(typeof files !== 'object') {
			App.debugging( 'Zip: Adding files: Path can only be array/object, is ' + (typeof files), 'error' );
		}
		else {

			App.zip.archive.bulk({ //add them all to the archive
				expand: true,
				cwd: cwd,
				src: files,
				dest: '/GUI-blend' + archivePath,
				filter: 'isFile',
			});

		}

		App.zip.readyZip();
	};


	//------------------------------------------------------------------------------------------------------------------------------------------------------------
	// Add or remove a type to queue so we can wait for all to be finished
	//
	// @param   type           [string]   Identifier for a type of file we are waiting for
	// @param   _isBeingAdded  [boolean]  Whether or not this type is added or removed from the queue
	//------------------------------------------------------------------------------------------------------------------------------------------------------------
	module.queuing = function ZipQueuing( type, _isBeingAdded ) {
		App.debugging( 'Zip: Queuing files', 'report' );

		if( _isBeingAdded ) {
			App.debugging( 'Zip: Queue: Adding ' + type, 'report' );

			App.zip.queue[type] = true;
		}
		else {
			if( App.zip.queue[type] ) {
				App.debugging( 'Zip: Queue: Removing ' + type, 'report' );

				delete App.zip.queue[type];
			}
		}

	};


	//------------------------------------------------------------------------------------------------------------------------------------------------------------
	// Check if the queue is empty
	//
	// @return  [boolean]  Whether or not it is...
	//------------------------------------------------------------------------------------------------------------------------------------------------------------
	module.isQueuingEmpty = function ZipIsQueuingEmpty() {
		App.debugging( 'Zip: Checking queue', 'report' );

		for( var prop in App.zip.queue ) {
			if( App.zip.queue.hasOwnProperty(prop) ) {
				App.debugging( 'Zip: Queue: Still things in the queue', 'report' );

				return false;
			}
		}

		App.debugging( 'Zip: Queue: Queue is empty', 'report' );
		return true;
	};


	//------------------------------------------------------------------------------------------------------------------------------------------------------------
	// Global vars
	//------------------------------------------------------------------------------------------------------------------------------------------------------------
	module.queue = {}; //global object to hold queue
	module.archive = Archiver('zip'); //class to add files to zip globally
	module.files = []; //an array of all files to be added to the archive


	App.zip = module;


}(App));
/***************************************************************************************************************************************************************
 *
 * Post to slack
 *
 **************************************************************************************************************************************************************/


//--------------------------------------------------------------------------------------------------------------------------------------------------------------
// Dependencies
//--------------------------------------------------------------------------------------------------------------------------------------------------------------
var Slack = require('node-slack');


(function SlackApp(App) {

	var module = {};

	//------------------------------------------------------------------------------------------------------------------------------------------------------------
	// Module init method
	//------------------------------------------------------------------------------------------------------------------------------------------------------------
	module.post = function SlackPost() {
		App.debugging( 'Slack: Posting', 'report' );

		var slack = new Slack( App.SLACKURL );
		var funky = '';
		var core = '';
		var modules = '';
		var POST = App.POST;
		var jquery = App.selectedModules.includeJquery ? '`Yes`' : '`No`';
		var unminJS  = App.selectedModules.includeUnminifiedJS ? '`Yes`' : '`No`';
		var less  = App.selectedModules.includeLess ? '`Yes`' : '`No`';

		var channel = '#testing';
		if( !App.DEBUG ) {
			var channel = '#blender';
		}

		for(var i = App.FUNKY.length - 1; i >= 0; i--) {
			if( POST[ App.FUNKY[i].var ] === 'on' ) {
				funky += '`' + App.FUNKY[i].name + '` ';
			}
		}

		if( funky === '' ) {
			funky = '`none`';
		}

		App.selectedModules.core.forEach(function CssIterateCore( module ) {
			core += ', `' + module.ID+ ':' + module.version + '`';
		});

		App.selectedModules.modules.forEach(function SlackIterateModules( module ) {
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
							'_Selected_: `' + App.selectedModules.modules.length + '`\n' +
							'_Core_:\n' + core.substr(2) + '\n' +
							'_Modules_:\n' + modules.substr(2) + '\n\n\n',
						'short': false,
					},
					{
						'title': 'Options',
						'value': '' +
							'_Brand_: `' + App.selectedModules.brand + '`\n' +
							'_jQuery_: ' + jquery + '\n' +
							'_unmin JS_: ' + unminJS + '\n' +
							'_Less_: ' + less + '\n' +
							'_Funky_: ' + funky + '\n\n\n',
						'short': false,
					},
					{
						'title': 'Client',
						'value': '' +
							'_IP_: `' + App.IP + '`',
						'short': false,
					}
				],
			}],
			'channel': channel,
			'username': 'The Blender',
			'icon_url': App.SLACKICON,
		});
	};


	App.slack = module;


}(App));
/***************************************************************************************************************************************************************
 *
 * Funky stuff
 *
 **************************************************************************************************************************************************************/


//--------------------------------------------------------------------------------------------------------------------------------------------------------------
// Dependencies
//--------------------------------------------------------------------------------------------------------------------------------------------------------------


(function FunkyApp(App) {

	var module = {};

	//------------------------------------------------------------------------------------------------------------------------------------------------------------
	// Module get method
	//------------------------------------------------------------------------------------------------------------------------------------------------------------
	module.get = function funkyPost() {
		App.debugging( 'funky: Getting funky stuff', 'report' );

		var POST = App.POST;
		var funkies = 0;

		for(var i = App.FUNKY.length - 1; i >= 0; i--) {
			if( POST[ App.FUNKY[i].var ] === 'on' ) {
				funkies++; //how many funky bits have been requested?
			}
		}

		if( funkies > 0 ) {
			for(var i = App.FUNKY.length - 1; i >= 0; i--) {

				if( POST[ App.FUNKY[i].var ] === 'on' ) {
					App.debugging( 'funky: Getting ' + App.FUNKY[i].name + ' reference', 'report' );

					funkies--; //counting down

					if( funkies === 0 ) { //if this is the last one
						App.zip.queuing('funky', false);
					}

					var file = App.FUNKY[i].file.replace( '[Brand]', POST['brand'] ); //brand path

					App.zip.addPath( file, App.FUNKY[i].zip ); //add file to zip
				}
			}
		}
		else {
			App.zip.queuing('funky', false);
			App.zip.readyZip();
		}
	};


	App.funky = module;


}(App));
/***************************************************************************************************************************************************************
 *
 * Counter
 *
 **************************************************************************************************************************************************************/


//--------------------------------------------------------------------------------------------------------------------------------------------------------------
// Dependencies
//--------------------------------------------------------------------------------------------------------------------------------------------------------------


(function CounterApp(App) {

	var module = {};

	//------------------------------------------------------------------------------------------------------------------------------------------------------------
	// Module add method
	//------------------------------------------------------------------------------------------------------------------------------------------------------------
	module.add = function counterPost() {
		App.debugging( 'counter: adding new instance', 'report' );

		var counter = 0;

		Fs.readFile( App.LOG , function(err, data) {
			if( err ) {
				throw err;
			}

			counter = parseInt( data ) + 1;

			Fs.writeFile( App.LOG, counter, function(err) {
				if( err ) {
					throw err;
				}

				App.debugging( 'counter: added', 'report' );
			});
		});
	};


	App.counter = module;


}(App));