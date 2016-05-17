require([
    'app/location/_GeoDefMixin'
],

function (_GeoDefMixin) {
    describe('app/location/_GeoDefMixin', function () {
        var testObject;
        beforeEach(function () {
            testObject = new _GeoDefMixin();
        });
        afterEach(function () {
            testObject = null;
        });
        it('creates a valid object', function () {
            expect(testObject).toEqual(jasmine.any(_GeoDefMixin));
        });
        describe('clearGeometry', function () {
            it('calls clear on all of the defs', function () {
                var defs = [
                    {clear: jasmine.createSpy('clear')},
                    {clear: jasmine.createSpy('clear')}
                ];
                testObject.defs = defs;

                testObject.clearGeometry();

                expect(defs[0].clear).toHaveBeenCalled();
                expect(defs[1].clear).toHaveBeenCalled();
            });
        });
    });
});
