/* global JasmineFaviconReporter, jasmineRequire */
var dojoConfig = { // eslint-disable-line no-unused-vars
    baseUrl: '/src/',
    packages: ['put-selector', 'dojo', // dojo is required here since we are defining baseUrl before loading dojo
        {
            name: 'agrc-jasmine-matchers',
            location: 'agrc-jasmine-matchers/src'
        }, {
            name: 'stubmodule',
            location: 'stubmodule/src',
            main: 'stub-module'
        }
    ],
    has: {
        'dojo-undef-api': true
    }
};
window.confirm = () => true;

// for jasmine-favicon-reporter
jasmine.getEnv().addReporter(new JasmineFaviconReporter());
jasmine.getEnv().addReporter(new jasmineRequire.JSReporter2());

jasmine.DEFAULT_TIMEOUT_INTERVAL = 10000;
