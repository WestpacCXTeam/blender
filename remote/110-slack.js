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

			let slack = new Slack( Blender.SLACKURL );
			let funky = ``;
			let core = ``;
			let modules = ``;
			let POST = Blender.POST;
			let jquery = Blender.selectedModules.includeJquery ? '`Yes`' : '`No`';
			let unminJS  = Blender.selectedModules.includeUnminifiedJS ? '`Yes`' : '`No`';
			let less  = Blender.selectedModules.includeLess ? '`Yes`' : '`No`';

			let channel = `#testing`;
			if( !Blender.DEBUG ) {
				let channel = `#blender`;
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