require([
    'app/SettingsDialog'
],

function (SettingsDialog) {
    describe('app/SettingsDialog', function () {
        var testWidget;
        beforeEach(function () {
            testWidget = new SettingsDialog();
        });
        afterEach(function () {
            testWidget = null;
        });
        it('create a valid object', function () {
            expect(testWidget).toEqual(jasmine.any(SettingsDialog));
        });
    });
});
