define([
    'agrc/modules/GUID',

    'app/catch/GridDropdown',
    'app/config',
    'app/_GridMixin',

    'dgrid/editor',

    'dijit/_TemplatedMixin',
    'dijit/_WidgetBase',
    'dijit/_WidgetsInTemplateMixin',

    'dojo/dom-class',
    'dojo/query',
    'dojo/text!app/catch/templates/MoreInfoDialog.html',
    'dojo/_base/declare',
    'dojo/_base/lang',

    './Health',
    'app/catch/TagsContainer'
],

function (
    GUID,

    GridDropdown,
    config,
    _GridMixin,

    editor,

    _TemplatedMixin,
    _WidgetBase,
    _WidgetsInTemplateMixin,

    domClass,
    query,
    template,
    declare,
    lang
) {
    // summary:
    //      Form for storing diet, tag and other fish stats.
    return declare('app/catch/MoreInfoDialog', [_WidgetBase, _TemplatedMixin, _WidgetsInTemplateMixin, _GridMixin], {
        widgetsInTemplate: true,
        templateString: template,
        baseClass: 'more-info-dialog',

        // skipNumber: Number
        //      required for _GridMixin
        skipNumber: 3,

        // lastColumn: String
        //      required for _GridMixin
        //      set in constructor
        lastColumn: null,

        // firstColumn: String
        //      required for _GridMixin
        //      set in constructor
        firstColumn: null,

        // idProperty: String
        //      required for _GridMixin
        idProperty: 'ID',

        // currentFishID: type
        //      description
        currentFishId: null,

        // dietData: {}
        //      object for storing the diet table
        dietData: null,

        // tagsData: {}
        //      object for storing the tags table
        tagsData: null,

        // healthData: {}
        //      object for storing the health table
        healthData: null,


        // properties passed in via the constructor

        // store: dojo/DataStore
        //      the grid's data store
        store: null,

        constructor: function () {
            // summary:
            //      description
            console.log(this.declaredClass + '::constructor', arguments);

            // initialize properties
            this.lastColumn = config.fieldNames.diet.MEASUREMENT;
            this.firstColumn = config.fieldNames.diet.CLASS;
            this.dietData = {};
            this.tagsData = {};
            this.healthData = {};
        },
        postCreate: function () {
            // summary:
            //      dom is ready
            console.log(this.declaredClass + '::postCreate', arguments);

            var columns = [
                {label: 'Catch ID', field: this.idProperty, sortable: false},
                {label: 'Fish ID', field: config.fieldNames.diet.FISH_ID, sortable: false},
                editor({
                    autoSave: true,
                    label: 'Class',
                    field: config.fieldNames.diet.CLASS,
                    editor: GridDropdown,
                    sortable: false,
                    editOn: 'dgrid-cellfocusin',
                    editorArgs: {
                        domainFieldName: config.fieldNames.diet.CLASS,
                        domainLayerUrl: config.urls.dietFeatureService
                    }
                }),
                editor({
                    autoSave: true,
                    label: 'Fish Species',
                    field: config.fieldNames.diet.FISH_SPECIES,
                    editor: GridDropdown,
                    sortable: false,
                    editOn: 'dgrid-cellfocusin',
                    editorArgs: {
                        domainFieldName: config.fieldNames.diet.FISH_SPECIES,
                        domainLayerUrl: config.urls.dietFeatureService
                    }
                }),
                editor({
                    autoSave: true,
                    label: 'Type',
                    field: config.fieldNames.diet.MEASUREMENT_TYPE,
                    editor: GridDropdown,
                    sortable: false,
                    editOn: 'dgrid-cellfocusin',
                    editorArgs: {
                        domainFieldName: config.fieldNames.diet.MEASUREMENT_TYPE,
                        domainLayerUrl: config.urls.dietFeatureService
                    }
                }),
                editor({
                    autoSave: true,
                    label: 'Measurement',
                    field: config.fieldNames.diet.MEASUREMENT,
                    editor: 'text',
                    sortable: false,
                    editOn: 'dgrid-cellfocusin',
                    editorArgs: {
                        'className': 'form-control dgrid-input'
                    }
                })
            ];

            this.initGrid(columns);

            $(this.dialog).on('hidden.bs.modal', lang.hitch(this, this.clearValues));

            this.inherited(arguments);
        },
        show: function (guid, tabName) {
            // summary:
            //      shows the dialog
            // guid: String
            //      The guid of the currently selected row
            // tabName: String
            //      The name of the tab that you want to show (i.e. 'Diet')
            console.log(this.declaredClass + '::show', arguments);

            // pre-populate dialog with existing data, if any
            this.currentFishId = guid;
            this.health.currentFishId = guid;
            if (this.healthData[guid]) {
                this.health.setData(this.healthData[guid][0]);
            }
            this.tagsContainer.currentFishId = guid;
            if (this.tagsData[guid]) {
                this.tagsContainer.setData(this.tagsData[guid]);
            }
            if (this.dietData[guid]) {
                this.setGridData(this.dietData[guid]);
            } else {
                this.addRow();
            }

            var item = this.store.get(guid);

            this.catchId.innerHTML = item[config.fieldNames.fish.CATCH_ID];
            this.passId.innerHTML = item[config.fieldNames.fish.PASS_NUM];

            this.notesTxtArea.value = item[config.fieldNames.fish.NOTES] || '';

            // tab
            query('.nav-tabs li', this.domNode).forEach(function (n) {
                domClass.remove(n, 'active');
            });
            var tb = query('a[href="#" + tabName + "_tab"]', this.domNode)[0].parentElement;
            domClass.add(tb, 'active');

            // tab contents
            query('.tab-pane', this.domNode).forEach(function (n) {
                domClass.remove(n, 'active in');
            });
            domClass.add(query('#' + tabName + '_tab', this.domNode)[0],
                'active in');

            $(this.dialog).modal('show');

            // make sure that dialog is scrolled to the top
            var that = this;
            setTimeout(function () {
                that.tabContainer.scrollTop = 0;
            }, 250);
        },
        addRow: function () {
            // summary:
            //      adds a row to the diet grid
            console.log(this.declaredClass + '::addRow', arguments);

            var data = {};
            var fn = config.fieldNames.diet;
            var guid = GUID.uuid();

            data[this.idProperty] = guid;
            data[fn.FISH_ID] = this.currentFishId;
            data[fn.CLASS] = null;
            data[fn.MEASUREMENT_TYPE] = null;
            data[fn.MEASUREMENT] = null;

            this.grid.collection.add(data);

            this.grid.focus(this.grid.cell(guid, '2'));
        },
        onSubmitClick: function () {
            // summary:
            //      gathers data and calls submit which Catch is listening for
            console.log(this.declaredClass + '::onSubmitClick', arguments);

            this.dietData[this.currentFishId] = this.getGridData();
            this.tagsData[this.currentFishId] = this.tagsContainer.getData().features;
            var healthFeature = this.health.getData();
            if (healthFeature) {
                this.healthData[this.currentFishId] = [healthFeature];
            }

            var item = this.store.get(this.currentFishId);
            item[config.fieldNames.fish.NOTES] = this.notesTxtArea.value;
            this.store.put(item);

            this.clearValues();
            $(this.dialog).modal('hide');
        },
        clearValues: function () {
            // summary:
            //      clears everything in the dialog
            console.log(this.declaredClass + '::clearValues', arguments);

            this.grid.collection.data = [];
            this.grid.refresh();

            this.tagsContainer.clear();
            this.health.clearValues();

            this.notesTxtArea.value = '';
        },
        onCancel: function () {
            // summary:
            //      cancel button is clicked
            console.log(this.declaredClass + '::onCancel', arguments);

            $(this.dialog).modal('hide');
        },
        getData: function (type) {
            // summary:
            //      formats data suitable for submission to gp service
            // returns: RecordSet (Object)
            console.log('app.catch.MoreInfoDialog:getData', arguments);

            var rSet = {
                displayFieldName: '',
                features: []
            };

            for (var fishId in this[type + 'Data']) {
                if (this[type + 'Data'].hasOwnProperty(fishId)) {
                    rSet.features = rSet.features.concat(this[type + 'Data'][fishId]);
                }
            }

            return rSet;
        }
    });
});
