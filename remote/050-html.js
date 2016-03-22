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

		if( _includeOriginalLess || _includeOriginalJS) {
			_hasBuild = true;
		}

		var options = { //options for underscore template
			_hasJS: App.selectedModules.js,
			_hasSVG: App.selectedModules.svg,
			_hasBuild: _hasBuild,
			Brand: POST['brand'],
			blendURL: App.banner.getBlendURL( App.selectedModules.brand ),
			GUIRURL: App.GUIRURL + App.selectedModules.brand + '/blender/',
		}

		var guiconfig = JSON.parse( Fs.readFileSync( '../.guiconfig', 'utf8') ); //getting guiconfig for brands

		guiconfig.brands.forEach(function HTMLIterateBrand( brand ) { //add URLs for each brand
			options[ 'blendURL' + brand ] = App.banner.getBlendURL( brand );
		});

		index = _.template( index )( options ); //render the index template

		App.zip.queuing('html', false); //html queue is done
		App.zip.addFile( index, '/index.html' );

	};


	App.html = module;


}(App));