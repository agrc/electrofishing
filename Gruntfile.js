/* eslint-disable camelcase */
module.exports = function (grunt) {
    var jsFiles = '_src/app/**/*.js';
    var otherFiles = [
        '_src/app/**/*.html',
        '_src/app/**/*.css',
        '_src/index.html',
        '_src/ChangeLog.html'
    ];
    const e2e_files = 'e2e_tests/**/*.js';
    var gruntFile = 'GruntFile.js';
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
        'package-lock.json',
        'package.json',
        'bower.json',
        '_src/app/package.json',
        '_src/app/config.js'
    ];

    grunt.initConfig({
        babel: {
            options: {
                sourceMap: true,
                presets: ['latest'],
                plugins: ['transform-remove-strict-mode']
            },
            src: {
                files: [{
                    expand: true,
                    cwd: '_src/app/',
                    src: ['**/*.js'],
                    dest: 'src/app/'
                }]
            }
        },
        bump: {
            options: {
                files: bumpFiles,
                commitFiles: bumpFiles.concat(['_src/ChangeLog.html']),
                push: false
            }
        },
        clean: {
            build: ['dist'],
            deploy: ['deploy'],
            src: ['src/app', 'src/ChangeLog.html', 'src/index.html']
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
            dist: {
                files: [{expand: true, cwd: 'src/', src: ['*.html'], dest: 'dist/'}]
            },
            src: {
                expand: true,
                cwd: '_src',
                src: ['**/*.html', '**/*.png', '**/*.jpg', 'secrets.json', 'app/package.json'],
                dest: 'src'
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
                src: [jsFiles].concat([gruntFile]).concat([e2e_files])
            },
            options: {
                configFile: '.eslintrc'
            }
        },
        exec: {
            main: {
                cmd: 'node node_modules/jasmine/bin/jasmine.js --config=e2e_tests/support/jasmine.json'
            },
            debug: {
                cmd: 'DEBUG=true node node_modules/jasmine/bin/jasmine.js --config=e2e_tests/support/jasmine.json'
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
        jasmine: {
            main: {
                options: {
                    specs: ['src/app/**/Spec*.js'],
                    // specs: ['src/app/tests/spec/SpecMoreInfoDialog.js'],
                    vendor: [
                        'src/jasmine-favicon-reporter/vendor/favico.js',
                        'src/jasmine-favicon-reporter/jasmine-favicon-reporter.js',
                        'src/jasmine-jsreporter/jasmine-jsreporter.js',
                        'src/app/tests/jasmineTestBootstrap.js',
                        'src/dojo/dojo.js',
                        'src/app/packages.js',
                        'src/app/tests/jasmineAMDErrorChecking.js',
                        'src/jquery/dist/jquery.js',
                        'src/bootstrap/dist/js/bootstrap.js'
                    ],
                    host: 'http://localhost:8000',
                    version: '2.5.1'
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
                    host: '<%= secrets.stage.host %>',
                    username: '<%= secrets.stage.username %>',
                    password: '<%= secrets.stage.password %>'
                }
            },
            prod: {
                files: {
                    './': 'deploy/deploy.zip'
                },
                options: {
                    host: '<%= secrets.prod.host %>',
                    username: '<%= secrets.prod.username %>',
                    password: '<%= secrets.prod.password %>'
                }
            },
            options: {
                path: './' + deployDir + '/',
                srcBasePath: 'deploy/',
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
                    host: '<%= secrets.stage.host %>',
                    username: '<%= secrets.stage.username %>',
                    password: '<%= secrets.stage.password %>'
                }
            },
            prod: {
                command: ['cd ' + deployDir, 'unzip -o deploy.zip', 'rm deploy.zip'].join(';'),
                options: {
                    host: '<%= secrets.prod.host %>',
                    username: '<%= secrets.prod.username %>',
                    password: '<%= secrets.prod.password %>'
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
                    cwd: '_src/',
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
                files: [jsFiles].concat(['.eslintrc']).concat(otherFiles),
                tasks: ['eslint', 'jasmine:main:build', 'newer:babel', 'newer:copy:src']
            },
            src: {
                files: [jsFiles].concat(otherFiles).map(path => path.replace('_src', 'src')),
                options: {
                    livereload: true
                }
            },
            stylus: {
                files: '_src/app/**/*.styl',
                tasks: ['stylus'],
                options: {
                    livereload: true
                }
            },
            e2etests: {
                files: e2e_files,
                tasks: ['exec:debug']
            }
        }
    });

    require('load-grunt-tasks')(grunt);

    grunt.registerTask('default', [
        'eslint',
        'clean:src',
        'babel',
        'stylus',
        'copy:src',
        'connect',
        'jasmine:main:build',
        'watch'
    ]);

    grunt.registerTask('e2etests', ['exec:debug', 'watch:e2etests']);

    grunt.registerTask('travis', [
        'eslint',
        'clean:src',
        'babel',
        'stylus',
        'copy:src',
        'connect',
        'jasmine'
    ]);

    grunt.registerTask('build-prod', [
        'clean:build',
        'clean:src',
        'babel',
        'stylus',
        'copy:src',
        'newer:imagemin:main',
        'dojo:prod',
        'uglify:prod',
        'copy:dist',
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
        'clean:src',
        'babel',
        'stylus',
        'copy:src',
        'newer:imagemin:main',
        'dojo:stage',
        'uglify:stage',
        'copy:dist',
        'processhtml:main'
    ]);
    grunt.registerTask('deploy-stage', [
        'clean:deploy',
        'compress:main',
        'sftp:stage',
        'sshexec:stage'
    ]);
};
