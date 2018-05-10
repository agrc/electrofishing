define([
    'dojo/on',
    'dojo/query',
    'dojo/_base/declare'
], function (
    on,
    query,
    declare
) {
    // summary:
    //      Mixin to add a method to clear all form values.
    return declare(null, {
        clearValue: function (node) {
            // summary:
            //      clears the input values for this widget
            console.log('app/_ClearValuesMixin:clearValue', arguments);

            var combobox = $(node).data('combobox');
            if (combobox) {
                combobox.clearTarget();
                combobox.clearElement();

                return;
            }

            node.value = null;

            // fire onchange for inputs involved with NumericInputValidator
            on.emit(node, 'change', {bubbles: false});
        },
        clearValues: function () {
            // summary:
            //      clears the input values for this widget
            console.log('app/_ClearValuesMixin:clearValues', arguments);

            query('select', this.domNode).forEach(this.clearValue);
            query('input[type="number"], input[type="text"]', this.domNode).forEach(this.clearValue);
        }
    });
});
