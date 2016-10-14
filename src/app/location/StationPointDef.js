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
        },
        onOtherMapBtnClicked: function () {
            // summary:
            //      overridden to not do anything since it's the only widget for
            //      this dialog
            console.log(this.declaredClass + '::onOtherMapBtnClicked', arguments);
        }
    });
});
