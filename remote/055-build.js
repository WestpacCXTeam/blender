/***************************************************************************************************************************************************************
 *
 * Insert build tool
 *
 **************************************************************************************************************************************************************/


//--------------------------------------------------------------------------------------------------------------------------------------------------------------
// Dependencies
//--------------------------------------------------------------------------------------------------------------------------------------------------------------


(function BuildApp(Blender) {

	let module = {};

	//------------------------------------------------------------------------------------------------------------------------------------------------------------
	// Module init method
	//------------------------------------------------------------------------------------------------------------------------------------------------------------
	module.init = function BuildInit() {
		Blender.debugging( 'Build: Initiating', 'report' );
	};


	//------------------------------------------------------------------------------------------------------------------------------------------------------------
	// Returns json object of a specific module.json
	//
	// @param   module  [sting]  ID of module
	//
	// @return  [object]  Json object of module.json
	//------------------------------------------------------------------------------------------------------------------------------------------------------------
	module.get = function BuildGet() {
		Blender.debugging( 'Build: Getting build', 'report' );

		var _includeOriginalLess  = Blender.selectedModules.includeLess;
		var _includeOriginalJS  = Blender.selectedModules.includeUnminifiedJS;

		if( _includeOriginalLess || _includeOriginalJS) {
			Blender.zip.queuing('build', false); //build queue is done

			Blender.zip.addBulk( Blender.TEMPPATH, ['Gruntfile.js', 'package.json'], '/' );
		}
		else {
			Blender.zip.queuing('build', false); //build queue is done
		}
	};


	Blender.build = module;


}(Blender));