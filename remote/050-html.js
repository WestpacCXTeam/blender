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

			const POST = Blender.POST;
			const _includeOriginalLess  = Blender.selectedModules.includeLess;
			const _includeOriginalJS  = Blender.selectedModules.includeUnminifiedJS;
			const guiconfig = JSON.parse( Fs.readFileSync( Blender.GUICONFIG, `utf8`) ); //getting guiconfig for brands
			const fontVersion = POST[`module-_fonts`];
			let index = Fs.readFileSync(`${Blender.TEMPPATH}index.html`, `utf8`);
			let _hasBuild = false;
			let brands = {};
			let options = {};
			options.webfonts = '';

			if( _includeOriginalLess || _includeOriginalJS) {
				_hasBuild = true;
			}

			guiconfig.brands.forEach(( brand ) => { //iterate over brands
				let fontFiles = [];

				if( brand.ID !== Blender.selectedModules.brand ) { //add URLs for all other brands
					brands[ brand.ID ] = {};
					brands[ brand.ID ].url = Blender.banner.getBlendURL( brand.ID );
					brands[ brand.ID ].name = brand.name;
					brands[ brand.ID ].webfonts = '';
				}

				try { //are there any font files in the font folder?
					fontFiles = Fs.readdirSync(`${Blender.GUIPATH}_fonts/${fontVersion}/_assets/${brand.ID}/font/`);
				}
				catch( error ) {
					//we know there are some folders that don't have fonts. All good.
				}

				if( fontFiles.length > 0 ) {
					let webfontPath = `${Blender.WEBFONTSROOT}_fonts-${fontVersion}-${brand.ID}.zip`;

					if( brand.ID === Blender.selectedModules.brand ) { //add webfont for this brand
						options.webfonts = webfontPath;
					}
					else {
						brands[ brand.ID ].webfonts = webfontPath; //add webfont for all other brands
					}
				}
			});

			//options for underscore template
			options._hasJS = Blender.selectedModules.js;
			options._hasSVG = Blender.selectedModules.svg;
			options._hasBuild = _hasBuild;
			options.Brand = POST[`brand`];
			options.brands = brands;
			options.blendURL = Blender.banner.getBlendURL( Blender.selectedModules.brand );
			options.GUIRURL = `${Blender.GUIRURL}${Blender.selectedModules.brand}/blender/`;

			index = _.template( index )( options ); //render the index template

			Blender.zip.queuing(`html`, false); //html queue is done
			Blender.zip.addFile( index, `/index.html` );

		},

	}

})();