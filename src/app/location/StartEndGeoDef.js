define([
    'app/config',
    'app/location/_GeoDefMixin',

    'dijit/_TemplatedMixin',
    'dijit/_WidgetBase',
    'dijit/_WidgetsInTemplateMixin',

    'dojo/aspect',
    'dojo/Deferred',
    'dojo/json',
    'dojo/request/xhr',
    'dojo/text!app/location/templates/StartEndGeoDef.html',
    'dojo/topic',
    'dojo/_base/array',
    'dojo/_base/declare',
    'dojo/_base/lang',

    'app/location/PointDef'
], function (
    config,
    _GeoDefMixin,

    _TemplatedMixin,
    _WidgetBase,
    _WidgetsInTemplateMixin,

    aspect,
    Deferred,
    json,
    xhr,
    template,
    topic,
    array,
    declare,
    lang
) {
    return declare([_WidgetBase, _TemplatedMixin, _WidgetsInTemplateMixin, _GeoDefMixin], {
        widgetsInTemplate: true,
        templateString: template,
        baseClass: 'start-end-geodef',

        // invalidStartMsg: String
        invalidStartMsg: 'Valid start point required!',

        // invalidEndMsg: String
        invalidEndMsg: 'Valid end point required!',

        // featureGroup: L.FeatureGroup
        //      The group that contains all of the markers associated with this class
        featureGroup: null,

        // defs: PointDef[]
        //      an array to store the point defs
        //      used in _GeoDefMixin:clearGeometry
        defs: null,

        // verifyFailedMsg: String
        //      Message displayed if the verify location task fails
        verifiedFailedMsg: 'There was an error with the verify service.',

        // gpServiceUrl: String
        //      The url to the gp service associated with this widget
        gpServiceUrl: null,

        constructor: function () {
            // summary:
            //    description
            console.log('app/location/StartEndGeoDef:constructor', arguments);

            this.gpServiceUrl = config.urls.getSegmentFromCoords;
        },
        postCreate: function () {
            // summary:
            //      description
            console.log('app/location/StartEndGeoDef:postCreate', arguments);

            this.defs = [this.startPointDef, this.endPointDef];

            this.wireEvents();
        },
        wireEvents: function () {
            // summary:
            //      description
            console.log('app/location/StartEndGeoDef:wireEvents', arguments);

            var that = this;

            this.own(
                topic.subscribe(config.topics.mapInit, function () {
                    that.featureGroup = new L.FeatureGroup().addTo(config.app.map);
                    that.startPointDef.setMap(config.app.map, that.featureGroup);
                    that.endPointDef.setMap(config.app.map, that.featureGroup);
                })
            );
            array.forEach(this.defs, function (def) {
                this.own(aspect.after(def, 'updateMarkerPosition', lang.hitch(this, 'onInvalidate')));
            }, this);
        },
        getGeometry: function () {
            // summary:
            //      gets points from pointdefs and submits them to the gp task
            // returns: def || String (if we are missing a point)
            console.log('app/location/StartEndGeoDef:getGeometry', arguments);

            var def = new Deferred();
            var start = this.startPointDef.getPoint();
            var end = this.endPointDef.getPoint();
            var params; // parameters for the xhr call
            var that = this;

            if (!start) {
                return this.invalidStartMsg;
            } else if (!end) {
                return this.invalidEndMsg;
            }

            this.geoDef = 'start:' + json.stringify(start) + '|end:' + json.stringify(end);

            params = this.getXHRParams(start, end);

            xhr(this.gpServiceUrl + '/submitJob?', params).then(function (data) {
                if (!that.onGetSegsCallback(data, def)) {
                    def.reject('There was an error with the verify service.');
                }
            }, function (err) {
                var msg = 'There was an error with the getSegmentFromCoords service: ';
                def.reject(msg + err.message);
            });

            return def;
        },
        getXHRParams: function (start, end) {
            // summary:
            //      builds the parameters object for the xhr request
            // start: point
            // end: point
            console.log('app/location/StartEndGeoDef:getXHRParams', arguments);

            return {
                query: {
                    f: 'json',
                    points: json.stringify({
                        displayFieldName: '',
                        geometryType: 'esriGeometryPoint',
                        spatialReference: {
                            wkid: 26912,
                            latestWkid: 26912
                        },
                        fields: [{
                            name: 'OBJECTID',
                            type: 'esriFieldTypeOID',
                            alias: 'OBJECTID'
                        }],
                        features: [
                            {
                                geometry: {x: Math.round(start.x), y: Math.round(start.y), spatialReference: { wkid: 26912 }},
                                attributes: {OBJECTID: 1}
                            },
                            {
                                geometry: {x: Math.round(end.x), y: Math.round(end.y), spatialReference: { wkid: 26912 }},
                                attributes: {OBJECTID: 2}
                            }
                        ]
                    })
                },
                handleAs: 'json'
            };
        }
    });
});
