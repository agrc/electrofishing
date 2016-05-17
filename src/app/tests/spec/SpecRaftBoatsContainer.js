require([
    'app/method/RaftBoatsContainer'
],

function (
    RaftBoatsContainer
    ) {
    describe('app/method/RaftBoatsContainer', function () {
        var testWidget;
        beforeEach(function () {
            testWidget = new RaftBoatsContainer();
            testWidget.startup();
        });
        afterEach(function () {
            testWidget = null;
        });
        it('create a valid object', function () {
            expect(testWidget).toEqual(jasmine.any(RaftBoatsContainer));
        });
    });
});
