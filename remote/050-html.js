/***************************************************************************************************************************************************************
 *
 * Compile HTML files
 *
 **************************************************************************************************************************************************************/


//--------------------------------------------------------------------------------------------------------------------------------------------------------------
// Dependencies
//--------------------------------------------------------------------------------------------------------------------------------------------------------------


//--------------------------------------------------------------------------------------------------------------------------------------------------------------
// Module
//--------------------------------------------------------------------------------------------------------------------------------------------------------------
Blender.html = (() => {

	return {

//--------------------------------------------------------------------------------------------------------------------------------------------------------------
// Module init method
//--------------------------------------------------------------------------------------------------------------------------------------------------------------
		init: () => {
			Blender.debugging.report(`HTML: Initiating`);
		},


//--------------------------------------------------------------------------------------------------------------------------------------------------------------
// Get all html files
//--------------------------------------------------------------------------------------------------------------------------------------------------------------
		get: () => {
			Blender.debugging.report(`HTML: Getting all HTML files`);

			var POST = Blender.POST;
			var index = Fs.readFileSync(`${Blender.TEMPPATH}index.html`, `utf8`);
			var _includeOriginalLess  = Blender.selectedModules.includeLess;
			var _includeOriginalJS  = Blender.selectedModules.includeUnminifiedJS;
			var _hasBuild = false;
			var guiconfig = JSON.parse( Fs.readFileSync( Blender.GUICONFIG, `utf8`) ); //getting guiconfig for brands
			var brands = {};

			if( _includeOriginalLess || _includeOriginalJS) {
				_hasBuild = true;
			}

			guiconfig.brands.forEach(( brand ) => { //add URLs for all other brands
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
				Brand: POST[`brand`],
				brands: brands,
				blendURL: Blender.banner.getBlendURL( Blender.selectedModules.brand ),
				GUIRURL: `${Blender.GUIRURL}${Blender.selectedModules.brand}/blender/`,
			}

			index = _.template( index )( options ); //render the index template

			Blender.zip.queuing(`html`, false); //html queue is done
			Blender.zip.addFile( index, `/index.html` );

		},

	}

})();