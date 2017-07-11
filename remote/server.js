/*! blender - v0.1.3 */
/***************************************************************************************************************************************************************
 *
 * Westpac GUI blender
 *
 * Application factory, dependencies, debugger and logger, settings and globals
 *
 * @license    https://raw.githubusercontent.com/WestpacCXTeam/blender/master/LICENSE  GNU GPLv2
 * @author     Dominik Wilkowski hi@dominik-wilkowski.com
 * @repository https://github.com/WestpacCXTeam/blender
 *
 **************************************************************************************************************************************************************/

'use strict';


//--------------------------------------------------------------------------------------------------------------------------------------------------------------
// Dependencies
//--------------------------------------------------------------------------------------------------------------------------------------------------------------
const Fs = require(`fs`);
const Http = require(`http`);
const Path = require(`path`);
const Chalk = require(`chalk`);
const _ = require(`underscore`);
const CFonts = require(`cfonts`);
const Express = require(`express`);
const BodyParser = require(`body-parser`);


//--------------------------------------------------------------------------------------------------------------------------------------------------------------
// Constructor
//--------------------------------------------------------------------------------------------------------------------------------------------------------------
const Blender = (() => { //constructor factory
	return {

//--------------------------------------------------------------------------------------------------------------------------------------------------------------
// Settings
//--------------------------------------------------------------------------------------------------------------------------------------------------------------
		DEBUG: false, //debugging infos
		DEBUGLEVEL: 3,
		PORT: 1337,
		SERVERPATH: '/api/blender',
		GELRURL: `http://gel.westpacgroup.com.au/`,
		GUIRURL: `http://gel.westpacgroup.com.au/GUI/`,
		// GUIPATH: Path.normalize(`${__dirname}/../../GUI-docs/GUI-source-master/`), //debug only
		GUIPATH: Path.normalize(`${__dirname}/../../GUI-source-master/`),
		TEMPPATH: Path.normalize(`${__dirname}/._template/`),
		GELPATH: Path.normalize(`${__dirname}/../../../`),
		GUICONFIG: Path.normalize(`${__dirname}/../.guiconfig`),
		JQUERYPATH: `_javascript-helpers/1.0.1/_core/js/010-jquery.js`,
		SLACKURL: `https://hooks.slack.com/services/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`,
		SLACKICON: `http://gel.westpacgroup.com.au/GUI/blender/remote/assets/img/blender-icon.png`,
		WEBFONTSROOT: `https://sites.thewestpacgroup.com.au/sites/TS1206/Shared%20Documents/webfonts/`,
		LOG: Path.normalize(`${__dirname}/blender.log`),
		FUNKY: [
			{
				name: `James Bond`,
				var: `includeBond`,
				file: Path.normalize(`${__dirname}/assets/img/bond.png`),
				zip: `/bond.png`,
			},
			{
				name: `Star Wars`,
				var: `includeStarWars`,
				file: Path.normalize(`${__dirname}/assets/img/starwars[Brand].jpg`),
				zip: `/starwars.png`,
			},
			{
				name: `David Bowie`,
				var: `includeBowie`,
				file: Path.normalize(`${__dirname}/assets/img/bowie.png`),
				zip: `/bowie.png`,
			},
			{
				name: `Catch ’em all`,
				var: `includePokemon`,
				file: Path.normalize(`${__dirname}/assets/pokemon.zip`),
				zip: `/pokemon.zip`,
			},
		],


//--------------------------------------------------------------------------------------------------------------------------------------------------------------
// Global vars
//--------------------------------------------------------------------------------------------------------------------------------------------------------------
		response: {}, //server response object
		POST: {}, //POST values from client
		GUI: {}, //GUI.json contents
		IP: ``, //Client IP


//--------------------------------------------------------------------------------------------------------------------------------------------------------------
// Debugging prettiness
//
// Print debug message that will be logged to console.
//
// @method  headline                    Return a headline preferably at the beginning of your app
//          @param    [text]  {string}  The sting you want to log
//          @return   [ansi]  {output}
//
// @method  report                      Return a message to report starting a process
//          @param    [text]  {string}  The sting you want to log
//          @return   [ansi]  {output}
//
// @method  error                       Return a message to report an error
//          @param    [text]  {string}  The sting you want to log
//          @return   [ansi]  {output}
//
// @method  interaction                 Return a message to report an interaction
//          @param    [text]  {string}  The sting you want to log
//          @return   [ansi]  {output}
//
// @method  send                        Return a message to report data has been sent
//          @param    [text]  {string}  The sting you want to log
//          @return   [ansi]  {output}
//
// @method  received                    Return a message to report data has been received
//          @param    [text]  {string}  The sting you want to log
//          @return   [ansi]  {output}
//--------------------------------------------------------------------------------------------------------------------------------------------------------------
		debugging: {

			headline: ( text ) => {
				if( Blender.DEBUG ) {
					CFonts.say(text, {
						'align': 'center',
						'colors': [`white`, `gray`],
					});
				}
			},

			report: ( text ) => {
				if( Blender.DEBUG && Blender.DEBUGLEVEL < 2 ) {
					console.log(
						Chalk.bgWhite(`\n${Chalk.bold.green(` \u2611  `)} ${Chalk.black(`${text} `)}`)
					);
				}
			},

			error: ( text ) => {
				if( Blender.DEBUG && Blender.DEBUGLEVEL < 3 ) {
					console.log(
						Chalk.bgWhite(`\n${Chalk.red(` \u2612  `)} ${Chalk.black(`${text} `)}`)
					);
				}
			},

			interaction: ( text ) => {
				if( Blender.DEBUG && Blender.DEBUGLEVEL < 1 ) {
					console.log(
						Chalk.bgWhite(`\n${Chalk.blue(` \u261C  `)} ${Chalk.black(`${text} `)}`)
					);
				}
			},

			send: ( text ) => {
				if( Blender.DEBUG && Blender.DEBUGLEVEL < 1 ) {
					console.log(
						Chalk.bgWhite(`\n${Chalk.bold.cyan(` \u219D  `)} ${Chalk.black(`${text} `)}`)
					);
				}
			},

			received: ( text ) => {
				if( Blender.DEBUG && Blender.DEBUGLEVEL < 1 ) {
					console.log(
						Chalk.bgWhite(`\n${Chalk.bold.cyan(` \u219C  `)} ${Chalk.black(`${text} `)}`)
					);
				}
			}
		},


//--------------------------------------------------------------------------------------------------------------------------------------------------------------
// Log to console.log
//
// Log to console and in extension save in log file regardless of debug mode
//
// @method  info                       Log info to console.log and in extension to node log file
//          @param   [text]  {string}  The sting you want to log
//          @return  [ansi]            output
//
// @method  error                      Log error to console.log and in extension to node log file
//          @param   [text]  {string}  The sting you want to log
//          @return  [ansi]            output
//--------------------------------------------------------------------------------------------------------------------------------------------------------------
		log: {

			info: ( text ) => {
				console.log(
					`${Chalk.bold.gray(`Info `)} ${new Date().toString()}  ${text}`
				);
			},

			error: ( text ) => {
				console.log(
					`${Chalk.bold.red(`ERROR`)} ${new Date().toString()}  ${text}`
				);
			},
		},
	}

})();
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
				jquery = Fs.readFileSync( Blender.GUIPATH + Blender.JQUERYPATH, `utf8`);

				if( _includeOriginal ) {
					Blender.zip.addFile( jquery, `/source/js/010-jquery.js` );
				}
			}


			//////////////////////////////////////////////////| CORE
			if( Blender.selectedModules.js ) {
				core = Fs.readFileSync(`${Blender.GUIPATH}_javascript-helpers/${POST[`module-_javascript-helpers`]}/js/020-core.js`, `utf8`);
				core = Blender.branding.replace(core, [`Debug`, `false`]); //remove debugging infos

				core = UglifyJS.minify( core, { fromString: true });

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
					files.push(`${Blender.GUIPATH}${module.ID}/${module.version}/js/${module.ID}.js`); //add js to uglify

					file = Fs.readFileSync(`${Blender.GUIPATH}${module.ID}/${module.version}/js/${module.ID}.js`, `utf8`);

					if( _includeOriginal ) {
						file = Blender.branding.replace(file, [`Module-Version`, ` ${module.name} v${module.version} `]); //name the current version
						Blender.zip.addFile( file, `/source/js/${module.ID}.js`);
					}
				}
			});


			//uglify js
			if( files.length > 0 ) {
				result = UglifyJS.minify( files );
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
/***************************************************************************************************************************************************************
 *
 * Compile CSS files
 *
 **************************************************************************************************************************************************************/


//--------------------------------------------------------------------------------------------------------------------------------------------------------------
// Dependencies
//--------------------------------------------------------------------------------------------------------------------------------------------------------------


//--------------------------------------------------------------------------------------------------------------------------------------------------------------
// Module
//--------------------------------------------------------------------------------------------------------------------------------------------------------------
Blender.css = (() => {

	return {

//--------------------------------------------------------------------------------------------------------------------------------------------------------------
// Module init method
//--------------------------------------------------------------------------------------------------------------------------------------------------------------
		init: () => {
			Blender.debugging.report(`CSS: Initiating`);
		},


//--------------------------------------------------------------------------------------------------------------------------------------------------------------
// Get all less files and compile them
//--------------------------------------------------------------------------------------------------------------------------------------------------------------
		get: () => {
			Blender.debugging.report(`CSS: Generating css`);

			const POST = Blender.POST;
			const _includeOriginal  = Blender.selectedModules.includeLess; //POST.hasOwnProperty(`includeless`);
			let lessContents = ``;
			let lessIndex = "\n\n" + `/* ---------------------------------------| MODULES |--------------------------------------- */` + "\n";


			//////////////////////////////////////////////////| CORE
			Blender.selectedModules.core.forEach(( module ) => {
				let lessContent = Blender.branding.replace(
					Fs.readFileSync(`${Blender.GUIPATH}${module.ID}/${module.version}/less/module-mixins.less`, `utf8`),
					[`Module-Version-Brand`, ` ${module.name} v${module.version} ${POST[`brand`]} `]
				);

				lessContent = Blender.branding.replace( lessContent, [ `Brand`, POST[`brand`] ] );

				if( _includeOriginal && module.less ) {
					lessIndex += `@import '${module.ID}.less';\n`;
					Blender.zip.addFile( lessContent, `/source/less/${module.ID}.less`);
				}

				lessContents += lessContent;
			});


			//////////////////////////////////////////////////| MODULES
			Blender.selectedModules.modules.forEach(( module ) => {
				let lessContent = Blender.branding.replace(
					Fs.readFileSync(`${Blender.GUIPATH}${module.ID}/${module.version}/less/module-mixins.less`, `utf8`),
					[`Module-Version-Brand`, ` ${module.name} v${module.version} ${POST[`brand`]} `]
				);

				lessContent = Blender.branding.replace( lessContent, [ `Brand`, POST[`brand`] ] );

				if( _includeOriginal && module.less ) {
					lessIndex += `@import '${module.ID}.less';\n`;
					Blender.zip.addFile( lessContent, `/source/less/${module.ID}.less` );
				}

				lessContents += lessContent;
			});

			if( lessIndex && _includeOriginal ) {
				Blender.zip.addFile( Blender.banner.attach( lessIndex ), `/source/less/gui.less` );
			}

			//compile less
			Less.render(lessContents, {
				compress: true
			},
			(e, output) => {
				//TODO: error handling

				let source = Blender.banner.attach( output.css ); //attach a banner to the top of the file with a URL of this build

				Blender.zip.queuing(`css`, false); //css queue is done
				Blender.zip.addFile( source, `/assets/css/gui.min.css` );

			});

		},

	}

})();
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
			let allBrands = {};
			let brandIntersection = [];
			options.webfonts = '';

			if( _includeOriginalLess || _includeOriginalJS) {
				_hasBuild = true;
			}

			//first we check what brands actually support the current blend
			Blender.selectedModules.core.forEach(( module ) => {
				module.brands.forEach( ( brand ) => {
					allBrands[ brand ] = allBrands[ brand ] + 1 || 1; //we count up each brand for each module
				});
			});

			Blender.selectedModules.modules.forEach(( module ) => {
				module.brands.forEach( ( brand ) => {
					allBrands[ brand ] = allBrands[ brand ] + 1 || 1; //we count up each brand for each module
				});
			});

			let allModules = Blender.selectedModules.core.length + Blender.selectedModules.modules.length; //how many modules we have

			//next we go over each brand and add URL, name and webfonts link
			guiconfig.brands.forEach(( brand ) => { //iterate over brands
				if( allBrands[ brand.ID ]  === allModules ) { //only if a brand has as many iterations as modules

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
/***************************************************************************************************************************************************************
 *
 * Insert build tool
 *
 **************************************************************************************************************************************************************/


//--------------------------------------------------------------------------------------------------------------------------------------------------------------
// Dependencies
//--------------------------------------------------------------------------------------------------------------------------------------------------------------


//--------------------------------------------------------------------------------------------------------------------------------------------------------------
// Module
//--------------------------------------------------------------------------------------------------------------------------------------------------------------
Blender.build = (() => {

	return {

//--------------------------------------------------------------------------------------------------------------------------------------------------------------
// Module init method
//--------------------------------------------------------------------------------------------------------------------------------------------------------------
		init: () => {
			Blender.debugging.report(`Build: Initiating`);
		},


//--------------------------------------------------------------------------------------------------------------------------------------------------------------
// Returns json object of a specific module.json
//
// @param   module  [sting]  ID of module
//
// @return  [object]  Json object of module.json
//--------------------------------------------------------------------------------------------------------------------------------------------------------------
		get: () => {
			Blender.debugging.report(`Build: Getting build`);

			const _includeOriginalLess  = Blender.selectedModules.includeLess;
			const _includeOriginalJS  = Blender.selectedModules.includeUnminifiedJS;
			const _includeSVG  = Blender.selectedModules.includeSVG;

			if( _includeOriginalLess || _includeOriginalJS || _includeSVG ) {
				Blender.zip.queuing(`build`, false); //build queue is done

				Blender.zip.addBulk( Blender.TEMPPATH, [`Gruntfile.js`, `package.json`], `/` );
			}
			else {
				Blender.zip.queuing(`build`, false); //build queue is done
			}
		},

	}

})();
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

				if( Fs.existsSync( oldFolder ) ) {
					Blender.zip.addBulk( oldFolder, [`*.svg`], `/source/svgs/` ); //old SVG location
				}
				else {
					Blender.zip.addBulk( newFolder, [`*.svg`], `/source/svgs/` ); //new SVG location
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
/***************************************************************************************************************************************************************
 *
 * Brand all content
 *
 **************************************************************************************************************************************************************/


//--------------------------------------------------------------------------------------------------------------------------------------------------------------
// Dependencies
//--------------------------------------------------------------------------------------------------------------------------------------------------------------


//--------------------------------------------------------------------------------------------------------------------------------------------------------------
// Module
//--------------------------------------------------------------------------------------------------------------------------------------------------------------
Blender.branding = (() => {

	return {

//--------------------------------------------------------------------------------------------------------------------------------------------------------------
// Module init method
//--------------------------------------------------------------------------------------------------------------------------------------------------------------
		init: () => {
			Blender.debugging.report(`Branding: Initiating`);
		},


//--------------------------------------------------------------------------------------------------------------------------------------------------------------
// Returns content with elements replaced
//
// @param   content  [string]  Content that needs parsing
// @param   replace  [array]   First element is replaced with second
//
// @return  [string]  Finished parsed content
//--------------------------------------------------------------------------------------------------------------------------------------------------------------
		replace: ( content, replace ) => {
			Blender.debugging.report(`Branding: Replacing "${replace[0]}" with "${replace[1]}"`);

			let pattern = new RegExp(`\\[(${replace[0]})\\]`, `g`);
			return content.replace(pattern, replace[1]);

		},

	}

})();
/***************************************************************************************************************************************************************
 *
 * Get modules infos
 *
 **************************************************************************************************************************************************************/


//--------------------------------------------------------------------------------------------------------------------------------------------------------------
// Dependencies
//--------------------------------------------------------------------------------------------------------------------------------------------------------------


//--------------------------------------------------------------------------------------------------------------------------------------------------------------
// Module
//--------------------------------------------------------------------------------------------------------------------------------------------------------------
Blender.modules = (() => {

	return {

//--------------------------------------------------------------------------------------------------------------------------------------------------------------
// Module init method
//--------------------------------------------------------------------------------------------------------------------------------------------------------------
		init: () => {
			Blender.debugging.report(`Modules: Initiating`);
		},


//--------------------------------------------------------------------------------------------------------------------------------------------------------------
// Returns json object of a specific module.json
//
// @param   module  [sting]  ID of module
//
// @return  [object]  Json object of module.json
//--------------------------------------------------------------------------------------------------------------------------------------------------------------
		getJson: ( module ) => {
			Blender.debugging.report(`Modules: Getting JSON for ${module}`);


			if( Blender.GUImodules === undefined ) { //flatten GUI json and assign to global

				Blender.GUImodules = {};
				Object.keys( Blender.GUI.modules ).forEach(( category ) => {

					Object.keys( Blender.GUI.modules[ category ] ).forEach(( mod ) => {
						Blender.GUImodules[ mod ] = Blender.GUI.modules[ category ][ mod ];
					});

				});
			}

			return Blender.GUImodules[module];
			//JSON.parse( Fs.readFileSync(`${Blender.GUIPATH}${module}/module.json`, 'utf8') ); //getting from module.json if we want to have a lot of I/O(we don't)

		},

	}

})();
/***************************************************************************************************************************************************************
 *
 * Get banner infos
 *
 **************************************************************************************************************************************************************/


//--------------------------------------------------------------------------------------------------------------------------------------------------------------
// Dependencies
//--------------------------------------------------------------------------------------------------------------------------------------------------------------


//--------------------------------------------------------------------------------------------------------------------------------------------------------------
// Module
//--------------------------------------------------------------------------------------------------------------------------------------------------------------
Blender.banner = (() => {

	return {

//--------------------------------------------------------------------------------------------------------------------------------------------------------------
// Module init method
//--------------------------------------------------------------------------------------------------------------------------------------------------------------
		init: () => {
			Blender.debugging.report(`Banner: Initiating`);
		},


//--------------------------------------------------------------------------------------------------------------------------------------------------------------
// Get the banner text
//
// @return  [string]  Content with attached banner
//--------------------------------------------------------------------------------------------------------------------------------------------------------------
		get: () => {
			Blender.debugging.report(`Banner: Generating banner`);

			return `/* GUI blend ${Blender.banner.getBlendURL( Blender.selectedModules.brand )} */\n`;

		},


//--------------------------------------------------------------------------------------------------------------------------------------------------------------
// Attach the banner to some content
//
// @param   content  [string]  Content the banner needs to be attached to
//
// @return  [string]  Content with attached banner
//--------------------------------------------------------------------------------------------------------------------------------------------------------------
		attach: ( content ) => {
			Blender.debugging.report(`Banner: Attaching banner`);

			if( content.length > 0 ) {
				return Blender.banner.get() + content;
			}
			else {
				return ``;
			}

		},


//--------------------------------------------------------------------------------------------------------------------------------------------------------------
// Get the blend url
//
// @param   brand  [string]  The brand for the URL
//
// @return  [string]  The URL string to this build
//--------------------------------------------------------------------------------------------------------------------------------------------------------------
		getBlendURL: ( brand ) => {
			Blender.debugging.report(`Banner: Generating blend link`);

			let url = `${Blender.GUIRURL}${brand}/blender/#`;

			Blender.selectedModules.core.forEach(( module ) => { //adding core
				url += `/${module.ID}:${module.version}`;
			});

			Blender.selectedModules.modules.forEach(( module ) => { //adding modules
				url += `/${module.ID}:${module.version}`;
			});

			return url;
		},

	}

})();
/***************************************************************************************************************************************************************
 *
 * Collect and zip all files
 *
 **************************************************************************************************************************************************************/


//--------------------------------------------------------------------------------------------------------------------------------------------------------------
// Dependencies
//--------------------------------------------------------------------------------------------------------------------------------------------------------------
const Archiver = require(`archiver`);


//--------------------------------------------------------------------------------------------------------------------------------------------------------------
// Module
//--------------------------------------------------------------------------------------------------------------------------------------------------------------
Blender.zip = (() => {

	return {

//--------------------------------------------------------------------------------------------------------------------------------------------------------------
// Module init method
//--------------------------------------------------------------------------------------------------------------------------------------------------------------
		init: () => {
			Blender.debugging.report(`Zip: Initiating`);
		},


//--------------------------------------------------------------------------------------------------------------------------------------------------------------
// Zip all files up and send to response
//--------------------------------------------------------------------------------------------------------------------------------------------------------------
		getZip: () => {
			Blender.debugging.report(`Zip: Compiling zip`);

			Blender.response.writeHead(200, {
				'Content-Type': `application/zip`,
				'Content-disposition': `attachment; filename=GUI-blend-${Blender.selectedModules.brand}.zip`,
			});

			Blender.zip.archive.pipe( Blender.response );

			try {
				Blender.zip.archive.finalize(); //send to server

				Blender.log.info(`             Zip sent!`);

				Blender.slack.post();
			}
			catch( error ) {

				Blender.log.error(`             Zip ERROR`);
				Blender.log.error( error );
			}

			//add new blend to log
			Custard.run([ //run this only when no more than 3 blends are currently blending
				{
					run: Blender.counter.add,
					maxCalls: 2,
					fallback: () => {
						Blender.debugging.error(`Custard: Counter not counting as too many blends are blending (${Custard.getQueue()})`);
					},
				},
				/*{
					run: Blender.statistic.init,
					maxCalls: 50,
					fallback: () => {
						Blender.debugging.error(``);
					},
				}*/],
				() => {
					Blender.debugging.error(`Custard: All normal again!`);
				}
			);

			//clearning up
			Blender.zip.archive = Archiver(`zip`); //new archive
			Blender.zip.files = []; //empty files
			module.queue = {}; // empty queue
		},


//--------------------------------------------------------------------------------------------------------------------------------------------------------------
// Check if queue is clear
//--------------------------------------------------------------------------------------------------------------------------------------------------------------
		readyZip: () => {
			Blender.debugging.report(`Zip: Readying zip`);

			if( Blender.zip.isQueuingEmpty() ) { //if queue is clear, add all files to the archive

				Blender.zip.files.forEach(( file ) => {
					Blender.zip.archive.append( file.content, { name: file.name } );
				});

				Blender.zip.getZip(); //finalize the zip
			}

		},


//--------------------------------------------------------------------------------------------------------------------------------------------------------------
// Add a file to the zip archive
//
// @param   content      [string]  The content of the file
// @param   archivePath  [string]  The path this file will have inside the archive
//--------------------------------------------------------------------------------------------------------------------------------------------------------------
		addFile: ( content, archivePath ) => {
			Blender.debugging.report(`Zip: Adding file: ${archivePath}`);

			if(typeof content !== `string`) {
				Blender.debugging.error(`Zip: Adding file: Content can only be string, is ${typeof content}`);
			}
			else {
				if( content.length > 0 ) { //don't need no empty files ;)
					Blender.zip.files.push({ //collect file for later adding
						content: content,
						name: `/GUI-blend${archivePath}`,
					});
				}
			}

			Blender.zip.readyZip();
		},


//--------------------------------------------------------------------------------------------------------------------------------------------------------------
// Add a file to the zip archive
//
// @param   path         [string]  The path to the file to be added
// @param   archivePath  [string]  The path this file will have inside the archive
//--------------------------------------------------------------------------------------------------------------------------------------------------------------
		addPath: ( path, archivePath ) => {
			Blender.debugging.report(`Zip: Adding file path: ${path}`);

			if(typeof path !== `string`) {
				Blender.debugging.error(`Zip: Adding file path: Path can only be string, is ${typeof path}`);
			}
			else {
				if( path.length > 0 ) { //don't need no empty files ;)
					Blender.zip.archive.file(
						path,
						{
							name: `/GUI-blend${archivePath}`,
						}
					);
				}
			}

			Blender.zip.readyZip();
		},


//--------------------------------------------------------------------------------------------------------------------------------------------------------------
// Add multiple file to the zip archive
//
// @param  cwd          [string]  The current working directory to flatten the paths in the archive
// @param  files        [array]   The file extensions of the files
// @param  archivePath  [string]  The path these files will have inside the archive
//--------------------------------------------------------------------------------------------------------------------------------------------------------------
		addBulk: ( cwd, files, archivePath ) => {
			Blender.debugging.report(`Zip: Adding bluk: ${cwd}${files} to: ${archivePath}`);

			if(typeof files !== `object`) {
				Blender.debugging.error(`Zip: Adding files: Path can only be array/object, is ${typeof files}`);
			}
			else {

				Blender.zip.archive.bulk({ //add them all to the archive
					expand: true,
					cwd: cwd,
					src: files,
					dest: `/GUI-blend${archivePath}`,
					filter: `isFile`,
				});

			}

			Blender.zip.readyZip();
		},


//--------------------------------------------------------------------------------------------------------------------------------------------------------------
// Add or remove a type to queue so we can wait for all to be finished
//
// @param   type           [string]   Identifier for a type of file we are waiting for
// @param   _isBeingAdded  [boolean]  Whether or not this type is added or removed from the queue
//--------------------------------------------------------------------------------------------------------------------------------------------------------------
		queuing: ( type, _isBeingAdded ) => {
			Blender.debugging.report(`Zip: Queuing files`);

			if( _isBeingAdded ) {
				Blender.debugging.report(`Zip: Queue: Adding ${type}`);

				Blender.zip.queue[type] = true;
			}
			else {
				if( Blender.zip.queue[type] ) {
					Blender.debugging.report(`Zip: Queue: Removing ${type}`);

					delete Blender.zip.queue[type];
				}
			}

		},


//--------------------------------------------------------------------------------------------------------------------------------------------------------------
// Check if the queue is empty
//
// @return  [boolean]  Whether or not it is...
//--------------------------------------------------------------------------------------------------------------------------------------------------------------
		isQueuingEmpty: () => {
			Blender.debugging.report(`Zip: Checking queue`);

			for( let prop in Blender.zip.queue ) {
				if( Blender.zip.queue.hasOwnProperty(prop) ) {
					Blender.debugging.report(`Zip: Queue: Still things in the queue`);

					return false;
				}
			}

			Blender.debugging.report(`Zip: Queue: Queue is empty`);
			return true;
		},


//--------------------------------------------------------------------------------------------------------------------------------------------------------------
// Global vars
//--------------------------------------------------------------------------------------------------------------------------------------------------------------
		queue: {}, //global object to hold queue
		archive: Archiver(`zip`), //class to add files to zip globally
		files: [], //an array of all files to be added to the archive

	}

})();
/***************************************************************************************************************************************************************
 *
 * Post to slack
 *
 **************************************************************************************************************************************************************/


//--------------------------------------------------------------------------------------------------------------------------------------------------------------
// Dependencies
//--------------------------------------------------------------------------------------------------------------------------------------------------------------
const Slack = require('node-slack');


//--------------------------------------------------------------------------------------------------------------------------------------------------------------
// Module
//--------------------------------------------------------------------------------------------------------------------------------------------------------------
Blender.slack = (() => {

	return {

//--------------------------------------------------------------------------------------------------------------------------------------------------------------
// Module init method
//--------------------------------------------------------------------------------------------------------------------------------------------------------------
		post: () => {
			Blender.debugging.report(`Slack: Posting`);

			const slack = new Slack( Blender.SLACKURL );
			const POST = Blender.POST;
			const jquery = Blender.selectedModules.includeJquery ? '`Yes`' : '`No`';
			const unminJS  = Blender.selectedModules.includeUnminifiedJS ? '`Yes`' : '`No`';
			const less  = Blender.selectedModules.includeLess ? '`Yes`' : '`No`';
			let funky = ``;
			let core = ``;
			let modules = ``;

			let channel = `#testing`;
			if( !Blender.DEBUG ) {
				channel = `#blender`;
			}

			for(let i = Blender.FUNKY.length - 1; i >= 0; i--) {
				if( POST[ Blender.FUNKY[i].var ] === `on` ) {
					funky += `\`${Blender.FUNKY[i].name}\` `;
				}
			}

			if( funky === `` ) {
				funky = '`none`';
			}

			Blender.selectedModules.core.forEach(( module ) => {
				core += `, \`${module.ID}:${module.version}\``;
			});

			Blender.selectedModules.modules.forEach(( module ) => {
				modules += `, \`${module.ID}:${module.version}\``;
			});

			slack.send({
				'text': `BOOM! ... another blend!`,
				'attachments': [{
					'fallback': `_What's in it?_`,
					'pretext': `_What's in it?_`,
					'color': `#ffcdd2`,
					'mrkdwn_in': [
						`text`,
						`pretext`,
						`fields`,
					],
					'fields': [
						{
							'title': `Modules`,
							'value': '' +
								'_Selected_: `' + Blender.selectedModules.modules.length + '`\n' +
								'_Core_:\n' + core.substr(2) + '\n' +
								'_Modules_:\n' + modules.substr(2) + '\n\n\n',
							'short': false,
						},
						{
							'title': `Options`,
							'value': '' +
								'_Brand_: `' + Blender.selectedModules.brand + '`\n' +
								'_jQuery_: ' + jquery + '\n' +
								'_unmin JS_: ' + unminJS + '\n' +
								'_Less_: ' + less + '\n' +
								'_Funky_: ' + funky + '\n\n\n',
							'short': false,
						},
						{
							'title': `Client`,
							'value': '' +
								'_IP_: `' + Blender.IP + '`',
							'short': false,
						}
					],
				}],
				'channel': channel,
				'username': `The Blender`,
				'icon_url': Blender.SLACKICON,
			});
		},

	}

})();
/***************************************************************************************************************************************************************
 *
 * Funky stuff
 *
 **************************************************************************************************************************************************************/


//--------------------------------------------------------------------------------------------------------------------------------------------------------------
// Dependencies
//--------------------------------------------------------------------------------------------------------------------------------------------------------------


//--------------------------------------------------------------------------------------------------------------------------------------------------------------
// Module
//--------------------------------------------------------------------------------------------------------------------------------------------------------------
Blender.funky = (() => {

	return {

//--------------------------------------------------------------------------------------------------------------------------------------------------------------
// Module get method
//--------------------------------------------------------------------------------------------------------------------------------------------------------------
		get: () => {
			Blender.debugging.report(`funky: Getting funky stuff`);

			const POST = Blender.POST;
			let funkies = 0;
			let funkyLog = ``;

			for(let i = Blender.FUNKY.length - 1; i >= 0; i--) {
				if( POST[ Blender.FUNKY[i].var ] === `on` ) {
					funkies++; //how many funky bits have been requested?
				}
			}

			if( funkies > 0 ) {
				for(let i = Blender.FUNKY.length - 1; i >= 0; i--) {

					if( POST[ Blender.FUNKY[i].var ] === `on` ) {
						Blender.debugging.report(`funky: Getting ${Blender.FUNKY[i].name} reference`);

						funkies--; //counting down

						if( funkies === 0 ) { //if this is the last one
							Blender.zip.queuing(`funky`, false);
						}

						const file = Blender.FUNKY[i].file.replace( `[Brand]`, POST[`brand`] ); //brand path

						Blender.zip.addPath( file, Blender.FUNKY[i].zip ); //add file to zip
						funkyLog += ` ${Blender.FUNKY[i].name}`;
					}
				}

				Blender.log.info(`             include LESS: ${funkyLog}`);
			}
			else {
				Blender.zip.queuing(`funky`, false);
				Blender.zip.readyZip();
			}
		},

	}

})();
/***************************************************************************************************************************************************************
 *
 * Counter
 *
 **************************************************************************************************************************************************************/


//--------------------------------------------------------------------------------------------------------------------------------------------------------------
// Dependencies
//--------------------------------------------------------------------------------------------------------------------------------------------------------------
const Custard = require('custardjs');


//--------------------------------------------------------------------------------------------------------------------------------------------------------------
// Module
//--------------------------------------------------------------------------------------------------------------------------------------------------------------
Blender.counter = (() => {

	return {

//--------------------------------------------------------------------------------------------------------------------------------------------------------------
// Module add method
//--------------------------------------------------------------------------------------------------------------------------------------------------------------
		add: () => {
			Blender.debugging.report(`counter: adding new instance`);

			let counter = 0;

			// Create a blender.log file if one doesn't already exist
			Fs.writeFile( Blender.LOG, '0', { flag: 'wx' }, () => {});

			Fs.readFile( Blender.LOG, (error, data) => { //read the log file
				if( error ) {
					Custard.finished();

					throw error;
				}

				counter = parseInt( data ) + 1; //add this blend

				if(!isNaN( counter )) { //check if the number is a number
					Fs.writeFile( Blender.LOG, counter, (error) => {
						if( error ) {
							Custard.finished();

							throw error;
						}

						Blender.debugging.report(`counter: added`);
						Custard.finished();
					});
				}
				else { //throw error
					Blender.log.error(`             Counter number not valid ("${counter}"). Leaving it alone for now!`);
					Custard.finished();
				}
			});
		},

	}

})();
/***************************************************************************************************************************************************************
 *
 * Application initialization
 *
 * Spawning up simple express app, listening to POST requests on /blender/ and init files when request is OK
 *
 **************************************************************************************************************************************************************/


//--------------------------------------------------------------------------------------------------------------------------------------------------------------
// Initiate application
//--------------------------------------------------------------------------------------------------------------------------------------------------------------
Blender.init = () => {
	Blender.debugging.headline(` DEBUG| INFO`);

	Blender.GUI = JSON.parse( Fs.readFileSync(`${Blender.GUIPATH}GUI.json`, `utf8`) );
	const blender = Express();

	//starting server
	blender
		.use( BodyParser.urlencoded({ extended: false }) )

		.listen(Blender.PORT, () => {
			Blender.debugging.report(`Server started on port ${Blender.PORT}`);
		});


	blender.get(`*`, (request, response) => {
		response.redirect(301, Blender.GUIRURL);
	});


	//listening to post request
	blender.post(Blender.SERVERPATH, (request, response) => {
		Blender.IP = request.headers[`x-forwarded-for`] || request.connection.remoteAddress;

		Blender.log.info(`New request: ${request.headers[`x-forwarded-for`]} / ${request.connection.remoteAddress}`);

		//the core needs to be in the request and the user agent should be presented
		if(
			typeof request.body[`module-_colors`] !== `undefined`
			&& typeof request.body[`module-_fonts`] !== `undefined`
			&& typeof request.body[`module-_text-styling`] !== `undefined`
			&& typeof request.body[`module-_grid`] !== `undefined`
			&& typeof request.body[`module-_javascript-helpers`] !== `undefined`
			&& typeof request.headers[`user-agent`] !== `undefined`
		) {

			//when debug mode is off discard "stress-tester"
			if( !Blender.DEBUG && request.headers[`user-agent`] !== `stress-tester` || Blender.DEBUG ) {
				Blender.response = response;
				Blender.POST = request.body;

				Blender.files.init();
			}
			else {
				Blender.log.info(`Discarded for invalid user-agent (${request.headers[`user-agent`]})`);

				response.status(500).send(`Discarded for invalid user-agent (${request.headers[`user-agent`]})`);
			}
		}
		else {
			Blender.log.info(`Discarded for invalid request (core not complete or user-agent empty)`);

			response.status(500).send(
				`Discarded for invalid request (core not complete or user-agent empty)
				${typeof request.body[`module-_colors`]}
				${typeof request.body[`module-_fonts`]}
				${typeof request.body[`module-_text-styling`]}
				${typeof request.body[`module-_grid`]}
				${typeof request.body[`module-_javascript-helpers`]}
				${typeof request.headers[`user-agent`]}`
			);
		}
	});
};


Blender.init();