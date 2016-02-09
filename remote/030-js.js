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