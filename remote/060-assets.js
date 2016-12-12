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
			[nottraviscomment]Blender.assets.svgfiles.svg += Fs.readFileSync(`${folder}css/symbols.data.svg.css`, `utf8`); //svg
			[traviscomment]Request({ 
				[traviscomment]url: `${folder}css/symbols.data.svg.css`
			[traviscomment]}, function (error, response, body) {
				[traviscomment]if (!error && response.statusCode === 200) {
					[traviscomment]Blender.assets.svgfiles.svg += body;
				[traviscomment]} else {
					[traviscomment]Blender.log.error(`             ERROR loading ${folder}css/symbols.data.svg.css`);
					[traviscomment]Blender.log.error( error );
				[traviscomment]}
			[traviscomment]});

			[nottraviscomment]Blender.assets.svgfiles.png += Fs.readFileSync(`${folder}css/symbols.data.png.css`, `utf8`); //png
			[traviscomment]Request({ 
				[traviscomment]url: `${folder}css/symbols.data.png.css`
			[traviscomment]}, function (error, response, body) {
				[traviscomment]if (!error && response.statusCode === 200) {
					[traviscomment]Blender.assets.svgfiles.png += body;
				[traviscomment]} else {
					[traviscomment]Blender.log.error(`             ERROR loading ${folder}css/symbols.data.png.css`);
					[traviscomment]Blender.log.error( error );
				[traviscomment]}
			[traviscomment]});

			[nottraviscomment]Blender.assets.svgfiles.fallback += Fs.readFileSync(`${folder}css/symbols.fallback.css`, `utf8`); //fallack
			[traviscomment]Request({ 
				[traviscomment]url: `${folder}css/symbols.fallback.css`
			[traviscomment]}, function (error, response, body) {
				[traviscomment]if (!error && response.statusCode === 200) {
					[traviscomment]Blender.assets.svgfiles.fallback += body;
				[traviscomment]} else {
					[traviscomment]Blender.log.error(`             ERROR loading ${folder}css/symbols.fallback.css`);
					[traviscomment]Blender.log.error( error );
				[traviscomment]}
			[traviscomment]});

			//////////////////////////////////////////////////| ADDING SOURCE SVG FILES
			const _includeSVG = Blender.selectedModules.includeSVG;

			if( _includeSVG ) { //optional include SVG files
				[nottraviscomment]let rootFolder = Path.normalize(`${folder}../../../`);
				[traviscomment]let rootFolder = `${folder}../../../`;
				let grunticon = ``;

				Blender.zip.addBulk( `${rootFolder}_assets/${Blender.POST[`brand`]}/svg/`, [`*.svg`], `/source/svgs/` ); //old SVG location
				Blender.zip.addBulk( `${rootFolder}tests/${Blender.POST[`brand`]}/assets/svg/`, [`*.svg`], `/source/svgs/` ); //new SVG location

				[nottraviscomment]grunticon = JSON.parse( Fs.readFileSync(`${rootFolder}_assets/grunticon.json`, `utf8`) );
				[traviscomment]Request({ 
					[traviscomment]url: `${rootFolder}_assets/grunticon.json`,
					[traviscomment]json: true
				[traviscomment]}, function (error, response, body) {
					[traviscomment]if (!error && response.statusCode === 200) {
						[traviscomment]grunticon = body;
					[traviscomment]} else {
						[traviscomment]Blender.log.error(`             ERROR loading ${rootFolder}_assets/grunticon.json`);
						[traviscomment]Blender.log.error( error );
					[traviscomment]}
				[traviscomment]});

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