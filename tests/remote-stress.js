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
const Chalk = require('chalk');
const Fs = require('fs');


let Tester = (function Application() {
	return {
		//----------------------------------------------------------------------------------------------------------------------------------------------------------
		// Settings
		//----------------------------------------------------------------------------------------------------------------------------------------------------------
		DEBUG: true,
		CALL: 1,
		ZIPS: 'zips/',
		TIMING: Date.now(),


		//----------------------------------------------------------------------------------------------------------------------------------------------------------
		// Initiate tester
		//----------------------------------------------------------------------------------------------------------------------------------------------------------
		init: function Init() {

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
			};


			//stress the blender
			let timer = setInterval(function() {
				Tester.CALL++;

				if( Tester.CALL > 100 ) {
					clearTimeout( timer );
				}

				Tester.debugging( 'Sending request', 'send' );
				Tester.send( data );
			}, 20);
		},


		//----------------------------------------------------------------------------------------------------------------------------------------------------------
		// Send request
		//
		// @param  data  [object]  Blender options
		//----------------------------------------------------------------------------------------------------------------------------------------------------------
		send: function Send( data ) {
			Tester.debugging( 'Running send', 'info' );

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
					Tester.CALL --;

					if(!error && response.statusCode == 200) {
						Tester.debugging( 'Request successfull', 'receive' );

						Tester.debugging( 'Saving file to: "zips/blend' + Tester.CALL + '.zip"', 'receive' );
						Fs.writeFile( Tester.ZIPS + 'blend' + Tester.CALL + '.zip', body, 'binary', function(error) {
							if(error) {
								Tester.debugging( 'Unable to save zip file', 'error' );
							}
							else {
								if( Tester.CALL === 1 ) {
									Tester.unpack(); //unpack all downloaded zip files
								}
							}
						});
					}
					else {
						Tester.debugging( 'Request unsuccessfull', 'error' );
						console.log(error);
					}
				}
			);
		},


		//----------------------------------------------------------------------------------------------------------------------------------------------------------
		// Unpack all zipfiles
		//----------------------------------------------------------------------------------------------------------------------------------------------------------
		unpack: function Unpack() {
			Tester.debugging( 'Running unpack', 'info' );

			Fs.readdir( Tester.ZIPS, function( error, files ) {
				files.forEach( function( file, index ) {
					if( file.substring(0, 5) === 'blend' ) {
						let zip = new AdmZip( Tester.ZIPS + file );
						let name = file.split('.'); //pack them all in a folder called the same as the zip file

						zip.extractAllTo( Tester.ZIPS + name[0] + '/', true );
					}
				});
			});

			Tester.done();
		},


		//----------------------------------------------------------------------------------------------------------------------------------------------------------
		// Wrapping things up
		//----------------------------------------------------------------------------------------------------------------------------------------------------------
		done: function Done() {
			Tester.debugging( 'Running done', 'info' );

			let now = Date.now();
			let diff = now - Tester.TIMING;

			console.log( "\n" + Chalk.bold('  TEST TOOK: ' + diff + 'ms') + "\n" );
		},


		//----------------------------------------------------------------------------------------------------------------------------------------------------------
		// Debugging prettiness
		//
		// @param  text  [string]   Text to be printed to debugger
		// @param  code  [string]   The urgency as a string: ['report', 'error', 'interaction', 'send', 'receive']
		//
		// @return  [output]  console.log output
		//----------------------------------------------------------------------------------------------------------------------------------------------------------
		debugging: function Debugging( text, code ) {

			if( code === 'headline' ) {
				if( Tester.DEBUG ) {
					let fonts = new CFonts({
						'text': text,
						'colors': ['white', 'gray'],
						'maxLength': 12,
					});
				}
			}

			if( code === 'report' ) {
				if( Tester.DEBUG ) console.log(Chalk.bgWhite("\n" + Chalk.bold.green(' \u2611  ') + Chalk.black(text + ' ')));
			}

			else if( code === 'error' ) {
				if( Tester.DEBUG ) console.log(Chalk.bgWhite("\n" + Chalk.red(' \u2612  ') + Chalk.black(text + ' ')));
			}

			else if( code === 'interaction' ) {
				if( Tester.DEBUG ) console.log(Chalk.bgWhite("\n" + Chalk.blue(' \u261C  ') + Chalk.black(text + ' ')));
			}

			else if( code === 'send' ) {
				if( Tester.DEBUG ) console.log(Chalk.bgWhite("\n" + Chalk.bold.cyan(' \u219D  ') + Chalk.black(text + ' ')));
			}

			else if( code === 'receive' ) {
				if( Tester.DEBUG ) console.log(Chalk.bgWhite("\n" + Chalk.bold.cyan(' \u219C  ') + Chalk.black(text + ' ')));
			}

		},
	}
}());

//run tester
Tester.init();