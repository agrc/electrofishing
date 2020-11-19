/* eslint-disable camelcase */
module.exports = function (grunt) {
    var jsFiles = '_src/app/**/*.js';
    var otherFiles = [
        '_src/app/**/*.html',
        '_src/app/**/*.css',
        '_src/index.html',
        '_src/ChangeLog.html'
    ];
    var gruntFile = 'Gruntfile.js';
    var deployDir = 'fishsample/dataentry';
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
                    archive: 'deploy/dataentry.zip'
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
                src: [jsFiles].concat([gruntFile])
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
        jasmine: {
            main: {
                options: {
                    specs: ['src/app/**/Spec*.js'],
                    vendor: [
                        'https://unpkg.com/react@17/umd/react.development.js',
                        'https://unpkg.com/react-dom@17/umd/react-dom.development.js',
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
                files: [{
                    expand: true,
                    cwd: 'dist',
                    src: deployFiles,
                    dest: './'
                }],
                options: {
                    createDirectories: true
                }
            },
            appPackageOnly: {
                files: [{
                    expand: true,
                    cwd: 'dist/app',
                    src: deployFiles,
                    dest: './app'
                }, {
                    expand: true,
                    cwd: 'dist/react-app',
                    src: deployFiles,
                    dest: './react-app'
                }, {
                    expand: true,
                    cwd: 'dist',
                    src: ['*.html'],
                    dest: './'
                }, {
                    expand: true,
                    cwd: 'dist/dojo',
                    src: 'dojo.*',
                    dest: './dojo'
                }]
            },
            options: {
                host: '<%= secrets.stageHost %>',
                path: `./${deployDir}/`,
                srcBasePath: 'dist/',
                showProgress: true,
                username: '<%= secrets.username %>',
                password: '<%= secrets.password %>'
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
                    src: ['**/*.js', '!leaflet/**'],
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
                files: [jsFiles].concat(otherFiles).map(path => path.replace('_src', 'src'))
                    .concat(['src/react-app/**/*.*']),
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
        'compress:main'
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
        'sftp:stage'
    ]);
    grunt.registerTask('deploy-app-only', [
        'sftp:appPackageOnly'
    ]);
};
