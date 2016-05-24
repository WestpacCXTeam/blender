/***************************************************************************************************************************************************************
 *
 * Get modules infos
 *
 **************************************************************************************************************************************************************/


//--------------------------------------------------------------------------------------------------------------------------------------------------------------
// Dependencies
//--------------------------------------------------------------------------------------------------------------------------------------------------------------


(function ModulesApp(Blender) {

	let module = {};

	//------------------------------------------------------------------------------------------------------------------------------------------------------------
	// Module init method
	//------------------------------------------------------------------------------------------------------------------------------------------------------------
	module.init = function ModulesInit() {
		Blender.debugging( 'Modules: Initiating', 'report' );
	};


	//------------------------------------------------------------------------------------------------------------------------------------------------------------
	// Returns json object of a specific module.json
	//
	// @param   module  [sting]  ID of module
	//
	// @return  [object]  Json object of module.json
	//------------------------------------------------------------------------------------------------------------------------------------------------------------
	module.getJson = function ModulesGetJson( module ) {
		Blender.debugging( 'Modules: Getting JSON for ' + module, 'report' );


		if( Blender.GUImodules === undefined ) { //flatten GUI json and assign to global

			Blender.GUImodules = {};
			Object.keys( Blender.GUI.modules ).forEach(function ModulesIterateCategory( category ) {

				Object.keys( Blender.GUI.modules[ category ] ).forEach(function ModulesIterateModules( mod ) {
					Blender.GUImodules[ mod ] = Blender.GUI.modules[ category ][ mod ];
				});

			});
		}

		return Blender.GUImodules[module];
		// JSON.parse( Fs.readFileSync( Blender.GUIPATH + module + '/module.json', 'utf8') ); //getting from module.json if we want to have a lot of I/O (we don't)

	};


	Blender.modules = module;


}(Blender));