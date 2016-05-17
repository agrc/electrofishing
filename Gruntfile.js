module.exports = function(grunt) {
    var jsFiles = 'src/app/**/*.js';
    var otherFiles = [
        'src/app/**/*.html',
        'src/app/**/*.css',
        'src/index.html'
    ];
    var gruntFile = 'GruntFile.js';
    var internFile = 'tests/intern.js';
    var packageFile = 'package.json';
    var jshintFiles = [jsFiles, gruntFile, internFile, packageFile];

    // Project configuration.
    grunt.initConfig({
        pkg: grunt.file.readJSON('package.json'),
        jasmine: {
            app: {
                src: ['src/app/tests/jasmineTestBootstrap.js',
                    'src/dojo/dojo.js',
                    'src/app/run.js'
                ],
                options: {
                    specs: [
                        'src/app/tests/spec/*.js'
                    ]
                }
            }
        },
        jshint: {
            files: jshintFiles,
            options: {
                jshintrc: '.jshintrc'
            }
        },
        watch: {
            jshint: {
                files: jshintFiles,
                tasks: ['jshint']
            },
            src: {
                files: jshintFiles.concat(otherFiles),
                options: {
                    livereload: true
                }
            },
            intern: {
                files: ['ui-tests/**/*.js'],
                tasks: ['intern:dev']
            }
        },
        connect: {
            uses_defaults: {}
        },
        intern: {
            dev: {
                options: {
                    runType: 'runner',
                    config: 'intern.js'
                }
            }
        }
    });

    // Register tasks.
    grunt.loadNpmTasks('grunt-contrib-jasmine');
    grunt.loadNpmTasks('grunt-contrib-jshint');
    grunt.loadNpmTasks('grunt-contrib-watch');
    grunt.loadNpmTasks('grunt-contrib-connect');
    grunt.loadNpmTasks('intern');

    // Default task.
    grunt.registerTask('default', ['jasmine:app:build', 'jshint', 'connect', 'watch']);
};