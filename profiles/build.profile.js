/* eslint-disable no-unused-vars */
var profile = {
    basePath: '../src',
    action: 'release',
    cssOptimize: 'comments',
    mini: true,
    optimize: false,
    layerOptimize: false,
    stripConsole: 'all',
    selectorEngine: 'acme',
    layers: {
        'dojo/dojo': {
            include: [
                'dojo/i18n',
                'dojo/domReady',
                'app/packages',
                'app/run',
                'react-app/App'
            ],
            includeLocales: ['en-us'],
            customBase: true,
            boot: true
        }
    },
    packages: [{
        name: 'agrc',
        trees: [
            ['.', '.', /(\/\.)|(~$)|(widgets|resources)/]
        ]
    }, {
        name: 'clsx',
        location: '../node_modules/clsx/dist',
        trees: [
            ['.', '.', /(\/\.)|(~$)|(m\.js)/]
        ]
    }, {
        name: 'downshift',
        location: '../node_modules/downshift/dist',
        files: [
            ['downshift.umd.js', 'downshift.umd.js']
        ],
        trees: []
    }, {
        name: 'esri-leaflet',
        location: '../node_modules/esri-leaflet/dist',
        resourceTags: {
            amd: function () {
                return true;
            }
        },
        trees: [
            ['.', '.', /(\/\.)|(~$)|(\.esm\.js)/]
        ]
    }, {
        name: 'handlebars',
        trees: [
            ['.', '.', /(\/\.)|(~$)|(.*\.amd\.js)/]
        ]
    }, {
        name: 'ijit',
        trees: [
            ['.', '.', /(\/\.)|(~$)|(resources|themes|widgets|_MustacheTemplateMixin|Identify)/]
        ]
    }, {
        name: 'immer',
        location: '../node_modules/immer/dist',
        files: [
            ['immer.umd.development.js', 'immer.umd.development.js']
        ],
        trees: [],
        resourceTags: {
            amd: function () {
                return true;
            }
        }
    }, {
        name: 'localforage',
        resourceTags: {
            amd: function () {
                return true;
            }
        }
    }, {
        name: 'papaparse',
        location: './papaparse',
        trees: [
            ['.', '.', /(\/\.)|(~$)|(docs|Gruntfile|bower)/]
        ]
    }, {
        name: 'proj4',
        resourceTags: {
            amd: function () {
                return true;
            },
            copyOnly: function () {
                return false;
            }
        },
        trees: [
            ['.', '.', /(\/\.)|(.html)/]
        ]
    }, {
        name: 'prop-types',
        location: '../node_modules/prop-types',
        trees: [
            ['.', '.', /(\/\.)|(~$)|(node_modules)/]
        ]
    }, {
        name: 'react-app',
        resourceTags: {
            amd: (filename) => /\.js/.test(filename)
        },
        trees: [
            ['.', '.', /(\/\.)|(.stories.js)/]
        ]
    }, {
        name: 'toaster',
        location: './toaster',
        main: 'dist/Toaster',
        resourceTags: {
            amd: function (filename) {
                return /\.js/.test(filename);
            }
        },
        trees: [
            ['.', '.', /(\/\.)|(~$)|(src|Gruntfile|tsconfig|bower|map$)/]
        ]
    }, {
        name: 'use-immer',
        location: '../node_modules/use-immer/dist',
        resourceTags: {
            amd: function () {
                return true;
            }
        },
        trees: [
            ['.', '.', /(\/\.)|(~$)|(\.umd\..*\.js)/]
        ]
    }, {
        name: 'uuid',
        resourceTags: {
            amd: function () {
                return true;
            }
        }
    }],
    staticHasFeatures: {
        'dojo-trace-api': 0,
        'dojo-log-api': 0,
        'dojo-publish-privates': 0,
        'dojo-sync-loader': 0,
        'dojo-xhr-factory': 0,
        'dojo-test-sniff': 0
    },
    userConfig: {
        packages: ['app', 'dijit', 'toaster']
    }
};
