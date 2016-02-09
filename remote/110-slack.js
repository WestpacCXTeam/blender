/***************************************************************************************************************************************************************
 *
 * Post to slack
 *
 **************************************************************************************************************************************************************/


//--------------------------------------------------------------------------------------------------------------------------------------------------------------
// Dependencies
//--------------------------------------------------------------------------------------------------------------------------------------------------------------
var Slack = require('node-slack');


(function SlackApp(App) {

	var module = {};

	//------------------------------------------------------------------------------------------------------------------------------------------------------------
	// Module init method
	//------------------------------------------------------------------------------------------------------------------------------------------------------------
	module.post = function SlackPost() {
		App.debugging( 'Slack: Posting', 'report' );

		var slack = new Slack( App.SLACKURL );
		var funky = '';
		var core = '';
		var modules = '';
		var POST = App.POST;
		var jquery = App.selectedModules.includeJquery ? '`Yes`' : '`No`';
		var unminJS  = App.selectedModules.includeUnminifiedJS ? '`Yes`' : '`No`';
		var less  = App.selectedModules.includeLess ? '`Yes`' : '`No`';

		var channel = '#testing';
		if( !App.DEBUG ) {
			var channel = '#blender';
		}

		for(var i = App.FUNKY.length - 1; i >= 0; i--) {
			if( POST[ App.FUNKY[i].var ] === 'on' ) {
				funky += '`' + App.FUNKY[i].name + '` ';
			}
		}

		if( funky === '' ) {
			funky = '`none`';
		}

		App.selectedModules.core.forEach(function CssIterateCore( module ) {
			core += ', `' + module.ID+ ':' + module.version + '`';
		});

		App.selectedModules.modules.forEach(function SlackIterateModules( module ) {
			modules += ', `' + module.ID+ ':' + module.version + '`';
		});

		slack.send({
			'text': 'BOOM! ... another blend!',
			'attachments': [{
				'fallback': '_What\'s in it?_',
				'pretext': '_What\'s in it?_',
				'color': '#ffcdd2',
				'mrkdwn_in': [
					'text',
					'pretext',
					'fields',
				],
				'fields': [
					{
						'title': 'Modules',
						'value': '' +
							'_Selected_: `' + App.selectedModules.modules.length + '`\n' +
							'_Core_:\n' + core.substr(2) + '\n' +
							'_Modules_:\n' + modules.substr(2) + '\n\n\n',
						'short': false,
					},
					{
						'title': 'Options',
						'value': '' +
							'_Brand_: `' + App.selectedModules.brand + '`\n' +
							'_jQuery_: ' + jquery + '\n' +
							'_unmin JS_: ' + unminJS + '\n' +
							'_Less_: ' + less + '\n' +
							'_Funky_: ' + funky + '\n\n\n',
						'short': false,
					},
					{
						'title': 'Client',
						'value': '' +
							'_IP_: `' + App.IP + '`',
						'short': false,
					}
				],
			}],
			'channel': channel,
			'username': 'The Blender',
			'icon_url': App.SLACKICON,
		});
	};


	App.slack = module;


}(App));