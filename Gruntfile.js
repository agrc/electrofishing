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
    var deployDir = 'wwwroot/electrofishing';
    var deployFiles = [
        '**',
        '!**/*.uncompressed.js',
        '!**/*consoleStripped.js',
        '!**/bootstrap/less/**',
        '!**/bootstrap/test-infra/**',
        '!**/tests/**',
        '!build-report.txt',
        '!components-jasmine/**',
        '!favico.js/**',
        '!jasmine-favicon-reporter/**',
        '!jasmine-jsreporter/**',
        '!stubmodule/**',
        '!util/**'
    ];
    var secrets;
    try {
        secrets = grunt.file.readJSON('secrets.json');
    } catch (e) {
        secrets = {
            stageHost: '',
            prodHost: '',
            username: '',
            password: ''
        };
    }
    var bumpFiles = [
        'package.json',
        'bower.json',
        'src/app/package.json',
        'src/app/config.js'
    ];

    grunt.initConfig({
        bump: {
            options: {
                files: bumpFiles,
                commitFiles: bumpFiles.concat(['src/ChangeLog.html']),
                push: false
            }
        },
        clean: {
            build: ['dist'],
            deploy: ['deploy']
        },
        compress: {
            main: {
                options: {
                    archive: 'deploy/deploy.zip'
                },
                files: [{
                    src: deployFiles,
                    dest: './',
                    cwd: 'dist/',
                    expand: true
                }]
            }
        },
        connect: {
            uses_defaults: {}
        },
        copy: {
            main: {
                files: [{expand: true, cwd: 'src/', src: ['*.html'], dest: 'dist/'}]
            }
        },
        dojo: {
            prod: {
                options: {
                    profiles: ['profiles/prod.build.profile.js', 'profiles/build.profile.js']
                }
            },
            stage: {
                options: {
                    profiles: ['profiles/stage.build.profile.js', 'profiles/build.profile.js']
                }
            },
            options: {
                dojo: 'src/dojo/dojo.js',
                load: 'build',
                releaseDir: '../dist',
                requires: ['src/app/packages.js', 'src/app/run.js'],
                basePath: './src',
                ignoreErrors: true
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
        imagemin: {
            main: {
                options: {
                    optimizationLevel: 3
                },
                files: [{
                    expand: true,
                    cwd: 'src/',
                    // exclude tests because some images in dojox throw errors
                    src: ['**/*.{png,jpg,gif}', '!**/tests/**/*.*'],
                    dest: 'src/'
                }]
            }
        },
        intern: {
            dev: {
                options: {
                    runType: 'runner',
                    config: internFile
                }
            }
        },
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
        processhtml: {
            options: {},
            main: {
                files: {
                    'dist/index.html': ['src/index.html']
                }
            }
        },
        pkg: grunt.file.readJSON('package.json'),
        secrets: secrets,
        sftp: {
            stage: {
                files: {
                    './': 'deploy/deploy.zip'
                },
                options: {
                    host: '<%= secrets.stageHost %>'
                }
            },
            prod: {
                files: {
                    './': 'deploy/deploy.zip'
                },
                options: {
                    host: '<%= secrets.prodHost %>'
                }
            },
            options: {
                path: './' + deployDir + '/',
                srcBasePath: 'deploy/',
                username: '<%= secrets.username %>',
                password: '<%= secrets.password %>',
                showProgress: true,
                readyTimeout: 120000
            }
        },
        sshexec: {
            options: {
                username: '<%= secrets.username %>',
                password: '<%= secrets.password %>',
                readyTimeout: 120000
            },
            stage: {
                command: ['cd ' + deployDir, 'unzip -o deploy.zip', 'rm deploy.zip'].join(';'),
                options: {
                    host: '<%= secrets.stageHost %>'
                }
            },
            prod: {
                command: ['cd ' + deployDir, 'unzip -o deploy.zip', 'rm deploy.zip'].join(';'),
                options: {
                    host: '<%= secrets.prodHost %>'
                }
            }
        },
        stylus: {
            main: {
                options: {
                    compress: false,
                    'resolve url': true
                },
                files: [{
                    expand: true,
                    cwd: 'src/',
                    src: ['app/**/*.styl'],
                    dest: 'src/',
                    ext: '.css'
                }]
            }
        },
        uglify: {
            options: {
                preserveComments: false,
                sourceMap: true,
                compress: {
                    drop_console: true,
                    passes: 2,
                    dead_code: true
                }
            },
            stage: {
                options: {
                    compress: {
                        drop_console: false
                    }
                },
                src: ['dist/dojo/dojo.js'],
                dest: 'dist/dojo/dojo.js'
            },
            prod: {
                files: [{
                    expand: true,
                    cwd: 'dist',
                    src: '**/*.js',
                    dest: 'dist'
                }]
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
            stylus: {
                files: 'src/app/**/*.styl',
                tasks: ['stylus']
            }
            // intern: {
            //     files: ['ui-tests/**/*.js'],
            //     tasks: ['intern:dev']
            // }
        }
    });

    require('load-grunt-tasks')(grunt);
    grunt.loadNpmTasks('intern');

    grunt.registerTask('default', [
        'jasmine:main:build',
        'eslint',
        'connect',
        'stylus',
        'watch'
    ]);

    grunt.registerTask('travis', [
        'eslint',
        'connect',
        'jasmine'
    ]);

    grunt.registerTask('build-prod', [
        'clean:build',
        'stylus',
        'newer:imagemin:main',
        'dojo:prod',
        'uglify:prod',
        'copy:main',
        'processhtml:main'
    ]);
    grunt.registerTask('deploy-prod', [
        'clean:deploy',
        'compress:main',
        'sftp:prod',
        'sshexec:prod'
    ]);
    grunt.registerTask('build-stage', [
        'clean:build',
        'stylus',
        'newer:imagemin:main',
        'dojo:stage',
        'uglify:stage',
        'copy:main',
        'processhtml:main'
    ]);
    grunt.registerTask('deploy-stage', [
        'clean:deploy',
        'compress:main',
        'sftp:stage',
        'sshexec:stage'
    ]);
};
