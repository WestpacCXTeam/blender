/*! [Name-Version] */
/***************************************************************************************************************************************************************
 *
 * Westpac GUI blender
 *
 **************************************************************************************************************************************************************/

'use strict';



//--------------------------------------------------------------------------------------------------------------------------------------------------------------
// Dependencies
//--------------------------------------------------------------------------------------------------------------------------------------------------------------
const Fs = require('fs');
const Http = require('http');
const Path = require('path');
const Chalk = require('chalk');
const _ = require('underscore');
const CFonts = require('cfonts');
const Express = require('express');
const BodyParser = require('body-parser');


let Blender = (function Application() {

	return {
		//----------------------------------------------------------------------------------------------------------------------------------------------------------
		// Settings
		//----------------------------------------------------------------------------------------------------------------------------------------------------------
		DEBUG: [Debug], //debugging infos
		GELRURL: 'http://gel.westpacgroup.com.au/',
		GUIRURL: 'http://gel.westpacgroup.com.au/' + 'GUI/',
		GUIPATH: Path.normalize(__dirname + '/../../GUI-docs/GUI-source-master/'), //debug only
		// GUIPATH: Path.normalize(__dirname + '/../../GUI-source-master/'),
		TEMPPATH: Path.normalize(__dirname + '/._template/'),
		GELPATH: Path.normalize(__dirname + '/../../../'),
		GUICONFIG: Path.normalize(__dirname + '/../.guiconfig'),
		JQUERYPATH: '_javascript-helpers/1.0.1/_core/js/010-jquery.js',
		SLACKURL: 'https://hooks.slack.com/services/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',
		SLACKICON: 'http://gel.westpacgroup.com.au/GUI/blender/remote/assets/img/blender-icon.png',
		LOG: Path.normalize(__dirname + '/blender.log'),
		FUNKY: [
			{
				name: 'James Bond',
				var: 'includeBond',
				file: Path.normalize(__dirname + '/assets/img/bond.png'),
				zip: '/bond.png'
			},
			{
				name: 'Star Wars',
				var: 'includeStarWars',
				file: Path.normalize(__dirname + '/assets/img/starwars[Brand].jpg'),
				zip: '/starwars.png'
			},
			{
				name: 'David Bowie',
				var: 'includeBowie',
				file: Path.normalize(__dirname + '/assets/img/bowie.png'),
				zip: '/bowie.png'
			}
		],


		//----------------------------------------------------------------------------------------------------------------------------------------------------------
		// Initiate blender
		//----------------------------------------------------------------------------------------------------------------------------------------------------------
		init: function Init() {
			if( Blender.DEBUG ) Blender.debugging( ' DEBUGGING| INFORMATION', 'headline' );

			Blender.GUI = JSON.parse( Fs.readFileSync( Blender.GUIPATH + 'GUI.json', 'utf8') );
			let blender = Express();

			//starting server
			blender
				.use( BodyParser.urlencoded({ extended: false }) )

				.listen(1337, function PortListener() {
					Blender.debugging( 'Server started on port 1337', 'report' );
				});


			blender.get('*', function GetListener(request, response) {
				response.redirect(301, Blender.GUIRURL);
			});


			//listening to post request
			blender.post('/blender', function PostListener(request, response) {
				Blender.IP = request.headers['x-forwarded-for'] || request.connection.remoteAddress;

				Blender.log.info( 'New request: ' + request.headers['x-forwarded-for'] + ' / ' + request.connection.remoteAddress );

				//the core needs to be in the request and the user agent should be presented
				if(
					typeof request.body['module-_colors'] !== 'undefined'
					&& typeof request.body['module-_fonts'] !== 'undefined'
					&& typeof request.body['module-_text-styling'] !== 'undefined'
					&& typeof request.body['module-_grid'] !== 'undefined'
					&& typeof request.body['module-_javascript-helpers'] !== 'undefined'
					&& typeof request.headers['user-agent'] !== 'undefined'
				) {

					//when debug mode is off disgard "stress-tester"
					if( !Blender.DEBUG && request.headers['user-agent'] !== 'stress-tester' || Blender.DEBUG ) {
						Blender.response = response;
						Blender.POST = request.body;

						Blender.files.init();
					}
					else {
						Blender.log.info( 'Discarded for invalid user-agent (' + request.headers['user-agent'] + ')' );
					}
				}
				else {
					Blender.log.info( 'Discarded for invalid request (core not complete or user-agent empty)' );
				}
			});

		},


		//------------------------------------------------------------------------------------------------------------------------------------------------------------
		// Global vars
		//------------------------------------------------------------------------------------------------------------------------------------------------------------
		response: {}, //server response object
		POST: {}, //POST values from client
		GUI: {}, //GUI.json contents
		IP: '', //Client IP


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
				if( Blender.DEBUG ) {
					let fonts = new CFonts({
						'text': text,
						'colors': ['white', 'gray'],
						'maxLength': 12,
					});
				}
			}

			if( code === 'report' ) {
				if( Blender.DEBUG ) console.log(Chalk.bgWhite("\n" + Chalk.bold.green(' \u2611  ') + Chalk.black(text + ' ')));
			}

			else if( code === 'error' ) {
				if( Blender.DEBUG ) console.log(Chalk.bgWhite("\n" + Chalk.red(' \u2612  ') + Chalk.black(text + ' ')));
			}

			else if( code === 'interaction' ) {
				if( Blender.DEBUG ) console.log(Chalk.bgWhite("\n" + Chalk.blue(' \u261C  ') + Chalk.black(text + ' ')));
			}

			else if( code === 'send' ) {
				if( Blender.DEBUG ) console.log(Chalk.bgWhite("\n" + Chalk.bold.cyan(' \u219D  ') + Chalk.black(text + ' ')));
			}

			else if( code === 'receive' ) {
				if( Blender.DEBUG ) console.log(Chalk.bgWhite("\n" + Chalk.bold.cyan(' \u219C  ') + Chalk.black(text + ' ')));
			}

		},


		//------------------------------------------------------------------------------------------------------------------------------------------------------------
		// Log to console.log
		//
		// @method  info     Log info to console.log and in extension to node log file
		//          @param   text     string   The sting you want to log
		//          @return  console.log output
		//
		// @method  error    Log error to console.log and in extension to node log file
		//          @param   text     string   The sting you want to log
		//          @return  console.log output
		//------------------------------------------------------------------------------------------------------------------------------------------------------------
		log: {

			info: function LogInfo( text ) {
				console.log( Chalk.bold.black( 'Info  ' ) + new Date().toString() + '  ' + text );
			},

			error: function LogError( text ) {
				console.log( Chalk.bold.red( 'ERROR ' ) + new Date().toString() + '  ' + text );
			},

		},

	}

}());


//run blender
Blender.init();