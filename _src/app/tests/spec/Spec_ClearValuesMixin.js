require([
    'app/_ClearValuesMixin'
], function (
    _ClearValuesMixin
) {
    describe('app/_ClearValuesMixin', function () {
        var testObject;
        beforeEach(function () {
            testObject = new _ClearValuesMixin();
        });
        afterEach(function () {
            testObject = null;
        });
        it('create a valid object', function () {
            expect(testObject).toEqual(jasmine.any(_ClearValuesMixin));
        });
    });
});
