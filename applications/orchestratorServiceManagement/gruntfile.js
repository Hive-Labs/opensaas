'use strict';

// # Globbing
// for performance reasons we're only matching one level down:
// 'test/spec/{,*/}*.js'
// use this if you want to recursively match all subfolders:
// 'test/spec/**/*.js'
module.exports = function(grunt) {
    grunt.initConfig({
        pkg: grunt.file.readJSON('package.json'),
        clean: {
            options: {
                force: true
            },
            dist: {
                files: [{
                    dot: true,
                    src: ['.tmp', 'dist/*', 'orchestratorServiceManagement.tar.gz']
                }]
            },
            server: '.tmp'
        },
        bump: {
            options: {
                files: ['package.json'],
                updateConfigs: [],
                commit: false,
                createTag: false,
                push: false
            }
        },
        jshint: {
            files: ['**/*.js'],
            options: {
                ignores: ['gruntfile.js', 'node_modules/**/*', 'public/scripts/jquery.flot.js', 'public/bower_components/**/*']
            }
        },
        copyto: {
            build: {
                files: [{
                    cwd: '.',
                    src: ['**/*'],
                    dest: 'dist/'
                }],
                options: {
                    processContent: function(content, path) {
                        return content;
                    },
                    ignore: ['./node_modules{,/**/*}', './.git{,/**/*}', './dist{,/**/*}', './orchestratorServiceManagement.tar.gz']
                }
            }
        },
        compress: {
            main: {
                options: {
                    mode: 'tgz',
                    archive: 'orchestratorServiceManagement.tar.gz'
                },
                files: [{
                    cwd: 'dist/',
                    src: ['**'],
                    dest: 'orchestratorServiceManagement/',
                }]
            }
        }
    });

    grunt.loadNpmTasks('grunt-contrib-compress');

    // This will run linting on the code
    grunt.loadNpmTasks('grunt-contrib-jshint');

    // This is the task to increment the build each build
    grunt.loadNpmTasks('grunt-bump');

    // This task will clear the dist directory of old files
    grunt.loadNpmTasks('grunt-contrib-clean');

    // This task will copy files from source to dist for production
    grunt.loadNpmTasks('grunt-copy-to');

    grunt.registerTask('test', ['clean:server']);

    grunt.registerTask('build', ['clean:dist', 'jshint', 'bump', 'copyto', 'compress']);

    grunt.registerTask('default', ['test', 'build']);
};