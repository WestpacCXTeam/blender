/***************************************************************************************************************************************************************
 *
 * Collect and zip all files
 *
 **************************************************************************************************************************************************************/


//--------------------------------------------------------------------------------------------------------------------------------------------------------------
// Dependencies
//--------------------------------------------------------------------------------------------------------------------------------------------------------------
const Archiver = require('archiver');


(function ZipApp(Blender) {

	let module = {};

	//------------------------------------------------------------------------------------------------------------------------------------------------------------
	// Module init method
	//------------------------------------------------------------------------------------------------------------------------------------------------------------
	module.init = function ZipInit() {
		Blender.debugging( 'Zip: Initiating', 'report' );
	};


	//------------------------------------------------------------------------------------------------------------------------------------------------------------
	// Zip all files up and send to response
	//------------------------------------------------------------------------------------------------------------------------------------------------------------
	module.getZip = function ZipGetZip() {
		Blender.debugging( 'Zip: Compiling zip', 'report' );

		Blender.response.writeHead(200, {
			'Content-Type': 'application/zip',
			'Content-disposition': 'attachment; filename=GUI-blend-' + Blender.selectedModules.brand + '.zip',
		});

		Blender.zip.archive.pipe( Blender.response );

		try {
			Blender.zip.archive.finalize(); //send to server

			Blender.log.info( '             Zip sent!' );

			Blender.slack.post();
		}
		catch( error ) {

			Blender.log.error( '             Zip ERROR' );
			Blender.log.error( error );
		}

		//add new blend to log
		Blender.counter.add();

		//clearning up
		Blender.zip.archive = Archiver('zip'); //new archive
		Blender.zip.files = []; //empty files
		module.queue = {}; // empty queue
	};


	//------------------------------------------------------------------------------------------------------------------------------------------------------------
	// Check if queue is clear
	//------------------------------------------------------------------------------------------------------------------------------------------------------------
	module.readyZip = function ZipReadyZip() {
		Blender.debugging( 'Zip: Readying zip', 'report' );

		if( Blender.zip.isQueuingEmpty() ) { //if queue is clear, add all files to the archive

			Blender.zip.files.forEach(function ZipIterateZipFiles( file ) {
				Blender.zip.archive.append( file.content, { name: file.name } );
			});

			Blender.zip.getZip(); //finalize the zip
		}

	};


	//------------------------------------------------------------------------------------------------------------------------------------------------------------
	// Add a file to the zip archive
	//
	// @param   content      [string]  The content of the file
	// @param   archivePath  [string]  The path this file will have inside the archive
	//------------------------------------------------------------------------------------------------------------------------------------------------------------
	module.addFile = function ZipAddFile( content, archivePath ) {
		Blender.debugging( 'Zip: Adding file: ' + archivePath, 'report' );

		if(typeof content !== 'string') {
			Blender.debugging( 'Zip: Adding file: Content can only be string, is ' + (typeof content), 'error' );
		}
		else {
			if( content.length > 0 ) { //don't need no empty files ;)
				Blender.zip.files.push({ //collect file for later adding
					content: content,
					name: '/GUI-blend' + archivePath,
				});
			}
		}

		Blender.zip.readyZip();
	};


	//------------------------------------------------------------------------------------------------------------------------------------------------------------
	// Add a file to the zip archive
	//
	// @param   path         [string]  The path to the file to be added
	// @param   archivePath  [string]  The path this file will have inside the archive
	//------------------------------------------------------------------------------------------------------------------------------------------------------------
	module.addPath = function ZipAddPath( path, archivePath ) {
		Blender.debugging( 'Zip: Adding file path: ' + path, 'report' );

		if(typeof path !== 'string') {
			Blender.debugging( 'Zip: Adding file path: Path can only be string, is ' + (typeof path), 'error' );
		}
		else {
			if( path.length > 0 ) { //don't need no empty files ;)
				Blender.zip.archive.file(
					path,
					{
						name: '/GUI-blend' + archivePath,
					}
				);
			}
		}

		Blender.zip.readyZip();
	};


	//------------------------------------------------------------------------------------------------------------------------------------------------------------
	// Add a file to the zip archive
	//
	// @param  cwd          [string]  The current working directory to flatten the paths in the archive
	// @param  files        [array]   The file extensions of the files
	// @param  archivePath  [string]  The path these files will have inside the archive
	//------------------------------------------------------------------------------------------------------------------------------------------------------------
	module.addBulk = function ZipAddBulk( cwd, files, archivePath ) {
		Blender.debugging( 'Zip: Adding bluk: ' + cwd + files + ' to: ' + archivePath, 'report' );

		if(typeof files !== 'object') {
			Blender.debugging( 'Zip: Adding files: Path can only be array/object, is ' + (typeof files), 'error' );
		}
		else {

			Blender.zip.archive.bulk({ //add them all to the archive
				expand: true,
				cwd: cwd,
				src: files,
				dest: '/GUI-blend' + archivePath,
				filter: 'isFile',
			});

		}

		Blender.zip.readyZip();
	};


	//------------------------------------------------------------------------------------------------------------------------------------------------------------
	// Add or remove a type to queue so we can wait for all to be finished
	//
	// @param   type           [string]   Identifier for a type of file we are waiting for
	// @param   _isBeingAdded  [boolean]  Whether or not this type is added or removed from the queue
	//------------------------------------------------------------------------------------------------------------------------------------------------------------
	module.queuing = function ZipQueuing( type, _isBeingAdded ) {
		Blender.debugging( 'Zip: Queuing files', 'report' );

		if( _isBeingAdded ) {
			Blender.debugging( 'Zip: Queue: Adding ' + type, 'report' );

			Blender.zip.queue[type] = true;
		}
		else {
			if( Blender.zip.queue[type] ) {
				Blender.debugging( 'Zip: Queue: Removing ' + type, 'report' );

				delete Blender.zip.queue[type];
			}
		}

	};


	//------------------------------------------------------------------------------------------------------------------------------------------------------------
	// Check if the queue is empty
	//
	// @return  [boolean]  Whether or not it is...
	//------------------------------------------------------------------------------------------------------------------------------------------------------------
	module.isQueuingEmpty = function ZipIsQueuingEmpty() {
		Blender.debugging( 'Zip: Checking queue', 'report' );

		for( let prop in Blender.zip.queue ) {
			if( Blender.zip.queue.hasOwnProperty(prop) ) {
				Blender.debugging( 'Zip: Queue: Still things in the queue', 'report' );

				return false;
			}
		}

		Blender.debugging( 'Zip: Queue: Queue is empty', 'report' );
		return true;
	};


	//------------------------------------------------------------------------------------------------------------------------------------------------------------
	// Global vars
	//------------------------------------------------------------------------------------------------------------------------------------------------------------
	module.queue = {}; //global object to hold queue
	module.archive = Archiver('zip'); //class to add files to zip globally
	module.files = []; //an array of all files to be added to the archive


	Blender.zip = module;


}(Blender));