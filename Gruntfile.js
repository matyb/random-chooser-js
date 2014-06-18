/*jslint node: true */
module.exports = function(grunt) {
    grunt.initConfig({
		env: {
			dev: {
				NODE_ENV : 'DEVELOPMENT'
			},
			web: {
				NODE_ENV : 'WEB'
			},
			phonegap: {
				NODE_ENV : 'PHONEGAP'
			},
			test: {
				NODE_ENV : 'TEST'
			}
		},
		preprocess: {
			dev: {
				src: 'src/index.html',
				dest: 'dev/index.html'
			},
			web: {
				files : {
					'dist/web/index.html' : 'src/index.html',
					'dist/web/.htaccess'  : 'src/htaccess'
				}
			},
			phonegap: {
				files : {
					'dist/phonegap/www/index.html' : 'src/index.html'
				}
			},
			test: {
				src: 'src/index.html',
				dest: 'test/tests.html'
			}
		},
		copy: {
			main: {
				files: [
					{expand: true, src: ['src/style/*.css', 'src/style/images/*', 'src/error/*'], dest: 'dist/web'},
					{expand: true, src: ['src/style/*.css', 'src/style/images/*', 'src/error/*'], dest: 'dev'},
					{expand: true, cwd: 'src', src: ['favicon.ico'], dest: 'dist/web'},
					{expand: true, cwd: 'src', src: ['favicon.ico'], dest: 'dev'}
				]
			},
			phonegap: {
				files: [
					{src: ['<%= concat.js.dest %>'], dest: 'dist/phonegap/www/js/<%= pkg.name %>.min.js'},
					{src: ['dist/web/src/style/<%= pkg.name %>.min.css'], dest: 'dist/phonegap/www/css/<%= pkg.name %>.min.css'},
					{expand: true, cwd: 'src/phonegap/.cordova', src: ['**'], dest: 'dist/phonegap/.cordova'},
					{expand: true, cwd: 'src/phonegap', src: ['**'], dest: 'dist/phonegap/'},
					{expand: true, flatten: true, cwd: 'src/style', src: ['*.css'], dest: 'dist/phonegap/www/css/'},
					{expand: true, flatten: true, cwd: 'src/style/images', src: ['**'], dest: 'dist/phonegap/www/css/images/'},
					{expand: true, cwd: 'src', src: ['favicon.ico'], dest: 'dist/phonegap/www'},
				]
			}
		},
		pkg: grunt.file.readJSON('package.json'),
		meta: {
			banner: '/*\n' +
				' * <%= pkg.title || pkg.name %> - v<%= pkg.version %> - ' +
				'<%= grunt.template.today("yyyy-mm-dd") %>\n' +
				'<%= pkg.homepage ? " * " + pkg.homepage + "\n" : "" %>' +
				' * Copyright (c) <%= grunt.template.today("yyyy") %> <%= pkg.author.name %>\n' +
				' * Licensed <%= _.pluck(pkg.licenses, "type").join(", ") %>\n' +
				' */'
		},
		concat: {
			js: {
				src: [	'<banner:meta.banner>', 'src/js/jquery-1.6.4.js', 
						'src/js/jquery.mobile-1.0.1.js', 'src/js/json2.js', 'src/js/chooser.js' ],
				dest: 'dist/web/src/js/<%= pkg.name %>.min.js'
			}
		},
        qunit: {
            files: ['test/tests.html']
        },
		jshint: {
			files: ['Gruntfile.js', 'src/js/**/*.js', 'test/**/*.js'],
			options: {
				curly: true,
				eqeqeq: true,
				immed: true,
				latedef: true,
				newcap: true,
				noarg: true,
				sub: true,
				undef: true,
				boss: true,
				eqnull: true,
				browser: true
			}
		},
        uglify: {
			options: {
				beautify: {
					beautify: false,
					"ascii_only": true
				},
				preserveComments: 'some'
			},
			js: {
				src: ['<banner:meta.banner>', '<%= concat.js.dest %>'],
				dest: '<%= concat.js.dest %>'
            }
        },
        cssmin: {
            combine: {
              files: {
                  'dist/web/src/style/<%= pkg.name %>.min.css': 
                      [ '<banner:meta.banner>', 'src/style/chooser.css', 'src/style/jquery.mobile-1.0.1.min.css' ]
              }
            }
        },
        exec: {
            startphonegapserver: 'cd dist && cd phonegap && phonegap serve && cd .. && cd ..'
        },
		watch : {
			dev : {
				files : [ 'src/style/*', 'src/index.html' ],
				tasks : [ 'dev', 'web', 'phonegap' ]
			},
			build : {
				files : [ 'Gruntfile.js', 'src/js/**/*.js', 'test/**/*.js' ],
				tasks : [ 'build' ]
			},
			livereload : {
				options : {livereload : true}, files : [ 'dev/index.html' ]
			}
		}
    });
    
    grunt.registerTask('default', [ 'build', 'asynch' ]);
    grunt.registerTask('build', [ 'test', 'web', 'phonegap', 'dev' ]);
    grunt.registerTask('web', [ 'env:web', 'preprocess:web', 'copy:main', 'concat', 'uglify', 'cssmin' ]);
    grunt.registerTask('phonegap', [ 'copy:phonegap', 'env:phonegap', 'preprocess:phonegap' ]);
    grunt.registerTask('dev', [ 'env:dev', 'preprocess:dev' ]);
    grunt.registerTask('test', [ 'jshint', 'env:test', 'preprocess:test', 'qunit' ]);
    grunt.registerTask('asynch', '', function() {
        var asynchTasks = ['exec:startphonegapserver', 'watch'],
            done = this.async();
        asynchTasks.map(function(asynchTask){
            setTimeout(function(){
                grunt.task.run(asynchTask);
                done();
            }, 3000);
        });
    });
    
	grunt.loadNpmTasks('grunt-env');
	grunt.loadNpmTasks('grunt-preprocess');
	grunt.loadNpmTasks('grunt-contrib-qunit');
	grunt.loadNpmTasks('grunt-contrib-jshint');
	grunt.loadNpmTasks('grunt-contrib-uglify');
	grunt.loadNpmTasks('grunt-contrib-concat');
	grunt.loadNpmTasks('grunt-contrib-copy');
	grunt.loadNpmTasks('grunt-exec');
	grunt.loadNpmTasks('grunt-contrib-watch');
	grunt.loadNpmTasks('grunt-contrib-cssmin');
};

