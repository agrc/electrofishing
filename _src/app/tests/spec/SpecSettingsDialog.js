require([
    'react-app/config',

    'dojo/dom-construct',

    'stubmodule'
], function (
    config,

    domConstruct,

    stubmodule
) {
    // TODO: remove once this module is converted to a component
    config = config.default;

    describe('app/SettingsDialog', function () {
        var testWidget;
        var topicMock;
        var value = config.coordTypes.utm27;
        var destroy = function (widget) {
            widget.destroyRecursive();
            widget = null;
        };

        // this is to prevent global topics from firing in other tests
        var oldTopic = config.topics.coordTypeToggle_onChange;
        beforeEach(function (done) {
            config.topics.coordTypeToggle_onChange = 'blah';
            topicMock = {
                publishSync: jasmine.createSpy('publish'),
                subscribe: jasmine.createSpy('subscribe')
            };
            stubmodule('app/SettingsDialog', {
                'pubsub-js': topicMock
            }).then(function (StubbedModule) {
                testWidget = new StubbedModule({}, domConstruct.create('div', {}, document.body));
                done();
            });

            localStorage.removeItem('coordType');
        });
        afterEach(function () {
            destroy(testWidget);
            config.topics.coordTypeToggle_onChange = oldTopic;
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
                spyOn(testWidget, 'onCoordTypeChange');

                testWidget.postCreate();

                expect(testWidget.onCoordTypeChange.calls.mostRecent().args[0])
                    .toEqual(config.coordTypes.utm83);
            });
            it('sets the current type to equal the localstorage value if there is one', function () {
                localStorage.coordType = config.coordTypes.utm27;

                testWidget.postCreate();

                expect(testWidget.currentType).toEqual(config.coordTypes.utm27);
            });
        });
        describe('wireEvents', function () {
            it('should wire onCoordTypeChange event to buttons', function () {
                spyOn(testWidget, 'onCoordTypeChange');

                testWidget.coord_utm83Btn.click();
                testWidget.coord_llBtn.click();
                testWidget.coord_utm27Btn.click();

                expect(testWidget.onCoordTypeChange.calls.count()).toEqual(3);
            });
            it('should pass the appropriate config.coordTypes to onCoordTypeChange', function () {
                spyOn(testWidget, 'onCoordTypeChange');

                testWidget.wireEvents();

                testWidget.coord_utm83Btn.click();
                expect(testWidget.onCoordTypeChange.calls.mostRecent().args[0]).toEqual(config.coordTypes.utm83);
                testWidget.coord_utm27Btn.click();
                expect(testWidget.onCoordTypeChange.calls.mostRecent().args[0]).toEqual(config.coordTypes.utm27);
                testWidget.coord_llBtn.click();
                expect(testWidget.onCoordTypeChange.calls.mostRecent().args[0]).toEqual(config.coordTypes.ll);
            });
        });
        describe('onCoordTypeChange', function () {
            it('should call topic.publish with correct topic from config', function () {
                testWidget.onCoordTypeChange(value);

                expect(topicMock.publishSync.calls.mostRecent().args[1]).toEqual(value);
                expect(topicMock.publishSync.calls.mostRecent().args[0])
                    .toEqual(config.topics.coordTypeToggle_onChange);
            });
            it('should set the currentType property', function () {
                testWidget.onCoordTypeChange(value);

                expect(testWidget.currentType).toEqual(value);
            });
            it('set the localStorage.coordType', function () {
                testWidget.onCoordTypeChange(config.coordTypes.utm83);

                expect(localStorage.coordType).toEqual(config.coordTypes.utm83);
            });
        });
    });
});
