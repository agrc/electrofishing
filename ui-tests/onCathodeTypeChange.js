define([
    'intern!object',
    'intern/chai!assert',
    'require',
    './config'

], function (
    registerSuite,
    assert,
    require,
    config
    ) {
    function assertCathodeDiameterTxtEnabled(expected) {
        var f = (expected) ? assert.isTrue : assert.isFalse;
        return this.remote
            .elementByCssSelector('[data-dojo-attach-point="cathodeDiameterTxt"]')
                // hangs right here for some reason - no finding the node
                .isEnabled()
                .then(function (enabled) {
                    f.apply(assert, [enabled]);
                });
    }
    registerSuite({
        name: 'on cathode type change',
        beforeEach: function () {
            return this.remote
                .get(require.toUrl(config.baseUrl))
                .waitForElementByCssSelector('body.loaded', 5000)
                .elementByCssSelector('button[data-dojo-attach-point="newEventBtn"]')
                    .clickElement()
                    .end()
                .wait(250)
                .elementByCssSelector('a[href="#methodTab"]')
                    .clickElement()
                    .end()
                .wait(250)
                .elementByCssSelector('a[href="#spec_raftBoat"]')
                    .clickElement()
                    .end()
                .wait(250)
                .elementsByCssSelector('.raft-boat .combobox-container input[type="text"]')
                    .then(function (nodes) {
                        nodes[2].type('b\uE004');
                    });
        },
        'should disable cathode diameter if any raft/boats are cathode type boat': function () {
            return assertCathodeDiameterTxtEnabled.apply(this, [false]);
        }
        // 'should re-enable if changed to non-boat': function () {
        //     var that = this;
        //     return this.remote
        //         .elementsByCssSelector('.raft-boat .dropdown-toggle')
        //             .then(function (nodes) {
        //                 nodes[2].click();
        //             })
        //             .end()
        //         .elementsByCssSelector('.raft-boat .combobox-container input[type="text"]')
        //             .then(function (nodes) {
        //                 nodes[2].type('n\uE004');
        //             })
        //             .end()
        //         .then(function () {
        //             return assertCathodeDiameterTxtEnabled.apply(that, [true]);
        //         });
        // },
        // 'more than one raft widget': {
        //     beforeEach: function () {
        //         return this.remote
        //             .elementByCssSelector('.raft-boat [data-dojo-attach-point="btn"]')
        //                 .clickElement()
        //                 .end()
        //             .elementsByCssSelector('.raft-boat .combobox-container input[type="text"]')
        //                 .then(function (nodes) {
        //                     nodes[5].type('n\uE004');
        //                 })
        //                 .end();
        //     },
        //     'should disable when there is more than one raft widget as long as at least one is type boat': function () {
        //         return assertCathodeDiameterTxtEnabled.apply(this, [false]);
        //     },
        //     'should enable when there is more than one raft widget as long as all are non-boat': function () {
        //         var that = this;
        //         return this.remote
        //             .elementsByCssSelector('.raft-boat .combobox-container input[type="text"]')
        //                 .then(function (nodes) {
        //                     nodes[2].type('n\uE004');
        //                 })
        //                 .end()
        //             .then(function () {
        //                 return assertCathodeDiameterTxtEnabled.apply(that, [true]);
        //             });
        //     }
        // }
    });
});