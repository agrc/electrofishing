require([
    'app/method/Backpack',
    'dojo/dom-construct'

],

function (
    Backpack,
    domConstruct
    ) {
    describe('app/method/Backpack', function () {
        var testWidget;
        beforeEach(function () {
            testWidget = new Backpack();
        });
        afterEach(function () {
            testWidget = null;
        });
        it('create a valid object', function () {
            expect(testWidget).toEqual(jasmine.any(Backpack));
        });
        describe('getData', function () {
            it('returns a data object', function () {
                var model = 'blah';
                var shape = 'blah2';
                AGRC.app = {newEvent: {eventId: 'blah'}};

                function populateSelect(select, value) {
                    domConstruct.create('option', {value: value}, select);
                    select.value = value;
                }

                populateSelect(testWidget.modelSelect, model);
                populateSelect(testWidget.anodeShapeSelect, shape);

                var data = testWidget.getData().attributes;
                var fn = AGRC.fieldNames.backpacks;

                expect(data[fn.EVENT_ID]).toEqual(AGRC.eventId);
            });
            it('returns null if all fields are blank', function () {
                expect(testWidget.getData()).toBeNull();
            });
        });
    });
});
