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
		var _includeOriginalLess  = App.selectedModules.includeLess;
		var _includeOriginalJS  = App.selectedModules.includeUnminifiedJS;
		var _hasBuild = false;
		var guiconfig = JSON.parse( Fs.readFileSync( '../.guiconfig', 'utf8') ); //getting guiconfig for brands
		var brands = {};

		if( _includeOriginalLess || _includeOriginalJS) {
			_hasBuild = true;
		}

		guiconfig.brands.forEach(function HTMLIterateBrand( brand ) { //add URLs for all other brands
			if( brand.ID !== App.selectedModules.brand ) {
				brands[ brand.ID ] = {};
				brands[ brand.ID ].url = App.banner.getBlendURL( brand.ID );
				brands[ brand.ID ].name = brand.name;
			}
		});

		var options = { //options for underscore template
			_hasJS: App.selectedModules.js,
			_hasSVG: App.selectedModules.svg,
			_hasBuild: _hasBuild,
			Brand: POST['brand'],
			brands: brands,
			blendURL: App.banner.getBlendURL( App.selectedModules.brand ),
			GUIRURL: App.GUIRURL + App.selectedModules.brand + '/blender/',
		}

		index = _.template( index )( options ); //render the index template

		App.zip.queuing('html', false); //html queue is done
		App.zip.addFile( index, '/index.html' );

	};


	App.html = module;


}(App));