require([
    'app/_SubmitJobMixin'
], function (
    _SubmitJobMixin
    ) {
    describe('app/_SubmitJobMixin', function () {
        var testObject;
        beforeEach(function () {
            testObject = new _SubmitJobMixin();
        });
        afterEach(function () {
            testObject = null;
        });
        it('create a valid object', function () {
            expect(testObject).toEqual(jasmine.any(_SubmitJobMixin));
        });
    });
});
