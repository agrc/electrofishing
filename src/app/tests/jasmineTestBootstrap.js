/*jshint unused:false, loopfunc:true*/
var dojoConfig = {
    isDebug: false,
    isJasmineTestRunner: true, // prevents parser in main.js from running
    has: {'dojo-undef-api': true},
    packages: [{
        name: 'StubModule',
        location: '../StubModule'
    }]
};