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
        clearValues: function () {
            // summary:
            //      clears the input values for this widget
            console.log('app/_ClearValuesMixin:clearValues', arguments);

            query('select', this.domNode).forEach(function (node) {
                var combobox = $(node).data('combobox');
                if (!combobox) {
                    return
                }

                combobox.clearTarget();
                combobox.clearElement();
            });
            query('input[type="number"], input[type="text"]', this.domNode).forEach(function (node) {
                node.value = null;

                // fire onchange for inputs involved with NumericInputValidator
                on.emit(node, 'change', {bubbles: false});
            });
        }
    });
});
