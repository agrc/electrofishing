require([
    'app/method/CanoeBarge'
],

function (
    CanoeBarge
    ) {
    "use strict";
    describe('app/method/CanoeBarge', function () {
        var testWidget;
        beforeEach(function () {
            testWidget = new CanoeBarge({type: 'test'});
        });
        afterEach(function () {
            testWidget.destroy();
            testWidget = null;
        });
        it('create a valid object', function () {
            expect(testWidget).toEqual(jasmine.any(CanoeBarge));
        });
        describe('postCreate', function () {
            // it("fire wireEvents", function () {
            //     spyOn(testWidget, 'wireEvents');

            //     testWidget.postCreate();

            //     expect(testWidget.wireEvents).toHaveBeenCalled();
            // });
        });
    });
});