/*eslint-disable no-unused-vars */
var profile = (function () {
    var copyOnly = function (mid) {
        // console.log(mid);
        var list = {
            'bootstrap': true
        };

        return (mid in list);
    };
    return {
        basePath: '../src',
        action: 'release',
        cssOptimize: 'comments',
        mini: true,
        optimize: 'closure',
        layerOptimize: 'closure',
        stripConsole: 'all',
        selectorEngine: 'acme',
        layers: {
            'dojo/dojo': {
                include: [
                    'dojo/i18n',
                    'dojo/domReady',
                    'app/packages',
                    'app/run',
                    'app/App'
                ],
                customBase: true,
                boot: true
            }
        },
        staticHasFeatures: {
            'dojo-trace-api': 0,
            'dojo-log-api': 0,
            'dojo-publish-privates': 0,
            'dojo-sync-loader': 0,
            'dojo-xhr-factory': 0,
            'dojo-test-sniff': 0,
            'dijit-legacy-requires': 0
        },
        resourceTags: {
            test: function (filename, mid) {
                return (/^Spec*./).test(filename);
            },
            copyOnly: function (filename, mid) {
                return copyOnly(mid);
            },
            // TODO: filter out agrc, ijit, and esri?
            amd: function (filename, mid) {
                return !copyOnly(mid) && /\.js$/.test(filename);
            }
        },
        packages: ['app', 'dijit']
    };
}());
