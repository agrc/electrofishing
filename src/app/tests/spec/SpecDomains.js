require([
    'app/Domains',

    'dojo/dom-construct'

], function (
    Domains,

    domConstruct
) {
    describe('app/Domains', function () {
        var values = [
            {
                name: 'blah',
                code: 'blah'
            },{
                name: 'blah',
                code: 'blah'
            }
        ];
        var select;
        beforeEach(function () {
            select = domConstruct.create('select');
        });
        describe('populateSelectWithDomainValues', function () {
            it('wires up a listener for when the other option is selected', function () {
                spyOn(Domains, 'getCodedValues').and.returnValue({then: function (cb) {
                    cb();
                }});
                Domains.populateSelectWithDomainValues(select, 'blah', 'blah');
                spyOn(Domains, 'onOtherSelected');

                $(select).trigger('change');

                expect(Domains.onOtherSelected).not.toHaveBeenCalled();

                select.value = Domains.otherTxt;
                $(select).trigger('change');

                expect(Domains.onOtherSelected).toHaveBeenCalled();
            });
        });
        describe('buildOptions', function () {
            it('should build an "other" option', function () {
                Domains.buildOptions(values, select);

                expect(select.children.length).toBe(4);
                expect(select.children[3].innerHTML).toEqual(Domains.otherTxt);
            });
        });
    });
});
