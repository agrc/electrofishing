require({
    packages: [
        'app',
        'dgrid',
        'dijit',
        'dojo',
        'dstore',
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
            name: 'bootstrap3-typeahead',
            location: './bootstrap3-typeahead',
            main: 'bootstrap3-typeahead'
        }, {
            name: 'jquery',
            location: './jquery/dist',
            main: 'jquery'
        }, {
            name: 'leaflet',
            location: './leaflet',
            main: 'dist/leaflet.js'
        }, {
            name: 'proj4',
            location: './proj4/dist',
            main: 'proj4'
        }
    ]
});
