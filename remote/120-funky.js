/***************************************************************************************************************************************************************
 *
 * Funky stuff
 *
 **************************************************************************************************************************************************************/


//--------------------------------------------------------------------------------------------------------------------------------------------------------------
// Dependencies
//--------------------------------------------------------------------------------------------------------------------------------------------------------------


(function FunkyApp(App) {

	var module = {};

	//------------------------------------------------------------------------------------------------------------------------------------------------------------
	// Module get method
	//------------------------------------------------------------------------------------------------------------------------------------------------------------
	module.get = function funkyPost() {
		App.debugging( 'funky: Getting funky stuff', 'report' );

		var POST = App.POST;
		var funkies = 0;
		var funkyLog = '';

		for(var i = App.FUNKY.length - 1; i >= 0; i--) {
			if( POST[ App.FUNKY[i].var ] === 'on' ) {
				funkies++; //how many funky bits have been requested?
			}
		}

		if( funkies > 0 ) {
			for(var i = App.FUNKY.length - 1; i >= 0; i--) {

				if( POST[ App.FUNKY[i].var ] === 'on' ) {
					App.debugging( 'funky: Getting ' + App.FUNKY[i].name + ' reference', 'report' );

					funkies--; //counting down

					if( funkies === 0 ) { //if this is the last one
						App.zip.queuing('funky', false);
					}

					var file = App.FUNKY[i].file.replace( '[Brand]', POST['brand'] ); //brand path

					App.zip.addPath( file, App.FUNKY[i].zip ); //add file to zip
					funkyLog += ' ' + App.FUNKY[i].name
				}
			}

			App.log.info( '             include LESS:' + funkyLog );
		}
		else {
			App.zip.queuing('funky', false);
			App.zip.readyZip();
		}
	};


	App.funky = module;


}(App));