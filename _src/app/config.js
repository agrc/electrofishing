define([
    'dojo/has',
    'dojo/request/xhr',

    'dojox/uuid/generateRandomUuid',

    'localforage',

    'leaflet'
], function (
    has,
    xhr,

    generateRandomUuid,

    localforage
) {
    var quadWord = '';
    var wildlifeFolder;
    if (has('agrc-build') === 'prod') {
        // ??
        quadWord = '??';
        wildlifeFolder = '/proxy/proxy.jsp?http://dwrmapserv.utah.gov/dwrarcgis/rest/services/Aquatics/';
    } else if (has('agrc-build') === 'stage') {
        // test.mapserv.utah.gov
        quadWord = 'opera-event-little-pinball';
        wildlifeFolder = 'http://test.mapserv.utah.gov/arcgis/rest/services/Electrofishing/';
    } else {
        wildlifeFolder = 'http://localhost/arcgis/rest/services/Electrofishing/';
        // localhost
        xhr(require.baseUrl + 'secrets.json', {
            handleAs: 'json',
            sync: true
        }).then(function (secrets) {
            quadWord = secrets.quadWord;
        }, function () {
            throw 'Error getting secrets!';
        });
    }

    var wildlifeToolbox = wildlifeFolder + 'Toolbox/GPServer/';
    var wildlifeFeatureService = wildlifeFolder + 'MapService/MapServer/';
    var referenceService = wildlifeFolder + 'Reference/MapServer/';
    var fldEVENT_ID = 'EVENT_ID';
    var fldTRANSECT_ID = 'TRANSECT_ID';

    var config = {
        // app: app.App
        //      global reference to app
        app: null,

        // appName: String
        //      name of app used in permission proxy and localforage db name
        appName: 'electrofishing',

        // databaseVersion: Number
        //      localforage database version
        databaseVersion: 1.0,

        // eventId: String(GUID)
        //      The guid for this unique event.
        eventId: '{' + generateRandomUuid() + '}',

        // version: String
        //      The app version number.
        version: '1.6.0',

        // coordTypes: {key:String}
        //      Coordinate types as used in app/SettingsDialoge
        coordTypes: {
            utm83: 'utm83',
            ll: 'll',
            utm27: 'utm27'
        },

        quadWord: quadWord,

        // tempValueKey: String
        //      used by _InProgressCacheMixin
        tempValueKey: 'tempValue',

        // topics: {key:String}
        //      Global dojo/topic topics used in the app
        topics: {
            coordTypeToggle_onChange: 'coordTypeToggle_onChange',
            pointDef_onBtnClick: 'pointDef_onBtnClick',
            mapInit: 'verifyMap_mapinited',
            startDistDirGeoDef_onDistanceChange: 'startDistDirGeoDef_onDistanceChange',
            newCollectionEvent: 'app_newCollectionEvent',
            onStationClick: 'verifyMap_onStationClick',
            onSubmitReportClick: 'header_onSubmitReportClick',
            onCancelReportClick: 'header_onCancelReportClick',
            mouseWheelZooming_onChange: 'app_mouseWheelZooming',
            streamsLakes_toggle: 'verifyMap_streamsLakes_toggle',
            toaster: 'app/Toaster',
            noFish: '1'
        },

        // urls: {}
        urls: {
            // basemaps
            googleImagery: 'https://discover.agrc.utah.gov/login/path/{quadWord}/tiles/utah/{z}/{x}/{y}',
            overlay: 'https://discover.agrc.utah.gov/login/path/{quadWord}/tiles/overlay_basemap/{z}/{x}/{y}',

            // leaflet icons
            startIcon: 'app/resources/images/start-icon.png',
            endIcon: 'app/resources/images/end-icon.png',
            markerShadow: 'leaflet/dist/images/marker-shadow.png',
            selectedIcon: 'app/resources/images/selected-icon.png',

            // gp tasks
            getSegmentFromCoords: wildlifeToolbox + 'GetSegmentFromCoords',
            getSegmentFromStartDistDir: wildlifeToolbox + 'GetSegmentFromStartDistDir',
            getSegmentFromID: wildlifeToolbox + 'GetSegmentFromID',
            newStationService: wildlifeToolbox + 'NewStation',
            newCollectionEvent: wildlifeToolbox + 'NewCollectionEvent',

            // feature service
            stationsFeatureService: wildlifeFeatureService + '0',
            samplingEventsFeatureService: wildlifeFeatureService + '1',

            fishFeatureService: wildlifeFeatureService + '2',
            dietFeatureService: wildlifeFeatureService + '3',
            healthFeatureService: wildlifeFeatureService + '4',
            tagsFeatureService: wildlifeFeatureService + '5',
            habitatFeatureService: wildlifeFeatureService + '6',
            equipmentFeatureService: wildlifeFeatureService + '7',
            anodesFeatureService: wildlifeFeatureService + '8',
            transectFeatureService: wildlifeFeatureService + '9',
            transectMeasurementsFeatureService: wildlifeFeatureService + '10',

            // reference service
            streamsLakesService: referenceService,
            streamsFeatureService: referenceService + '0/query',
            lakesFeatureService: referenceService + '1/query'
        },

        // tableNames: {}
        tableNames: {
            diet: 'Diet',
            fish: 'Fish',
            habitat: 'Habitat',
            health: 'Health',
            samplingEvents: 'SamplingEvents',
            tags: 'Tags',
            equipment: 'Equipment',
            anodes: 'Anodes',
            transect: 'Transect',
            transectMeasurements: 'TransectMeasurements'
        },

        // fieldNames: {}
        //      Field names
        fieldNames: {
            MOREINFO: 'MOREINFO',
            OBJECTID: 'OBJECTID',
            stations: {
                NAME: 'NAME',
                STATION_ID: 'STATION_ID',
                STREAM_TYPE: 'STREAM_TYPE'
            },
            samplingEvents: {
                EVENT_ID: fldEVENT_ID,
                GEO_DEF: 'GEO_DEF',
                LOCATION_NOTES: 'LOCATION_NOTES',
                EVENT_DATE: 'EVENT_DATE',
                EVENT_TIME: 'EVENT_TIME',
                STATION_ID: 'STATION_ID',
                SEGMENT_LENGTH: 'SEGMENT_LENGTH',
                NUM_PASSES: 'NUM_PASSES',
                WEATHER: 'WEATHER',
                PURPOSE: 'SURVEY_PURPOSE',
                OBSERVERS: 'OBSERVERS'
            },
            equipment: {
                EVENT_ID: fldEVENT_ID,
                EQUIPMENT_ID: 'EQUIPMENT_ID',
                WAVEFORM: 'WAVEFORM',
                VOLTAGE: 'VOLTAGE',
                DUTY_CYCLE: 'DUTY_CYCLE',
                FREQUENCY: 'FREQUENCY',
                AMPS: 'AMPS',
                CATHODE_LEN: 'CATHODE_LEN',
                CATHODE_DIAMETER: 'CATHODE_DIAMETER',
                NUM_ANODES: 'NUM_ANODES',
                MACHINE_RES: 'MACHINE_RES',
                MODEL: 'MODEL',
                ANODE_SHAPE: 'ANODE_SHAPE',
                ARRAY_TYPE: 'ARRAY_TYPE',
                NUM_NETTERS: 'NUM_NETTERS',
                CATHODE_TYPE: 'CATHODE_TYPE',
                TYPE: 'TYPE',
                DURATION: 'PEDAL_TIME'
            },
            anodes: {
                EQUIPMENT_ID: 'EQUIPMENT_ID',
                ANODE_DIAMETER: 'ANODE_DIAMETER',
                STOCK_DIAMETER: 'STOCK_DIAMETER'
            },
            fish: {
                FISH_ID: 'FISH_ID',
                EVENT_ID: fldEVENT_ID,
                PASS_NUM: 'PASS_NUM',
                CATCH_ID: 'CATCH_ID',
                SPECIES_CODE: 'SPECIES_CODE',
                LENGTH_TYPE: 'LENGTH_TYPE',
                LENGTH: 'LENGTH',
                WEIGHT: 'WEIGHT',
                NOTES: 'NOTES'
            },
            diet: {
                FISH_ID: 'FISH_ID',
                CLASS: 'CLASS',
                FISH_SPECIES: 'FISH_SPECIES',
                MEASUREMENT_TYPE: 'MEASUREMENT_TYPE',
                MEASUREMENT: 'MEASUREMENT'
            },
            tags: {
                FISH_ID: 'FISH_ID',
                NUMBER: 'NUMBER',
                TRANSPONDER_FREQ: 'TRANSPONDER_FREQ',
                TRANSMITTER_FREQ: 'TRANSMITTER_FREQ',
                TRANSMITTER_FREQ_TYPE: 'TRANSMITTER_FREQ_TYPE',
                TYPE: 'TYPE',
                LOCATION: 'LOCATION',
                COLOR: 'COLOR',
                NEW_TAG: 'NEW_TAG'
            },
            health: {
                FISH_ID: 'FISH_ID',
                EYE: 'EYE',
                GILL: 'GILL',
                PSBR: 'PSBR',
                THYMUS: 'THYMUS',
                FAT: 'FAT',
                SPLEEN: 'SPLEEN',
                HIND: 'HIND',
                KIDNEY: 'KIDNEY',
                LIVER: 'LIVER',
                BILE: 'BILE',
                GENDER: 'GENDER',
                REPRODUCTIVE: 'REPRODUCTIVE',
                HEMATOCRIT: 'HEMATOCRIT',
                LEUKOCRIT: 'LEUKOCRIT',
                PLPRO: 'PLPRO',
                FIN: 'FIN',
                OPERCLE: 'OPERCLE',
                COLLECTION_PART: 'COLLECTION_PART'
            },
            habitat: {
                EVENT_ID: fldEVENT_ID,
                BANKVEG: 'BANKVEG',
                DEPMAX: 'DEPMAX',
                DOVR: 'DOVR',
                DUND: 'DUND',
                LGWD: 'LGWD',
                POOL: 'POOL',
                SPNG: 'SPNG',
                RIFF: 'RIFF',
                RUNA: 'RUNA',
                SUB_FINES: 'SUB_FINES',
                SUB_SAND: 'SUB_SAND',
                SUB_GRAV: 'SUB_GRAV',
                SUB_COBB: 'SUB_COBB',
                SUB_RUBB: 'SUB_RUBB',
                SUB_BOUL: 'SUB_BOUL',
                SUB_BEDR: 'SUB_BEDR',
                WWID: 'WWID',
                SIN: 'SIN',
                VEL: 'VEL',
                EROS: 'EROS',
                TEMP: 'TEMP_',
                PH: 'PH',
                CON: 'CON',
                OXYGEN: 'OXYGEN',
                SOLIDS: 'SOLIDS',
                TURBIDITY: 'TURBIDITY',
                ALKALINITY: 'ALKALINITY',
                BACKWATER: 'BACKWATER'
            },
            transect: {
                EVENT_ID: fldEVENT_ID,
                BWID: 'BWID',
                WWID: 'WWID',
                STARTING_BANK: 'STARTING_BANK',
                TRANSECT_ID: fldTRANSECT_ID,
                TRANSECT_NUM: 'TRANSECT_NUM'
            },
            transectMeasurements: {
                DEPTH: 'DEPTH',
                VELOCITY: 'VELOCITY',
                SUBSTRATE: 'SUBSTRATE',
                DISTANCE_START: 'DISTANCE_START',
                TRANSECT_ID: fldTRANSECT_ID
            },
            reference: {
                COUNTY: 'COUNTY',
                WaterName: 'WaterName'
            }
        },

        // missingRequiredFieldTxt: String
        //      used to display a message about a required field that is missing
        missingRequiredFieldTxt: 'Missing value for ${0}!',

        // noWeightValue: Number
        //      The value used in the WEIGHT field in the Fish table
        //      used when no weight was collected for a fish (dropped in the river or something)
        noWeightValue: -1,

        // tooSmallValue: Number
        //      The value used in the WEIGHT field in the Fish table
        //      used when the fish was too small to weigh
        tooSmallValue: 0,

        domains: {}
    };

    // Leaflet config
    L.Icon.Default.prototype.options.imagePath = 'leaflet/dist/images/';

    localforage.config({
        name: config.appName,
        version: config.databaseVersion
    });

    return config;
});