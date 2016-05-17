require([
    'app/App',
    'app/NewCollectionEvent'
], 

function (App, NewCollectionEvent) {
    describe('app/App', function () {
        var testWidget;
        beforeEach(function () {
            testWidget = new App();
        });
        afterEach(function () {
            testWidget = null;
        });
        it('create a valid object', function () {
            expect(testWidget).toEqual(jasmine.any(App));
        });
    });
});