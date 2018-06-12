require([
    'app/method/Method',

    'localforage'
], function (
    Method,

    localforage
) {
    describe('app/method/Method', function () {
        var testWidget;
        beforeEach(function (done) {
            localforage.clear().then(function () {
                testWidget = new Method();
                testWidget.startup();
                testWidget.promise.then(done);
            });
        });
        afterEach(function (done) {
            testWidget = null;
            localforage.clear().then(done);
        });
        it('create a valid object', function () {
            expect(testWidget).toEqual(jasmine.any(Method));
        });

        describe('initChildWidgets', function () {
            it('creates multiple existing widgets if there is cached in progress data', function (done) {
                console.warn(`setting ${Method.prototype.cacheId} to [1, 2, 3]`);
                localforage.clear().then(() => {
                    localforage.setItem(Method.prototype.cacheId, [1, 2, 3]).then(function () {
                        testWidget.addBtnWidgets = [];

                        testWidget.initChildWidgets().then(function () {
                            expect(testWidget.addBtnWidgets.length).toBe(3);

                            done();
                        });
                    });
                });
            });
        });
    });
});
