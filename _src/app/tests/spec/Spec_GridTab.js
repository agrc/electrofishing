require([
    'app/GridTab',

    'dojo/dom-construct',
    'dojo/query'
], function (
    GridTab,

    domConstruct,
    query
) {
    describe('app/GridTab', function () {
        var testWidget;
        var destroy = function (widget) {
            widget.destroyRecursive();
            widget = null;
        };
        beforeEach(function () {
            testWidget = new GridTab({}, domConstruct.create('div', {}, document.body));
            testWidget.startup();
        });
        afterEach(function () {
            destroy(testWidget);
        });

        it('create a valid object', function () {
            expect(testWidget).toEqual(jasmine.any(GridTab));
        });

        describe('addTab', function () {
            it('adds a new tab button', function () {
                var origTab = testWidget.currentTab;

                testWidget.addTab();

                expect(query('div[data-dojo-attach-point="tabBtnContainer"] .btn', testWidget.domNode).length).toBe(2);
                expect(testWidget.currentTab).toEqual(origTab + 1);
            });
            it('calls changeTab on the newly created button', function () {
                spyOn(testWidget, 'changeTab');

                testWidget.addTab();

                expect(testWidget.changeTab.calls.mostRecent().args[0].target.innerText).toBe('2');
            });
            it('adds the correct number even if the tab with the highest number isnt selected', function () {
                spyOn(testWidget, 'changeTab');

                testWidget.addTab();

                testWidget.currentTab = 1;

                testWidget.addTab();

                expect(testWidget.changeTab.calls.mostRecent().args[0].target.innerText).toBe('3');
            });
        });

        describe('changeTab', function () {
            var e = {
                target: {innerText: '2'}
            };
            it('updates the current tab', function () {
                testWidget.changeTab(e);

                expect(testWidget.currentTab).toBe(2);
            });
        });
        describe('getNumberOfTabs', function () {
            it('returns the correct number of tabs', function () {
                expect(testWidget.getNumberOfTabs()).toEqual(1);

                testWidget.addTab();
                testWidget.addTab();

                expect(testWidget.getNumberOfTabs()).toEqual(3);
            });
        });
    });
});
