require([
    'app/catch/TagsContainer',
    'dojo/dom-construct',
    'dojo/_base/window'

],

function (
    TagsContainer,
    domConstruct,
    win
    ) {
    describe('app/catch/TagsContainer', function () {
        var testWidget;
        var destroy = function (widget) {
            widget.destroyRecursive();
            widget = null;
        };
        beforeEach(function () {
            testWidget = new TagsContainer({}, domConstruct.create('div', {}, win.body()));
            testWidget.startup();
        });
        afterEach(function () {
            destroy(testWidget);
        });
        it('create a valid object', function () {
            expect(testWidget).toEqual(jasmine.any(TagsContainer));
        });
        describe('getData', function () {
            it('should get data from all tags', function () {
                testWidget.addAddBtnWidget();

                spyOn(testWidget.AddBtnWidgets[0], 'getData').and.returnValue({});
                spyOn(testWidget.AddBtnWidgets[1], 'getData').and.returnValue({});

                var data = testWidget.getData();

                expect(data.displayFieldName).toEqual('');
                expect(data.features.length).toEqual(2);
            });
        });
        describe('setData', function () {
            var data = [{}, {}];
            beforeEach(function () {
                spyOn(testWidget.AddBtnWidgets[0], 'setData');
            });
            it('creates the appropriate tag widgets', function () {
                testWidget.setData(data);

                expect(testWidget.AddBtnWidgets[0].setData).toHaveBeenCalledWith(data[0]);
                expect(testWidget.AddBtnWidgets.length).toBe(2);
            });
            it('passes the appropriate values for lastOne to setData', function () {
                var setDataSpy = jasmine.createSpy('setData');
                spyOn(testWidget, 'addAddBtnWidget').and.returnValue({
                    setData: setDataSpy
                });

                testWidget.setData(data);

                expect(setDataSpy).toHaveBeenCalledWith(data[1], true);
            });
        });
    });
});
