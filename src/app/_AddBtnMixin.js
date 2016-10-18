define([
    'app/config',
    'app/Domains',
    'app/helpers',

    'dojo/dom-class',
    'dojo/on',
    'dojo/promise/all',
    'dojo/_base/array',
    'dojo/_base/declare',

    'localforage'
], function (
    config,
    Domains,
    helpers,

    domClass,
    on,
    all,
    array,
    declare,

    localforage
) {
    return declare(null, {
        // minusIconClass: String
        //      bootstrap icon class
        minusIconClass: 'glyphicon-minus',

        // plusIconClass: String
        //      bootstrap icon class
        plusIconClass: 'glyphicon-plus',

        // container: _MultipleWidgetsWithAddBtnMixin
        //      a pointer to the parent container of this widget
        //      set in post create or addAddBtnWidget of parent container
        container: null,

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


        postCreate: function () {
            // summary:
            //      dom is ready
            console.log('app/_AddBtnMixin:postCreate', arguments);

            var that = this;
            var defs = [];
            array.forEach(this.fields, function (fld) {
                if (fld.control.type === 'select-one') {
                    defs.push(Domains.populateSelectWithDomainValues(fld.control,
                        that.featureServiceUrl, fld.fieldName));
                }
            });

            all(defs).then(function () {
                $(that.domNode).find('select').combobox();
            });

            this.wireEvents();
        },
        wireEvents: function () {
            // summary:
            //      wires the events for this widget
            console.log('app/_AddBtnMixin:wireEvents', arguments);
            var that = this;

            this.own(
                on(this.btn, 'click', function () {
                    if (domClass.contains(that.icon, that.plusIconClass)) {
                        that.onAdd();
                    } else {
                        that.onRemove();
                    }
                })
            );
        },
        clearValues: function () {
            // summary:
            //      overridden from _ClearValuesMixin to take care of changing the icon back
            console.log('app._AddBtnMixin:clearValues', arguments);

            this.toggleButton(false);

            this.inherited(arguments);
        },
        toggleButton: function (minus) {
            // summary:
            //      toggles the button between plus and minus symbols
            // minus: Boolean
            console.log('app/_AddBtnMixin:toggleButton', arguments);

            if (minus) {
                domClass.add(this.icon, this.minusIconClass);
                domClass.remove(this.icon, this.plusIconClass);
            } else {
                domClass.remove(this.icon, this.minusIconClass);
                domClass.add(this.icon, this.plusIconClass);
            }
        },
        onAdd: function () {
            // summary:
            //      description
            console.log('app/_AddBtnMixin:onAdd', arguments);
        },
        onRemove: function () {
            // summary:
            //      description
            console.log('app/_AddBtnMixin:onRemove', arguments);

            this.destroyRecursive(false);

            localforage.removeItem(this.cacheId);
        },
        getData: function () {
            // summary:
            //      gathers the data for this widget and returns an object
            //      if all fields are blank, then it returns null
            console.log('app/_AddBtnMixin:getData', arguments);

            var data = {};

            array.forEach(this.fields, function (fld) {
                data[fld.fieldName] = (fld.control.type === 'number') ?
                    helpers.getNumericValue(fld.control.value) : fld.control.value;
            });

            var empty = true;
            for (var prop in data) {
                if (data.hasOwnProperty(prop)) {
                    if (data[prop] !== null && data[prop] !== '') {
                        empty = false;
                        break;
                    }
                }
            }

            if (empty) {
                return null;
            } else {
                return this.addConstantValues(data);
            }
        },
        setData: function (feature, lastOne) {
            // summary:
            //      pre-populates controls with data
            // feature: {attributes{...}}
            // lastOne: Boolean
            //      controls whether the plus or minus icons are show
            console.log('app/_AddBtnMixin:setData', arguments);

            var that = this;
            var getControl = function (fieldName) {
                var control;
                array.some(that.fields, function (fld) {
                    if (fld.fieldName === fieldName) {
                        control = fld.control;
                        return false;
                    }
                });
                return control;
            };
            for (var fn in feature.attributes) {
                if (fn !== config.fieldNames.tags.FISH_ID) {
                    var control = getControl(fn);
                    control.value = feature.attributes[fn];
                    if (control.type === 'select-one') {
                        $(control).combobox('refresh');
                    }
                } else {
                    this.container.currentFishId = feature.attributes[fn];
                }
            }

            if (!lastOne) {
                domClass.add(this.icon, this.minusIconClass);
                domClass.remove(this.icon, this.plusIconClass);
            }
        },
        addConstantValues: function (/* data */) {
            // summary:
            //      needs to be implemented in child object
            // data: {}
            console.log('app/_AddBtnMixin:addConstantValues', arguments);
        }
    });
});
