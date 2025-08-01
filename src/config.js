import localforage from 'localforage';

let proxyBase;
const projectId = JSON.parse(import.meta.env.VITE_FIREBASE_CONFIG).projectId;
if (import.meta.env.VITE_BUILD === 'prod') {
  proxyBase = `https://us-central1-${projectId}.cloudfunctions.net/maps/`;
} else if (import.meta.env.VITE_BUILD === 'stage') {
  proxyBase = `https://us-central1-${projectId}.cloudfunctions.net/maps/`;
} else {
  proxyBase = `http://localhost:5001/${projectId}/us-central1/maps/`;
}

const wildlifeToolbox = proxyBase + 'toolbox/';
const wildlifeFeatureService = proxyBase + 'mapservice/';
const referenceService = proxyBase + 'reference/';
const fldEVENT_ID = 'EVENT_ID';
const fldTRANSECT_ID = 'TRANSECT_ID';
const markerImagesFolder = 'markers/';
const fieldNames = {
  MOREINFO: 'MOREINFO',
  OBJECTID: 'OBJECTID',
  stations: {
    NAME: 'NAME',
    STATION_ID: 'STATION_ID',
    STREAM_TYPE: 'STREAM_TYPE',
    WATER_ID: 'WATER_ID',
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
    OBSERVERS: 'OBSERVERS',
    SUBMITTER: 'SUBMITTER',
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
    ARRAY_TYPE: 'ARRAY_TYPE',
    NUM_NETTERS: 'NUM_NETTERS',
    CATHODE_TYPE: 'CATHODE_TYPE',
    TYPE: 'TYPE',
    DURATION: 'PEDAL_TIME',
  },
  anodes: {
    EQUIPMENT_ID: 'EQUIPMENT_ID',
    ANODE_DIAMETER: 'ANODE_DIAMETER',
    ANODE_SHAPE: 'ANODE_SHAPE',
    STOCK_DIAMETER: 'STOCK_DIAMETER',
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
    NOTES: 'NOTES',
    COUNT: 'COUNT', // only used client side for averaging weights
  },
  diet: {
    FISH_ID: 'FISH_ID',
    CLASS: 'CLASS',
    FISH_SPECIES: 'FISH_SPECIES',
    MEASUREMENT_TYPE: 'MEASUREMENT_TYPE',
    MEASUREMENT: 'MEASUREMENT',
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
    NEW_TAG: 'NEW_TAG',
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
    COLLECTION_PART: 'COLLECTION_PART',
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
    BACKWATER: 'BACKWATER',
  },
  transect: {
    EVENT_ID: fldEVENT_ID,
    BWID: 'BWID',
    WWID: 'WWID',
    STARTING_BANK: 'STARTING_BANK',
    TRANSECT_ID: fldTRANSECT_ID,
  },
  transectMeasurements: {
    DEPTH: 'DEPTH',
    VELOCITY: 'VELOCITY',
    SUBSTRATE: 'SUBSTRATE',
    DISTANCE_START: 'DISTANCE_START',
    TRANSECT_ID: fldTRANSECT_ID,
  },
  reference: {
    COUNTY: 'COUNTY',
    WaterName: 'WaterName',
    Permanent_Identifier: 'Permanent_Identifier',
  },
};
const tableNames = {
  diet: 'Diet',
  fish: 'Fish',
  habitat: 'Habitat',
  health: 'Health',
  samplingEvents: 'SamplingEvents',
  tags: 'Tags',
  equipment: 'Equipment',
  anodes: 'Anodes',
  transect: 'Transect',
  transectMeasurements: 'TransectMeasurements',
};

const config = {
  app: {},

  // appName: String
  //      name of app used in permission proxy and localforage db name
  appName: 'electrofishing',

  // databaseVersion: Number
  //      localforage database version
  databaseVersion: 3, // whole numbers only

  // version: String
  //      The app version number.
  version: '2.4.12', // x-release-please-version

  // coordTypes: {key:String}
  //      Coordinate types as used in app/SettingsDialog
  coordTypes: {
    utm83: 'utm83',
    ll: 'll',
    utm27: 'utm27',
  },

  // tempValueKey: String
  //      used by _InProgressCacheMixin
  tempValueKey: 'tempValue',

  // labelsMinZoom: number
  labelsMinZoom: 13,

  // largerSymbolsMinZoom: number
  largerSymbolsMinZoom: 14,

  largerLineSymbolWidth: 6,
  defaultLineSymbolWidth: 3,

  colors: {
    default: '#3388ff',
    selected: '#D1E600',
  },

  // topics: {key:String}
  //      Global pubsub-js topics used in the app
  topics: {
    pointDef_onBtnClick: 'pointDef_onBtnClick',
    mapInit: 'verifyMap_mapinited',
    startDistDirGeoDef_onDistanceChange: 'startDistDirGeoDef_onDistanceChange',
    newCollectionEvent: 'app_newCollectionEvent',
    onSubmitReportClick: 'header_onSubmitReportClick',
    onCancelReportClick: 'header_onCancelReportClick',
    onMapClick: 'verifyMap_mapClick',
  },

  noFish: 'NO_FISH',

  // urls: {}
  urls: {
    // basemaps
    googleImagery: `https://discover.agrc.utah.gov/login/path/${import.meta.env.VITE_QUAD_WORD}/tiles/utah/{z}/{x}/{y}`,
    overlay: `https://discover.agrc.utah.gov/login/path/${
      import.meta.env.VITE_QUAD_WORD
    }/tiles/overlay_basemap/{z}/{x}/{y}`,

    // leaflet icons
    endIcon: `${markerImagesFolder}end-icon.png`,
    markerImagesFolder,
    markerShadow: `${markerImagesFolder}marker-shadow.png`,
    startIcon: `${markerImagesFolder}start-icon.png`,
    selectedIcon: `${markerImagesFolder}selected-icon.png`,

    // gp tasks
    getSegmentFromCoords: wildlifeToolbox + 'GetSegmentFromCoords',
    getSegmentFromStartDistDir: wildlifeToolbox + 'GetSegmentFromStartDistDir',
    getSegmentFromID: wildlifeToolbox + 'GetSegmentFromID',
    newCollectionEvent: wildlifeToolbox + 'NewCollectionEvent/execute',

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
    streamsFeatureService: referenceService + '0',
    lakesFeatureService: referenceService + '1',
  },

  // tableNames: {}
  tableNames,

  // fieldNames: {}
  //      Field names
  fieldNames,

  requiredFields: {
    [tableNames.samplingEvents]: [
      fieldNames.samplingEvents.SEGMENT_LENGTH,
      fieldNames.samplingEvents.EVENT_DATE,
      fieldNames.samplingEvents.PURPOSE,
      fieldNames.samplingEvents.OBSERVERS,
    ],
  },

  // noWeightValue: Number
  //      The value used in the WEIGHT field in the Fish table
  //      used when no weight was collected for a fish (dropped in the river or something)
  noWeightValue: -1,

  // tooSmallValue: Number
  //      The value used in the WEIGHT field in the Fish table
  //      used when the fish was too small to weigh
  tooSmallValue: 0,

  domains: {},

  emptyPoint: { x: '', y: '' },
};

// Leaflet config
// L.Icon.Default.prototype.options.imagePath = 'leaflet/dist/images/';

localforage.config({
  name: config.appName,
  version: config.databaseVersion,
});

export default config;
