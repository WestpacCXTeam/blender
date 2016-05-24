/***************************************************************************************************************************************************************
 *
 * Counter
 *
 **************************************************************************************************************************************************************/


//--------------------------------------------------------------------------------------------------------------------------------------------------------------
// Dependencies
//--------------------------------------------------------------------------------------------------------------------------------------------------------------


(function CounterApp(Blender) {

	let module = {};

	//------------------------------------------------------------------------------------------------------------------------------------------------------------
	// Module add method
	//------------------------------------------------------------------------------------------------------------------------------------------------------------
	module.add = function counterPost() {
		Blender.debugging( 'counter: adding new instance', 'report' );

		var counter = 0;

		Fs.readFile( Blender.LOG , function(err, data) { //read the log file
			if( err ) {
				throw err;
			}

			counter = parseInt( data ) + 1; //add this blend

			if(!isNaN( counter )) { //check if the number is a number
				Fs.writeFile( Blender.LOG, counter, function(err) {
					if( err ) {
						throw err;
					}

					Blender.debugging( 'counter: added', 'report' );
				});
			}
			else { //throw error
				Blender.log.error('             Counter number not valid ("' + counter + '"). Leaving it alone for now!');
			}
		});
	};


	Blender.counter = module;


}(Blender));