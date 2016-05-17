define([
    'intern!object',
    'intern/chai!assert',
    'require',
    './Common',
    'src/dojo/Deferred'

], function (
    registerSuite,
    assert,
    require,
    Common,
    Deferred
    ) {
    registerSuite({
        beforeEach: function () {
            this.remote.clearCombobox = function (context) {
                return context.remote.elementByCssSelector('.catch .dgrid-input .combobox-container .glyphicon-remove')
                    .clickElement()
                    .end()
                ;
            };
            this.remote.goToFirstRow = function (context) {
                return context.remote.elementByCssSelector('.catch .dgrid td.dgrid-cell.field-SPECIES_CODE')
                    .clickElement()
                    .end()
                ;
            };
            this.remote.addRow = function (context) {
                return context.remote.elementByCssSelector('.catch a[data-dojo-attach-point="addRowBtn"]')
                    .clickElement()
                    .end()
                ;
            };
        },

        name: 'Catch Tab',
        // 'bug #27678, preserve cell value if dropdown default is different': function () {
        //     return Common.goToCatchTab(this)
        //         // fill in first row
        //         .goToFirstRow(this)
        //         .keys('b\uE004\uE004') // species code
        //         .keys('s\uE004\uE004') // length type
        //         .keys('300\uE004') // length
        //         .keys('50\uE004') // weight

        //         // fill in second row
        //         .clearCombobox(this)
        //         .keys('s\uE004\uE004') // species code
        //         .clearCombobox(this)
        //         .keys('f\uE004\uE004') // length type
        //         .keys('300\uE004') // length
        //         .keys('50\uE004') // weight

        //         // go back to first row
        //         .goToFirstRow(this)
        //         .elementByCssSelector('.catch .dgrid td.dgrid-cell.field-SPECIES_CODE input.form-control.combobox')
        //             .getValue()
        //             .then(function (value) {
        //                 assert.equal(value[0], 'B');
        //             })

        //         // .wait(30000)
        //     ;
        // },
        'batch form with no weight': function () {
            var num = 5;
            return Common.goToCatchTab(this)
                .elementByCssSelector('.catch a[data-dojo-attach-point="batchBtn"]')
                    .clickElement()
                    .end()
                .wait(500) // dialog animation
                .keys('b\uE004\uE004') // species code
                .keys(num + '\uE004') // number
                .elementByCssSelector('button[data-dojo-attach-point="batchGoBtn"]')
                    .clickElement()
                    .end()

                // check number of rows
                .elementsByCssSelector('.dgrid-content>.dgrid-row')
                    .then(function (rows) {
                        assert.equal(rows.length, num);
                    })
                // check row values
                .elementByCssSelector('.catch td.field-SPECIES_CODE')
                    .text()
                        .then(function (txt) {
                            assert.equal(txt, 'BG');
                        })
                    .end()
                .elementByCssSelector('.catch td.field-WEIGHT')
                    .text()
                        .then(function (txt) {
                            assert.equal(txt, '0');
                        })
                    .end()
            ;
        }
    });
});