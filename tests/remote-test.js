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
const Dirsum = require('dirsum');
const Rimraf = require('rimraf');
const Chalk = require('chalk');
const Fs = require('fs');


let Tester = (() => {
	return {
		//----------------------------------------------------------------------------------------------------------------------------------------------------------
		// Settings
		//----------------------------------------------------------------------------------------------------------------------------------------------------------
		DEBUG: true,
		ZIPS: 'zips/',
		TIMING: Date.now(),
		MAX: 10,


		//----------------------------------------------------------------------------------------------------------------------------------------------------------
		// Initiate tester
		//----------------------------------------------------------------------------------------------------------------------------------------------------------
		init: () => {
			Tester.debugging( 'Running init', 'report' );

			Tester.empty(); //delete all files in zip folder
		},


		//----------------------------------------------------------------------------------------------------------------------------------------------------------
		// Delete all files in zip folder
		//----------------------------------------------------------------------------------------------------------------------------------------------------------
		empty: () => {
			Tester.debugging( 'Running empty', 'report' );

			let fileCount = 0;

			Rimraf( Tester.ZIPS + '*', function(error) {
				Tester.debugging( 'Zip folder emptied', 'report' );

				Tester.set(); //setup the queries
			});
		},


		//----------------------------------------------------------------------------------------------------------------------------------------------------------
		// Delete all files in zip folder
		//----------------------------------------------------------------------------------------------------------------------------------------------------------
		set: () => {
			Tester.debugging( 'Running set', 'report' );

			//data
			let data = {
				'module-_colors': '2.0.1', 'module-_fonts': '2.0.1', 'module-_text-styling': '2.0.1', 'module-_grid': '2.0.0', 'module-_javascript-helpers': '2.0.0',
				'module-icons-base': '2.0.1', 'tick-icons-base': 'on',
				'module-icons-group03': '2.0.0', 'tick-icons-group03': 'on',
				'module-icons-group17': '2.0.0', 'tick-icons-group17': 'on',
				'module-tabcordions': '2.0.1', 'tick-tabcordions': 'on',
				'includeJquery': 'on',
				'includeUnminifiedJS': 'on',
				'includeLess': 'on',
				'brand': 'BOM',
			}; //hash for this unzipped folder is: 073131bffb9e2a3bdc27d129fb1dc0b0ad1c74e743decba3a7a339ae2ffa9fc8

			let call = 0;

			let timer = setInterval(function() {
				call ++;

				if( call >= Tester.MAX ) {
					clearTimeout( timer );
				}

				Tester.debugging( 'Sending request', 'send' );
				Tester.send( data );
			}, 5);
		},


		//----------------------------------------------------------------------------------------------------------------------------------------------------------
		// Send request
		//
		// @param  data  [object]  Blender options
		//----------------------------------------------------------------------------------------------------------------------------------------------------------
		send: ( data ) => {
			Tester.debugging( 'Running send', 'report' );

			Tester.call = 0;
			Tester.name = 0;

			Request.post(
				{
					url: 'http://127.0.0.1:1337/blender',
					form: data,
					encoding: 'binary',
					headers: {
						'User-Agent': 'stress-tester',
					},
				},
				function responseCallback(error, response, body) {
					if(!error && response.statusCode == 200) {
						Tester.debugging( 'Request successfull', 'receive' );

						Tester.name ++;

						Tester.debugging( 'Saving file to: "zips/blend' + Tester.name + '.zip"', 'receive' );
						Fs.writeFile( Tester.ZIPS + 'blend' + Tester.name + '.zip', body, 'binary', function(error) {
							Tester.call ++;

							if(error) {
								Tester.debugging( 'Unable to save zip file', 'error' );
							}
							else {
								if( Tester.call >= Tester.MAX ) {
									Tester.unpack(); //unpack all downloaded zip files
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
		},


		//----------------------------------------------------------------------------------------------------------------------------------------------------------
		// Unpack all zipfiles
		//----------------------------------------------------------------------------------------------------------------------------------------------------------
		unpack: () => {
			Tester.debugging( 'Running unpack', 'report' );

			Fs.readdir( Tester.ZIPS, function( error, files ) {
				files.forEach( function( file, index ) {
					if( file.substring(0, 5) === 'blend' ) {
						let zip = new AdmZip( Tester.ZIPS + file );
						let name = file.split('.'); //pack them all in a folder called the same as the zip file

						zip.extractAllTo( Tester.ZIPS + name[0] + '/', true );
					}
				});

				Tester.check();
			});
		},


		//----------------------------------------------------------------------------------------------------------------------------------------------------------
		// Check zip files against hash
		//----------------------------------------------------------------------------------------------------------------------------------------------------------
		check: () => {
			Tester.debugging( 'Running check', 'report' );

			let zipsum = '073131bffb9e2a3bdc27d129fb1dc0b0ad1c74e743decba3a7a339ae2ffa9fc8'; //the hash of the unzipped files

			for(let i = 1; i <= Tester.MAX; i++) { //let's look at all zip files we have unpacked

				Dirsum.digest( Tester.ZIPS + 'blend' + i, 'sha256', (error, hashes) => { //and get the has for each
					if(error) {
						Tester.debugging( 'Dirsum failed', 'error' );
						console.log( JSON.stringify( error ) );
					}
					else {
						if( hashes.hash === zipsum ) {
							Tester.debugging( 'Zip (blend' + i + ') contents passes hash comparison', 'positive' );
						}
						else {
							Tester.debugging( 'Zip (blend' + i + ') contents fails hash comparison', 'negative' );
						}
					}

					if( i === Tester.MAX ) { //when we are through the loop call done()
						Tester.done();
					}
				});
			}
		},


		//----------------------------------------------------------------------------------------------------------------------------------------------------------
		// Wrapping things up
		//----------------------------------------------------------------------------------------------------------------------------------------------------------
		done: () => {
			Tester.debugging( 'Running done', 'report' );

			let now = Date.now();
			let diff = now - Tester.TIMING;

			Tester.debugging( 'TEST TOOK: ' + diff + 'ms', 'success' );
		},


		//----------------------------------------------------------------------------------------------------------------------------------------------------------
		// Debugging prettiness
		//
		// @param  text  [string]   Text to be printed to debugger
		// @param  code  [string]   The urgency as a string: ['report', 'error', 'interaction', 'send', 'receive']
		//
		// @return  [output]  console.log output
		//----------------------------------------------------------------------------------------------------------------------------------------------------------
		debugging: ( text, code ) => {

			if( code === 'headline' ) {
				if( Tester.DEBUG ) {
					let fonts = new CFonts({
						'text': text,
						'colors': ['white', 'gray'],
						'maxLength': 12,
					});
				}
			}

			if( code === 'report' && Tester.DEBUG ) {
				console.log(Chalk.bgWhite("\n" + Chalk.bold.green(' \u2611  ') + Chalk.black(text + ' ')));
			}

			else if( code === 'error' && Tester.DEBUG ) {
				console.log(Chalk.bgWhite("\n" + Chalk.red(' \u2612  ') + Chalk.black(text + ' ')));
			}

			else if( code === 'interaction' && Tester.DEBUG ) {
				console.log(Chalk.bgWhite("\n" + Chalk.blue(' \u261C  ') + Chalk.black(text + ' ')));
			}

			else if( code === 'send' && Tester.DEBUG ) {
				console.log(Chalk.bgWhite("\n" + Chalk.bold.cyan(' \u219D  ') + Chalk.black(text + ' ')));
			}

			else if( code === 'receive' && Tester.DEBUG ) {
				console.log(Chalk.bgWhite("\n" + Chalk.bold.cyan(' \u219C  ') + Chalk.black(text + ' ')));
			}

			else if( code === 'positive' && Tester.DEBUG ) {
				console.log(Chalk.bgGreen("\n" + Chalk.bold.white( '    ' + text + ' ' )));
			}

			else if( code === 'negative' && Tester.DEBUG ) {
				console.log(Chalk.bgRed("\n" + Chalk.bold.white( '    ' + text + ' ' )));
			}

			else if( code === 'success' && Tester.DEBUG ) {
				console.log(Chalk.bgBlue("\n") + "\n" + Chalk.black("\n" + Chalk.bold.green( '    ' + text + ' ' )) + "\n");
			}

		},
	}
})();

//run tester
Tester.init();