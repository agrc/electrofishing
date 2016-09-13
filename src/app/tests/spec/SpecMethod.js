require([
    'app/method/Method'
], function (
    Method
) {
    describe('app/method/Method', function () {
        var testWidget;
        beforeEach(function () {
            testWidget = new Method();
        });
        afterEach(function () {
            testWidget = null;
        });
        it('create a valid object', function () {
            expect(testWidget).toEqual(jasmine.any(Method));
        });
    });
});
