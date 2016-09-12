require([
    'app/config',
    'app/method/RaftBoat',

    'dojo/dom-construct',
    'dojo/topic'
],

function (
    config,
    RaftBoat,

    domConstruct,
    topic
) {
    describe('app/method/RaftBoat', function () {
        var testWidget;
        beforeEach(function () {
            testWidget = new RaftBoat();
            testWidget.startup();
        });
        afterEach(function () {
            testWidget = null;
        });
        it('create a valid object', function () {
            expect(testWidget).toEqual(jasmine.any(RaftBoat));
        });
        describe('wireEvents', function () {
            it('wires the cathode type change topic', function () {
                var fired = false;
                topic.subscribe(AGRC.topics.onCathodeTypeChange, function () {
                    fired = true;
                });
                $(testWidget.cathodeTypeSelect).trigger('change');

                expect(fired).toBe(true);
            });
        });
        describe('getData', function () {
            it('returns numeric value for netters', function () {
                testWidget.numberTxt.value = '3';
                var div = domConstruct.create('div', {
                    className: 'active'
                }, document.body);
                domConstruct.place(testWidget.domNode, div);

                expect(testWidget.getData()[config.fieldNames.raftsboats.NUM_NETTERS]).toBe(3);
            });
        });
    });
});
