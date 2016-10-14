define([
    'dojo/has',
    'dojo/request/xhr',

    'leaflet'
], function (
    has,
    xhr
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

    var config = {
        // app: app.App
        //      global reference to app
        app: null,

        // appName: String
        //      name of app used in permission proxy and localforage db name
        appName: 'electrofishing',

        // eventId: String(GUID)
        //      The guid for this unique event.
        eventId: null,

        // version: String
        //      The app version number.
        version: '1.1.0',

        // coordTypes: {key:String}
        //      Coordinate types as used in app/SettingsDialoge
        coordTypes: {
            utm83: 'utm83',
            ll: 'll',
            utm27: 'utm27'
        },

        quadWord: quadWord,

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
            streamsLakes_toggle: 'verifyMap_streamsLakes_toggle'
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

            // reference service
            streamsLakesService: referenceService,
            streamsFeatureService: referenceService + '/0/query',
            lakesFeatureService: referenceService + '/1/query'
        },

        // tableNames: {}
        tableNames: {
            diet: 'Diet',
            fish: 'Fish',
            habitat: 'Habitat',
            health: 'Health',
            samplingEvents: 'SamplingEvents',
            tags: 'Tags',
            equipment: 'Equipment'
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
                EVENT_ID: 'EVENT_ID',
                GEO_DEF: 'GEO_DEF',
                LOCATION_NOTES: 'LOCATION_NOTES',
                EVENT_DATE: 'EVENT_DATE',
                STATION_ID: 'STATION_ID',
                SEGMENT_LENGTH: 'SEGMENT_LENGTH',
                NUM_PASSES: 'NUM_PASSES'
            },
            equipment: {
                EVENT_ID: 'EVENT_ID',
                WAVEFORM: 'WAVEFORM',
                VOLTAGE: 'VOLTAGE',
                DUTY_CYCLE: 'DUTY_CYCLE',
                FREQUENCY: 'FREQUENCY',
                AMPS: 'AMPS',
                ANODE_DIAMETER: 'ANODE_DIAMETER',
                STOCK_DIAMETER: 'STOCK_DIAMETER',
                CATHODE_LEN: 'CATHODE_LEN',
                CATHODE_DIAMETER: 'CATHODE_DIAMETER',
                NUM_ANODES: 'NUM_ANODES',
                MACHINE_RES: 'MACHINE_RES',
                MODEL: 'MODEL',
                ANODE_SHAPE: 'ANODE_SHAPE',
                ARRAY_TYPE: 'ARRAY_TYPE',
                NUM_NETTERS: 'NUM_NETTERS',
                CATHODE_TYPE: 'CATHODE_TYPE',
                TYPE: 'TYPE'
            },
            fish: {
                FISH_ID: 'FISH_ID',
                EVENT_ID: 'EVENT_ID',
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
                FREQUENCY: 'FREQUENCY',
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
                OPERCLE: 'OPERCLE'
            },
            habitat: {
                EVENT_ID: 'EVENT_ID',
                BANKVEG: 'BANKVEG',
                BWID: 'BWID',
                DEPTR: 'DEPTR',
                DEPTL: 'DEPTL',
                DEPM: 'DEPM',
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
                VEGD: 'VEGD',
                WWID: 'WWID',
                SIN: 'SIN',
                VEL: 'VEL',
                EROS: 'EROS',
                TEMP: 'TEMP_',
                PH: 'PH',
                CON: 'CON'
            },
            reference: {
                COUNTY: 'COUNTY',
                WaterName: 'WaterName'
            }
        },

        // idTypes: {}
        //      used in IDGeoDef
        idTypes: {
            reachcode: 'reachcode',
            waterbodyid: 'waterbodyid'
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
    L.Icon.Default.imagePath = 'leaflet/dist/images';

    return config;
});
