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
        name: 'stream search',
        beforeEach: function () {
            return Common.loadApp(this);
        },
        'returns matches': function () {
            return this.remote
                .elementByCssSelector('.location>.verify-map input[data-dojo-attach-point="textBox"]')
                    .type('fish')
                    .end()
                .wait(5000) // wait for search to be performed
                .elementsByCssSelector('.location>.verify-map .magic-zoom .match')
                    .then(function (elements) {
                        assert.isTrue(elements.length > 1);
                    })
            ;
        },
        'zooms to stream': function () {
            var origBounds;
            return this.remote
                .execute(function () {
                    return AGRC.app.newEvent.locationTb.verifyMap.map.getBounds();
                })
                    .then(function (value) {
                        origBounds = value;
                    })
                .elementByCssSelector('.location>.verify-map input[data-dojo-attach-point="textBox"]')
                    .type('fish')
                    .end()
                .wait(2000) // wait for search to be performed
                .elementByCssSelector('.location>.verify-map .magic-zoom .match')
                    .clickElement()
                    .end()
                .wait(1000) // wait for map to zoom
                .execute(function () {
                    return AGRC.app.newEvent.locationTb.verifyMap.map.getBounds();
                })
                    .then(function (value) {
                        assert.notDeepEqual(origBounds, value);
                    })
            ;
        }
    });
});
