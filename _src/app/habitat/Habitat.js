define([
    'app/catch/FilteringSelectForGrid',
    'app/config',
    'app/Domains',
    'app/GridTab',
    'app/helpers',
    'app/_ClearValuesMixin',
    'app/_GridMixin',
    'app/_InProgressCacheMixin',

    'dijit/form/NumberSpinner',
    'dijit/_TemplatedMixin',
    'dijit/_WidgetBase',

    'dojo/DeferredList',
    'dojo/dom-class',
    'dojo/query',
    'dojo/text!./templates/Habitat.html',
    'dojo/_base/declare',
    'dojo/_base/lang',

    'dojox/uuid/generateRandomUuid',

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

    NumberSpinner,
    _TemplatedMixin,
    _WidgetBase,

    DeferredList,
    domClass,
    query,
    template,
    declare,
    lang,

    generateRandomUuid
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

            this.gridTab = new GridTab({ name: '' }, this.gridTabDiv);
            this.gridTab.startup();
            this.gridTab.on('add-tab', this.onAddTransect.bind(this));
            this.gridTab.on('change-tab', this.onChangeTransect.bind(this));

            var that = this;
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
            lst.then(function () {
                $(that.domNode).find('select').combobox();
            });

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
                editor: NumberSpinner,
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
                editor: NumberSpinner,
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
                    grid: this.grid
                }
            }, {
                autoSave: true,
                label: 'Distance from starting bank (m)',
                field: FN.transectMeasurements.DISTANCE_START,
                sortable: false,
                editor: NumberSpinner,
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
            }.bind(this));

            this.inherited(arguments);
        },
        addRow: function () {
            // summary:
            //      adds a new blank row to the transect measurements grid
            console.log('app/method/Equipment:addRow', arguments);

            var data = {};

            data[this.idProperty] = Math.random();
            data[FN.transectMeasurements.TRANSECT_ID] = this.getCurrentTransect()[FN.transect.TRANSECT_ID];
            data[FN.transectMeasurements.DEPTH] = null;
            data[FN.transectMeasurements.VELOCITY] = null;
            data[FN.transectMeasurements.SUBSTRATE] = null;
            data[FN.transectMeasurements.DISTANCE_START] = null;

            this.grid.collection.add(data);

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

            this.clearGrid();
            this.clearValues();

            this.onSedimentClassChange();
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

            var f = {};
            var fn = config.fieldNames.habitat;

            f[fn.EVENT_ID] = config.eventId;
            f[fn.BANKVEG] = helpers.getNumericValue(this.bankVegTxt.value);
            f[fn.DOVR] = this.overstorySelect.value;
            f[fn.DUND] = this.understorySelect.value;
            f[fn.LGWD] = helpers.getNumericValue(this.largeWoodyDebrisTxt.value);
            f[fn.POOL] = helpers.getNumericValue(this.poolAreaTxt.value);
            f[fn.SPNG] = this.springSelect.value;
            f[fn.RIFF] = helpers.getNumericValue(this.riffleAreaTxt.value);
            f[fn.RUNA] = helpers.getNumericValue(this.runAreaTxt.value);
            f[fn.SUB_FINES] = helpers.getNumericValue(this.finesTxt.value);
            f[fn.SUB_SAND] = helpers.getNumericValue(this.sandTxt.value);
            f[fn.SUB_GRAV] = helpers.getNumericValue(this.gravelTxt.value);
            f[fn.SUB_COBB] = helpers.getNumericValue(this.cobbleTxt.value);
            f[fn.SUB_RUBB] = helpers.getNumericValue(this.rubbleTxt.value);
            f[fn.SUB_BOUL] = helpers.getNumericValue(this.boulderTxt.value);
            f[fn.SUB_BEDR] = helpers.getNumericValue(this.bedrockTxt.value);
            f[fn.VEGD] = helpers.getNumericValue(this.vegDensityTxt.value);
            f[fn.SIN] = helpers.getNumericValue(this.sinuosityTxt.value);
            f[fn.EROS] = helpers.getNumericValue(this.banksErodingTxt.value);
            f[fn.TEMP] = helpers.getNumericValue(this.waterTempTxt.value);
            f[fn.PH] = helpers.getNumericValue(this.acidityTxt.value);
            f[fn.CON] = helpers.getNumericValue(this.conductivityTxt.value);
            f[fn.OXYGEN] = helpers.getNumericValue(this.oxygenTxt.value);
            f[fn.SOLIDS] = helpers.getNumericValue(this.solidsTxt.value);
            f[fn.TURBIDITY] = helpers.getNumericValue(this.turbidityTxt.value);
            f[fn.ALKALINITY] = helpers.getNumericValue(this.alkalinityTxt.value);
            f[fn.BACKWATER] = helpers.getNumericValue(this.backwaterTxt.value);

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
            var newQuery = {};
            newQuery[FN.transectMeasurements.TRANSECT_ID] = transect[FN.transect.TRANSECT_ID];

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
        }
    });
});
