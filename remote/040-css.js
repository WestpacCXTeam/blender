/***************************************************************************************************************************************************************
 *
 * Compile CSS files
 *
 **************************************************************************************************************************************************************/


//--------------------------------------------------------------------------------------------------------------------------------------------------------------
// Dependencies
//--------------------------------------------------------------------------------------------------------------------------------------------------------------


(function CssApp(App) {

	var module = {};

	//------------------------------------------------------------------------------------------------------------------------------------------------------------
	// Module init method
	//------------------------------------------------------------------------------------------------------------------------------------------------------------
	module.init = function CssInit() {
		App.debugging( 'CSS: Initiating', 'report' );
	};


	//------------------------------------------------------------------------------------------------------------------------------------------------------------
	// Get all less files and compile them
	//------------------------------------------------------------------------------------------------------------------------------------------------------------
	module.get = function CssGet() {
		App.debugging( 'CSS: Generating css', 'report' );

		var POST = App.POST;
		var lessContents = '';
		var lessIndex = "\n\n" + '/* ---------------------------------------| MODULES |--------------------------------------- */' + "\n";
		var _includeOriginal  = App.selectedModules.includeLess; //POST.hasOwnProperty('includeless');


		//////////////////////////////////////////////////| CORE
		App.selectedModules.core.forEach(function CssIterateCore( module ) {
			var lessContent = App.branding.replace(
				Fs.readFileSync(App.GUIPATH + module.ID + '/' + module.version + '/less/module-mixins.less', 'utf8'),
				['Module-Version-Brand', ' ' + module.name + ' v' + module.version + ' ' + POST['brand'] + ' ']
			);

			lessContent = App.branding.replace( lessContent, [ 'Brand', POST['brand'] ] );

			if( _includeOriginal && module.less ) {
				lessIndex += '@import \'' + module.ID + '.less\';' + "\n";
				App.zip.addFile( lessContent, '/source/less/' + module.ID + '.less' );
			}

			lessContents += lessContent;
		});


		//////////////////////////////////////////////////| MODULES
		App.selectedModules.modules.forEach(function CssIterateModules( module ) {
			var lessContent = App.branding.replace(
				Fs.readFileSync( App.GUIPATH + module.ID + '/' + module.version + '/less/module-mixins.less', 'utf8'),
				['Module-Version-Brand', ' ' + module.name + ' v' + module.version + ' ' + POST['brand'] + ' ']
			);

			lessContent = App.branding.replace( lessContent, [ 'Brand', POST['brand'] ] );

			if( _includeOriginal && module.less ) {
				lessIndex += '@import \'' + module.ID + '.less\';' + "\n";
				App.zip.addFile( lessContent, '/source/less/' + module.ID + '.less' );
			}

			lessContents += lessContent;
		});

		if( lessIndex && _includeOriginal ) {
			App.zip.addFile( App.banner.attach( lessIndex ), '/source/less/gui.less' );
		}

		//compile less
		Less.render(lessContents, {
			compress: true
		},
		function CssRenderLess(e, output) {
			//TODO: error handling

			var source = App.banner.attach( output.css ); //attach a banner to the top of the file with a URL of this build

			App.zip.queuing('css', false); //css queue is done
			App.zip.addFile( source, '/assets/css/gui.min.css' );

		});

	};


	App.css = module;


}(App));
