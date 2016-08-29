/***************************************************************************************************************************************************************
 *
 * Blender stress test
 *
 * This stresser will request the loal blender x times every n nano-seconds. After it saved all zip files it will attempt to unzip them to see
 * if they are valid. x and n can be adjusted below.
 *
 **************************************************************************************************************************************************************/

'use strict';


//--------------------------------------------------------------------------------------------------------------------------------------------------------------
// Dependencies
//--------------------------------------------------------------------------------------------------------------------------------------------------------------
const Request = require('request');
const AdmZip = require('adm-zip');
const CFonts = require(`cfonts`);
const Dirsum = require('dirsum');
const Rimraf = require('rimraf');
const Chalk = require('chalk');
const Fs = require('fs');


const Tester = (() => {
	return {
//--------------------------------------------------------------------------------------------------------------------------------------------------------------
// Settings
//--------------------------------------------------------------------------------------------------------------------------------------------------------------
		DEBUG: false,
		ZIPS: 'zips/',
		TIMING: Date.now(),
		MAX: 10,
		TIMEOUT: 5,
		PACKS: [
			{
				hash: '78753230f729b80d849d29296af16e09d45b8c7ace869c05971920ab03586d34',
				pack: {
					'module-_colors': '2.0.1', 'module-_fonts': '2.0.1', 'module-_text-styling': '3.0.0', 'module-_grid': '2.0.0', 'module-_javascript-helpers': '2.0.0',
					'module-icons-base': '2.0.1', 'tick-icons-base': 'on',
					'module-icons-group03': '2.0.0', 'tick-icons-group03': 'on',
					'module-icons-group17': '2.0.0', 'tick-icons-group17': 'on',
					'module-tabcordions': '2.0.1', 'tick-tabcordions': 'on',
					'includeJquery': 'on',
					'includeUnminifiedJS': 'on',
					'includeLess': 'on',
					'brand': 'BOM',
				},
			},
			{
				hash: 'c18c7ad026d4fd6f24b46112c796757da10161c0309888cacadbe82bbbb149aa',
				pack: {
					'module-_colors': '2.0.1', 'module-_fonts': '2.0.1', 'module-_text-styling': '3.0.0', 'module-_grid': '2.0.0', 'module-_javascript-helpers': '2.0.0',
					'module-switches': '1.0.1', 'tick-switches': 'on',
					'module-lists': '1.0.0', 'tick-lists': 'on',
					'module-tables': '2.0.0', 'tick-tables': 'on',
					'includeJquery': 'on',
					'includeUnminifiedJS': 'on',
					'includeLess': 'on',
					'brand': 'STG',
				},
			},
			{
				hash: 'ab716ea65d0046c49a70edef72922a862dc3d5dcf87a502171581e666ec0086a',
				pack: {
					'module-_colors': '2.0.1', 'module-_fonts': '2.0.1', 'module-_text-styling': '3.0.0', 'module-_grid': '2.0.0', 'module-_javascript-helpers': '2.0.0',
					'module-text-extensions': '2.0.1', 'tick-text-extensions': 'on',
					'module-responsive-margins': '2.0.1', 'tick-responsive-margins': 'on',
					'module-responsive-toggles': '2.0.1', 'tick-responsive-toggles': 'on',
					'module-accessibility-helpers': '2.0.1', 'tick-accessibility-helpers': 'on',
					'module-alerts': '2.0.1', 'tick-alerts': 'on',
					'module-badges': '2.0.1', 'tick-badges': 'on',
					'module-labels': '2.0.2', 'tick-labels': 'on',
					'module-progress-bars': '2.0.1', 'tick-progress-bars': 'on',
					'module-breadcrumbs': '2.0.1', 'tick-breadcrumbs': 'on',
					'module-paginations': '2.0.2', 'tick-paginations': 'on',
					'module-buttons': '3.0.0', 'tick-buttons': 'on',
					'module-checkboxes': '2.0.1', 'tick-checkboxes': 'on',
					'module-input-addons': '2.0.2', 'tick-input-addons': 'on',
					'module-input-fields': '2.0.1', 'tick-input-fields': 'on',
					'module-input-groups': '2.0.2', 'tick-input-groups': 'on',
					'module-radios': '2.0.1', 'tick-radios': 'on',
					'module-switches': '2.0.1', 'tick-switches': 'on',
					'module-icons-base': '2.0.1', 'tick-icons-base': 'on',
					'module-icons-group01': '2.0.1', 'tick-icons-group01': 'on',
					'module-icons-group02': '3.0.0', 'tick-icons-group02': 'on',
					'module-icons-group03': '2.0.0', 'tick-icons-group03': 'on',
					'module-icons-group04': '2.0.0', 'tick-icons-group04': 'on',
					'module-icons-group05': '2.0.0', 'tick-icons-group05': 'on',
					'module-icons-group06': '2.0.0', 'tick-icons-group06': 'on',
					'module-icons-group07': '2.0.0', 'tick-icons-group07': 'on',
					'module-icons-group08': '2.0.0', 'tick-icons-group08': 'on',
					'module-icons-group09': '2.0.0', 'tick-icons-group09': 'on',
					'module-icons-group10': '2.0.0', 'tick-icons-group10': 'on',
					'module-icons-group11': '2.0.0', 'tick-icons-group11': 'on',
					'module-icons-group12': '2.0.0', 'tick-icons-group12': 'on',
					'module-icons-group13': '2.0.0', 'tick-icons-group13': 'on',
					'module-icons-group14': '2.0.0', 'tick-icons-group14': 'on',
					'module-icons-group15': '2.0.0', 'tick-icons-group15': 'on',
					'module-icons-group16': '2.0.1', 'tick-icons-group16': 'on',
					'module-icons-group17': '2.0.0', 'tick-icons-group17': 'on',
					'module-images': '2.0.1', 'tick-images': 'on',
					'module-responsive-embeds': '2.0.1', 'tick-responsive-embeds': 'on',
					'module-list-groups': '3.0.0', 'tick-list-groups': 'on',
					'module-lists': '2.0.2', 'tick-lists': 'on',
					'module-logos': '2.0.2', 'tick-logos': 'on',
					'module-symbols': '2.0.2', 'tick-symbols': 'on',
					'module-modals': '2.0.2', 'tick-modals': 'on',
					'module-popovers': '2.0.1', 'tick-popovers': 'on',
					'module-tooltips': '2.0.1', 'tick-tooltips': 'on',
					'module-panels': '2.0.1', 'tick-panels': 'on',
					'module-tabcordions': '3.0.0', 'tick-tabcordions': 'on',
					'module-wells': '2.0.1', 'tick-wells': 'on',
					'module-tables': '2.0.1', 'tick-tables': 'on',
					'includeJquery': 'on',
					'includeUnminifiedJS': 'on',
					'includeLess': 'on',
					'includePokemon': 'on',
					'brand': 'BT',
				},
			},
		],


//--------------------------------------------------------------------------------------------------------------------------------------------------------------
// Initiate tester
//--------------------------------------------------------------------------------------------------------------------------------------------------------------
		init: () => {
			Tester.debugging( 'Running init', 'report' );

			Tester
				.empty() //delete all files in zip folder
				.then( Tester.pack ); //setup the queries;
		},


//--------------------------------------------------------------------------------------------------------------------------------------------------------------
// Delete all files in zip folder
//--------------------------------------------------------------------------------------------------------------------------------------------------------------
		empty: () => {
			Tester.debugging( 'Running empty', 'report' );

			let fileCount = 0;

			return new Promise(function( resolve, reject ) {
				Rimraf( Tester.ZIPS + '*', function( error ) {
					Tester.debugging( 'Zip folder emptied', 'report' );

					resolve();
				});
			});
		},


//--------------------------------------------------------------------------------------------------------------------------------------------------------------
// todo
//--------------------------------------------------------------------------------------------------------------------------------------------------------------
		pack: ( loop = 0 ) => {
			Tester.debugging( `Running pack with loop: ${loop}`, 'report' );

			Tester.LOOP = loop;

			if( loop < Tester.PACKS.length ) {
				Tester
					.set( Tester.PACKS[ loop ] )
					.then( function() {
						Tester.pack( loop + 1 );
				});
			}
			else {
				Tester
					.unpack() //unpack all downloaded zip files
					.then( function() {
						Tester.check() //test the hash for each folder
					});
			}
		},


//--------------------------------------------------------------------------------------------------------------------------------------------------------------
// Set a group of packs for the queue
//--------------------------------------------------------------------------------------------------------------------------------------------------------------
		set: ( data ) => {
			Tester.debugging( 'Running set', 'report' );

			let call = 0;

			return new Promise(function( resolve, reject ) {
				const timer = setInterval(function() {
					call ++;

					if( call >= Tester.MAX ) {
						clearTimeout( timer );
					}

					Tester.debugging( 'Sending request', 'send' );
					Tester
						.send( data )
						.then( resolve );
				}, Tester.TIMEOUT);
			});
		},


//--------------------------------------------------------------------------------------------------------------------------------------------------------------
// Send request
//
// @param  data  [object]  Blender options
//--------------------------------------------------------------------------------------------------------------------------------------------------------------
		send: ( data ) => {
			Tester.debugging( 'Running send', 'report' );

			Tester.call = 0;
			Tester.name = ( Tester.MAX * Tester.LOOP );

			return new Promise(function( resolve, reject ) {
				Request.post(
					{
						url: 'http://127.0.0.1:1337/blender',
						form: data.pack,
						encoding: 'binary',
						headers: {
							'User-Agent': 'stress-tester',
						},
					},
					( error, response, body ) => {
						if(!error && response.statusCode == 200) {
							Tester.debugging( 'Request successfull', 'receive' );

							Tester.name ++;

							Tester.debugging( `Saving file to: "zips/blend${Tester.name}.zip"`, `receive` );

							Fs.writeFile( Tester.ZIPS + 'blend' + Tester.name + '.zip', body, 'binary', function( error ) {
								Tester.call ++;

								if( error ) {
									Tester.debugging( 'Unable to save zip file', 'error' );
								}
								else {
									if( Tester.call >= Tester.MAX ) {
										resolve();
									}
								}
							});
						}
						else {
							Tester.debugging( 'Request unsuccessfull', 'error' );
							console.log( JSON.stringify( error ) );
						}
					}
				);
			});
		},


//--------------------------------------------------------------------------------------------------------------------------------------------------------------
// Unpack all zipfiles
//--------------------------------------------------------------------------------------------------------------------------------------------------------------
		unpack: () => {
			Tester.debugging( 'Running unpack', 'report' );

			return new Promise(function( resolve, reject ) {
				Fs.readdir( Tester.ZIPS, function( error, files ) {
					files.forEach( function( file, index ) {
						if( file.substring(0, 5) === 'blend' ) {
							const zip = new AdmZip( Tester.ZIPS + file );
							const name = file.split('.'); //pack them all in a folder called the same as the zip file

							zip.extractAllTo( Tester.ZIPS + name[0] + '/', true );
						}
					});

					resolve();
				});
			});
		},


//--------------------------------------------------------------------------------------------------------------------------------------------------------------
// Check zip files against hash
//--------------------------------------------------------------------------------------------------------------------------------------------------------------
		check: () => {
			Tester.debugging( `Running check`, 'report' );

			let done = 0;

			for(let i = 1; i <= ( Tester.MAX * Tester.LOOP ); i++) { //let's look at all zip files we have unpacked

				let base = Math.ceil( i / ( Tester.MAX )) - 1; //to find the loop we are in we devide by max and some other funky math
				let zipsum = Tester.PACKS[ base ].hash; //find the hash we compare against

				Dirsum.digest( `${Tester.ZIPS}blend${i}`, 'sha256', ( error, hashes ) => { //and get the has for each
					done ++; //increment this so we can check if you've done ’em all

					if( error ) {
						Tester.debugging( `Dirsum failed for folder: "${Tester.ZIPS}blend${i}"`, 'error' );
						console.log( JSON.stringify( error ) );
					}
					else {
						if( hashes.hash === zipsum ) {
							Tester.debugging( `Zip (blend${i}) contents passes hash comparison`, 'positive' );
						}
						else {
							Tester.debugging( `Zip (blend${i}) contents fails hash comparison (${hashes.hash} != ${zipsum})`, 'negative' );
						}
					}

					if( done === ( Tester.MAX * Tester.LOOP ) ) { //when we are through the loop call done()
						Tester.done();
					}
				});
			}
		},


//--------------------------------------------------------------------------------------------------------------------------------------------------------------
// Wrapping things up
//--------------------------------------------------------------------------------------------------------------------------------------------------------------
		done: () => {
			Tester.debugging( 'Running done', 'report' );

			const now = Date.now();
			const diff = now - Tester.TIMING;

			Tester.debugging( `TEST TOOK: ${diff}ms`, `success` );
		},


//--------------------------------------------------------------------------------------------------------------------------------------------------------------
// Debugging prettiness
//
// @param  text  [string]   Text to be printed to debugger
// @param  code  [string]   The urgency as a string: ['report', 'error', 'interaction', 'send', 'receive']
//
// @return  [output]  console.log output
//--------------------------------------------------------------------------------------------------------------------------------------------------------------
		debugging: ( text, code ) => {

			if( code === 'headline' ) {
				if( Tester.DEBUG ) {
					CFonts.say(text, {
						'align': 'center',
						'colors': [`white`, `gray`],
					});
				}
			}

			if( code === 'report' && Tester.DEBUG ) {
				console.log(Chalk.bgWhite("\n" + Chalk.bold.green(' \u2611  ') + Chalk.black(text + ' ')));
			}

			if( code === 'error' && Tester.DEBUG ) {
				console.log(Chalk.bgWhite("\n" + Chalk.red(' \u2612  ') + Chalk.black(text + ' ')));
			}

			if( code === 'interaction' && Tester.DEBUG ) {
				console.log(Chalk.bgWhite("\n" + Chalk.blue(' \u261C  ') + Chalk.black(text + ' ')));
			}

			if( code === 'send' && Tester.DEBUG ) {
				console.log(Chalk.bgWhite("\n" + Chalk.bold.cyan(' \u219D  ') + Chalk.black(text + ' ')));
			}

			if( code === 'receive' && Tester.DEBUG ) {
				console.log(Chalk.bgWhite("\n" + Chalk.bold.cyan(' \u219C  ') + Chalk.black(text + ' ')));
			}

			if( code === 'positive' ) {
				console.log(Chalk.bgGreen("\n" + Chalk.bold.white( '    ' + text + ' ' )));
			}

			if( code === 'negative' ) {
				console.log(Chalk.bgRed("\n" + Chalk.bold.white( '    ' + text + ' ' )));
			}

			if( code === 'success' ) {
				console.log(Chalk.bgBlue("\n") + "\n" + Chalk.black("\n" + Chalk.bold.green( '    ' + text + ' ' )) + "\n");
			}

		},
	}
})();

//run tester
Tester.init();