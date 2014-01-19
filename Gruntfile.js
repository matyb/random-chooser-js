/*jslint node: true */
module.exports = function(grunt) {
    grunt.initConfig({
		env: {
			dev: {
				NODE_ENV : 'DEVELOPMENT'
			},
			prod: {
				NODE_ENV : 'PRODUCTION'
			},
			test: {
				NODE_ENV : 'TEST'
			}
		},
		preprocess: {
			dev: {
				src: 'index.html',
				dest: './dev/index.html'
			},
			prod: {
				src: 'index.html',
				dest: 'dist/index.html'
			},
			test: {
				src: 'index.html',
				dest: 'test/tests.html'
			}
		},
		copy: {
			main: {
				files: [
					{expand: true, src: ['style/*.css'], dest: 'dist', filter: 'isFile'},
					{expand: true, src: ['style/images/*'], dest: 'dist', filter: 'isFile'},
					{expand: true, src: ['style/*.css'], dest: 'dev', filter: 'isFile'},
					{expand: true, src: ['style/images/*'], dest: 'dev', filter: 'isFile'}
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
			dist: {
				src: ['<banner:meta.banner>', '<file_strip_banner:js/<%= pkg.name %>.js>', 
					'js/jquery-1.6.4.js', 'js/jquery.mobile-1.0.1.js', 'js/json2.js', 
					'js/chooser.js'],
				dest: 'dist/js/<%= pkg.name %>.min.js'
			}
		},
        qunit: {
            files: ['test/tests.html']
        },
		jshint: {
			files: ['Gruntfile.js', 'js/**/*.js', 'test/**/*.js'],
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
				}
			},
			dist: {
				src: ['<banner:meta.banner>', '<%= concat.dist.dest %>'],
				dest: '<%= concat.dist.dest %>'
			}
		}
    });
	grunt.registerTask('default', [	'jshint', 'env:test', 'preprocess:test', 'qunit', 'env:prod', 
									'preprocess:prod', 'copy', 'concat', 'uglify', 'env:dev', 'preprocess:dev' ]);
    grunt.registerTask('test', ['jshint', 'env:test', 'preprocess:test', 'qunit']);
	grunt.loadNpmTasks('grunt-env');
	grunt.loadNpmTasks('grunt-preprocess');
	grunt.loadNpmTasks('grunt-contrib-qunit');
	grunt.loadNpmTasks('grunt-contrib-jshint');
	grunt.loadNpmTasks('grunt-contrib-uglify');
	grunt.loadNpmTasks('grunt-contrib-concat');
	grunt.loadNpmTasks('grunt-contrib-copy');
};

