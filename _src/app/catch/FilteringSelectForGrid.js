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
        otherOptionHandler: null,


        // params pass via constructor

        // domainFieldName: String
        //      the name of the field to get the domain values from
        domainFieldName: null,

        // domainLayerUrl: String
        //      URL to the feature service for the layer associated with this field
        domainLayerUrl: null,

        // parentId: String
        //      the id of the widget that this widget is a child of
        //      used in the refocus method
        parentId: null,

        // columnIndex: Number
        //      the index of the column within the grid
        columnIndex: null,

        postCreate: function () {
            // summary:
            //      description
            // param or return
            console.log('app/catch/FilteringSelectForGrid:postCreate', arguments);

            Domains.getCodedValues(this.domainLayerUrl, this.domainFieldName).then((values) => {
                // add "other" option
                values.push({
                    name: appDomains.otherTxt,
                    code: appDomains.otherTxt
                });

                this.store = new Memory({
                    data: values,
                    idProperty: 'code'
                });

                this.set('store', this.store);
            });

            this.on('change', () => {
                if (this.otherOptionHandler) {
                    // don't create to dialogs
                    return;
                }

                if (this.get('value') === appDomains.otherTxt) {
                    this.otherOptionHandler = new OtherOptionHandler({
                        existingOptions: this.store.query(function (d) {
                            return d.code !== appDomains.otherTxt;
                        }).map(item => item.code),
                        otherTxt: appDomains.otherTxt
                    }, domConstruct.create('div', null, document.body));
                    this.otherOptionHandler.startup();
                    this.otherOptionHandler.on('add-new-value', (event) => {
                        this.refocusGridCell();
                        var item = {
                            name: event.code,
                            code: event.code
                        };
                        this.store.put(item);
                        this.set('value', item.code);
                        this.destroyOtherOptionHandler();
                    });
                    this.otherOptionHandler.on('cancel', () => {
                        this.refocusGridCell();
                        this.set('value', '');
                        this.destroyOtherOptionHandler();
                    });
                }
            });

            this.inherited(arguments);
        },

        refocusGridCell: function () {
            // summary:
            //      refocus puts the focus back in the appropriate grid cell after
            //      it is lost when the OtherOptionsHandler dialog opens
            console.log('app/catch/FilteringSelect:refocusGridCell', arguments);

            topic.publish(`refocus_${this.parentId}`, this.columnIndex);
        },

        destroyOtherOptionHandler: function () {
            // summary:
            //      destroys the widget and reference to it
            // param or return
            console.log('app/catch/FilteringSelect:destroyOtherOptionHandler', arguments);

            this.otherOptionHandler.destroy();
            this.otherOptionHandler = null;
        }
    });
});
