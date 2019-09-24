define([
    'app/catch/FilteringSelectForGrid',
    'app/config',
    'app/Domains',
    'app/GridTab',
    'app/helpers',
    'app/_ClearValuesMixin',
    'app/_GridMixin',
    'app/_InProgressCacheMixin',

    'dijit/_TemplatedMixin',
    'dijit/_WidgetBase',

    'dojo/DeferredList',
    'dojo/dom-class',
    'dojo/on',
    'dojo/query',
    'dojo/text!./templates/Habitat.html',
    'dojo/_base/declare',
    'dojo/_base/lang',
    'dojo/topic',

    'dojox/uuid/generateRandomUuid',

    'localforage',

    'bootstrap-combobox/js/bootstrap-combobox'
], function (
    FilteringSelectForGrid,
    config,
    Domains,
    GridTab,
    helpers,
    _ClearValuesMixin,
    _GridMixin,
    _InProgressCacheMixin,

    _TemplatedMixin,
    _WidgetBase,

    DeferredList,
    domClass,
    on,
    query,
    template,
    declare,
    lang,
    topic,

    generateRandomUuid,

    localforage
) {
    var FN = config.fieldNames;
    var tempID = 'temp_id';

    return declare([_WidgetBase, _TemplatedMixin, _ClearValuesMixin, _InProgressCacheMixin, _GridMixin], {
        templateString: template,
        baseClass: 'habitat',

        // cacheId: String
        //      used by _InProgressCacheMixin
        cacheId: 'app/habitat',

        // badSedClassesErrMsg: String
        //      error message when the sed classes don't add up to 100
        badSedClassesErrMsg: 'Sediment Class Percentages must add up to 100!',

        // gridTab: GridTab
        gridTab: null,

        // gridDiv: String
        //      dojo attach point to div for grid
        //      defined in widget template
        gridDiv: null,

        // skipNumber: Number
        //      The number of fields to skip when you tab at the end of the row
        //      This is to skip over the hidden fields
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
        idProperty: tempID,

        // ignoreColumn: String
        //      the name of the column in the grid to ignore when data is sent to the server
        ignoreColumn: tempID,

        // transects: Object
        //      a look up for the transect objects by grid tab number
        transects: null,


        constructor: function () {
            // summary:
            //      set up the grid props
            console.log('app/habitat/Habitat:constructor', arguments);

            this.firstColumn = FN.transectMeasurements.DEPTH;
            this.lastColumn = FN.transectMeasurements.DISTANCE_START;

            this.transects = {
                1: this.getNewTransect()
            };
        },

        postCreate: function () {
            // summary:
            //      dom is ready
            console.log('app/habitat/Habitat:postCreate', arguments);

            this.gridTab = new GridTab({ name: 'transect' }, this.gridTabDiv);
            this.gridTab.startup();
            this.gridTab.on('add-tab', this.onAddTransect.bind(this));
            this.gridTab.on('remove-tab', this.onRemoveTransect.bind(this));
            this.gridTab.on('change-tab', this.onChangeTransect.bind(this));

            this.loadComboboxes();

            var columns = [{
                label: this.idProperty,
                field: this.idProperty,
                sortable: false
            }, {
                label: FN.transectMeasurements.TRANSECT_ID,
                field: FN.transectMeasurements.TRANSECT_ID,
                sortable: false
            }, {
                autoSave: true,
                label: 'Depth (m)',
                field: FN.transectMeasurements.DEPTH,
                sortable: false,
                editor: this.NewNumberSpinner,
                autoSelect: true,
                editOn: 'focus',
                editorArgs: {
                    constraints: {
                        min: 0,
                        max: 1000
                    }
                }
            }, {
                autoSave: true,
                label: 'Velocity (m/s)',
                field: FN.transectMeasurements.VELOCITY,
                sortable: false,
                editor: this.NewNumberSpinner,
                autoSelect: true,
                editOn: 'focus',
                editorArgs: {
                    constraints: {
                        min: 0,
                        max: 10
                    }
                }
            }, {
                autoSave: true,
                label: 'Substrate',
                field: FN.transectMeasurements.SUBSTRATE,
                sortable: false,
                editor: FilteringSelectForGrid,
                editOn: 'focus',
                editorArgs: {
                    domainFieldName: FN.transectMeasurements.SUBSTRATE,
                    domainLayerUrl: config.urls.transectMeasurementsFeatureService,
                    parentId: this.id,
                    columnIndex: 4
                }
            }, {
                autoSave: true,
                label: 'Distance from starting bank (m)',
                field: FN.transectMeasurements.DISTANCE_START,
                sortable: false,
                editor: this.NewNumberSpinner,
                autoSelect: true,
                editOn: 'focus',
                editorArgs: {
                    constraints: {
                        min: 0,
                        max: 1000
                    }
                }
            }];

            this.initGrid(columns);
            this.addRow();

            // relayout grid once tab has been shown
            // this prevents the headers from being overlapped by the first row
            $('a[href="#habitatTab"]').one('shown.bs.tab', function () {
                this.grid.startup();
                this.showValidation(this.wettedWidthTxt.valueAsNumber);
            }.bind(this));

            this._trackStore();

            this.inherited(arguments);
        },
        loadComboboxes() {
            var lst = new DeferredList([
                Domains.populateSelectWithDomainValues(this.springSelect,
                    config.urls.habitatFeatureService,
                    config.fieldNames.habitat.SPNG),
                Domains.populateSelectWithDomainValues(this.overstorySelect,
                    config.urls.habitatFeatureService,
                    config.fieldNames.habitat.DOVR),
                Domains.populateSelectWithDomainValues(this.understorySelect,
                    config.urls.habitatFeatureService,
                    config.fieldNames.habitat.DUND),
                Domains.populateSelectWithDomainValues(this.startingBank,
                    config.urls.transectFeatureService,
                    config.fieldNames.transect.STARTING_BANK)
            ]);
            lst.then(() => {
                $(this.domNode).find('select').combobox();
            });
        },
        _trackStore() {
            // summary:
            //      sets up the events to track the store
            // param or return
            console.info('app/habitat/Habitat:_trackStore', arguments);

            if (this._storeEvent) {
                this._storeEvent.remove();
                this._storeEvent = null;
            }

            this._storeEvent = this.store.on('add, update, delete', () => {
                this.showValidation(this.wettedWidthTxt.valueAsNumber);
            });

            this.own(
                this._storeEvent
            );
        },
        addRow: function () {
            // summary:
            //      adds a new blank row to the transect measurements grid
            console.log('app/habitat/Habitat:addRow', arguments);

            var data = {
                [this.idProperty]: Math.random(),
                [FN.transectMeasurements.TRANSECT_ID]: this.getCurrentTransect()[FN.transect.TRANSECT_ID],
                [FN.transectMeasurements.DEPTH]: null,
                [FN.transectMeasurements.VELOCITY]: null,
                [FN.transectMeasurements.SUBSTRATE]: null,
                [FN.transectMeasurements.DISTANCE_START]: null
            };

            this.store.addSync(data);
            this.grid.focus(this.grid.cell(data[this.idProperty], '2'));
        },
        hydrateWithInProgressData: function () {
            // summary:
            //      overriden from _InProgressCacheMixin to set the grid data
            console.log('app/habitat/Habitat:hydrateWithInProgressData', arguments);

            this.inherited(arguments).then(function (inProgressData) {
                if (inProgressData) {
                    if (inProgressData.gridData) {
                        this.setGridData(inProgressData.gridData);
                        // setGridData creates a new store. Set up the events again
                        this._trackStore();
                        this.grid.refresh();
                    }

                    if (inProgressData.transects) {
                        this.transects = inProgressData.transects;

                        if (Object.keys(this.transects).length > 1) {
                            var numTransects = 0;
                            for (var tabID in inProgressData.transects) {
                                if (inProgressData.transects.hasOwnProperty(tabID)) {
                                    numTransects++;

                                    if (numTransects === 1) {
                                        // the first one is already there
                                        continue;
                                    }
                                    this.gridTab.addTab(true);
                                }
                            }
                        }
                    }
                }

                this.store.on('add, update, delete', this.cacheInProgressData.bind(this));
            }.bind(this));
        },
        getAdditionalCacheData: function () {
            // summary:
            //      override from _InProgressCacheMixin to cache the grid data
            // param or return
            console.log('app/habitat/Habitat:getAdditionalCacheData', arguments);

            var transect = this.getCurrentTransect();
            transect[FN.transect.BWID] = this.bankfulWidthTxt.valueAsNumber;
            transect[FN.transect.WWID] = this.wettedWidthTxt.valueAsNumber;
            transect[FN.transect.STARTING_BANK] = this.startingBank.value;

            return {
                gridData: JSON.parse(JSON.stringify(this.store.fetchSync())),
                transects: this.transects
            };
        },
        clear: function () {
            // summary:
            //      resets all controls
            console.log('app/habitat/Habitat:clear', arguments);

            this.transects = {
                1: this.getNewTransect()
            };

            return localforage.removeItem(this.cacheId).then(() => {
                this.gridTab.clear();
                this.clearGrid();
                this.clearValues();

                this.onSedimentClassChange();
            });
        },
        getNewTransect: function () {
            // summary:
            //      returns a transect object
            // returns: Object
            console.log('app/habitat/Habitat:getNewTransect', arguments);

            var obj = {};
            obj[FN.transect.TRANSECT_ID] = '{' + generateRandomUuid() + '}';

            return obj;
        },
        isValid: function () {
            // summary:
            //      Supposed to check for required values. But this tab currently
            //      has no required values.
            console.log('app/habitat/Habitat:isValid', arguments);

            var total = parseInt(this.sedTotalSpan.innerHTML, 10);

            if (total === 0 || total === 100) {
                return true;
            }

            return this.badSedClassesErrMsg;
        },
        getData: function () {
            // summary:
            //      Builds a record set object suitable for submitting to the
            //      NewCollectionEvent service
            console.log('app/habitat/Habitat:getData', arguments);

            var fn = config.fieldNames.habitat;
            var f = {
                [fn.EVENT_ID]: config.eventId,
                [fn.BANKVEG]: helpers.getNumericValue(this.bankVegTxt.value),
                [fn.DOVR]: this.overstorySelect.value,
                [fn.DUND]: this.understorySelect.value,
                [fn.LGWD]: helpers.getNumericValue(this.largeWoodyDebrisTxt.value),
                [fn.POOL]: helpers.getNumericValue(this.poolAreaTxt.value),
                [fn.SPNG]: this.springSelect.value,
                [fn.RIFF]: helpers.getNumericValue(this.riffleAreaTxt.value),
                [fn.RUNA]: helpers.getNumericValue(this.runAreaTxt.value),
                [fn.SUB_FINES]: helpers.getNumericValue(this.finesTxt.value),
                [fn.SUB_SAND]: helpers.getNumericValue(this.sandTxt.value),
                [fn.SUB_GRAV]: helpers.getNumericValue(this.gravelTxt.value),
                [fn.SUB_COBB]: helpers.getNumericValue(this.cobbleTxt.value),
                [fn.SUB_RUBB]: helpers.getNumericValue(this.rubbleTxt.value),
                [fn.SUB_BOUL]: helpers.getNumericValue(this.boulderTxt.value),
                [fn.SUB_BEDR]: helpers.getNumericValue(this.bedrockTxt.value),
                [fn.SIN]: helpers.getNumericValue(this.sinuosityTxt.value),
                [fn.EROS]: helpers.getNumericValue(this.banksErodingTxt.value),
                [fn.TEMP]: helpers.getNumericValue(this.waterTempTxt.value),
                [fn.PH]: helpers.getNumericValue(this.acidityTxt.value),
                [fn.CON]: helpers.getNumericValue(this.conductivityTxt.value),
                [fn.OXYGEN]: helpers.getNumericValue(this.oxygenTxt.value),
                [fn.SOLIDS]: helpers.getNumericValue(this.solidsTxt.value),
                [fn.TURBIDITY]: helpers.getNumericValue(this.turbidityTxt.value),
                [fn.ALKALINITY]: helpers.getNumericValue(this.alkalinityTxt.value),
                [fn.BACKWATER]: helpers.getNumericValue(this.backwaterTxt.value)
            };

            return [f];
        },
        onSedimentClassChange: function () {
            // summary:
            //      fires when a change has been made to any of the six
            //      sediment classes
            //      Adds up the classes and applies the appropriate color to the total
            console.log('app/habitat/Habitat:onSedimentClassChange', arguments);

            var total = 0;
            query('.panel-body .form-group input', this.domNode).forEach(function (node) {
                if (node.value !== '') {
                    total = total + parseInt(node.value, 10);
                }
            });
            this.sedTotalSpan.innerHTML = total;

            // update color of badge
            var parentDiv = this.sedTotalSpan.parentElement;
            if (total === 100) {
                domClass.add(parentDiv, 'text-success');
                domClass.remove(parentDiv, 'text-danger');
            } else if (total === 0) {
                domClass.remove(parentDiv, 'text-danger');
                domClass.remove(parentDiv, 'text-success');
            } else {
                domClass.add(parentDiv, 'text-danger');
                domClass.remove(parentDiv, 'text-success');
            }
        },
        onChangeTransect: function () {
            // summary:
            //      fires when the user clicks on a transect button
            console.log('app/habitat/Habitat:onChangeTransect', arguments);

            this.grid.save();

            var transect = this.getCurrentTransect();
            const newQuery = this.getTransectFilter(transect[FN.transect.TRANSECT_ID]);

            this.grid.set('collection', this.store.filter(newQuery));

            this.bankfulWidthTxt.valueAsNumber = transect[FN.transect.BWID];
            this.wettedWidthTxt.valueAsNumber = transect[FN.transect.WWID];

            var startingBank = transect[FN.transect.STARTING_BANK];
            if (startingBank && startingBank.length > 0) {
                this.startingBank.value = startingBank;
                $(this.startingBank).combobox('refresh');
            } else {
                this.clearValue(this.startingBank);
            }
        },
        onWidthChange() {
            // summary:
            //      checks the distance from shore against the width value
            // toasts a warning if the user needs to do something
            console.info('app/habitat/Habitat:onWidthChange', arguments);

            this.showValidation(this.wettedWidthTxt.valueAsNumber);
        },
        getTransectFilter: function (transectNum) {
            // summary:
            //      returns an object suitable to pass to store.filter that filters the data
            //      by the passed in transect number
            // transectNum: Number
            console.log('app/habitat/Habitat:getTransectFilter', arguments);

            return {
                [config.fieldNames.transect.TRANSECT_ID]: transectNum
            };
        },
        onAddTransect: function (event) {
            // summary:
            //      fires when the user clicks on the add transect button
            // event: Event Object
            console.log('app/habitat/Habitat:onAddTransect', arguments);

            this.grid.save();

            if (!event.skipAddRow) {
                this.addRow();

                this.cacheInProgressData();
            }
        },
        onRemoveTransect: function (event) {
            // summary:
            //      remove the last transect and updates the grid store
            // event: Event Object with tabNum property
            console.log('app/habitat/Habitat:onRemoveTransect', arguments);

            this.store.filter(this.getTransectFilter(event.tabNum))
                .forEach(item => this.store.removeSync(item[this.idProperty]));

            delete this.transects[event.tabNum];
        },
        getCurrentTransect: function () {
            // summary:
            //      returns the object for the current transect
            console.log('app/habitat/Habitat:getCurrentTransect', arguments);

            if (!this.transects[this.gridTab.currentTab]) {
                this.transects[this.gridTab.currentTab] = this.getNewTransect();
            }

            return this.transects[this.gridTab.currentTab];
        },
        getTransectMeasurementData: function () {
            // summary:
            //      returns the grid data for insertion into the TransectMeasurements table
            console.log('app/habitat/Habitat:getTransectMeasurementData', arguments);

            return this.getGridData();
        },
        getTransectData: function () {
            // summary:
            //      returns data for the Transect table
            console.log('app/habitat/Habitat:getTransectData', arguments);

            return Object.keys(this.transects).map(function (key) {
                var obj = {};
                obj[FN.transect.EVENT_ID] = config.eventId;

                return lang.mixin(this.transects[key], obj);
            }.bind(this));
        },
        showValidation(width) {
            // summary:
            //      shows validation messages
            console.info('app/habitat/Habitat:showValidation', arguments);

            const validation = this._validateWidth(width);

            domClass.remove(this.validateMsg, 'alert-info alert-danger');
            domClass.add(this.validateMsg, 'hidden');

            let type = 'danger';
            if (validation.result) {
                type = 'info';
            }

            if (validation.message) {
                domClass.add(this.validateMsg, `alert alert-${type}`);
                domClass.remove(this.validateMsg, 'hidden');
                this.validateMsg.innerHTML = validation.message;
            } else {
                domClass.add(this.validateMsg, 'hidden');
            }
        },
        _validateWidth(wettedWidth) {
            // summary:
            //      vlidation function
            // boolean
            console.info('app/habitat/Habitat:_validateWidth', arguments);

            if (!wettedWidth) {
                let message = null;

                const hasStartDistances = this.store.data.some(row => {
                    return row[FN.transectMeasurements.DISTANCE_START];
                });

                if (hasStartDistances) {
                    message = 'Wetted Width does not have a value. Remember that the ' +
                             'distance from starting bank needs to be less than the wetted width.';
                }

                return {
                    result: true,
                    message: message
                };
            }

            const isValid = this.store.data.every(row => {
                const start = row[FN.transectMeasurements.DISTANCE_START];

                return !isNaN(start) && start < wettedWidth;
            });

            let message = isValid ?
                null :
                'The distance from the starting bank needs to be less than the wetted width.';

            return {
                result: isValid,
                message: message
            };
        }
    });
});
