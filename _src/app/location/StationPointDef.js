define([
    'dojo/_base/declare',
    'app/location/PointDef',
    'dojo/text!app/location/templates/StationPointDef.html'
], function (
    declare,
    PointDef,
    template
) {
    return declare([PointDef], {
        templateString: template,
        baseClass: 'station-point-def',

        constructor: function () {
            console.log(this.declaredClass + '::constructor', arguments);
        }
    });
});
