require(['react-app/config', 'app/Domains', 'dojo/dom-construct'], function (
  config,
  Domains,

  domConstruct
) {
  // TODO: remove once this module is converted to a component
  config = config.default;

  describe('app/Domains', function () {
    var values = [
      {
        name: 'blah',
        code: 'blah',
      },
      {
        name: 'blah',
        code: 'blah',
      },
    ];
    var select;
    beforeEach(function () {
      select = domConstruct.create('select');
    });
    describe('populateSelectWithDomainValues', function () {
      it('wires up a listener for when the other option is selected', function () {
        spyOn(Domains, 'getCodedValues').and.returnValue({
          then: function (cb) {
            cb();
          },
        });
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
      it('sets the value from tempValue if any', function () {
        var value = 'blah';
        select.dataset[config.tempValueKey] = value;

        Domains.buildOptions(values, select);

        expect(select.value).toBe(value);
      });
      it('creates other option from tempValue if appropriate', function () {
        var value = 'foo';
        select.dataset[config.tempValueKey] = value;

        Domains.buildOptions(values, select);

        expect(select.children[4].innerHTML).toBe(value);
        expect(select.value).toBe(value);
      });
    });
  });
});
