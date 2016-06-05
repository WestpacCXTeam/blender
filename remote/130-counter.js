/***************************************************************************************************************************************************************
 *
 * Counter
 *
 **************************************************************************************************************************************************************/


//--------------------------------------------------------------------------------------------------------------------------------------------------------------
// Dependencies
//--------------------------------------------------------------------------------------------------------------------------------------------------------------


//--------------------------------------------------------------------------------------------------------------------------------------------------------------
// Module
//--------------------------------------------------------------------------------------------------------------------------------------------------------------
Blender.counter = (() => {

	return {

//--------------------------------------------------------------------------------------------------------------------------------------------------------------
// Module add method
//--------------------------------------------------------------------------------------------------------------------------------------------------------------
		add: () => {
			Blender.debugging.report(`counter: adding new instance`);

			let counter = 0;

			Fs.readFile( Blender.LOG , (error, data) => { //read the log file
				if( error ) {
					throw error;
				}

				counter = parseInt( data ) + 1; //add this blend

				if(!isNaN( counter )) { //check if the number is a number
					Fs.writeFile( Blender.LOG, counter, (error) => {
						if( error ) {
							throw error;
						}

						Blender.debugging.report(`counter: added`);
					});
				}
				else { //throw error
					Blender.log.error(`             Counter number not valid ("${counter}"). Leaving it alone for now!`);
				}
			});
		},

	}

})();