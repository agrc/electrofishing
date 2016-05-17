require([
    'app/location/StationPointDef'
],

function (
    StationPointDef
    ) {
    "use strict";
    describe('app/location/StationPointDef', function () {
        var testWidget;
        beforeEach(function () {
            testWidget = new StationPointDef();
        });
        afterEach(function () {
            testWidget = null;
        });
        it('create a valid object', function () {
            expect(testWidget).toEqual(jasmine.any(StationPointDef));
        });
    });
});