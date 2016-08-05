require({
    packages: [
        'agrc',
        'app',
        'dgrid',
        'dijit',
        'dojo',
        'dojox',
        'dstore',
        'ijit',
        'proj4',
        {
            name: 'bootstrap',
            location: './bootstrap',
            main: 'dist/js/bootstrap'
        }, {
            name: 'bootstrap-combobox',
            location: './bootstrap-combobox',
            main: 'js/bootstrap-combobox.js'
        }, {
            name: 'esri-leaflet',
            location: './esri-leaflet/dist',
            main: 'esri-leaflet-src'
        }, {
            name: 'jquery',
            location: './jquery/dist',
            main: 'jquery'
        }, {
            name: 'leaflet',
            location: './leaflet',
            main: 'dist/leaflet-src'
        }, {
            name: 'proj4',
            location: './proj4/dist',
            main: 'proj4'
        }, {
            name: 'proj4leaflet',
            location: './Proj4Leaflet/src',
            main: 'proj4leaflet'
        }
    ]
});
