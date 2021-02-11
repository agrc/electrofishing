define([
  'react-app/config',
  'app/Domains',
  'app/helpers',
  'app/_ClearValuesMixin',

  'dijit/_TemplatedMixin',
  'dijit/_WidgetBase',

  'dojo/promise/all',
  'dojo/text!app/catch/templates/Health.html',
  'dojo/_base/array',
  'dojo/_base/declare',
], function (
  config,
  Domains,
  helpers,
  _ClearValuesMixin,

  _TemplatedMixin,
  _WidgetBase,

  all,
  template,
  array,
  declare
) {
  // TODO: remove once this module is converted to a component
  config = config.default;

  // summary:
  //      Health fields in more info dialog.
  return declare([_WidgetBase, _TemplatedMixin, _ClearValuesMixin], {
    templateString: template,
    baseClass: 'health',

    // currentFishId: String (guid)
    //      the guid corresponding to the currently selected fish in the catch grid
    currentFishId: null,

    // controlMappings: [][]
    //      sets up association between controls and field names
    controlMappings: null,

    postCreate: function () {
      // summary:
      //      dom is ready
      console.log(this.declaredClass + '::postCreate', arguments);

      var fn = config.fieldNames.health;

      // initialize mappings property
      this.controlMappings = [
        [this.eyeConditionSelect, fn.EYE],
        [this.gillConditionSelect, fn.GILL],
        [this.pseudoConditionSelect, fn.PSBR],
        [this.thymusConditionSelect, fn.THYMUS],
        [this.fatSelect, fn.FAT],
        [this.spleenConditionSelect, fn.SPLEEN],
        [this.hindGutConditionSelect, fn.HIND],
        [this.kidneyConditionSelect, fn.KIDNEY],
        [this.liverConditionSelect, fn.LIVER],
        [this.bileConditionSelect, fn.BILE],
        [this.genderSelect, fn.GENDER],
        [this.reproductiveConditionSelect, fn.REPRODUCTIVE],
        [this.hematocritTxt, fn.HEMATOCRIT],
        [this.leukocritTxt, fn.LEUKOCRIT],
        [this.plasmaTxt, fn.PLPRO],
        [this.finConditionSelect, fn.FIN],
        [this.opercleConditionSelect, fn.OPERCLE],
      ];

      var url = config.urls.healthFeatureService;
      var defs = [];

      array.forEach(this.controlMappings, function (map) {
        if (map[0].type === 'select-one') {
          defs.push(Domains.populateSelectWithDomainValues(map[0], url, map[1]));
        }
      });

      all(defs).then(function () {
        $('.health select').combobox();
      });

      this.inherited(arguments);
    },
    getData: function (controlMappings) {
      // summary:
      //      builds a record set
      console.log(this.declaredClass + '::getData', arguments);

      var f = {};
      var mappings = this.controlMappings;
      if (controlMappings) {
        mappings = this.controlMappings.concat(controlMappings);
      }

      array.forEach(mappings, function (map) {
        var control = map[0];
        f[map[1]] = control.type === 'number' ? helpers.getNumericValue(control.value) : control.value;
      });

      var empty = true;
      for (var prop in f) {
        if (f.hasOwnProperty(prop)) {
          if (f[prop] !== null && f[prop] !== '') {
            empty = false;
            break;
          }
        }
      }

      if (empty) {
        return null;
      }
      f[config.fieldNames.health.FISH_ID] = this.currentFishId;

      return f;
    },
    setData: function (feature, controlMappings) {
      // summary:
      //      prepopulates the controls with existing data
      // feature: {}
      console.log('app.catch.Health:setData', arguments);

      var f = feature;

      var mappings = this.controlMappings;
      if (controlMappings) {
        mappings = this.controlMappings.concat(controlMappings);
      }

      array.forEach(mappings, function (map) {
        map[0].value = f[map[1]];
        if (map[0].type === 'select-one') {
          $(map[0]).combobox('refresh');
        }
      });
    },
  });
});
