/*! [Name-Version] */
/***************************************************************************************************************************************************************
 *
 * Westpac GUI file server
 *
 **************************************************************************************************************************************************************/

'use strict';



//--------------------------------------------------------------------------------------------------------------------------------------------------------------
// Dependencies
//--------------------------------------------------------------------------------------------------------------------------------------------------------------
var Fs = require('fs');
var Http = require('http');
var Path = require('path');
var Chalk = require('chalk');
var _ = require("underscore");
var CFonts = require('cfonts');
var Express = require('express');
var BodyParser = require('body-parser');


var App = (function Application() {

	//------------------------------------------------------------------------------------------------------------------------------------------------------------
	// Settings
	//------------------------------------------------------------------------------------------------------------------------------------------------------------
	return {
		DEBUG: [Debug], //debugging infos
		GELRURL: 'http://gel.westpacgroup.com.au/',
		GUIRURL: 'http://gel.westpacgroup.com.au/' + 'GUI/',
		GUIPATH: Path.normalize(__dirname + '/../../GUI-source-master/'),
		TEMPPATH: Path.normalize(__dirname + '/._template/'),
		GELPATH: Path.normalize(__dirname + '/../../../'),
		JQUERYPATH: '_javascript-helpers/1.0.1/_core/js/010-jquery.js',
		SLACKURL: 'https://hooks.slack.com/services/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',
		SLACKICON: 'http://gel.westpacgroup.com.au/GUI/blender/assets/img/blender-icon.png',
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
			if( App.DEBUG ) App.debugging( ' DEBUGGING| INFORMATION', 'headline' );

			App.GUI = JSON.parse( Fs.readFileSync( App.GUIPATH + 'GUI.json', 'utf8') );
			var blender = Express();

			//starting server
			blender
				.use( BodyParser.urlencoded({ extended: false }) )

				.listen(8080, function PortListener() {
					App.debugging( 'Server started on port 8080', 'report' );
				});


			blender.get('*', function GetListener(request, response) {
				response.redirect(301, App.GUIRURL);
			});


			//listening to post request
			blender.post('/blender', function PostListener(request, response) {
				App.IP = request.connection.remoteAddress;

				App.log.info( 'New request: ' + request.headers['x-forwarded-for'] + ' / ' + App.IP );

				App.response = response;
				App.POST = request.body;

				App.files.init();
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
				if( App.DEBUG ) {
					var fonts = new CFonts({
						'text': text,
						'colors': ['white', 'gray'],
						'maxLength': 12,
					});
				}
			}

			if( code === 'report' ) {
				if( App.DEBUG ) console.log(Chalk.bgWhite("\n" + Chalk.bold.green(' \u2611  ') + Chalk.black(text + ' ')));
			}

			else if( code === 'error' ) {
				if( App.DEBUG ) console.log(Chalk.bgWhite("\n" + Chalk.red(' \u2612  ') + Chalk.black(text + ' ')));
			}

			else if( code === 'interaction' ) {
				if( App.DEBUG ) console.log(Chalk.bgWhite("\n" + Chalk.blue(' \u261C  ') + Chalk.black(text + ' ')));
			}

			else if( code === 'send' ) {
				if( App.DEBUG ) console.log(Chalk.bgWhite("\n" + Chalk.bold.cyan(' \u219D  ') + Chalk.black(text + ' ')));
			}

			else if( code === 'receive' ) {
				if( App.DEBUG ) console.log(Chalk.bgWhite("\n" + Chalk.bold.cyan(' \u219C  ') + Chalk.black(text + ' ')));
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
				console.log( Chalk.bold.black( 'Info ' ) + new Date().toString() + '  ' + text );
			},

			error: function LogError( text ) {
				console.log( Chalk.bold.red( 'ERROR' ) + new Date().toString() + '  ' + text );
			},

		},

	}

}());


//run blender
App.init();