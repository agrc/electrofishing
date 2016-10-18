define([
    'app/config',
    'app/method/Equipment',
    'app/_AddBtnMixin',
    'app/_ClearValuesMixin',
    'app/_MultipleWidgetsWithAddBtnMixin',

    'dijit/_TemplatedMixin',
    'dijit/_WidgetBase',

    'dojo/text!app/method/templates/Method.html',
    'dojo/_base/declare',

    'bootstrap-combobox/js/bootstrap-combobox'
], function (
    config,
    Equipment,
    _AddBtnMixin,
    _ClearValuesMixin,
    _MultipleWidgetsWithAddBtnMixin,

    _TemplatedMixin,
    _WidgetBase,

    template,
    declare
) {
    return declare([_WidgetBase, _TemplatedMixin, _MultipleWidgetsWithAddBtnMixin], {
        templateString: template,
        baseClass: 'method',

        // cacheId: String
        //      used to build cacheId's in _MultipleWidgetsWithAddBtnMixin
        cacheId: 'app/method',

        constructor: function () {
            // summary:
            //      description
            // param or return
            console.log('app/method/Method:constructor', arguments);

            this.AddBtnWidgetClass = Equipment;
        },
        isValid: function () {
            // summary:
            //      description
            console.log('app/method/Method:isValid', arguments);

            return this.addBtnWidgets.map(function checkValid(widget) {
                return widget.isValid();
            }).reduce(function (previous, current) {
                if (previous === true) {
                    return current;
                } else {
                    return previous;
                }
            });
        }
    });
});
