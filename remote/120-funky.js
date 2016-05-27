/***************************************************************************************************************************************************************
 *
 * Funky stuff
 *
 **************************************************************************************************************************************************************/


//--------------------------------------------------------------------------------------------------------------------------------------------------------------
// Dependencies
//--------------------------------------------------------------------------------------------------------------------------------------------------------------


((Blender) => {

	let module = {};

	//------------------------------------------------------------------------------------------------------------------------------------------------------------
	// Module get method
	//------------------------------------------------------------------------------------------------------------------------------------------------------------
	module.get = () => {
		Blender.debugging( 'funky: Getting funky stuff', 'report' );

		var POST = Blender.POST;
		var funkies = 0;
		var funkyLog = '';

		for(let i = Blender.FUNKY.length - 1; i >= 0; i--) {
			if( POST[ Blender.FUNKY[i].var ] === 'on' ) {
				funkies++; //how many funky bits have been requested?
			}
		}

		if( funkies > 0 ) {
			for(let i = Blender.FUNKY.length - 1; i >= 0; i--) {

				if( POST[ Blender.FUNKY[i].var ] === 'on' ) {
					Blender.debugging( 'funky: Getting ' + Blender.FUNKY[i].name + ' reference', 'report' );

					funkies--; //counting down

					if( funkies === 0 ) { //if this is the last one
						Blender.zip.queuing('funky', false);
					}

					var file = Blender.FUNKY[i].file.replace( '[Brand]', POST['brand'] ); //brand path

					Blender.zip.addPath( file, Blender.FUNKY[i].zip ); //add file to zip
					funkyLog += ' ' + Blender.FUNKY[i].name
				}
			}

			Blender.log.info( '             include LESS:' + funkyLog );
		}
		else {
			Blender.zip.queuing('funky', false);
			Blender.zip.readyZip();
		}
	};


	Blender.funky = module;


})(Blender);