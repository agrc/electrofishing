define(['app/Domains', 'dojo/promise/all', 'dojo/_base/array', 'dojo/_base/declare'], function (
  Domains,

  all,
  array,
  declare
) {
  return declare(null, {
    // featureServiceUrl: String
    //      used to populate selects with associated coded domains
    featureServiceUrl: null,

    // fields: Object[]
    //      config for the mapping between controls and fields
    //      set in constructor so that we have access to config.fieldNames
    // [{
    //     control: '',
    //     fieldName: ''
    // }]
    fields: null,

    populateSelects: function () {
      // summary:
      //      dom is ready
      console.log('app/_SelectPopulate:populateSelects', arguments);

      var that = this;
      var defs = [];
      array.forEach(this.fields, function (fld) {
        if (fld.control.type === 'select-one') {
          defs.push(Domains.populateSelectWithDomainValues(fld.control, that.featureServiceUrl, fld.fieldName));
        }
      });

      all(defs).then(function () {
        $(that.domNode).find('select').combobox();
      });
    },
  });
});
