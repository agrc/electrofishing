define([
    'agrc/modules/Domains',

    'app/Domains',
    'app/OtherOptionHandler',

    'dijit/form/FilteringSelect',

    'dojo/dom-construct',
    'dojo/store/Memory',
    'dojo/topic',
    'dojo/_base/array',
    'dojo/_base/declare'
], function (
    Domains,

    appDomains,
    OtherOptionHandler,

    FilteringSelect,

    domConstruct,
    Memory,
    topic,
    array,
    declare
) {
    return declare([FilteringSelect], {
        searchAttr: 'name',
        labelAttr: 'name',
        postCreate: function () {
            // summary:
            //      description
            // param or return
            console.log('app/catch/FilteringSelectForGrid:postCreate', arguments);

            var that = this;
            Domains.getCodedValues(this.domainLayerUrl, this.domainFieldName).then(function (values) {
                // add "other" option
                values.push({
                    name: appDomains.otherTxt,
                    code: appDomains.otherTxt
                });

                that.store = new Memory({
                    data: values,
                    idProperty: 'code'
                });

                that.set('store', that.store);
            });

            this.on('change', function () {
                var parentElement = that.domNode.parentElement;
                var refocus = function () {
                    topic.publish('refocus', parentElement);
                };
                if (that.get('value') === appDomains.otherTxt) {
                    var otherOptionHandler = new OtherOptionHandler({
                        existingOptions: that.store.query(function (d) {
                            return d.code !== appDomains.otherTxt;
                        }),
                        otherTxt: appDomains.otherTxt
                    }, domConstruct.create('div', null, document.body));
                    otherOptionHandler.startup();
                    otherOptionHandler.on('add-new-value', function (newValue) {
                        refocus();
                        that.store.data.push({
                            name: newValue.name,
                            code: newValue.code
                        });
                        that.set('value', newValue.code);
                    });
                    otherOptionHandler.on('cancel', function () {
                        refocus();
                        that.set('value', '');
                    });
                }
            });

            this.inherited(arguments);
        }
    });
});
