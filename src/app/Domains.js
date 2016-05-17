define([
    'dojo/_base/window',

    'agrc/modules/Domains',

    'dojo/dom-construct',

    'app/OtherOptionHandler'
], function(
    win,

    agrcDomains,

    domConstruct,

    OtherOptionHandler
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
        },
        getCodedValues: agrcDomains.getCodedValues,
        onOtherSelected: function (select) {
            // summary:
            //      fires when a select is changed to the "other" option
            console.log('app/Domains:onOtherSelected', arguments);
        
            var ooh = new OtherOptionHandler({
                select: select,
                otherTxt: this.otherTxt
            }, domConstruct.create('div', null, win.body()));
            ooh.startup();
        }
    };
});