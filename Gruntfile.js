module.exports = function ( grunt ) {
	var js_files  = [ 'javascript/**/*.js', '!javascript/*.min.js' ],
		css_files = [ 'css/*.css', '!css/*.min.css' ];

	grunt.initConfig( {
		pkg: grunt.file.readJSON( 'package.json' ),

		uglify: {
			dist: {
				files: {
					'javascript/intent-driven-interface.min.js': js_files
				}
			}
		},

		jshint: {
			files: js_files,

			options: {
				"boss": true,
				"curly": true,
				"eqeqeq": true,
				"eqnull": true,
				"es3": true,
				"expr": true,
				"immed": true,
				"noarg": true,
				"onevar": true,
				"quotmark": "single",
				"trailing": true,
				"undef": true,
				"unused": true,
				"browser": true,

				"globals": {
					"_": false,
					"Backbone": false,
					"console": false,
					"jQuery": false,
					"idiOptions": true
				}
			}
		},

		cssmin: {
			combine: {
				files: {
					'css/intent-driven-interface.min.css': css_files
				}
			}
		},

		watch: {
			js: {
				files: js_files,
				tasks: [ 'uglify', 'jshint' ]
			},

			css: {
				files: css_files,
				tasks: [ 'cssmin' ]
			},

			options: {
				spawn: false
			}
		}
	} );

	grunt.loadNpmTasks( 'grunt-contrib-uglify' );
	grunt.loadNpmTasks( 'grunt-contrib-cssmin' );
	grunt.loadNpmTasks( 'grunt-contrib-jshint' );
	grunt.loadNpmTasks( 'grunt-contrib-watch' );
	grunt.registerTask( 'default', [ 'uglify', 'cssmin', 'jshint' ] );
};
