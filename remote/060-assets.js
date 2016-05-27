/***************************************************************************************************************************************************************
 *
 * Compile symbole files
 *
 **************************************************************************************************************************************************************/


//--------------------------------------------------------------------------------------------------------------------------------------------------------------
// Dependencies
//--------------------------------------------------------------------------------------------------------------------------------------------------------------


((Blender) => {

	let module = {};

	//------------------------------------------------------------------------------------------------------------------------------------------------------------
	// Module init method
	//------------------------------------------------------------------------------------------------------------------------------------------------------------
	module.init = () => {
		Blender.debugging( 'Assets: Initiating', 'report' );
	};


	//------------------------------------------------------------------------------------------------------------------------------------------------------------
	// Get all assets files
	//------------------------------------------------------------------------------------------------------------------------------------------------------------
	module.get = () => {
		Blender.debugging( 'Assets: Getting all files', 'report' );

		var POST = Blender.POST;
		module.svgfiles.svg = '';
		module.svgfiles.png = '';
		module.svgfiles.fallback = '';


		//////////////////////////////////////////////////| CORE
		Blender.selectedModules.core.forEach(( module ) => {
			if( module.font ) {
				Blender.assets.getFonts( Blender.GUIPATH + module.ID + '/' + module.version + '/_assets/' + POST['brand'] + '/font/' );
			}

			if( module.svg ) {
				Blender.assets.getSVG( Blender.GUIPATH + module.ID + '/' + module.version + '/tests/' + POST['brand'] + '/assets/' );
			}
		});


		//////////////////////////////////////////////////| MODULES
		Blender.selectedModules.modules.forEach(( module ) => {

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
	module.getFonts = ( folder ) => {
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
	module.getSVG = ( folder ) => {
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


})(Blender);