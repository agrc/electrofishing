define([
    'dojo/_base/declare',
    'dojo/query',
    'dojo/on'

],

function (
    declare,
    query,
    on
    ) {
    // summary:
    //      Mixin to add a method to clear all form values.
    return declare('app/_ClearValuesMixin', null, {
        clearValues: function () {
            // summary:
            //      clears the input values for this widget
            console.log(this.declaredClass + '::clearValues', arguments);

            query('select', this.domNode).forEach(function (node) {
                $(node).combobox('clear');
            });
            query('input[type="number"], input[type="text"]', this.domNode).forEach(function (node) {
                node.value = null;

                // fire onchange for inputs involved with NumericInputValidator
                on.emit(node, 'change', {bubbles: false});
            });
        }
    });
});
