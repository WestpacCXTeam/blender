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