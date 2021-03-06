/***************************************************************************************************************************************************************
 *
 * Brand all content
 *
 **************************************************************************************************************************************************************/


//--------------------------------------------------------------------------------------------------------------------------------------------------------------
// Dependencies
//--------------------------------------------------------------------------------------------------------------------------------------------------------------


//--------------------------------------------------------------------------------------------------------------------------------------------------------------
// Module
//--------------------------------------------------------------------------------------------------------------------------------------------------------------
Blender.branding = (() => {

	return {

//--------------------------------------------------------------------------------------------------------------------------------------------------------------
// Module init method
//--------------------------------------------------------------------------------------------------------------------------------------------------------------
		init: () => {
			Blender.debugging.report(`Branding: Initiating`);
		},


//--------------------------------------------------------------------------------------------------------------------------------------------------------------
// Returns content with elements replaced
//
// @param   content  [string]  Content that needs parsing
// @param   replace  [array]   First element is replaced with second
//
// @return  [string]  Finished parsed content
//--------------------------------------------------------------------------------------------------------------------------------------------------------------
		replace: ( content, replace ) => {
			Blender.debugging.report(`Branding: Replacing "${replace[0]}" with "${replace[1]}"`);

			let pattern = new RegExp(`\\[(${replace[0]})\\]`, `g`);
			return content.replace(pattern, replace[1]);

		},

	}

})();