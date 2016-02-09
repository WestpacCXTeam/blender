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