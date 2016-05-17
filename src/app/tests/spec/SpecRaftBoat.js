require([
    'app/method/RaftBoat',
    'dojo/topic'
],

function (
    RaftBoat,
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
    });
});
