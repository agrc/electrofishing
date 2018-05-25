define([
    'agrc/modules/Domains',

    'app/config',
    'app/OtherOptionHandler',

    'dojo/dom-construct'
], function (
    agrcDomains,

    config,
    OtherOptionHandler,

    domConstruct
) {
    // summary:
    //      Used to feed options to comboboxes
    return {
        otherTxt: '[other]',
        _errMsgs: agrcDomains._errMsgs,
        responses: {},
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

            var tempValue = select.dataset[config.tempValueKey];
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
        makeRequest: agrcDomains.makeRequest,
        onOtherSelected: function (select) {
            // summary:
            //      fires when a select is changed to the "other" option
            console.log('app/Domains:onOtherSelected', arguments);

            var existingOptions = Array.from(select.children).map(option => option.value);

            var ooh = new OtherOptionHandler({
                existingOptions,
                otherTxt: this.otherTxt
            }, domConstruct.create('div', null, document.body));
            ooh.startup();

            ooh.on('add-new-value', function (event) {
                domConstruct.create('option', {
                    innerHTML: event.code,
                    value: event.code
                }, select);
                select.value = event.code;

                $(select).combobox('refresh');
            });
        }
    };
});
