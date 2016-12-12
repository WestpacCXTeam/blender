/***************************************************************************************************************************************************************
 *
 * Compile JS files
 *
 **************************************************************************************************************************************************************/


//--------------------------------------------------------------------------------------------------------------------------------------------------------------
// Dependencies
//--------------------------------------------------------------------------------------------------------------------------------------------------------------


//--------------------------------------------------------------------------------------------------------------------------------------------------------------
// Module
//--------------------------------------------------------------------------------------------------------------------------------------------------------------
Blender.js = (() => {

	return {

//--------------------------------------------------------------------------------------------------------------------------------------------------------------
// Module init method
//--------------------------------------------------------------------------------------------------------------------------------------------------------------
		init: () => {
			Blender.debugging.report(`JS: Initiating`);
		},


//--------------------------------------------------------------------------------------------------------------------------------------------------------------
// Get all js files and concat them
//--------------------------------------------------------------------------------------------------------------------------------------------------------------
		get: () => {
			Blender.debugging.report(`JS: Generating js`);

			const POST = Blender.POST;
			const _includeJquery = Blender.selectedModules.includeJquery; //POST.hasOwnProperty(`jquery`);
			const _includeOriginal  = Blender.selectedModules.includeUnminifiedJS; //POST.hasOwnProperty(`jsunminified`);
			let files = [];
			let file = ``;
			let core = ``;
			let jquery = ``;
			let result = ``;


			//////////////////////////////////////////////////| JQUERY
			if( _includeJquery ) { //optional include jquery
				[nottraviscomment]jquery = Fs.readFileSync( Blender.GUIPATH + Blender.JQUERYPATH, `utf8`);
				[traviscomment]Request({ 
					[traviscomment]url: Blender.GUIPATH + Blender.JQUERYPATH
				[traviscomment]}, function (error, response, body) {
					[traviscomment]if (!error && response.statusCode === 200) {
						[traviscomment]jquery = body;
					[traviscomment]} else {
						[traviscomment]Blender.log.error(`             ERROR loading ` + Blender.GUIPATH + Blender.JQUERYPATH);
						[traviscomment]Blender.log.error( error );
					[traviscomment]}
				[traviscomment]});

				if( _includeOriginal ) {
					Blender.zip.addFile( jquery, `/source/js/010-jquery.js` );
				}
			}


			//////////////////////////////////////////////////| CORE
			if( Blender.selectedModules.js ) {
				[nottraviscomment]core = Fs.readFileSync(`${Blender.GUIPATH}_javascript-helpers/${POST[`module-_javascript-helpers`]}/js/020-core.js`, `utf8`);
				[traviscomment]Request({ 
					[traviscomment]url: `${Blender.GUIPATH}_javascript-helpers/${POST[`module-_javascript-helpers`]}/js/020-core.js`
				[traviscomment]}, function (error, response, body) {
					[traviscomment]if (!error && response.statusCode === 200) {
						[traviscomment]core = body;
					[traviscomment]} else {
						[traviscomment]Blender.log.error(`             ERROR loading ${Blender.GUIPATH}_javascript-helpers/${POST[`module-_javascript-helpers`]}/js/020-core.js`);
						[traviscomment]Blender.log.error( error );
					[traviscomment]}
				[traviscomment]});

				core = Blender.branding.replace(core, [`Debug`, `false`]); //remove debugging infos

				core = UglifyJS.minify( core, { fromString: true });

				if( _includeOriginal ) {
					[nottraviscomment]file = Fs.readFileSync(`${Blender.GUIPATH}_javascript-helpers/${POST[`module-_javascript-helpers`]}/js/020-core.js`, `utf8`);
					[traviscomment]Request({ 
						[traviscomment]url: `${Blender.GUIPATH}_javascript-helpers/${POST[`module-_javascript-helpers`]}/js/020-core.js`
					[traviscomment]}, function (error, response, body) {
						[traviscomment]if (!error && response.statusCode === 200) {
							[traviscomment]file = body;
						[traviscomment]} else {
							[traviscomment]Blender.log.error(`             ERROR loading ${Blender.GUIPATH}_javascript-helpers/${POST[`module-_javascript-helpers`]}/js/020-core.js`);
							[traviscomment]Blender.log.error( error );
						[traviscomment]}
					[traviscomment]});

					file = Blender.branding.replace(file, [`Module-Version`, ` Core v${POST[`module-_javascript-helpers`]} `]); //name the current version
					file = Blender.branding.replace(file, [`Debug`, `false`]); //remove debugging infos
					Blender.zip.addFile( file, `/source/js/020-core.js` );
				}
			}


			//////////////////////////////////////////////////| MODULES
			Blender.selectedModules.modules.forEach(( module ) => {
				const _hasJS = module.js; //look if this module has js

				if( _hasJS ) {
					[nottraviscomment]file = Fs.readFileSync(`${Blender.GUIPATH}${module.ID}/${module.version}/js/${module.ID}.js`, `utf8`);
					[traviscomment]Request({ 
						[traviscomment]url: `${Blender.GUIPATH}${module.ID}/${module.version}/js/${module.ID}.js`
					[traviscomment]}, function (error, response, body) {
						[traviscomment]if (!error && response.statusCode === 200) {
							[traviscomment]file = body;
						[traviscomment]} else {
							[traviscomment]Blender.log.error(`             ERROR loading ${Blender.GUIPATH}${module.ID}/${module.version}/js/${module.ID}.js`);
							[traviscomment]Blender.log.error( error );
						[traviscomment]}
					[traviscomment]});

					files.push(file); //add js to uglify

					if( _includeOriginal ) {
						file = Blender.branding.replace(file, [`Module-Version`, ` ${module.name} v${module.version} `]); //name the current version
						Blender.zip.addFile( file, `/source/js/${module.ID}.js`);
					}
				}
			});


			//uglify js
			if( files.length > 0 ) {
				result = UglifyJS.minify( files, { fromString: true } );
			}
			else {
				result = {};
				result.code = ``;
			}

			const source = Blender.banner.attach( jquery + core.code + result.code ); //attach a banner to the top of the file with a URL of this build

			Blender.zip.queuing(`js`, false); //js queue is done
			Blender.zip.addFile( source, `/assets/js/gui.min.js` ); //add minified file to zip

		},

	}

})();