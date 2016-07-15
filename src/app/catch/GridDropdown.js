define([
    'app/Domains',

    'dijit/focus',
    'dijit/_FocusMixin',
    'dijit/_TemplatedMixin',
    'dijit/_WidgetBase',

    'dojo/dom-style',
    'dojo/on',
    'dojo/query',
    'dojo/text!app/catch/templates/GridDropdown.html',
    'dojo/_base/declare',

    'bootstrap-combobox/js/bootstrap-combobox'
],

function (
    Domains,

    focusUtil,
    _FocusMixin,
    _TemplatedMixin,
    _WidgetBase,

    domStyle,
    on,
    query,
    template,
    declare
) {
    // summary:
    //      Dijit wrapper for bootstrap's GridDropdown so that it can be used in dgrid.
    return declare([_WidgetBase, _TemplatedMixin], {
        templateString: template,
        baseClass: 'griddropdown-wrapper',

        // textBox: input Element
        //      text box created by the combobox plugin
        //      this needs to be queried for dynamically after the
        //      combobox has been initialized since it's not part
        //      of the template
        textBox: null,


        // params passed into the constructor

        // width: Number
        //      The width of the textBox
        width: null,

        // domainFieldName: String
        //      The field that this widget is associated with.
        //      Used to get the domain values.
        domainFieldName: null,

        // domainLayerUrl: String
        //      The url to the associated layer's feature service
        domainLayerUrl: null,

        postCreate: function () {
            // summary:
            //      dom is ready
            console.log(this.declaredClass + '::postCreate', arguments);

            this.inherited(arguments);

            var that = this;
            var def = Domains.populateSelectWithDomainValues(this.select,
                this.domainLayerUrl, this.domainFieldName);

            def.then(function (values) {
                that.values = values;
                // init combobox
                $(that.select).combobox();
                that.textBox = query('.combobox-container input[type="text"]', that.domNode)[0];
                that.Btn = query('.combobox-container span.dropdown-toggle', that.domNode)[0];

                // this mess is all so that we don't loose focus of the dgrid cell
                // when clicking on the drop-down button
                var bx = $(that.select).data('combobox');
                that.own(
                    on(that.textBox, 'blur', function (evt) {
                        if (evt.relatedTarget !== that.domNode.parentElement) {
                            if (bx.mousedover && bx.shown) {
                                // mouse click on drop down
                                setTimeout(function () {
                                    that.delayBlur();
                                }, 201);
                            } else {
                                // tab out of box
                                that.delayBlur();
                            }
                        }
                    })
                );
            });
        },
        delayBlur: function () {
            // summary:
            //      delay the onBlur until the OtherOptionHandler widget is done
            //      doing it's thing
            console.log('app/GridDropdown:delayBlur', arguments);

            if (this.textBox.value !== Domains.otherTxt) {
                this._onBlur();
            }
        },
        focus: function () {
            // summary:
            //      dgrid/editor calls this
            console.log(this.declaredClass + '::focus::' + this.id, arguments);

            // manually focus the textbox
            // this is called when the user clicks in the dgrid cell
            if (this.textBox) {
                this.textBox.focus();
            }
        },
        isValid: function () {
            // summary:
            //      another method that it is called by dgrid/editor
            console.log(this.declaredClass + '::isValid::' + this.id, arguments);

            return true;
        },
        _getValueAttr: function () {
            // summary:
            //      another method that it is called by dgrid/editor
            console.log(this.declaredClass + '::getValueAttr::' + this.id, arguments);

            // return value of
            return this.textBox.value;
        },
        _setValueAttr: function (newValue) {
            // summary:
            //      another method that is called by dgrid/editor
            // newValue: String
            console.log(this.declaredClass + '::_setValueAttr', arguments);

            if (newValue) {
                this.textBox.value = newValue;
            }
        }
    });
});
