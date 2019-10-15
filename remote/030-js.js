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
			let fileSource = ``;
			let file = ``;
			let core = ``;
			let jquery = ``;
			let result = ``;


			//////////////////////////////////////////////////| JQUERY
			if( _includeJquery ) { //optional include jquery
				jquery = Fs.readFileSync( Blender.GUIPATH + Blender.JQUERYPATH, `utf8`);

				if( _includeOriginal ) {
					Blender.zip.addFile( jquery, `/source/js/010-jquery.js` );
				}
			}


			//////////////////////////////////////////////////| CORE
			if( Blender.selectedModules.js ) {
				core = Fs.readFileSync(`${Blender.GUIPATH}_javascript-helpers/${POST[`module-_javascript-helpers`]}/js/020-core.js`, `utf8`);
				core = Blender.branding.replace(core, [`Debug`, `false`]); //remove debugging infos

				core = UglifyJS.minify( core );

				if( _includeOriginal ) {
					file = Fs.readFileSync(`${Blender.GUIPATH}_javascript-helpers/${POST[`module-_javascript-helpers`]}/js/020-core.js`, `utf8`);
					file = Blender.branding.replace(file, [`Module-Version`, ` Core v${POST[`module-_javascript-helpers`]} `]); //name the current version
					file = Blender.branding.replace(file, [`Debug`, `false`]); //remove debugging infos
					Blender.zip.addFile( file, `/source/js/020-core.js` );
				}
			}


			//////////////////////////////////////////////////| MODULES
			Blender.selectedModules.modules.forEach(( module ) => {
				const _hasJS = module.js; //look if this module has js

				if( _hasJS ) {
					fileSource += Fs.readFileSync(`${Blender.GUIPATH}${module.ID}/${module.version}/js/${module.ID}.js`) + `\n`; //add js to uglify

					file = Fs.readFileSync(`${Blender.GUIPATH}${module.ID}/${module.version}/js/${module.ID}.js`, `utf8`);

					if( _includeOriginal ) {
						file = Blender.branding.replace(file, [`Module-Version`, ` ${module.name} v${module.version} `]); //name the current version
						Blender.zip.addFile( file, `/source/js/${module.ID}.js`);
					}
				}
			});


			//uglify js
			if( fileSource !== '' ) {
				result = UglifyJS.minify( fileSource );
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
