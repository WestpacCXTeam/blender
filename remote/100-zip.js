/***************************************************************************************************************************************************************
 *
 * Collect and zip all files
 *
 **************************************************************************************************************************************************************/


//--------------------------------------------------------------------------------------------------------------------------------------------------------------
// Dependencies
//--------------------------------------------------------------------------------------------------------------------------------------------------------------
const Archiver = require(`archiver`);


//--------------------------------------------------------------------------------------------------------------------------------------------------------------
// Module
//--------------------------------------------------------------------------------------------------------------------------------------------------------------
Blender.zip = (() => {

	return {

//--------------------------------------------------------------------------------------------------------------------------------------------------------------
// Module init method
//--------------------------------------------------------------------------------------------------------------------------------------------------------------
		init: () => {
			Blender.debugging.report(`Zip: Initiating`);
		},


//--------------------------------------------------------------------------------------------------------------------------------------------------------------
// Zip all files up and send to response
//--------------------------------------------------------------------------------------------------------------------------------------------------------------
		getZip: () => {
			Blender.debugging.report(`Zip: Compiling zip`);

			Blender.response.writeHead(200, {
				'Content-Type': `application/zip`,
				'Content-disposition': `attachment; filename=GUI-blend-${Blender.selectedModules.brand}.zip`,
			});

			Blender.zip.archive.pipe( Blender.response );

			try {
				Blender.zip.archive.finalize(); //send to server

				Blender.log.info(`             Zip sent!`);

				Blender.slack.post();
			}
			catch( error ) {

				Blender.log.error(`             Zip ERROR`);
				Blender.log.error( error );
			}

			//add new blend to log
			Custard.run([ //run this only when no more than 3 blends are currently blending
				{
					run: Blender.counter.add,
					maxCalls: 2,
					fallback: () => {
						Blender.debugging.error(`Custard: Counter not counting as too many blends are blending (${Custard.getQueue()})`);
					},
				},
				/*{
					run: Blender.statistic.init,
					maxCalls: 50,
					fallback: () => {
						Blender.debugging.error(``);
					},
				}*/],
				() => {
					Blender.debugging.error(`Custard: All normal again!`);
				}
			);

			//clearning up
			Blender.zip.archive = Archiver(`zip`); //new archive
			Blender.zip.files = []; //empty files
			module.queue = {}; // empty queue
		},


//--------------------------------------------------------------------------------------------------------------------------------------------------------------
// Check if queue is clear
//--------------------------------------------------------------------------------------------------------------------------------------------------------------
		readyZip: () => {
			Blender.debugging.report(`Zip: Readying zip`);

			if( Blender.zip.isQueuingEmpty() ) { //if queue is clear, add all files to the archive

				Blender.zip.files.forEach(( file ) => {
					Blender.zip.archive.append( file.content, { name: file.name } );
				});

				Blender.zip.getZip(); //finalize the zip
			}

		},


//--------------------------------------------------------------------------------------------------------------------------------------------------------------
// Add a file to the zip archive
//
// @param   content      [string]  The content of the file
// @param   archivePath  [string]  The path this file will have inside the archive
//--------------------------------------------------------------------------------------------------------------------------------------------------------------
		addFile: ( content, archivePath ) => {
			Blender.debugging.report(`Zip: Adding file: ${archivePath}`);

			if(typeof content !== `string`) {
				Blender.debugging.error(`Zip: Adding file: Content can only be string, is ${typeof content}`);
			}
			else {
				if( content.length > 0 ) { //don't need no empty files ;)
					Blender.zip.files.push({ //collect file for later adding
						content: content,
						name: `/GUI-blend${archivePath}`,
					});
				}
			}

			Blender.zip.readyZip();
		},


//--------------------------------------------------------------------------------------------------------------------------------------------------------------
// Add a file to the zip archive
//
// @param   path         [string]  The path to the file to be added
// @param   archivePath  [string]  The path this file will have inside the archive
//--------------------------------------------------------------------------------------------------------------------------------------------------------------
		addPath: ( path, archivePath ) => {
			Blender.debugging.report(`Zip: Adding file path: ${path}`);

			if(typeof path !== `string`) {
				Blender.debugging.error(`Zip: Adding file path: Path can only be string, is ${typeof path}`);
			}
			else {
				if( path.length > 0 ) { //don't need no empty files ;)
					Blender.zip.archive.file(
						path,
						{
							name: `/GUI-blend${archivePath}`,
						}
					);
				}
			}

			Blender.zip.readyZip();
		},


//--------------------------------------------------------------------------------------------------------------------------------------------------------------
// Add multiple file to the zip archive
//
// @param  cwd          [string]  The current working directory to flatten the paths in the archive
// @param  files        [array]   The file extensions of the files
// @param  archivePath  [string]  The path these files will have inside the archive
//--------------------------------------------------------------------------------------------------------------------------------------------------------------
		addBulk: ( cwd, files, archivePath ) => {
			Blender.debugging.report(`Zip: Adding bluk: ${cwd}${files} to: ${archivePath}`);

			if(typeof files !== `object`) {
				Blender.debugging.error(`Zip: Adding files: Path can only be array/object, is ${typeof files}`);
			}
			else {

				Blender.zip.archive.bulk({ //add them all to the archive
					expand: true,
					cwd: cwd,
					src: files,
					dest: `/GUI-blend${archivePath}`,
					filter: `isFile`,
				});

			}

			Blender.zip.readyZip();
		},


//--------------------------------------------------------------------------------------------------------------------------------------------------------------
// Add or remove a type to queue so we can wait for all to be finished
//
// @param   type           [string]   Identifier for a type of file we are waiting for
// @param   _isBeingAdded  [boolean]  Whether or not this type is added or removed from the queue
//--------------------------------------------------------------------------------------------------------------------------------------------------------------
		queuing: ( type, _isBeingAdded ) => {
			Blender.debugging.report(`Zip: Queuing files`);

			if( _isBeingAdded ) {
				Blender.debugging.report(`Zip: Queue: Adding ${type}`);

				Blender.zip.queue[type] = true;
			}
			else {
				if( Blender.zip.queue[type] ) {
					Blender.debugging.report(`Zip: Queue: Removing ${type}`);

					delete Blender.zip.queue[type];
				}
			}

		},


//--------------------------------------------------------------------------------------------------------------------------------------------------------------
// Check if the queue is empty
//
// @return  [boolean]  Whether or not it is...
//--------------------------------------------------------------------------------------------------------------------------------------------------------------
		isQueuingEmpty: () => {
			Blender.debugging.report(`Zip: Checking queue`);

			for( let prop in Blender.zip.queue ) {
				if( Blender.zip.queue.hasOwnProperty(prop) ) {
					Blender.debugging.report(`Zip: Queue: Still things in the queue`);

					return false;
				}
			}

			Blender.debugging.report(`Zip: Queue: Queue is empty`);
			return true;
		},


//--------------------------------------------------------------------------------------------------------------------------------------------------------------
// Global vars
//--------------------------------------------------------------------------------------------------------------------------------------------------------------
		queue: {}, //global object to hold queue
		archive: Archiver(`zip`), //class to add files to zip globally
		files: [], //an array of all files to be added to the archive

	}

})();