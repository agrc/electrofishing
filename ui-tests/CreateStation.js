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
        name: 'create station',
        'normal station': function () {
            var stationName = 'createStation.js Test';
            return Common.loadApp(this)
                .elementByCssSelector('a[href="#stationModal"')
                    .clickElement()
                    .end()
                .wait(500) // dialog animation
                .elementByCssSelector('input[data-dojo-attach-point="stationNameTxt"]')
                    .type(stationName + '\uE004')
                    .end()
                .keys('co\uE004') // stream type
                .elementByCssSelector('button[data-dojo-attach-point="mapBtn"]')
                    .clickElement()
                    .end()
                .elementByCssSelector('.station div[data-dojo-attach-point="mapDiv"]')
                    .moveTo(419, 181)
                    .end()
                .click()
                .elementByCssSelector('.station button[data-dojo-attach-point="submitBtn"]')
                    .clickElement()
                    .end()
                .wait(15000) // wait for ajax request / couldn't figure out how to do this better
                .elementByCssSelector('input[data-dojo-attach-point="stationTxt"]')
                    .getValue()
                    .then(function (value) {
                        assert.equal(value, stationName);
                    })
            ;
        }
    });
});