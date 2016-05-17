define([
    'intern!object',
    'intern/chai!assert',
    'require',
    'src/dojo/_base/array',
    './Common'
], function (
    registerSuite,
    assert,
    require,
    array,
    Common
    ) {
    registerSuite({
        name: 'submit report',

        'normal report': function () {
            return Common.loadApp(this)
                .elementsByCssSelector('.location .leaflet-marker-pane img')
                    .then(function (elements) {
                        elements[0].click();
                    })
                .elementByCssSelector('#app_location_PointDef_0 button')
                    .clickElement()
                    .end()
                .elementByCssSelector('div[data-dojo-attach-point="mapDiv"].map')
                    .moveTo(200, 230)
                    .end()
                .click() // if this is called before end, then it's the same as calling element.click()
                .elementByCssSelector('#app_location_PointDef_1 button')
                    .clickElement()
                    .end()
                .elementByCssSelector('div[data-dojo-attach-point="mapDiv"].map')
                    .moveTo(536, 136)
                    .end()
                .click()
                .elementByCssSelector('button[data-dojo-attach-point="verifyMapBtn"]')
                    .clickElement()
                    .end()
                // .waitForConditionInBrowser('return AGRC.app.newEvent.locationTb.verifyMapBtn.innerHTML === AGRC.app.newEvent.locationTb.successfullyVerifiedMsg;', 
                //     10000) // throws an error
                .wait(30000)
                .elementByCssSelector('input[data-dojo-attach-point="streamLengthTxt"]')
                    .type('400')
                    .end()
                .elementByCssSelector('input[data-dojo-attach-point="dateTxt"]')
                    .type('01/20/1980')
                    .end()
                .elementByCssSelector('textarea[data-dojo-attach-point="additionalNotesTxt"]')
                    .type('test report - delete me')
                    .end()


                // ＿人人人人人人人人人＿
                // ＞  METHOD TAB　 ＜
                // ￣ＹＹＹＹＹＹＹＹＹ￣
                .elementByCssSelector('a[href="#methodTab"]')
                    .clickElement()
                    .end()
                .wait(250) // tab animation
                .elementsByCssSelector('.backpack input[type="text"]')
                    .then(function (elements) {
                        array.forEach(elements, function (el) {
                            el.type('s\uE004\uE004');
                        });
                    })
                .elementByCssSelector('[data-dojo-attach-point="anodeDiameterTxt"]')
                    .type('500')
                    .end()
                .elementByCssSelector('[data-dojo-attach-point="stockDiameterTxt"]')
                    .type('1.55')
                    .end()
                .elementByCssSelector('[data-dojo-attach-point="cathodeLengthTxt"]')
                    .type('2.01')
                    .end()
                .elementByCssSelector('[data-dojo-attach-point="cathodeDiameterTxt"]')
                    .type('1.95')
                    .end()
                .elementByCssSelector('[data-dojo-attach-point="machineResistenceTxt"]')
                    .type('5')
                    .end()
                .elementByCssSelector('.method>.row>.col-md-3>.form-group>.combobox-container input[type="text"]')
                    .type('b\uE004')
                    .end()
                .elementByCssSelector('[data-dojo-attach-point="voltsTxt"]')
                    .type('200.05')
                    .end()
                .elementByCssSelector('[data-dojo-attach-point="dutyCycleTxt"]')
                    .type('60')
                    .end()
                .elementByCssSelector('[data-dojo-attach-point="frequencyTxt"]')
                    .type('30')
                    .end()
                .elementByCssSelector('[data-dojo-attach-point="ampsTxt"]')
                    .type('15.5')
                    .end()

                // ＿人人人人人人人＿
                // ＞　CATCH TAB　 ＜
                // ￣ＹＹＹＹＹＹＹ￣
                .elementByCssSelector('a[href="#catchTab"]')
                    .clickElement()
                    .end()
                .wait(250) // tab animation
                .elementByCssSelector('.catch .dgrid td.dgrid-cell.field-SPECIES_CODE')
                    .clickElement()
                    .end()
                .keys('b\uE004\uE004') // species code
                .keys('s\uE004\uE004') // length type
                .keys('300\uE004') // length
                .keys('50\uE004') // weight
                .keys('\uE004') // species code
                .keys('\uE004') // length type
                .keys('250\uE004') // length
                .keys('45') // weight
                .elementByCssSelector('.catch .btn-group.more-info a')
                    .clickElement()
                    .end()
                .wait(1000) // dialog animation
                .elementByCssSelector('.more-info-dialog .dgrid td.dgrid-cell.field-CLASS')
                    .clickElement()
                    .end()
                .keys('t\uE004\uE004') // class
                .keys('b\uE004\uE004') // species
                .keys('s\uE004\uE004') // type
                .keys('blah\uE004') // measurement
                .keys('\uE004') // class
                .keys('\uE004') // species
                .keys('\uE004') // type
                .keys('blah2') // measurement
                .elementByCssSelector('a[href="#Tag_tab"]')
                    .clickElement()
                    .end()
                .wait(250) // tab animation
                .elementByCssSelector('.tag .combobox-container input[type="text"]')
                    .type('y\uE004\uE004') // new tag // need to select this element then tab
                    .end()
                .keys('a\uE004\uE004') // type
                .keys('tagNumber123\uE004')
                .keys('1\uE004\uE004') // frequency
                .keys('b\uE004\uE004') // color
                .keys('r\uE004\uE004') // location
                .elementByCssSelector('a[href="#Health_tab"]')
                    .clickElement()
                    .end()
                .wait(250) // tab animation
                .elementsByCssSelector('.health .combobox-container input[type="text"]')
                    .then(function (elements) {
                        array.forEach(elements, function (el) {
                            el.type('n\uE004');
                        });
                    })
                .elementsByCssSelector('.health input[type="number"]')
                    .then(function (elements) {
                        array.forEach(elements, function (el) {
                            el.type('33');
                        });
                    })
                .elementByCssSelector('a[href="#Notes_tab"]')
                    .clickElement()
                    .end()
                .wait(200) // tab animation
                .elementByCssSelector('textarea[data-dojo-attach-point="notesTxtArea"]')
                    .type('more info notes test')
                    .end()
                .elementByCssSelector('.more-info-dialog .btn-primary')
                    .clickElement()
                    .end()
                .wait(500) // dialog animation

                                
                // ＿人人人人人人人人＿
                // ＞　habitat tab　 ＜
                // ￣ＹＹＹＹＹＹＹＹ￣
                .elementByCssSelector('a[href="#habitatTab"]')
                    .clickElement()
                    .end()
                .wait(500) // dialog animation
                .elementsByCssSelector('.habitat input[type="number"]')
                    .then(function (elements) {
                        array.forEach(elements, function (el) {
                            el.type('2');
                        });
                    })
                // overstories
                .elementByCssSelector('input[data-dojo-attach-point="maxDepthTxt"]')
                    .type('\uE004')
                    .end()
                .keys('s\uE004\uE004') // overstory
                .keys('d\uE004\uE004') // understory
                .keys('\uE004\uE004')
                .keys('y\uE004') // presence of spring
                .elementByCssSelector('input[data-dojo-attach-point="conductivityTxt"]')
                    .type('55')
                    .end()
                // make sure sed classes add up to 100
                .elementByCssSelector('.habitat input[data-dojo-attach-point="boulderTxt"')
                    .type('\uE00390')
                    .end()
                // .wait(10000)
                .elementByCssSelector('button[data-loading-text="submitting report..."]')
                    .clickElement()
                    .end()
                .waitForVisibleByCssSelector('[data-dojo-attach-point="successMsgContainer"]', 30000)
                .then(function () {
                    assert.equal(true, true); // success msg was displayed
                })
            ;
        }
    });
});