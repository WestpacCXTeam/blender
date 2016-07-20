/***************************************************************************************************************************************************************
 *
 * Compile CSS files
 *
 **************************************************************************************************************************************************************/


//--------------------------------------------------------------------------------------------------------------------------------------------------------------
// Dependencies
//--------------------------------------------------------------------------------------------------------------------------------------------------------------


//--------------------------------------------------------------------------------------------------------------------------------------------------------------
// Module
//--------------------------------------------------------------------------------------------------------------------------------------------------------------
Blender.css = (() => {

	return {

//--------------------------------------------------------------------------------------------------------------------------------------------------------------
// Module init method
//--------------------------------------------------------------------------------------------------------------------------------------------------------------
		init: () => {
			Blender.debugging.report(`CSS: Initiating`);
		},


//--------------------------------------------------------------------------------------------------------------------------------------------------------------
// Get all less files and compile them
//--------------------------------------------------------------------------------------------------------------------------------------------------------------
		get: () => {
			Blender.debugging.report(`CSS: Generating css`);

			const POST = Blender.POST;
			const _includeOriginal  = Blender.selectedModules.includeLess; //POST.hasOwnProperty(`includeless`);
			let lessContents = ``;
			let lessIndex = "\n\n" + `/* ---------------------------------------| MODULES |--------------------------------------- */` + "\n";


			//////////////////////////////////////////////////| CORE
			Blender.selectedModules.core.forEach(( module ) => {
				let lessContent = Blender.branding.replace(
					Fs.readFileSync(`${Blender.GUIPATH}${module.ID}/${module.version}/less/module-mixins.less`, `utf8`),
					[`Module-Version-Brand`, ` ${module.name} v${module.version} ${POST[`brand`]} `]
				);

				lessContent = Blender.branding.replace( lessContent, [ `Brand`, POST[`brand`] ] );

				if( _includeOriginal && module.less ) {
					lessIndex += `@import '${module.ID}.less';\n`;
					Blender.zip.addFile( lessContent, `/source/less/${module.ID}.less`);
				}

				lessContents += lessContent;
			});


			//////////////////////////////////////////////////| MODULES
			Blender.selectedModules.modules.forEach(( module ) => {
				let lessContent = Blender.branding.replace(
					Fs.readFileSync(`${Blender.GUIPATH}${module.ID}/${module.version}/less/module-mixins.less`, `utf8`),
					[`Module-Version-Brand`, ` ${module.name} v${module.version} ${POST[`brand`]} `]
				);

				lessContent = Blender.branding.replace( lessContent, [ `Brand`, POST[`brand`] ] );

				if( _includeOriginal && module.less ) {
					lessIndex += `@import '${module.ID}.less';\n`;
					Blender.zip.addFile( lessContent, `/source/less/${module.ID}.less` );
				}

				lessContents += lessContent;
			});

			if( lessIndex && _includeOriginal ) {
				Blender.zip.addFile( Blender.banner.attach( lessIndex ), `/source/less/gui.less` );
			}

			//compile less
			Less.render(lessContents, {
				compress: true
			},
			(e, output) => {
				//TODO: error handling

				let source = Blender.banner.attach( output.css ); //attach a banner to the top of the file with a URL of this build

				Blender.zip.queuing(`css`, false); //css queue is done
				Blender.zip.addFile( source, `/assets/css/gui.min.css` );

			});

		},

	}

})();