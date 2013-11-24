var path = require('path');

module.exports = function(grunt) {
  // Project configuration.
  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),
    bump: {
      options: {
        files: ['package.json'],
        updateConfigs: [],
        createTag: false,
        commit: false,
        push: false
      }
    },
    jshint: {
      files: ['**/*.js'],
      options: {
        ignores: ['node_modules/**/*']
      }
    },
    nodemon: {
      prod: {
        options: {
          file: 'server.js',
          args: ['production'],
          ignoredFiles: ['README.md', 'node_modules/**'],
          watchedExtensions: ['js'],
          debug: true,
          delayTime: 1,
          env: {
            PORT: '2000'
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

  // Default task(s).
  grunt.registerTask('default', ['bump', 'jshint', 'nodemon']);

  // This will run linting on the code
  grunt.loadNpmTasks('grunt-contrib-jshint');

  // This will run the nodejs app
  grunt.loadNpmTasks('grunt-nodemon');

  // This is the task to increment the build each build
  grunt.loadNpmTasks('grunt-bump');
};