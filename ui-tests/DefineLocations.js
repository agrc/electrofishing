define([
    'intern!object',
    'intern/chai!assert',
    'require',
    './Common'

], function (
    registerSuite,
    assert,
    require,
    Common
    ) {
    registerSuite({
        beforeEach: function () {
            this.remote.clickStartOnMap = function (context) {
                return context.remote
                    .elementByCssSelector('div[data-dojo-attach-point="mapDiv"].map')
                        .moveTo(454, 260)
                        .end()
                    .click()
                ; 
            };
            this.remote.clickVerifyBtn = function (context) {
                return context.remote
                    .elementByCssSelector('button[data-dojo-attach-point="verifyMapBtn"]')
                        .clickElement()
                        .end()
                    .waitForElementByCssSelector('button[data-dojo-attach-point="verifyMapBtn"]:enabled',
                        20000)
                    .elementByCssSelector('.location>.form-group>span[data-dojo-attach-point="validateMsg"]')
                    .waitForCondition('true') // throws an error
                ;
            };
        },

        name: 'Define Locations',
        'Start, Distance, Direction': function () {
            return Common.loadApp(this)
                .elementByCssSelector('#startDistDirTab')
                    .clickElement()
                    .end()
                .wait(250)
                .elementByCssSelector('.start-dist-dir .glyphicon-map-marker')
                    .clickElement()
                    .end()
                .clickStartOnMap(this)
                .elementByCssSelector('.start-dist-dir [data-dojo-attach-point="distanceBox"]')
                    .type('1000')
                    .end()
                .clickVerifyBtn(this)
                .then(function () {
                    console.log('hello');
                })
            ;
        }
    });
});