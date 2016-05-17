// required to load jquery with dojo's amd loader
// don't move this below the require statement or it will
// screw up the build system
define.amd.jQuery = true;
require({
    packages: [
        {
            name: 'app',
            location: '../app'
        },{
            name: 'ijit',
            location: '../ijit'
        },{
            name: 'bootstrap',
            location: '../bootstrap',
            main: 'js/bootstrap'
        },{
            name: 'jquery',
            location: '../jquery',
            main: 'jquery-1.10.0'
        },{
            name: 'leaflet',
            location: '../leaflet',
            main: 'leaflet-src'
        }, {
            name: 'proj4js',
            location: '../proj4js',
            main: 'proj4'
        }, {
            name: 'agrc',
            location: '../agrc'
        }, {
            name: 'dgrid',
            location: '../dgrid'
        }, {
            name: 'put-selector',
            location: '../put-selector'
        }, {
            name: 'xstyle',
            location: '../xstyle'
        }, {
            name: 'bootstrap-combobox',
            location: '../bootstrap-combobox'
        }, {
            name: 'typeahead',
            location: '../typeahead',
            main: 'typeahead'
        }
    ]
}, ['app']);