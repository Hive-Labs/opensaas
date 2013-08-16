/**
 * Example Grunt Hub
 *
 * Edit the hub.all.src to point to your Gruntfile locations.
 * Then run `grunt` or `grunt watch`.
 */
module.exports = function(grunt) {
  'use strict';

  grunt.initConfig({
    hub: {
      all: {
        src: ['../authService/gruntfile.js','../orchestratorService/gruntfile.js','../proxyService/gruntfile.js'],
        tasks: ['default']
      }
    },
    watch: {
      all: {
        files: ['<%= hub.all.files %>'],
        tasks: ['default']
      }
    }
  });

  grunt.loadNpmTasks('grunt-hub');

  grunt.registerTask('default', ['hub']);
};
