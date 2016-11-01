define([
    'agrc/modules/Domains',

    'app/config',
    'app/OtherOptionHandler',

    'dojo/dom-construct',
    'dojo/_base/array'
], function (
    agrcDomains,

    config,
    OtherOptionHandler,

    domConstruct,
    array
) {
    // summary:
    //      Used to feed options to comboboxes
    return {
        otherTxt: '[other]',
        _errMsgs: agrcDomains._errMsgs,
        populateSelectWithDomainValues: function (select, featureServiceUrl, fieldName) {
            // summary:
            //      Adds a listener for the other option being selected
            console.log('app/Domains:populateSelectWithDomainValues', arguments);

            var that = this;
            $(select).on('change', function (evt) {
                if (evt.target.value === that.otherTxt) {
                    that.onOtherSelected(evt.target);
                }
            });

            return agrcDomains.populateSelectWithDomainValues
                .apply(this, [select, featureServiceUrl, fieldName]);
        },
        buildOptions: function (values, select) {
            // summary:
            //      Add an extra option at the bottom called other
            console.log('app/Domains:buildOptions', arguments);
            agrcDomains.buildOptions(values, select);

            domConstruct.create('option', {
                value: this.otherTxt,
                innerHTML: this.otherTxt
            }, select);

            var tempValue = select.dataset[config.tempValueKey]
            if (tempValue) {
                var isExistingOption = values.some(function checkTemp(val) {
                    return val.code === tempValue;
                });
                if (!isExistingOption) {
                    domConstruct.create('option', {
                        value: tempValue,
                        innerHTML: tempValue
                    }, select);
                }

                select.value = tempValue;
            }
        },
        getCodedValues: agrcDomains.getCodedValues,
        onOtherSelected: function (select) {
            // summary:
            //      fires when a select is changed to the "other" option
            console.log('app/Domains:onOtherSelected', arguments);

            var existingOptions = [];

            array.forEach(select.children, function (option) {
                if (option.value !== '' && option.value !== this.otherTxt) {
                    existingOptions.push({
                        code: option.value,
                        name: option.innerHTML
                    });
                }
            }, this);

            var ooh = new OtherOptionHandler({
                existingOptions: existingOptions,
                otherTxt: this.otherTxt
            }, domConstruct.create('div', null, document.body));
            ooh.startup();

            ooh.on('add-new-value', function (newValue) {
                domConstruct.create('option', {
                    innerHTML: newValue.name,
                    value: newValue.code
                }, select);
                select.value = newValue.code;

                $(select).combobox('refresh');
            });
        }
    };
});
