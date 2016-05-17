define([
    'dojo/_base/declare',
    'dijit/_WidgetBase',
    'dijit/_TemplatedMixin',
    'dijit/_WidgetsInTemplateMixin',
    'app/location/_GeoDefMixin',
    'dojo/text!app/location/templates/StartDistDirGeoDef.html',
    'dojo/Deferred',
    'dojo/query',
    'dojo/topic',
    'dojo/json',
    'dojo/request/xhr',

    'app/location/PointDef'
],

function (
    declare,
    _WidgetBase,
    _TemplatedMixin,
    _WidgetsInTemplateMixin,
    _GeoDefMixin,
    template,
    Deferred,
    query,
    topic,
    json,
    xhr
    ) {
    return declare('app.location.StartDistDirGeoDef', [_WidgetBase, _TemplatedMixin, _WidgetsInTemplateMixin, _GeoDefMixin], {
        widgetsInTemplate: true,
        templateString: template,
        baseClass: 'start-dist-dir',

        // invalidStartMsg: String
        invalidStartMsg: 'Start point required!',

        // invalidDistanceMsg: String
        invalidDistanceMsg: 'Distance required!',

        // gpServiceUrl: String
        //      the url to the gp service associated with this widget
        gpServiceUrl: null,

        // verifiedFailedMsg: String
        verifiedFailedMsg: 'The verify service experienced an error!',

        constructor: function () {
            // summary:
            //    description
            console.log('app/location/StartDistDirGeoDef:constructor', arguments);

            this.gpServiceUrl = AGRC.urls.getSegmentFromStartDistDir;
        },
        postCreate: function () {
            // summary:
            //        dom is ready
            console.log('app/location/StartDistDirGeoDef:postCreate', arguments);

            this.wireEvents();
            this.defs = [this.startPointDef];
        },
        wireEvents: function () {
            // summary:
            //        wires the events for the widget
            console.log('app/location/StartDistDirGeoDef:wireEvents', arguments);

            var that = this;

            this.own(
                topic.subscribe(AGRC.topics.mapInit, function () {
                    that.featureGroup = new L.FeatureGroup().addTo(AGRC.app.map);
                    that.startPointDef.setMap(AGRC.app.map, that.featureGroup);
                }),
                this.connect(this.startPointDef, 'updateMarkerPosition', 'onInvalidate'),
                this.connect(this.distanceBox, 'onchange', 'onInvalidate'),
                query('.btn-group .btn', this.domNode).on('click', function () {
                    that.onInvalidate();
                })
            );
        },
        getDistance: function () {
            // summary:
            //      Returns the distance if it's valid. Otherwise it sets the error message
            //      and returns null.
            // returns: String || null
            console.log('app/location/StartDistDirGeoDef:getDistance', arguments);

            var dist = this.distanceBox.value;

            topic.publish(AGRC.topics.startDistDirGeoDef_onDistanceChange, dist);

            if (dist === '') {
                return null;
            } else {
                return dist;
            }
        },
        getDirection: function () {
            // summary:
            //      Returns up or down depending on what button is selected
            // returns: String (up || down)
            console.log('app/location/StartDistDirGeoDef:getDirection', arguments);

            return query('.btn-group .btn.active', this.domNode)[0].children[0].value;
        },
        getGeometry: function () {
            // summary:
            //      Returns a deferred if the geometries are valid, returns and invalid
            //      message if the geometries are not valid
            // returns: Deferred || String
            console.log('app/location/StartDistDirGeoDef:getGeometry', arguments);

            var def = new Deferred();
            var startPnt = this.startPointDef.getPoint();
            var distance = this.getDistance();
            var direction = this.getDirection();
            var params;
            var that = this;

            if (!startPnt) {
                return this.invalidStartMsg;
            } else if (distance === null) {
                return this.invalidDistanceMsg;
            }

            this.geoDef = 'start:' + json.stringify(startPnt) + '|dist:' + distance + '|dir:' + direction;

            params = this.getXHRParams(startPnt, distance, direction);

            xhr(this.gpServiceUrl + '/submitJob?', params).then(function (data) {
                if (!that.onGetSegsCallback(data, def)) {
                    def.reject('There was an error with the verify service.');
                }
            }, function (err) {
                var msg = 'There was an error with the getSegmentFromStartDistDir service: ';
                AGRC.errorLogger.log(err, msg);
                def.reject(msg + err.message);
            });

            return def;
        },
        getXHRParams: function (startPnt, distance, direction) {
            // summary:
            //        builds the xhr parameters object
            // startPnt: point
            // distance: Number
            // direction: String
            console.log('app/location/StartDistDirGeoDef:getXHRParams', arguments);

            return {
                query: {
                    f: 'json',
                    point: json.stringify({
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
                                geometry: {
                                    x: Math.round(startPnt.x),
                                    y: Math.round(startPnt.y),
                                    spatialReference: {wkid: 26912}},
                                attributes: {OBJECTID: 1}
                            }
                        ]
                    }),
                    distance: distance,
                    direction: direction
                },
                handleAs: 'json'
            };
        }
    });
});
