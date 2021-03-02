require({
  packages: [
    'agrc',
    'app',
    'dgrid',
    'dijit',
    'dojo',
    'dojox',
    'dstore',
    'handlebars',
    'ijit',
    'papaparse',
    'react-app',
    {
      name: 'bootstrap',
      location: './bootstrap',
      main: 'dist/js/bootstrap',
    },
    {
      name: 'bootstrap-combobox',
      location: './bootstrap-combobox',
    },
    {
      name: 'esri-leaflet',
      location: '../node_modules/esri-leaflet',
      main: 'dist/esri-leaflet-debug',
    },
    {
      name: 'downshift',
      location: '../node_modules/downshift/dist',
      main: 'downshift.umd',
    },
    {
      name: 'jquery',
      location: './jquery/dist',
      main: 'jquery',
    },
    {
      name: 'immer',
      location: '../node_modules/immer/dist',
      main: 'immer.umd.development',
    },
    {
      name: 'use-immer',
      location: '../node_modules/use-immer/dist',
      main: 'use-immer.umd',
    },
    {
      name: 'leaflet',
      location: '../node_modules/leaflet',
      main: 'dist/leaflet-src',
    },
    {
      name: 'localforage',
      location: './localforage/dist',
      main: 'localforage',
    },
    {
      name: 'pubsub-js',
      location: '../node_modules/pubsub-js',
      main: 'src/pubsub',
    },
    {
      name: 'proj4',
      location: './proj4/dist',
      main: 'proj4',
    },
    {
      name: 'proj4leaflet',
      location: './Proj4Leaflet/src',
      main: 'proj4leaflet',
    },
    {
      name: 'react-toastify',
      location: './react-toastify',
      main: 'react-toastify.esm',
    },
    {
      name: 'react',
      location: '../node_modules/react/umd',
      main: 'react.development',
    },
    {
      name: 'react-dom',
      location: '../node_modules/react-dom/umd',
      main: 'react-dom.development',
    },
    {
      name: 'react-transition-group',
      location: '../node_modules/react-transition-group/dist',
      main: 'react-transition-group',
    },
    {
      name: 'prop-types',
      location: '../node_modules/prop-types',
      main: 'prop-types',
    },
    {
      name: 'clsx',
      location: '../node_modules/clsx/dist',
      main: 'clsx.min',
    },
    {
      name: 'uuid',
      location: '../node_modules/uuid/dist/umd',
      main: 'uuid.min',
    },
  ],
});
