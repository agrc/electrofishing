define([
    'dijit/_TemplatedMixin',
    'dijit/_WidgetBase',

    'dojo/dom-class',
    'dojo/text!app/location/templates/PointDef.html',
    'dojo/topic',
    'dojo/_base/declare',
    'dojo/_base/lang',

    'proj4',
    'proj4leaflet'
], function (
    _TemplatedMixin,
    _WidgetBase,

    domClass,
    template,
    topic,
    declare,
    lang
) {
    return declare([_WidgetBase, _TemplatedMixin], {
        templateString: template,
        baseClass: 'point-def',

        // labels: {}
        //      The text for the different labels above the textboxes as well
        //      as the placeholders within the text boxes
        labels: {
            utm: {
                y: 'Northing',
                x: 'Easting',
                placeY: '4435007',
                placeX: '445615'
            },
            ll: {
                y: 'Latitude',
                x: 'Longitude',
                placeY: '40.616234',
                placeX: '-111.841234'
            }
        },

        // yLabelTxt: String
        //      the txt that is currently showing above the y text box
        yLabelTxt: null,
        _setYLabelTxtAttr: {node: 'yLabel', type: 'innerHTML'},

        // yPlaceHolder: String
        //      the placeholder text in the y text box
        yPlaceHolder: null,
        _setYPlaceHolderAttr: {node: 'yBox', type: 'attribute', attribute: 'placeholder'},

        // xLabelTxt: String
        //      the text that is currently showing above the x text box
        xLabelTxt: null,
        _setXLabelTxtAttr: {node: 'xLabel', type: 'innerHTML'},

        // xPlaceHolder: String
        //      the placeholder text in the x text box
        xPlaceHolder: null,
        _setXPlaceHolderAttr: {node: 'xBox', type: 'attribute', attribute: 'placeholder'},

        // validateMsgs: {}
        //      validate error messages
        validateMsgs: {
            tooLong: 'Too many digits!',
            tooShort: 'Too few digits!'
        },

        // validateErrorClass: String
        //      The bootstrap css class to add when there is a validate error
        validateErrorClass: 'has-error',

        // validateDijits: {}
        //      stores the number of digits there should be for utm values
        validateDijits: {
            utmY: 7,
            utmX: 6
        },

        // currentType: String
        //      utm or ll
        currentType: null,

        // marker: L.Marker
        //      the marker on the map
        marker: null,

        // utm27crs: L.CRS
        //      CRS for UTM 12 NAD27
        utm27crs: null,

        // utm83crs: L.CRS
        //      CRS for UTM 12 NAD83
        utm83crs: null,

        // startIcon: L.Icon
        //      the green start icon
        startIcon: null,

        // endIcon: L.Icon
        //      the red end icon
        endIcon: null,

        // fGroup: L.FeatureGroup
        //      feature group from parent *GeoDef class
        fGroup: null,


        // properties passed via the constructor

        // label: String
        //      The label at the top (Start or End)
        label: 'Start',

        constructor: function () {
            // summary:
            //    description
            console.log('app/location/PointDef:constructor', arguments);

            this.utm27crs = new L.Proj.CRS(
                'EPSG:26712',
                '+proj=utm +zone=12 +ellps=clrk66 +datum=NAD27 +units=m +no_defs',
                new L.Transformation(1, 5682968.14599198, -1, 10997674.9165387)
            );
            this.utm83crs = new L.Proj.CRS(
                'EPSG:26912',
                '+proj=utm +zone=12 +ellps=GRS80 +datum=NAD83 +units=m +no_defs',
                {transformation: new L.Transformation(1, 5120900, -1, 9998100)}
            );

            this.subscribeHandles = [];
        },
        buildRendering: function () {
            // summary:
            //      description
            console.log('app/location/PointDef:buildRendering', arguments);

            this.inherited(arguments);

            if (!localStorage.coordType) {
                this.onCoordTypeChange(AGRC.coordTypes.utm83);
            } else {
                this.onCoordTypeChange(localStorage.coordType);
            }
        },
        postCreate: function () {
            // summary:
            //      description
            console.log('app/location/PointDef:postCreate', arguments);

            var url = (this.label === 'Start') ? AGRC.urls.startIcon : AGRC.urls.endIcon;

            this.icon = new L.Icon({
                iconUrl: url,
                iconRetinaUrl: url.replace('.png', '-2x.png'),
                iconSize: new L.Point(25, 41),
                iconAnchor: new L.Point(13, 41),
                popupAnchor: new L.Point(1, -34),
                shadowSize: new L.Point(41, 41),
                shadowUrl: AGRC.urls.markerShadow
            });

            this.wireEvents();
        },
        wireEvents: function () {
            // summary:
            //      description
            console.log('app/location/PointDef:wireEvents', arguments);

            this.own(
                topic.subscribe(AGRC.topics.coordTypeToggle_onChange, lang.hitch(this, this.onCoordTypeChange)),
                topic.subscribe(AGRC.topics.pointDef_onBtnClick, lang.hitch(this, this.onOtherMapBtnClicked))
            );

            // validate text boxes
            this.connect(this.domNode, 'input[type="text"]:focusout', 'onTextBoxFocusOut');

            this.connect(this.mapBtn, 'click', 'onMapBtnClicked');
        },
        onCoordTypeChange: function (type) {
            // summary:
            //      Fires when the user changes the coordinate type through
            //      the CoordTypeToggle widget.
            // type: String (AGRC.coordTypes)
            console.log('app/location/PointDef:onCoordTypeChange', arguments);

            this.clear();

            if (type === AGRC.coordTypes.ll) {
                this.set('yLabelTxt', this.labels.ll.y);
                this.set('yPlaceHolder', this.labels.ll.placeY);
                this.set('xLabelTxt', this.labels.ll.x);
                this.set('xPlaceHolder', this.labels.ll.placeX);
            } else {
                this.set('yLabelTxt', this.labels.utm.y);
                this.set('yPlaceHolder', this.labels.utm.placeY);
                this.set('xLabelTxt', this.labels.utm.x);
                this.set('xPlaceHolder', this.labels.utm.placeX);
            }
            this.currentType = type;
        },
        validate: function (box) {
            // summary:
            //      Validates the passed in text box for number of dijits for
            //      only for utm values
            console.log('app/location/PointDef:validate', arguments);

            var numDigits;                  // the number of dijits that the box should have
            var value = box.value;          // the value of the text box
            var message;                    // the invalid message to be displayed
            var helpTxtSpan;                // the span element associated with the text box
            var groupDiv;                   // the div (class='form-group') associated with the text box
            var that = this;

            function setNoError() {
                helpTxtSpan.innerHTML = '';
                domClass.remove(groupDiv, that.validateErrorClass);
            }

            helpTxtSpan = this[box.getAttribute('data-dojo-attach-point') + 'Txt'];
            groupDiv = this[box.getAttribute('data-dojo-attach-point')[0] + 'Group'];

            // return true if we are in ll
            if (this.currentType === 'll') {
                return true;
            }

            if (value.length === 0) {
                setNoError();
                return false;
            }

            // determine if this is x or y box
            numDigits = (box === this.yBox) ? this.validateDijits.utmY : this.validateDijits.utmX;

            if (value.length < numDigits) {
                message = this.validateMsgs.tooShort;
            } else if (value.length > numDigits) {
                message = this.validateMsgs.tooLong;
            }

            if (message) {
                helpTxtSpan.innerHTML = message;
                domClass.add(groupDiv, this.validateErrorClass);

                return false;
            } else {
                setNoError();

                return true;
            }
        },
        onMapBtnClicked: function (evt) {
            // summary:
            //      fires when the user clicks the map btn
            console.log('app/location/PointDef:onMapBtnClicked', arguments);

            var disabled;

            evt.preventDefault();

            if (domClass.contains(this.mapBtn, 'active')) {
                // button is being de-selected
                this.map.off('click', this.onMapClicked, this);
                disabled = false;
                this.map._container.style.cursor = '';
            } else {
                this.map.on('click', this.onMapClicked, this);
                disabled = true;
                this.map._container.style.cursor = 'crosshair';
            }

            this.yBox.disabled = disabled;
            this.xBox.disabled = disabled;

            topic.publish(AGRC.topics.pointDef_onBtnClick, this);
        },
        onOtherMapBtnClicked: function (widget) {
            // summary:
            //      fires when any PointDef widget's map button is clicked
            console.log('app/location/PointDef:onOtherMapBtnClicked', arguments);

            if (widget !== this && this.map) {
                this.map.off('click', this.onMapClicked, this);
                domClass.remove(this.mapBtn, 'active');
                this.yBox.disabled = false;
                this.xBox.disabled = false;
            }
        },
        onMapClicked: function (evt) {
            // summary:
            //      description
            console.log('app/location/PointDef:onMapClicked', arguments);

            var projection;
            var pnt;

            this.updateMarkerPosition(evt.latlng);

            if (this.currentType === AGRC.coordTypes.ll) {
                this.yBox.value = Math.round(evt.latlng.lat * 1000000) / 1000000;
                this.xBox.value = Math.round(evt.latlng.lng * 1000000) / 1000000;
            } else if (this.currentType === AGRC.coordTypes.utm83) {
                projection = this.utm83crs.projection;
                pnt = projection.project(evt.latlng);
                this.yBox.value = parseInt(pnt.y, 10);
                this.xBox.value = parseInt(pnt.x, 10);
            } else {
                // utm 27
                projection = this.utm27crs.projection;
                pnt = projection.project(evt.latlng);
                this.yBox.value = parseInt(pnt.y, 10);
                this.xBox.value = parseInt(pnt.x, 10);
            }
        },
        updateMarkerPosition: function (ll) {
            // summary:
            //      description
            console.log('app/location/PointDef:updateMarkerPosition', arguments);

            var x;
            var y;

            if (!ll) {
                y = this.yBox.value;
                x = this.xBox.value;

                // get it from the text boxes
                if (this.currentType === AGRC.coordTypes.ll) {
                    ll = new L.LatLng(y, x);
                } else if (this.currentType === AGRC.coordTypes.utm83) {
                    ll = this.utm83crs.projection.unproject(new L.Point(x, y));
                } else {
                    // utm27
                    ll = this.utm27crs.projection.unproject(new L.Point(x, y));
                }
            }
            if (this.marker) {
                this.marker.setLatLng(ll);
            } else {
                this.marker = new L.Marker(ll, {icon: this.icon});
                this.fGroup.addLayer(this.marker);
            }

            // // zoom to marker if it's off of the map
            if (!this.map.getBounds().contains(this.fGroup.getBounds())) {
                this.map.fitBounds(this.fGroup.getBounds().pad(0.05));
            }
        },
        clear: function () {
            // summary:
            //      removes text box values and marker
            console.log('app/location/PointDef:clear', arguments);

            this.yBox.value = '';
            this.xBox.value = '';

            if (this.marker) {
                this.fGroup.removeLayer(this.marker);
                this.marker = null;
            }

            this.validate(this.yBox);
            this.validate(this.xBox);

            domClass.remove(this.mapBtn, 'active');
            this.yBox.disabled = false;
            this.xBox.disabled = false;
        },
        getPoint: function () {
            // summary:
            //      gets the point if there is a valid point
            // returns: false || {x,y}
            //      returns false if there is not point defined.
            //      otherwise returns a point object in utm
            console.log('app/location/PointDef:getPoint', arguments);

            if (this.marker === null || !this.marker) {
                return false;
            } else {
                return this.utm83crs.projection.project(this.marker.getLatLng());
            }
        },
        setMap: function (map, group) {
            // summary:
            //      sets the local pointer to the fGroup.
            //      Called by *GeoDef parent class
            console.log('app/location/PointDef:setMap', arguments);

            this.map = map;
            this.fGroup = group;
        },
        onTextBoxFocusOut: function () {
            // summary:
            //      fires when a text box looses focus
            console.log('app/location/PointDef:onTextBoxFocusOut', arguments);

            var yValid = this.validate(this.yBox);
            var xValid = this.validate(this.xBox);

            if (yValid && xValid) {
                this.updateMarkerPosition();
            } else {
                // clear marker
                if (this.marker) {
                    this.fGroup.removeLayer(this.marker);
                    this.marker = null;
                }
            }
        }
    });
});
