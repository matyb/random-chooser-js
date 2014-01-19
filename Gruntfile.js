module.exports = function(grunt) {
    grunt.initConfig({
        qunit: {
            files: ['test/tests.html']
        }
    });
    grunt.registerTask('test', 'qunit');
    grunt.loadNpmTasks('grunt-contrib-qunit');
};

