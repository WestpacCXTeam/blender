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