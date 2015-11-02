module.exports = function ( grunt ) {
	var jshint_files,
		js_files = [
			'javascript/app.js',                           // this comes first because all the other classes depend on window.QuickNavigationInterface being defined
			'javascript/**/*.js',
			'!javascript/quick-navigation-interface*.js',  // ignore concatenated and minified files
			'!javascript/bootstrap.js',
			'javascript/bootstrap.js'                      // this comes last because we don't want to initialize window.QuickNavigationInterface until all the files have been concatenated
		],
		css_files = [ 'css/*.css', '!css/*.min.css' ];

		jshint_files = js_files.slice();
		jshint_files.push( '!javascript/murmurhash3_gc.js' );

	grunt.initConfig( {
		pkg : grunt.file.readJSON( 'package.json' ),

		concat : {
			options : {
				sourceMap : true
			},

			dist : {
				src  : js_files,
				dest : 'javascript/quick-navigation-interface.js'
			}
		},

		uglify : {
			options : {
				sourceMap               : true,
				sourceMapIncludeSources : true,
				sourceMapIn             : 'javascript/quick-navigation-interface.js.map'
			},

			dist : {
				files : {
					'javascript/quick-navigation-interface.min.js' : [ 'javascript/quick-navigation-interface.js' ]
				}
			}
		},

		jshint : {
			files : jshint_files,

			options : {
				boss     : true,
				browser  : true,
				curly    : true,
				eqeqeq   : true,
				eqnull   : true,
				es3      : true,
				expr     : true,
				force    : true,
				immed    : true,
				noarg    : true,
				onevar   : true,
				quotmark : 'single',
				trailing : true,
				undef    : true,
				unused   : true,

				globals : {
					_                        : false,
					alert                    : false,
					app                      : false,
					Backbone                 : false,
					console                  : false,
					jQuery                   : false,
					murmurhash3_32_gc        : true,
					QuickNavigationInterface : true,
					wp                       : false
				}
			}
		},

		cssmin : {
			combine : {
				files : {
					'css/quick-navigation-interface.min.css' : css_files
				}
			}
		},

		makepot : {
			target : {
				options : {
					domainPath      : 'languages/',
					mainFile        : 'bootstrap.php',
					potComments     : 'Copyright (c) Ian Dunn {year}',
					potFilename     : 'quick-navigation-interface.pot',
					type            : 'wp-plugin',
					updateTimestamp : false,
					updatePoFiles   : true,

					potHeaders : {
						poedit                  : true,
						'x-poedit-keywordslist' : true,
						'Report-Msgid-Bugs-To'  : 'https://wordpress.org/plugins/quick-navigation-interface/'
					}
				}
			}
		},

		po2mo : {
			files : {
				src    : 'languages/*.po',
				expand : true
			}
		},

		watch : {
			php : {
				files : [ '**/*.php' ],
				tasks : [ 'makepot', 'po2mo' ]
			},

			js : {
				files : js_files,
				tasks : [ 'concat', 'uglify', 'jshint', 'beep:error', 'reset-grunt-error-count' ]
			},

			css : {
				files : css_files,
				tasks : [ 'cssmin' ]
			},

			options : {
				spawn : false
			}
		}
	} );

	/**
	 * Reset Grunt's error count
	 *
	 * We have grunt-beep setup to beep on errors, but we also have `spawn: false` setup for the watch task. That
	 * means that the error count doesn't get reset on it's own, so after one error has been encountered, there'll
	 * be a beep on all subsequent runs, even after the problem has been resolved.
	 *
	 * @see {@link https://github.com/shama/grunt-beep/issues/6 grunt-beep #6}
	 */
	grunt.registerTask( 'reset-grunt-error-count', "Reset Grunt's error count", function() {
		grunt.fail.errorcount = 0;
	} );

	grunt.loadNpmTasks( 'grunt-beep'           );
	grunt.loadNpmTasks( 'grunt-contrib-watch'  );
	grunt.loadNpmTasks( 'grunt-contrib-concat' );
	grunt.loadNpmTasks( 'grunt-contrib-uglify' );
	grunt.loadNpmTasks( 'grunt-contrib-cssmin' );
	grunt.loadNpmTasks( 'grunt-contrib-jshint' );
	grunt.loadNpmTasks( 'grunt-wp-i18n'        );
	grunt.loadNpmTasks( 'grunt-po2mo'          );

	grunt.registerTask( 'default', [ 'concat', 'uglify', 'cssmin', 'jshint', 'makepot', 'po2mo' ] );
};
