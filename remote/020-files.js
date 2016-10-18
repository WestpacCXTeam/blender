/***************************************************************************************************************************************************************
 *
 * Files
 *
 * Route to all files for concatenating, compiling and if necessary branding.
 *
 **************************************************************************************************************************************************************/


//--------------------------------------------------------------------------------------------------------------------------------------------------------------
// Dependencies
//--------------------------------------------------------------------------------------------------------------------------------------------------------------
const UglifyJS = require(`uglify-js`);
const Less = require(`less`);


//--------------------------------------------------------------------------------------------------------------------------------------------------------------
// Module
//--------------------------------------------------------------------------------------------------------------------------------------------------------------
Blender.files = (() => {

	return {

//--------------------------------------------------------------------------------------------------------------------------------------------------------------
// Module init method
//--------------------------------------------------------------------------------------------------------------------------------------------------------------
		init: () => {
			Blender.debugging.report(`Files: new query`);

			//////////////////////////////////////////////////| PARSING POST
			Blender.files.getPost();

			//////////////////////////////////////////////////| SETTING QUE
			Blender.zip.queuing(`css`, true);
			Blender.zip.queuing(`html`, true);

			if( Blender.selectedModules.js ) {
				Blender.zip.queuing(`js`, true);
			}
			Blender.zip.queuing(`assets`, true);
			Blender.zip.queuing(`build`, true);

			Blender.zip.queuing(`funky`, true);


			//////////////////////////////////////////////////| GENERATING FILES
			Blender.css.get();

			if( Blender.selectedModules.js ) {
				Blender.js.get();
			}

			Blender.build.get();
			Blender.html.get();
			Blender.assets.get();
			Blender.funky.get();
		},


//--------------------------------------------------------------------------------------------------------------------------------------------------------------
// Saves an array of the selected modules globally so we don't work with the raw data that comes from the client... as that could be a mess ;)
//--------------------------------------------------------------------------------------------------------------------------------------------------------------
		getPost: () => {
			Blender.debugging.report(`Files: Parsing POST`);

			const POST = Blender.POST;
			let fromPOST = {};
			fromPOST.modules = [];
			let _hasJS = false;
			let _hasSVG = false;

			const _includeJquery = POST.includeJquery === `on`;
			const _includeUnminifiedJS = POST.includeUnminifiedJS === `on`;
			const _includeLess = POST.includeLess === `on`;
			const _includeSVG = POST.includeSVG === `on`;
			let log = ``;


			//////////////////////////////////////////////////| ADDING MODULES
			Object.keys( POST ).forEach(( moduleName ) => {
				let module = moduleName.substr(5);

				if(
					moduleName.substr(0, 5) === `tick-` &&
					POST[ moduleName ] === `on`
				) { //only look at enabled checkboxes

					let json = Blender.modules.getJson( module );
					let version = POST[`module-${module}`];

					let newObject = _.extend( json, json.versions[ version ] ); //merge version to the same level
					newObject.version = version;

					if( newObject.js ) {
						_hasJS = true;
					}

					if( newObject.svg ) {
						_hasSVG = true;
					}

					fromPOST.modules.push( newObject );

					log += `, ${json.ID}:${version}`;
				}
			});


			//////////////////////////////////////////////////| ADDING CORE
			fromPOST.core = [];

			Object.keys( Blender.GUI.modules._core ).forEach(( moduleName ) => {
				let module = Blender.GUI.modules._core[moduleName];
				let version = POST[`module-${module.ID}`];

				let newObject = _.extend(module, module.versions[ version ]); //merge version to the same level
				newObject.version = POST[`module-${module.ID}`];

				fromPOST.core.push(newObject);

				log += `, ${module.ID}:${version}`;
			});

			Blender.log.info(`             ${log.substr(2)}`);


			//////////////////////////////////////////////////| ADDING OPTIONS
			if( _includeJquery ) { //when checkbox is ticked but you don't have any modules with js then don't include jquery... controversial!
				// _hasJS = true;
			}

			fromPOST.js = _hasJS;
			fromPOST.svg = _hasSVG;
			fromPOST.brand = POST.brand;
			fromPOST.includeJquery = _includeJquery;
			fromPOST.includeUnminifiedJS = _includeUnminifiedJS;
			fromPOST.includeLess = _includeLess;
			fromPOST.includeSVG = _includeSVG;

			Blender.log.info(`             brand: ${POST.brand}`);
			Blender.log.info(`             jquery: ${_includeJquery}`);
			Blender.log.info(`             minify JS: ${_includeUnminifiedJS}`);
			Blender.log.info(`             include LESS: ${_includeLess}`);
			Blender.log.info(`             include SVG: ${_includeSVG}`);


			//////////////////////////////////////////////////| SAVIG GLOBALLY
			Blender.selectedModules = fromPOST;
		},

	}

})();