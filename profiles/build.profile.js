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
        name: 'react-app',
        trees: [
            ['.', '.', /(\/\.)|(.stories.js)/]
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
        name: 'localforage',
        resourceTags: {
            amd: function () {
                return true;
            }
        }
    }, {
        name: 'downshift',
        location: '../node_modules/downshift/dist',
        trees: [
            ['.', '.', /(\/\.)|(~$)|(\.esm\.js)/]
        ]
    }, {
        name: 'immer',
        location: '../node_modules/immer/dist',
        trees: [
            ['.', '.', /(\/\.)|(~$)|(\.esm\.js)/]
        ]
    }, {
        name: 'prop-types',
        location: '../node_modules/prop-types',
        trees: [
            ['.', '.', /(\/\.)|(~$)|(node_modules)/]
        ]
    }, {
        name: 'use-immer',
        location: '../node_modules/use-immer/dist',
        trees: [
            ['.', '.', /(\/\.)|(~$)|(\.modern\.js)/]
        ]
    }, {
        name: 'toaster',
        resourceTags: {
            amd: function (filename) {
                return /\.js/.test(filename);
            }
        }
    }, {
        name: 'agrc',
        trees: [
            ['.', '.', /(\/\.)|(~$)|(widgets|resources)/]
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
        name: 'toaster',
        location: './toaster',
        main: 'dist/Toaster',
        trees: [
            ['.', '.', /(\/\.)|(~$)|(src|Gruntfile|tsconfig|bower|map$)/]
        ]
    }, {
        name: 'esri-leaflet',
        location: '../node_modules/esri-leaflet',
        trees: [
            ['.', '.', /(\/\.)|(~$)|(profiles|src)/]
        ]
    }, {
        name: 'papaparse',
        location: './papaparse',
        trees: [
            ['.', '.', /(\/\.)|(~$)|(docs|Gruntfile|bower)/]
        ]
    }, {
        name: 'clsx',
        location: '../node_modules/clsx/dist',
        trees: [
            ['.', '.', /(\/\.)|(~$)|(m\.js|min\.js)/]
        ]
    }, {
        name: 'react-app',
        resourceTags: {
            amd: (filename) => /\.js/.test(filename)
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
