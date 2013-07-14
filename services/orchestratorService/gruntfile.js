var path = require('path');

module.exports = function(grunt) {
  // Project configuration.
  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),
    uglify: {
      options: {
        banner: '/*! <%= pkg.name %> <%= grunt.template.today("yyyy-mm-dd") %> */\n'
      },
      build: {
        src: 'server.js',
        dest: 'build/server.min.js'
      }
    },
    nodemon: {
      prod: {
        options: {
          file: 'server.js',
          args: ['production'],
          ignoredFiles: ['README.md', 'node_modules/**'],
          watchedExtensions: ['js', 'coffee'],
          debug: true,
          delayTime: 1,
          env: {
             PORT: '3000'
            ,SERVERCONF: path.resolve('../ServerConfiguration.json')
          },
          cwd: '.'
        }
      },
      exec: {
        options: {
          exec: 'less'
        }
      }
    }
  });

  // Load the plugin that provides the "uglify" task.
  grunt.loadNpmTasks('grunt-contrib-uglify');

  // Default task(s).
  grunt.registerTask('default', ['uglify', 'nodemon']);

  /*https://github.com/ChrisWren/grunt-nodemon
    Used to run node app in a demon using Grunt script  
  */
  grunt.loadNpmTasks('grunt-nodemon');

};