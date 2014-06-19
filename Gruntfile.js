/*jslint node: true */
module.exports = function(grunt) {
    if(!grunt.option('target')){
        grunt.option('target', 'android');
    }
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
				src: '<%= pkg.directories.src %>/index.html',
				dest: '<%= pkg.directories.dev %>/index.html'
			},
			web: {
				files : {
                    '<%= pkg.directories.distweb %>/index.html' : '<%= pkg.directories.src %>/index.html',
                    '<%= pkg.directories.distweb %>/.htaccess'  : '<%= pkg.directories.src %>/htaccess'
				}
			},
			phonegap: {
				files : {
                    '<%= pkg.directories.phonegapwww %>/index.html' : '<%= pkg.directories.src %>/index.html'
				}
			},
			test: {
                src: '<%= pkg.directories.src %>/index.html',
				dest: '<%= pkg.directories.test %>/tests.html'
			}
		},
		copy: {
            dev: {
                files: [
                    {expand: true, src: ['<%= pkg.directories.srcstyle %>/*.css', '<%= pkg.directories.srcimages %>/*', '<%= pkg.directories.srcstyle %>/*'], 
                        dest: '<%= pkg.directories.dev %>' },
                    {expand: true, cwd: '<%= pkg.directories.src %>', src: ['favicon.ico'], 
                        dest: '<%= pkg.directories.dev %>'}
                ]
            },
            web: {
                files: [
                    {expand: true, src: ['<%= pkg.directories.srcimages %>/*'], 
                        dest: '<%= pkg.directories.distweb %>' },
                    {expand: true, cwd: '<%= pkg.directories.src %>', src: ['favicon.ico'], 
                        dest: '<%= pkg.directories.distweb %>'}
                ]
            },
            phonegap: {
				files: [
					{src: ['<%= concat.js.dest %>'], 
                        dest: '<%= pkg.directories.phonegapwww %>/js/<%= pkg.name %>.min.js'},
					{src: ['<%= pkg.directories.distweb %>/src/style/<%= pkg.name %>.min.css'], 
                        dest: '<%= pkg.directories.phonegapwww %>/css/<%= pkg.name %>.min.css'},
					{expand: true, cwd: '<%= pkg.directories.srcphonegap %>/.cordova', src: ['**'], 
                        dest: '<%= pkg.directories.distphonegap %>/.cordova'},
					{expand: true, cwd: '<%= pkg.directories.srcphonegap %>', src: ['**'], 
                        dest: '<%= pkg.directories.distphonegap %>'},
					{expand: true, flatten: true, cwd: '<%= pkg.directories.srcstyle %>', src: ['*.css'], 
                        dest: '<%= pkg.directories.phonegapwww %>/css/'},
					{expand: true, flatten: true, cwd: '<%= pkg.directories.srcimages %>', src: ['**'], 
                        dest: '<%= pkg.directories.phonegapwww %>/css/images/'},
					{expand: true, cwd: '<%= pkg.directories.src %>', src: ['favicon.ico'], 
                        dest: '<%= pkg.directories.phonegapwww %>'},
				]
			},
			android: {
                files: [
                    {expand: true, cwd: '<%= pkg.directories.phonegapandroid %>/ant-build', src: ['**'], 
                        dest: '<%= pkg.directories.distandroid %>'}
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
				src: [	'<banner:meta.banner>', '<%= pkg.directories.srcjs %>/jquery-1.6.4.js', 
						'<%= pkg.directories.srcjs %>/jquery.mobile-1.0.1.js', 
						'<%= pkg.directories.srcjs %>/json2.js', 
						'<%= pkg.directories.srcjs %>/<%= pkg.name %>.js' ],
				dest: '<%= pkg.directories.distweb %>/src/js/<%= pkg.name %>.min.js'
			}
		},
        qunit: {
            files: ['<%= pkg.directories.test %>/tests.html']
        },
		jshint: {
			files: ['Gruntfile.js', '<%= pkg.directories.srcjs %>/**/*.js', '<%= pkg.directories.test %>/**/*.js'],
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
                  '<%= pkg.directories.distweb %>/src/style/<%= pkg.name %>.min.css': 
                      [ '<banner:meta.banner>', 
                        '<%= pkg.directories.srcstyle %>/<%= pkg.name %>.css', 
                        '<%= pkg.directories.srcstyle %>/jquery.mobile-1.0.1.min.css' ]
              }
            }
        },
        exec: {
            startphonegapserver: 'cd dist && cd phonegap && phonegap serve && cd .. && cd ..',
            phonegapbuild: 'cd dist && cd phonegap && phonegap build ' + grunt.option('target') + ' && cd .. && cd ..'
        },
		watch : {
			dev : {
				files : [ '<%= pkg.directories.srcstyle %>/*', '<%= pkg.directories.src %>/index.html' ],
				tasks : [ 'dev', 'phonegap' ]
			},
			build : {
				files : [ 'Gruntfile.js', '<%= pkg.directories.srcjs %>/**', 'package.json' ],
				tasks : [ 'build' ]
			},
			test : {
                files : [ '<%= pkg.directories.test %>/**' ],
                tasks : [ 'test' ]
            },
			livereload : {
				options : {livereload : true}, files : [ '<%= pkg.directories.dev %>/index.html' ]
			}
		},
		clean: {
            dev: ["<%= pkg.directories.dev %>"],
            web: ["<%= pkg.directories.distweb %>"],
            phonegap: ["<%= pkg.directories.distphonegap %>"],
            test: ['<%= pkg.directories.test %>/tests.html'],
            'phonegap-build': ['<%= pkg.directories.phonegapplatforms %>' + '/' + grunt.option('target')]
		}
    });
    
    grunt.registerTask('default', [ 'clean:phonegap', 'build', 'asynch' ]);
    grunt.registerTask('clear', [ 'clean' ]);
    grunt.registerTask('build', [ 'test', 'web', 'phonegap', 'dev' ]);
    grunt.registerTask('phonegap-build', [ 'clean:phonegap-build', 'exec:phonegapbuild', 'copy:' + grunt.option('target') ]);
    grunt.registerTask('web', [ 'env:web', 'clean:web', 'preprocess:web', 'copy:web', 'concat', 'uglify', 'cssmin' ]);
    grunt.registerTask('phonegap', [ 'copy:phonegap', 'env:phonegap', 'preprocess:phonegap' ]);
    grunt.registerTask('dev', [ 'env:dev', 'clean:dev', 'preprocess:dev', 'copy:dev' ]);
    grunt.registerTask('test', [ 'clean:test', 'jshint', 'env:test', 'preprocess:test', 'qunit' ]);
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
	grunt.loadNpmTasks('grunt-contrib-clean');
};

