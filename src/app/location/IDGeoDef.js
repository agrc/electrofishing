define([
    'dojo/_base/declare',
    'dijit/_WidgetBase',
    'dijit/_TemplatedMixin',
    'dijit/_WidgetsInTemplateMixin',
    'app/location/_GeoDefMixin',
    'dojo/text!app/location/templates/IDGeoDef.html',
    'dojo/dom-class',
    'dojo/Deferred',
    'dojo/request/xhr'

],

function (
    declare,
    _WidgetBase,
    _TemplatedMixin,
    _WidgetsInTemplateMixin,
    _GeoDefMixin,
    template,
    domClass,
    Deferred,
    xhr
    ) {
    return declare('app.location.IDGeoDef', [_WidgetBase, _TemplatedMixin, _WidgetsInTemplateMixin, _GeoDefMixin], {
        widgetsInTemplate: false,
        templateString: template,
        baseClass: 'id-geo-def',

        // gpServiceUrl: String
        //      the url to the gp service related to this widget
        gpServiceUrl: null,

        // notEnoughDigitsMsg: String
        //      invalid message displayed when there are not enough digits
        notEnoughDigitsMsg: 'There are not enough digits!',

        // tooManyDigitsMsg: String
        //      invalid message displayed when there are too many digits
        tooManyDigitsMsg: 'There are too many digits!',

        // invalidMsg: String
        //      the string returned by validate if the form is not valid
        invalidMsg: 'A valid id is required!',

        // reachDigits: Number
        //      The number of digits that a reach code should have
        //      See getID
        reachDigits: 14,

        // errorMsg: String
        //      The error message displayed if the gp service chokes
        errorMsg: 'There was an error with the verify service',

        // verifiedFailedMsg: String
        //      if the script throws an error
        verifiedFailedMsg: 'No matching id found!',


        constructor: function () {
            // summary:
            //    description
            console.log(this.declaredClass + '::constructor:', arguments);

            this.gpServiceUrl = AGRC.urls.getSegmentFromID;
            this.defs = [];
        },
        postCreate: function () {
            // summary:
            //        dom is ready
            console.log(this.declaredClass + '::postCreate', arguments);

            this.wireEvents();
        },
        wireEvents: function () {
            // summary:
            //        wires the events for the widget
            console.log(this.declaredClass + '::wireEvents', arguments);

            var that = this;

            // invalidate on textbox value change
            this.connect(this.waterIDBox, 'onchange', function () {
                that.onInvalidate(that.reachBox);
            });
            this.connect(this.reachBox, 'onchange', function () {
                that.onInvalidate(that.waterIDBox);
            });

            // validate value on blur
            this.connect(this.waterIDBox, 'onblur', 'getID');
            this.connect(this.reachBox, 'onblur', 'getID');
        },
        onInvalidate: function (otherBox) {
            // summary:
            //        fires when a change is made to either text box
            // otherBox: TextBox
            console.log(this.declaredClass + '::onInvalidate', arguments);

            otherBox.value = '';
        },
        getID: function () {
            // summary:
            //        validates the number of digits in the text box with a value in it
            // returns: Boolean | {id: String, type: String}
            console.log(this.declaredClass + '::getID', arguments);

            function toggleErrorClass(div, add) {
                var f = (add) ? domClass.add : domClass.remove;
                f(div, 'error');
            }

            var length;

            // clear any previous messages
            this.reachBoxTxt.innerHTML = '';
            toggleErrorClass(this.reachGroup, false);
            this.waterIDBoxTxt.innerHTML = '';
            toggleErrorClass(this.waterIDGroup, false);

            if (this.waterIDBox.value.length > 0) {
                // no validation
                return {
                    id: this.waterIDBox.value,
                    type: AGRC.idTypes.waterbodyid
                };
            } else if (this.reachBox.value.length > 0) {
                length = this.reachBox.value.length;
                if (length === this.reachDigits) {
                    return {
                        id: this.reachBox.value,
                        type: AGRC.idTypes.reachcode
                    };
                } else if (length > this.reachDigits) {
                    this.reachBoxTxt.innerHTML = this.tooManyDigitsMsg;
                    toggleErrorClass(this.reachGroup, true);
                    return false;
                } else {
                    this.reachBoxTxt.innerHTML = this.notEnoughDigitsMsg;
                    toggleErrorClass(this.reachGroup, true);
                    return false;
                }
            } else {
                return false;
            }
        },
        getGeometry: function () {
            // summary:
            //        fires off the validate service and returns the segment
            // returns: Deferred
            console.log(this.declaredClass + '::getGeometry', arguments);

            var def;    // the deferred returned if the id is valid
            var idObj;  // the id object (or false) as returned by getID
            var xhrParams;
            var that = this;

            idObj = this.getID();

            if (idObj !== false) {
                that.geoDef = 'id:' + idObj.id + '|type:' + idObj.type;

                def = new Deferred();

                xhrParams = this.getXHRParams(idObj.id, idObj.type);

                xhr(this.gpServiceUrl + '/submitJob?', xhrParams)
                    .then(function (data) {
                        if (!that.onGetSegsCallback(data, def)) {
                            def.reject(that.errorMsg);
                        }
                    }, function (err) {
                        AGRC.errorLogger.log(err, 'Error getting id');
                        def.reject(that.erorMsg + ': ' + err.message);
                    });

                return def;
            } else {
                return this.invalidMsg;
            }
        },
        getXHRParams: function (id, type) {
            // summary:
            //        builds the xhr parameter object
            //
            // id: String
            // type: String
            console.log(this.declaredClass + '::getXHRParams', arguments);

            return {
                query: {
                    f: 'json',
                    id: id,
                    type: type
                },
                handleAs: 'json'
            };
        }
    });
});
