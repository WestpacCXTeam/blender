/***************************************************************************************************************************************************************
 *
 * Compile symbole files
 *
 **************************************************************************************************************************************************************/


//--------------------------------------------------------------------------------------------------------------------------------------------------------------
// Dependencies
//--------------------------------------------------------------------------------------------------------------------------------------------------------------


//--------------------------------------------------------------------------------------------------------------------------------------------------------------
// Module
//--------------------------------------------------------------------------------------------------------------------------------------------------------------
Blender.assets = (() => {

	return {

//--------------------------------------------------------------------------------------------------------------------------------------------------------------
// Module init method
//--------------------------------------------------------------------------------------------------------------------------------------------------------------
		init: () => {
			Blender.debugging.report(`Assets: Initiating`);
		},


//--------------------------------------------------------------------------------------------------------------------------------------------------------------
// Get all assets files
//--------------------------------------------------------------------------------------------------------------------------------------------------------------
		get: () => {
			Blender.debugging.report(`Assets: Getting all files`);

			const POST = Blender.POST;
			const _includeSVG = Blender.selectedModules.includeSVG;
			Blender.assets.svgfiles.svg = ``;
			Blender.assets.svgfiles.png = ``;
			Blender.assets.svgfiles.fallback = ``;
			Blender.assets.svgfiles.grunticon = {};


			//////////////////////////////////////////////////| CORE
			Blender.selectedModules.core.forEach(( module ) => {
				// if( module.font ) {
				// 	Blender.assets.getFonts(`${Blender.GUIPATH}${module.ID}/${module.version}/_assets/${POST[`brand`]}/font/`);
				// }

				if( module.svg ) {
					Blender.assets.getSVG(`${Blender.GUIPATH}${module.ID}/${module.version}/tests/${POST[`brand`]}/assets/`);
				}
			});


			//////////////////////////////////////////////////| MODULES
			Blender.selectedModules.modules.forEach(( module ) => {

				// if( module.font ) {
				// 	Blender.assets.getFonts(`${Blender.GUIPATH}${module.ID}/${module.version}/_assets/${POST[`brand`]}`);
				// }

				if( module.svg ) {
					Blender.assets.getSVG(`${Blender.GUIPATH}${module.ID}/${module.version}/tests/${POST[`brand`]}/assets/`);
				}

			});


			//adding files to zip
			Blender.zip.addFile( Blender.assets.svgfiles.svg, `/assets/css/symbols.data.svg.css` );
			Blender.zip.addFile( Blender.assets.svgfiles.png, `/assets/css/symbols.data.png.css` );
			Blender.zip.addFile( Blender.assets.svgfiles.fallback, `/assets/css/symbols.fallback.css` );
			Blender.zip.queuing(`assets`, false); //assets queue is done

			if( _includeSVG ) { //optional include SVG files
				Blender.zip.addFile( JSON.stringify( Blender.assets.svgfiles.grunticon, null, `\t` ), `/source/svgs/grunticon.json` );
			}

		},


//--------------------------------------------------------------------------------------------------------------------------------------------------------------
// Get all font files from a specific folder
//
// @param  [string]  Path to a folder of the font files
//--------------------------------------------------------------------------------------------------------------------------------------------------------------
		getFonts: ( folder ) => {
			Blender.debugging.report(`Assets: Getting font files`);

			let files = [
				`*.eot`,
				`*.svg`,
				`*.ttf`,
				`*.woff`,
				`*.woff2`,
			];

			Blender.zip.addBulk( folder, files, `/assets/font/` );

		},


//--------------------------------------------------------------------------------------------------------------------------------------------------------------
// Get all svg string and png fallback files from a specific folder
//
// @param  [string]  Path to a tests folder
//--------------------------------------------------------------------------------------------------------------------------------------------------------------
		getSVG: ( folder ) => {
			Blender.debugging.report(`Assets: Getting svg files from ${folder}`);

			//////////////////////////////////////////////////| ADDING PNGs
			Blender.zip.addBulk(`${folder}img/`, [`*.png`], `/assets/img/`);

			//////////////////////////////////////////////////| BUILDING CSS FILES
			Blender.assets.svgfiles.svg += Fs.readFileSync(`${folder}css/symbols.data.svg.css`, `utf8`); //svg
			Blender.assets.svgfiles.png += Fs.readFileSync(`${folder}css/symbols.data.png.css`, `utf8`); //png
			Blender.assets.svgfiles.fallback += Fs.readFileSync(`${folder}css/symbols.fallback.css`, `utf8`); //fallack

			//////////////////////////////////////////////////| ADDING SOURCE SVG FILES
			const _includeSVG = Blender.selectedModules.includeSVG;

			if( _includeSVG ) { //optional include SVG files
				let rootFolder = Path.normalize(`${folder}../../../`);
				const oldFolder = Path.normalize(`${rootFolder}_assets/${Blender.POST[`brand`]}/svg/`);
				const newFolder = Path.normalize(`${rootFolder}tests/${Blender.POST[`brand`]}/assets/svg/`);

				if( Fs.existsSync( newFolder ) ) {
					Blender.zip.addBulk( newFolder, [`*.svg`], `/source/svgs/` ); //new SVG location
				}
				else {
					Blender.zip.addBulk( oldFolder, [`*.svg`], `/source/svgs/` ); //old SVG location
				}

				let grunticon = JSON.parse( Fs.readFileSync(`${rootFolder}_assets/grunticon.json`, `utf8`) );
				Blender.assets.svgfiles.grunticon = _.extend( Blender.assets.svgfiles.grunticon, grunticon ); //merge new grunticon keys into this object
			}

		},


//--------------------------------------------------------------------------------------------------------------------------------------------------------------
// Global vars
//--------------------------------------------------------------------------------------------------------------------------------------------------------------
		svgfiles: {
			svg: ``,
			png: ``,
			fallback: ``,
			grunticon: {},
		},

	}

})();