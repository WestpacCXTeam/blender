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