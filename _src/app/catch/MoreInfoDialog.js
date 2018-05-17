define([
    './../Domains',
    './../_ClearValuesMixin',

    'app/catch/FilteringSelectForGrid',
    'app/config',
    'app/_GridMixin',

    'dgrid/Editor',

    'dijit/popup',
    'dijit/_TemplatedMixin',
    'dijit/_WidgetBase',
    'dijit/_WidgetsInTemplateMixin',

    'dojo/dom-class',
    'dojo/dom-construct',
    'dojo/promise/all',
    'dojo/query',
    'dojo/text!app/catch/templates/MoreInfoDialog.html',
    'dojo/_base/array',
    'dojo/_base/declare',
    'dojo/_base/lang',

    'dojox/uuid/generateRandomUuid',

    'localforage',

    './Health',
    'app/catch/TagsContainer',
    'leaflet'
], function (
    Domains,
    _ClearValuesMixin,

    FilteringSelectForGrid,
    config,
    _GridMixin,

    editor,

    popupManager,
    _TemplatedMixin,
    _WidgetBase,
    _WidgetsInTemplateMixin,

    domClass,
    domConstruct,
    all,
    query,
    template,
    array,
    declare,
    lang,

    generateRandomUuid,

    localforage
) {
    // summary:
    //      Form for storing diet, tag and other fish stats.
    return declare([_WidgetBase, _TemplatedMixin, _WidgetsInTemplateMixin, _GridMixin, _ClearValuesMixin], {
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
        //      required for _GridMixin, not in corresponding data table.
        //      Stripped off before the data is sent to the server.
        idProperty: 'TEMP_ID',

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

        // cacheId: String
        //      used to cache in progress data
        cacheId: 'app/catch/moreinfodialog',


        // properties passed in via the constructor

        // catch: app/catch/Catch
        //      for accessing the grid's data store
        catch: null,

        constructor: function () {
            // summary:
            //      description
            console.log('app/catch/MoreInfoDialog:constructor', arguments);

            popupManager._beginZIndex = 1051;

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
            console.log('app/catch/MoreInfoDialog:postCreate', arguments);

            var columns = [
                {label: 'Catch ID', field: this.idProperty, sortable: false},
                {label: 'Fish ID', field: config.fieldNames.diet.FISH_ID, sortable: false},
                {
                    autoSave: true,
                    label: 'Class',
                    field: config.fieldNames.diet.CLASS,
                    editor: FilteringSelectForGrid,
                    sortable: false,
                    editOn: 'focus',
                    editorArgs: {
                        domainFieldName: config.fieldNames.diet.CLASS,
                        domainLayerUrl: config.urls.dietFeatureService,
                        grid: this.grid
                    }
                }, {
                    autoSave: true,
                    label: 'Fish Species',
                    field: config.fieldNames.diet.FISH_SPECIES,
                    editor: FilteringSelectForGrid,
                    sortable: false,
                    editOn: 'focus',
                    editorArgs: {
                        domainFieldName: config.fieldNames.diet.FISH_SPECIES,
                        domainLayerUrl: config.urls.dietFeatureService,
                        grid: this.grid
                    }
                }, {
                    autoSave: true,
                    label: 'Type',
                    field: config.fieldNames.diet.MEASUREMENT_TYPE,
                    editor: FilteringSelectForGrid,
                    sortable: false,
                    editOn: 'focus',
                    editorArgs: {
                        domainFieldName: config.fieldNames.diet.MEASUREMENT_TYPE,
                        domainLayerUrl: config.urls.dietFeatureService,
                        grid: this.grid
                    }
                }, {
                    autoSave: true,
                    label: 'Measurement',
                    field: config.fieldNames.diet.MEASUREMENT,
                    editor: 'text',
                    sortable: false,
                    editOn: 'focus',
                    editorArgs: {
                        className: 'form-control dgrid-input'
                    }
                }
            ];

            this.initGrid(columns);

            this.own($(this.dialog).on('hidden.bs.modal', lang.hitch(this, this.clearValues)));

            var that = this;
            $(this.dietTab).on('shown.bs.tab', function () {
                that.grid.startup();
            });

            this.own(query('input[type=number]', this.domNode).on('change, keyup', function () {
                // bump this to the bottom of the callstack
                // otherwise this code executes before the numericInputValidator
                window.setTimeout(function () {
                    if (that.submitBtn) {
                        that.submitBtn.disabled = query('.form-group.has-error', that.domNode).length > 0;
                    }
                }, 0);
            }));

            this.controlMappings = [
                [this.collectionPartSelect, 'COLLECTION_PART']
            ];

            var defs = [];
            var url = config.urls.healthFeatureService;

            array.forEach(this.controlMappings, function (map) {
                if (map[0].type === 'select-one') {
                    defs.push(Domains.populateSelectWithDomainValues(map[0], url, map[1]));
                }
            });

            all(defs).then(function () {
                $('#Collection_tab select').combobox();
            });

            localforage.getItem(this.cacheId).then(function (inProgressData) {
                if (inProgressData) {
                    lang.mixin(that, inProgressData);
                }
            });
        },
        show: function (guid, tabName) {
            // summary:
            //      shows the dialog
            // guid: String
            //      The guid of the currently selected row
            // tabName: String
            //      The name of the tab that you want to show (i.e. 'Diet')
            console.log('app/catch/MoreInfoDialog:show', arguments);

            // pre-populate dialog with existing data, if any
            this.currentFishId = guid;
            this.health.currentFishId = guid;
            if (this.healthData[guid]) {
                this.health.setData(this.healthData[guid][0], this.controlMappings);
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

            var item = this.catch.store.getSync(guid);

            this.catchId.innerHTML = item[config.fieldNames.fish.CATCH_ID];
            this.passId.innerHTML = item[config.fieldNames.fish.PASS_NUM];

            this.notesTxtArea.value = item[config.fieldNames.fish.NOTES] || '';

            // tab
            query('.nav-tabs li', this.domNode).forEach(function (n) {
                domClass.remove(n, 'active');
            });
            var tb = query('a[href="#' + tabName + '"]', this.domNode)[0].parentElement;
            domClass.add(tb, 'active');

            // tab contents
            query('.tab-pane', this.domNode).forEach(function (n) {
                domClass.remove(n, 'active in');
            });
            domClass.add(query('#' + tabName, this.domNode)[0],
                'active in');

            $(this.dialog).modal('show');

            // make sure that dialog is scrolled to the top and grid is started upd
            var that = this;
            setTimeout(function () {
                if (!that.tabContainer) {
                    return;
                }
                that.tabContainer.scrollTop = 0;

                if (tabName === 'Diet_tab') {
                    that.grid.startup();
                }
            }, 250);
        },
        addRow: function () {
            // summary:
            //      adds a row to the diet grid
            console.log('app/catch/MoreInfoDialog:addRow', arguments);

            var data = {};
            var fn = config.fieldNames.diet;
            var guid = '{' + generateRandomUuid() + '}';

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
            console.log('app/catch/MoreInfoDialog:onSubmitClick', arguments);

            this.dietData[this.currentFishId] = array.map(this.getGridData(), function (record) {
                delete record[this.idProperty];

                return record;
            }, this);
            this.tagsData[this.currentFishId] = this.tagsContainer.getData();

            var healthFeature = this.health.getData(this.controlMappings);
            if (healthFeature) {
                this.healthData[this.currentFishId] = [healthFeature];
            }

            this.cacheInProgressData();

            var item = this.catch.store.getSync(this.currentFishId);
            item[config.fieldNames.fish.NOTES] = this.notesTxtArea.value;
            item[config.fieldNames.MOREINFO] = true;
            this.catch.store.putSync(item);

            this.clearValues();
            $(this.dialog).modal('hide');
        },
        cacheInProgressData: function () {
            // summary:
            //      caches any in progress data in localforage
            console.log('app/catch/MoreInfoDialog:cacheInProgressData', arguments);

            localforage.setItem(this.cacheId, {
                dietData: this.dietData,
                tagsData: this.tagsData,
                healthData: this.healthData
            });

            // notes are cached via the catch grid
        },
        clearValues: function () {
            // summary:
            //      clears everything in the dialog
            console.log('app/catch/MoreInfoDialog:clearValues', arguments);

            this.setGridData([]);

            this.tagsContainer.clear();
            this.health.clearValues();

            this.notesTxtArea.value = '';

            this.inherited(arguments);
        },
        onCancel: function () {
            // summary:
            //      cancel button is clicked
            console.log('app/catch/MoreInfoDialog:onCancel', arguments);

            $(this.dialog).modal('hide');
        },
        getData: function (type) {
            // summary:
            //      formats data suitable for submission to gp service
            // returns: RecordSet (Object)
            console.log('app/catch/MoreInfoDialog:getData', arguments);

            var data = [];
            for (var fishId in this[type + 'Data']) {
                if (this[type + 'Data'].hasOwnProperty(fishId)) {
                    /* eslint-disable no-loop-func */
                    data = data.concat(this[type + 'Data'][fishId].map(function (record) {
                        record[config.fieldNames.fish.FISH_ID] = fishId;

                        return record;
                    }));
                    /* eslint-enable no-loop-func */
                }
            }

            return data;
        },
        destroy: function () {
            // summary:
            //      clean up between tests
            console.log('app/catch/MoreInfoDialog:destroy', arguments);

            domConstruct.destroy(this.dialog);

            this.inherited(arguments);
        }
    });
});
