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

			let POST = Blender.POST;
			let index = Fs.readFileSync(`${Blender.TEMPPATH}index.html`, `utf8`);
			let _includeOriginalLess  = Blender.selectedModules.includeLess;
			let _includeOriginalJS  = Blender.selectedModules.includeUnminifiedJS;
			let _hasBuild = false;
			let guiconfig = JSON.parse( Fs.readFileSync( Blender.GUICONFIG, `utf8`) ); //getting guiconfig for brands
			let brands = {};

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

			let options = { //options for underscore template
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