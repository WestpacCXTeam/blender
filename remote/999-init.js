/***************************************************************************************************************************************************************
 *
 * Application initialization
 *
 * Spawning up simple express app, listening to POST requests on /blender/ and init files when request is OK
 *
 **************************************************************************************************************************************************************/


//--------------------------------------------------------------------------------------------------------------------------------------------------------------
// Initiate application
//--------------------------------------------------------------------------------------------------------------------------------------------------------------
Blender.init = () => {
	Blender.debugging.headline(` DEBUG| INFO`);

	Blender.GUI = JSON.parse( Fs.readFileSync(`${Blender.GUIPATH}GUI.json`, `utf8`) );
	const blender = Express();

	//starting server
	blender
		.use( BodyParser.urlencoded({ extended: false }) )

		.listen(1337, () => {
			Blender.debugging.report(`Server started on port 1337`);
		});


	blender.get(`*`, (request, response) => {
		response.redirect(301, Blender.GUIRURL);
	});


	//listening to post request
	blender.post(`/blender`, (request, response) => {
		Blender.IP = request.headers[`x-forwarded-for`] || request.connection.remoteAddress;

		Blender.log.info(`New request: ${request.headers[`x-forwarded-for`]} / ${request.connection.remoteAddress}`);

		//the core needs to be in the request and the user agent should be presented
		if(
			typeof request.body[`module-_colors`] !== `undefined`
			&& typeof request.body[`module-_fonts`] !== `undefined`
			&& typeof request.body[`module-_text-styling`] !== `undefined`
			&& typeof request.body[`module-_grid`] !== `undefined`
			&& typeof request.body[`module-_javascript-helpers`] !== `undefined`
			&& typeof request.headers[`user-agent`] !== `undefined`
		) {

			//when debug mode is off disgard "stress-tester"
			if( !Blender.DEBUG && request.headers[`user-agent`] !== `stress-tester` || Blender.DEBUG ) {
				Blender.response = response;
				Blender.POST = request.body;

				Blender.files.init();
			}
			else {
				Blender.log.info(`Discarded for invalid user-agent (${request.headers[`user-agent`]})`);
			}
		}
		else {
			Blender.log.info(`Discarded for invalid request (core not complete or user-agent empty)`);
		}
	});
};


Blender.init();