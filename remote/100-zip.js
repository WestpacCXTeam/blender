/***************************************************************************************************************************************************************
 *
 * Collect and zip all files
 *
 **************************************************************************************************************************************************************/


//--------------------------------------------------------------------------------------------------------------------------------------------------------------
// Dependencies
//--------------------------------------------------------------------------------------------------------------------------------------------------------------
var Archiver = require('archiver');


(function ZipApp(App) {

	var module = {};

	//------------------------------------------------------------------------------------------------------------------------------------------------------------
	// Module init method
	//------------------------------------------------------------------------------------------------------------------------------------------------------------
	module.init = function ZipInit() {
		App.debugging( 'Zip: Initiating', 'report' );
	};


	//------------------------------------------------------------------------------------------------------------------------------------------------------------
	// Zip all files up and send to response
	//------------------------------------------------------------------------------------------------------------------------------------------------------------
	module.getZip = function ZipGetZip() {
		App.debugging( 'Zip: Compiling zip', 'report' );

		App.response.writeHead(200, {
			'Content-Type': 'application/zip',
			'Content-disposition': 'attachment; filename=GUI-blend-' + App.selectedModules.brand + '.zip',
		});

		App.zip.archive.pipe( App.response );

		try {
			App.zip.archive.finalize(); //send to server

			App.log.info( '             Zip sent!' );

			App.slack.post();
		}
		catch( error ) {

			App.log.error( '             Zip ERROR' );
			App.log.error( error );
		}

		//add new blend to log
		App.counter.add();

		//clearning up
		App.zip.archive = Archiver('zip'); //new archive
		App.zip.files = []; //empty files
		module.queue = {}; // empty queue
	};


	//------------------------------------------------------------------------------------------------------------------------------------------------------------
	// Check if queue is clear
	//------------------------------------------------------------------------------------------------------------------------------------------------------------
	module.readyZip = function ZipReadyZip() {
		App.debugging( 'Zip: Readying zip', 'report' );

		if( App.zip.isQueuingEmpty() ) { //if queue is clear, add all files to the archive

			App.zip.files.forEach(function ZipIterateZipFiles( file ) {
				App.zip.archive.append( file.content, { name: file.name } );
			});

			App.zip.getZip(); //finalize the zip
		}

	};


	//------------------------------------------------------------------------------------------------------------------------------------------------------------
	// Add a file to the zip archive
	//
	// @param   content      [string]  The content of the file
	// @param   archivePath  [string]  The path this file will have inside the archive
	//------------------------------------------------------------------------------------------------------------------------------------------------------------
	module.addFile = function ZipAddFile( content, archivePath ) {
		App.debugging( 'Zip: Adding file: ' + archivePath, 'report' );

		if(typeof content !== 'string') {
			App.debugging( 'Zip: Adding file: Content can only be string, is ' + (typeof content), 'error' );
		}
		else {
			if( content.length > 0 ) { //don't need no empty files ;)
				App.zip.files.push({ //collect file for later adding
					content: content,
					name: '/GUI-blend' + archivePath,
				});
			}
		}

		App.zip.readyZip();
	};


	//------------------------------------------------------------------------------------------------------------------------------------------------------------
	// Add a file to the zip archive
	//
	// @param   path         [string]  The path to the file to be added
	// @param   archivePath  [string]  The path this file will have inside the archive
	//------------------------------------------------------------------------------------------------------------------------------------------------------------
	module.addPath = function ZipAddPath( path, archivePath ) {
		App.debugging( 'Zip: Adding file path: ' + path, 'report' );

		if(typeof path !== 'string') {
			App.debugging( 'Zip: Adding file path: Path can only be string, is ' + (typeof path), 'error' );
		}
		else {
			if( path.length > 0 ) { //don't need no empty files ;)
				App.zip.archive.file(
					path,
					{
						name: '/GUI-blend' + archivePath,
					}
				);
			}
		}

		App.zip.readyZip();
	};


	//------------------------------------------------------------------------------------------------------------------------------------------------------------
	// Add a file to the zip archive
	//
	// @param  cwd          [string]  The current working directory to flatten the paths in the archive
	// @param  files        [array]   The file extensions of the files
	// @param  archivePath  [string]  The path these files will have inside the archive
	//------------------------------------------------------------------------------------------------------------------------------------------------------------
	module.addBulk = function ZipAddBulk( cwd, files, archivePath ) {
		App.debugging( 'Zip: Adding bluk: ' + cwd + files + ' to: ' + archivePath, 'report' );

		if(typeof files !== 'object') {
			App.debugging( 'Zip: Adding files: Path can only be array/object, is ' + (typeof files), 'error' );
		}
		else {

			App.zip.archive.bulk({ //add them all to the archive
				expand: true,
				cwd: cwd,
				src: files,
				dest: '/GUI-blend' + archivePath,
				filter: 'isFile',
			});

		}

		App.zip.readyZip();
	};


	//------------------------------------------------------------------------------------------------------------------------------------------------------------
	// Add or remove a type to queue so we can wait for all to be finished
	//
	// @param   type           [string]   Identifier for a type of file we are waiting for
	// @param   _isBeingAdded  [boolean]  Whether or not this type is added or removed from the queue
	//------------------------------------------------------------------------------------------------------------------------------------------------------------
	module.queuing = function ZipQueuing( type, _isBeingAdded ) {
		App.debugging( 'Zip: Queuing files', 'report' );

		if( _isBeingAdded ) {
			App.debugging( 'Zip: Queue: Adding ' + type, 'report' );

			App.zip.queue[type] = true;
		}
		else {
			if( App.zip.queue[type] ) {
				App.debugging( 'Zip: Queue: Removing ' + type, 'report' );

				delete App.zip.queue[type];
			}
		}

	};


	//------------------------------------------------------------------------------------------------------------------------------------------------------------
	// Check if the queue is empty
	//
	// @return  [boolean]  Whether or not it is...
	//------------------------------------------------------------------------------------------------------------------------------------------------------------
	module.isQueuingEmpty = function ZipIsQueuingEmpty() {
		App.debugging( 'Zip: Checking queue', 'report' );

		for( var prop in App.zip.queue ) {
			if( App.zip.queue.hasOwnProperty(prop) ) {
				App.debugging( 'Zip: Queue: Still things in the queue', 'report' );

				return false;
			}
		}

		App.debugging( 'Zip: Queue: Queue is empty', 'report' );
		return true;
	};


	//------------------------------------------------------------------------------------------------------------------------------------------------------------
	// Global vars
	//------------------------------------------------------------------------------------------------------------------------------------------------------------
	module.queue = {}; //global object to hold queue
	module.archive = Archiver('zip'); //class to add files to zip globally
	module.files = []; //an array of all files to be added to the archive


	App.zip = module;


}(App));