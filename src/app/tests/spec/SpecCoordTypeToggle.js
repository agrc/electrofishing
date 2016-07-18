require([
    'app/location/CoordTypeToggle'
],

function (
    CoordTypeToggle
    ) {
    describe('app/location/CoordTypeToggle', function () {
        var testWidget;
        var topicMock;
        var value = AGRC.coordTypes.utm27;

        // this is to prevent global topics from firing in other tests
        var oldTopic = AGRC.topics.coordTypeToggle_onChange;
        beforeEach(function () {
            AGRC.topics.coordTypeToggle_onChange = 'blah';
            testWidget = new CoordTypeToggle();

            topicMock = {
                publish: jasmine.createSpy('publish'),
                subscribe: jasmine.createSpy('subscribe')
            };
            localStorage.removeItem('coordType');
        });
        afterEach(function () {
            // testWidget.destroy();
            testWidget = null;
            AGRC.topics.coordTypeToggle_onChange = oldTopic;
        });
        it('should create a valid object', function () {
            expect(testWidget).toBeDefined();
        });
        describe('postCreate', function () {
            it('should fire wire events', function () {
                spyOn(testWidget, 'wireEvents');

                testWidget.postCreate();

                expect(testWidget.wireEvents).toHaveBeenCalled();
            });
            it('should set the default type to be utm83', function () {
                spyOn(testWidget, 'onChange');

                testWidget.postCreate();

                expect(testWidget.onChange.calls.mostRecent().args[0])
                    .toEqual(AGRC.coordTypes.utm83);
            });
            it('sets the current type to equal the localstorage value if there is one', function () {
                localStorage.coordType = AGRC.coordTypes.utm27;

                testWidget.postCreate();

                expect(testWidget.currentType).toEqual(AGRC.coordTypes.utm27);
            });
        });
        describe('wireEvents', function () {
            it('should wire onChange event to buttons', function () {
                spyOn(testWidget, 'onChange');

                testWidget.coord_utm83Btn.click();
                testWidget.coord_llBtn.click();
                testWidget.coord_utm27Btn.click();

                expect(testWidget.onChange.calls.count()).toEqual(3);
            });
            it('should pass the appropriate AGRC.coordTypes to onChange', function () {
                spyOn(testWidget, 'onChange');

                testWidget.wireEvents();

                testWidget.coord_utm83Btn.click();
                expect(testWidget.onChange.calls.mostRecent().args[0]).toEqual(AGRC.coordTypes.utm83);
                testWidget.coord_utm27Btn.click();
                expect(testWidget.onChange.calls.mostRecent().args[0]).toEqual(AGRC.coordTypes.utm27);
                testWidget.coord_llBtn.click();
                expect(testWidget.onChange.calls.mostRecent().args[0]).toEqual(AGRC.coordTypes.ll);
            });
        });
        describe('onChange', function () {
            it('should call topic.publish with correct topic from AGRC', function () {
                testWidget.onChange(value, topicMock);

                expect(topicMock.publish.calls.mostRecent().args[1]).toEqual(value);
                expect(topicMock.publish.calls.mostRecent().args[0]).toEqual(AGRC.topics.coordTypeToggle_onChange);
            });
            it('should set the currentType property', function () {
                testWidget.onChange(value, topicMock);

                expect(testWidget.currentType).toEqual(value);
            });
            it('set the localStorage.coordType', function () {
                testWidget.onChange(AGRC.coordTypes.utm83, topicMock);

                expect(localStorage.coordType).toEqual(AGRC.coordTypes.utm83);
            });
        });
    });
});
