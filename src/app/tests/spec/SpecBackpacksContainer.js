require([
    'app/method/BackpacksContainer'
],

function (
    BackpacksContainer
    ) {
    describe('app/method/BackpacksContainer', function () {
        var testWidget;
        beforeEach(function () {
            testWidget = new BackpacksContainer();
        });
        afterEach(function () {
            testWidget = null;
        });
        it('create a valid object', function () {
            expect(testWidget).toEqual(jasmine.any(BackpacksContainer));
        });
    });
});
