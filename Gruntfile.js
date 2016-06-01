'use strict';

//--------------------------------------------------------------------------------------------------------------------------------------------------------------
//
//                                                ██████╗  ██╗   ██╗ ██╗      ██████╗   ██████╗   ██████╗ ███████╗
//                                               ██╔════╝  ██║   ██║ ██║      ██╔══██╗ ██╔═══██╗ ██╔════╝ ██╔════╝
//                                               ██║  ███╗ ██║   ██║ ██║      ██║  ██║ ██║   ██║ ██║      ███████╗
//                                               ██║   ██║ ██║   ██║ ██║      ██║  ██║ ██║   ██║ ██║      ╚════██║
//                                               ╚██████╔╝ ╚██████╔╝ ██║      ██████╔╝ ╚██████╔╝ ╚██████╗ ███████║
//                                                ╚═════╝   ╚═════╝  ╚═╝      ╚═════╝   ╚═════╝   ╚═════╝ ╚══════╝
//                                                                       Created by Westpac Design Delivery Team
// @desc     GUI docs
// @author   Dominik Wilkowski
// @website  https://github.com/WestpacCXTeam/GUI-docs
// @issues   https://github.com/WestpacCXTeam/GUI-docs/issues
//--------------------------------------------------------------------------------------------------------------------------------------------------------------


//--------------------------------------------------------------------------------------------------------------------------------------------------------------
// External dependencies
//--------------------------------------------------------------------------------------------------------------------------------------------------------------


//--------------------------------------------------------------------------------------------------------------------------------------------------------------
// Custom functions
//--------------------------------------------------------------------------------------------------------------------------------------------------------------


//--------------------------------------------------------------------------------------------------------------------------------------------------------------
// Settings
//--------------------------------------------------------------------------------------------------------------------------------------------------------------
var SETTINGS = function() {
	return {
		'folder': {
			'fileserver': 'remote',
			'serverProd': 'remote/server.js',
			'serverDev': 'remote/server-dev.js',
			'Packagejson': 'remote/package.json',
		},
	};
};


//--------------------------------------------------------------------------------------------------------------------------------------------------------------
// Grunt module
//--------------------------------------------------------------------------------------------------------------------------------------------------------------
module.exports = function(grunt) {

	//------------------------------------------------------------------------------------------------------------------------------------------------------------
	// Dependencies
	//------------------------------------------------------------------------------------------------------------------------------------------------------------
	grunt.loadNpmTasks('grunt-contrib-concat');
	grunt.loadNpmTasks('grunt-contrib-watch');
	grunt.loadNpmTasks('grunt-text-replace');
	grunt.loadNpmTasks('grunt-wakeup');
	grunt.loadNpmTasks('grunt-font');
	require('time-grunt')(grunt);


	//------------------------------------------------------------------------------------------------------------------------------------------------------------
	// Grunt tasks
	//------------------------------------------------------------------------------------------------------------------------------------------------------------
	grunt.initConfig({


		//----------------------------------------------------------------------------------------------------------------------------------------------------------
		// Package content
		//----------------------------------------------------------------------------------------------------------------------------------------------------------
		SETTINGS: SETTINGS(),
		pkg: grunt.file.readJSON( SETTINGS().folder.Packagejson ),


		//----------------------------------------------------------------------------------------------------------------------------------------------------------
		// Replace version
		//----------------------------------------------------------------------------------------------------------------------------------------------------------
		replace: {
			debugDev: {
				src: [
					'<%= SETTINGS.folder.serverDev %>',
				],
				overwrite: true,
				replacements: [
					{
						from: '[Debug]',
						to: 'true',
					},
					{
						from: '[-Debug-]',
						to: '[Debug]',
					},
					{
						from: '[Name-Version]',
						to: '<%= pkg.name %> - v<%= pkg.version %>',
					},
					{
						from: '[Version]',
						to: 'v<%= pkg.version %>',
					},
				],
			},

			debugProd: {
				src: [
					'<%= SETTINGS.folder.serverProd %>',
				],
				overwrite: true,
				replacements: [
					{
						from: '[Debug]',
						to: 'false',
					},
					{
						from: '[-Debug-]',
						to: '[Debug]',
					},
					{
						from: '[Name-Version]',
						to: '<%= pkg.name %> - v<%= pkg.version %>',
					},
					{
						from: '[Version]',
						to: 'v<%= pkg.version %>',
					},
				],
			},
		},


		//----------------------------------------------------------------------------------------------------------------------------------------------------------
		// Concat files
		//----------------------------------------------------------------------------------------------------------------------------------------------------------
		concat: {
			nodeProd: {
				src: [
					'<%= SETTINGS.folder.fileserver %>/*.js',
					'!<%= SETTINGS.folder.serverProd %>',
					'!<%= SETTINGS.folder.serverDev %>',
				],
				dest: '<%= SETTINGS.folder.serverProd %>',
			},
			nodeDev: {
				src: [
					'<%= SETTINGS.folder.fileserver %>/*.js',
					'!<%= SETTINGS.folder.serverProd %>',
					'!<%= SETTINGS.folder.serverDev %>',
				],
				dest: '<%= SETTINGS.folder.serverDev %>',
			},
		},


		//----------------------------------------------------------------------------------------------------------------------------------------------------------
		// Banners
		//----------------------------------------------------------------------------------------------------------------------------------------------------------
		font: {
			options: {
				space: false,
				maxLength: 11,
				colors: ['blue', 'gray'],
			},

			title: {
				text: '| blender',
			},
		},


		//----------------------------------------------------------------------------------------------------------------------------------------------------------
		// Wakeup
		//----------------------------------------------------------------------------------------------------------------------------------------------------------
		wakeup: {
			wakeme: {
				options: {
					randomize: true,
					notifications: true,
				},
			},
		},


		//----------------------------------------------------------------------------------------------------------------------------------------------------------
		// Watch
		//----------------------------------------------------------------------------------------------------------------------------------------------------------
		watch: {
			node: {
				files: [
					'<%= SETTINGS.folder.fileserver %>/*.js',
					'!<%= SETTINGS.folder.fileserver %>/server.js',
					'!<%= SETTINGS.folder.fileserver %>/server-dev.js',
				],
				tasks: [
					'_buildNode',
					'replace',
					'replace',
					'wakeup',
				],
			},
		},

	});



	//------------------------------------------------------------------------------------------------------------------------------------------------------------
	// Private tasks
	//------------------------------------------------------------------------------------------------------------------------------------------------------------
	grunt.registerTask('_buildNode', [
		'concat',
		'replace',
	]);


	//------------------------------------------------------------------------------------------------------------------------------------------------------------
	// Build tasks
	//------------------------------------------------------------------------------------------------------------------------------------------------------------
	grunt.registerTask('default', [ //run build with watch
		'font:title',
		'_buildNode',
		'replace',
		'wakeup',
		'watch',
	]);

};