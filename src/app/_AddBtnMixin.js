define([
    './_SelectPopulate',
    'app/helpers',

    'dojo/dom-class',
    'dojo/on',
    'dojo/_base/array',
    'dojo/_base/declare'
], function (
    _SelectPopulate,
    helpers,

    domClass,
    on,
    array,
    declare
) {
    return declare([_SelectPopulate], {
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


        postCreate: function () {
            // summary:
            //      dom is ready
            console.log('app/_AddBtnMixin:postCreate', arguments);

            this.populateSelects();
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
        addConstantValues: function (/* data */) {
            // summary:
            //      needs to be implemented in child object
            // data: {}
            console.log('app/_AddBtnMixin:addConstantValues', arguments);
        }
    });
});
