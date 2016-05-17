module.exports = function (grunt) {
    var jsFiles = 'src/app/**/*.js';
    var otherFiles = [
        'src/app/**/*.html',
        'src/app/**/*.css',
        'src/index.html'
    ];
    var gruntFile = 'GruntFile.js';
    var internFile = 'ui-tests/intern.js';
    var packageFile = 'package.json';
    var eslintFiles = [jsFiles, gruntFile, internFile, packageFile];

    // Project configuration.
    grunt.initConfig({
        pkg: grunt.file.readJSON('package.json'),
        jasmine: {
            app: {
                src: [
                    'src/app/tests/jasmineTestBootstrap.js',
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
        eslint: {
            main: {
                src: eslintFiles
            },
            options: {
                configFile: '.eslintrc'
            }
        },
        watch: {
            eslint: {
                files: eslintFiles,
                tasks: ['eslint']
            },
            src: {
                files: eslintFiles.concat(otherFiles),
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
                    config: internFile
                }
            }
        }
    });

    // Register tasks.
    require('load-grunt-tasks')(grunt);
    grunt.loadNpmTasks('intern');

    // Default task.
    grunt.registerTask('default', [
        'jasmine:app:build',
        // 'eslint',
        'connect',
        'watch'
    ]);
};
