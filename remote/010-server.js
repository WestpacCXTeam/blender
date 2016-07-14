/*! [Name-Version] */
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
		DEBUG: [Debug], //debugging infos
		GELRURL: `http://gel.westpacgroup.com.au/`,
		GUIRURL: `http://gel.westpacgroup.com.au/GUI/`,
		GUIPATH: Path.normalize(`${__dirname}/../../GUI-docs/GUI-source-master/`), //debug only
		// GUIPATH: Path.normalize(`${__dirname}/../../GUI-source-master/`),
		TEMPPATH: Path.normalize(`${__dirname}/._template/`),
		GELPATH: Path.normalize(`${__dirname}/../../../`),
		GUICONFIG: Path.normalize(`${__dirname}/../.guiconfig`),
		JQUERYPATH: `_javascript-helpers/1.0.1/_core/js/010-jquery.js`,
		SLACKURL: `https://hooks.slack.com/services/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`,
		SLACKICON: `http://gel.westpacgroup.com.au/GUI/blender/remote/assets/img/blender-icon.png`,
		LOG: Path.normalize(`${__dirname}/blender.log`),
		FUNKY: [
			{
				name: `James Bond`,
				var: `includeBond`,
				file: Path.normalize(`${__dirname}/assets/img/bond.png`),
				zip: `/bond.png`
			},
			{
				name: `Star Wars`,
				var: `includeStarWars`,
				file: Path.normalize(`${__dirname}/assets/img/starwars[Brand].jpg`),
				zip: `/starwars.png`
			},
			{
				name: `David Bowie`,
				var: `includeBowie`,
				file: Path.normalize(`${__dirname}/assets/img/bowie.png`),
				zip: `/bowie.png`
			}
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
				if( Blender.DEBUG ) {
					console.log(
						Chalk.bgWhite(`\n${Chalk.bold.green(` \u2611  `)} ${Chalk.black(`${text} `)}`)
					);
				}
			},

			error: ( text ) => {
				if( Blender.DEBUG ) {
					console.log(
						Chalk.bgWhite(`\n${Chalk.red(` \u2612  `)} ${Chalk.black(`${text} `)}`)
					);
				}
			},

			interaction: ( text ) => {
				if( Blender.DEBUG ) {
					console.log(
						Chalk.bgWhite(`\n${Chalk.blue(` \u261C  `)} ${Chalk.black(`${text} `)}`)
					);
				}
			},

			send: ( text ) => {
				if( Blender.DEBUG ) {
					console.log(
						Chalk.bgWhite(`\n${Chalk.bold.cyan(` \u219D  `)} ${Chalk.black(`${text} `)}`)
					);
				}
			},

			received: ( text ) => {
				if( Blender.DEBUG ) {
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