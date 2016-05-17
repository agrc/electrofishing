require([
    'app/Header',
    'dojo/on'

],

function (
    Header,
    on
    ) {
    describe('app/Header', function () {
        var testWidget;
        beforeEach(function () {
            testWidget = new Header();
        });
        afterEach(function () {
            testWidget = null;
        });

        it('creates a valid object', function () {
            expect(testWidget).toEqual(jasmine.any(Header));
        });

        it('fires onGoHome on title', function () {
            spyOn(testWidget, 'onGoHome');

            on.emit(testWidget.title, 'click', {
                bubbles: true,
                cancelable: true
            });

            expect(testWidget.onGoHome).toHaveBeenCalled();
        });
    });
});
