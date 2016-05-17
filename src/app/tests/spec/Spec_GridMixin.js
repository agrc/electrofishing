require([
    'app/_GridMixin'
],

function (
    _GridMixin
    ) {
    describe('app/_GridMixin', function () {
        var testObject;
        beforeEach(function () {
            testObject = new _GridMixin();
        });
        afterEach(function () {
            testObject = null;
        });
        it('create a valid object', function () {
            expect(testObject).toEqual(jasmine.any(_GridMixin));
        });
    });
});