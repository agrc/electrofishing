define([
    'dijit/registry',
    'dijit/_TemplatedMixin',
    'dijit/_WidgetBase',
    'dijit/_WidgetsInTemplateMixin',

    'dojo/dom-construct',
    'dojo/text!./templates/OtherOptionHandler.html',
    'dojo/_base/array',
    'dojo/_base/declare',
    'dojo/_base/lang'
], function (
    registry,
    _TemplatedMixin,
    _WidgetBase,
    _WidgetsInTemplateMixin,

    domConstruct,
    template,
    array,
    declare,
    lang
) {
    // summary:
    //      A dialog that shows when a user selects the "other" option in a dropdown.
    //      It shows existing options and give the user the ability to create a new one.
    //      It then updates the corresponding combobox.
    return declare([_WidgetBase, _TemplatedMixin, _WidgetsInTemplateMixin], {
        widgetsInTemplate: true,
        templateString: template,
        baseClass: 'other-option-handler',


        // options pass in via the constructor

        // existingOptions: String[]
        //      The existing options
        existingOptions: null,

        // otherTxt: String
        //      The other txt from Domains
        otherTxt: null,

        postCreate: function () {
            // summary:
            //      set up widget
            console.log('app/OtherOptionHandler:postCreate', arguments);

            this.existingOptions.forEach(function (option) {
                if (option.code !== '' && option.code !== this.otherTxt) {
                    var txt = option.name + ' (' + option.code + ')';
                    domConstruct.create('li', {innerHTML: txt}, this.existingOptionsList);
                }
            }, this);
        },
        startup: function () {
            // summary:
            //      shows the dialog
            console.log('app/OtherOptionHandler:startup', arguments);

            $(this.modal).modal('show');

            setTimeout(lang.hitch(this.codeTxt, 'focus'), 200);

            this.inherited(arguments);
        },
        onSubmit: function () {
            // summary:
            //      fires when the submit button is clicked
            console.log('app/OtherOptionHandler:onSubmit', arguments);

            $(this.modal).modal('hide');

            this.emit('add-new-value', {
                name: this.descTxt.value,
                code: this.codeTxt.value
            });
        },
        onCancel: function () {
            // summary:
            //      user has clicked the close button
            // param or return
            console.log('app/OtherOptionHandler:onCancel', arguments);

        },
        onTxtChange: function () {
            // summary:
            //      sets the disabled state of the submit button
            console.log('app/OtherOptionHandler:onTxtChange', arguments);

            this.submitBtn.disabled = !(this.codeTxt.value.length > 0 && this.descTxt.value.length > 0);
        },
        destroyRecursive: function () {
            // summary:
            //      clean up
            console.log('app/OtherOptionHandler:destroyRecursive', arguments);

            domConstruct.destroy(this.modal);

            this.inherited(arguments);
        }
    });
});
