module.exports = function (grunt) {
    var jsFiles = 'src/app/**/*.js';
    var otherFiles = [
        'src/app/**/*.html',
        'src/app/**/*.css',
        'src/index.html'
    ];
    var gruntFile = 'GruntFile.js';
    var internFile = 'ui-tests/intern.js';
    var eslintFiles = [jsFiles, gruntFile, internFile];

    // Project configuration.
    grunt.initConfig({
        pkg: grunt.file.readJSON('package.json'),
        jasmine: {
            main: {
                options: {
                    specs: ['src/app/**/Spec*.js'],
                    vendor: [
                        'src/jasmine-favicon-reporter/vendor/favico.js',
                        'src/jasmine-favicon-reporter/jasmine-favicon-reporter.js',
                        'src/jasmine-jsreporter/jasmine-jsreporter.js',
                        'src/app/tests/jasmineTestBootstrap.js',
                        'src/dojo/dojo.js',
                        'src/app/packages.js',
                        'src/app/tests/jsReporterSanitizer.js',
                        'src/app/tests/jasmineAMDErrorChecking.js',
                        'src/jquery/dist/jquery.js'
                    ],
                    host: 'http://localhost:8000'
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
            }
            // intern: {
            //     files: ['ui-tests/**/*.js'],
            //     tasks: ['intern:dev']
            // }
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

    require('load-grunt-tasks')(grunt);
    grunt.loadNpmTasks('intern');

    grunt.registerTask('default', [
        'jasmine:main:build',
        'eslint',
        'connect',
        'watch'
    ]);

    grunt.registerTask('travis', [
        'eslint',
        'connect',
        'jasmine'
    ]);
};
