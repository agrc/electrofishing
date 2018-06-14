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
        {
            name: 'bootstrap',
            location: './bootstrap',
            main: 'dist/js/bootstrap'
        }, {
            name: 'bootstrap-combobox',
            location: './bootstrap-combobox'
        }, {
            name: 'esri-leaflet',
            location: './esri-leaflet'
        }, {
            name: 'jquery',
            location: './jquery/dist',
            main: 'jquery'
        }, {
            name: 'leaflet',
            location: './leaflet',
            main: 'dist/leaflet-src'
        }, {
            name: 'localforage',
            location: './localforage/dist',
            main: 'localforage'
        }, {
            name: 'proj4',
            location: './proj4/dist',
            main: 'proj4'
        }, {
            name: 'proj4leaflet',
            location: './Proj4Leaflet/src',
            main: 'proj4leaflet'
        }, {
            name: 'toaster',
            location: './toaster',
            main: 'dist/Toaster'
        }
    ]
});
