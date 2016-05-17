require([
    'app/method/CanoeBargesContainer'
],

function (
    CanoeBargesContainer
    ) {
    describe('app/method/CanoeBargesContainer', function () {
        var testWidget;
        beforeEach(function () {
            testWidget = new CanoeBargesContainer();
        });
        afterEach(function () {
            testWidget = null;
        });
        it('create a valid object', function () {
            expect(testWidget).toEqual(jasmine.any(CanoeBargesContainer));
        });
    });
});
