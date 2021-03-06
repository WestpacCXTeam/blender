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