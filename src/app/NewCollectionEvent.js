define([
    'app/config',
    'app/helpers',
    'app/_SubmitJobMixin',

    'dijit/_TemplatedMixin',
    'dijit/_WidgetBase',
    'dijit/_WidgetsInTemplateMixin',

    'dojo/dom-class',
    'dojo/json',
    'dojo/request/xhr',
    'dojo/text!app/templates/NewCollectionEvent.html',
    'dojo/topic',
    'dojo/_base/array',
    'dojo/_base/declare',
    'dojo/_base/fx',
    'dojo/_base/lang',

    'dojox/uuid/generateRandomUuid',

    'ijit/modules/NumericInputValidator',

    'app/catch/Catch',
    'app/habitat/Habitat',
    'app/location/Location',
    'app/method/Method'
],

function (
    config,
    helpers,
    _SubmitJobMixin,

    _TemplatedMixin,
    _WidgetBase,
    _WidgetsInTemplateMixin,

    domClass,
    json,
    xhr,
    template,
    topic,
    array,
    declare,
    fx,
    lang,

    generateRandomUuid,

    NumericInputValidator
) {
    return declare([_WidgetBase, _TemplatedMixin, _WidgetsInTemplateMixin, _SubmitJobMixin], {
        widgetsInTemplate: true,
        templateString: template,
        baseClass: 'new-collection-event',

        // cancelConfirmMsg: String
        //      The message displayed in the cancel confirm dialog
        cancelConfirmMsg: 'Are you sure? This will clear all values in the report.',

        // submitErrMsg: String
        submitErrMsg: 'There was an error submitting the report!',


        constructor: function () {
            console.log('app/NewCollectionEvent:constructor', arguments);
        },
        postCreate: function () {
            // summary:
            //      dom is ready
            console.log('app/NewCollectionEvent:postCreate', arguments);

            this.wireEvents();

            var validator = new NumericInputValidator();
            validator.init();

            this.locationTb.verifyMap.initMap();
        },
        wireEvents: function () {
            // summary:
            //      description
            console.log('app/NewCollectionEvent:wireEvents', arguments);

            this.own(
                topic.subscribe(AGRC.topics.onSubmitReportClick, lang.hitch(this, 'onSubmit')),
                topic.subscribe(AGRC.topics.onCancelReportClick, lang.hitch(this, 'onCancel'))
            );
        },
        onCancel: function () {
            // summary:
            //      description
            console.log('app/NewCollectionEvent:onCancel', arguments);

            if (window.confirm(this.cancelConfirmMsg)) {
                this.clearReport();
            }
        },
        onSubmit: function () {
            // summary:
            //      fires when the user clicks the submit button
            console.log('app/NewCollectionEvent:onSubmit', arguments);

            domClass.add(this.successMsgContainer, 'hidden');

            var valid = this.validateReport();

            if (valid !== true) {
                this.validateMsg.innerHTML = valid;
                domClass.remove(this.validateMsg, 'hidden');
                window.scrollTo(0,0);
                return;
            }
            this.validateMsg.innerHTML = '';
            domClass.add(this.validateMsg, 'hidden');
            $(AGRC.app.header.submitBtn).button('loading');

            var data = {};
            data[config.tableNames.samplingEvents] = this.buildFeatureObject();
            data[config.tableNames.equipment] = this.methodTb.getData();
            data[config.tableNames.fish] = this.catchTb.getData();
            data[config.tableNames.diet] = this.catchTb.moreInfoDialog.getData('diet');
            data[config.tableNames.tags] = this.catchTb.moreInfoDialog.getData('tags');
            data[config.tableNames.health] = this.catchTb.moreInfoDialog.getData('health');
            data[config.tableNames.habitat] = this.habitatTb.getData();

            if (!localStorage.reportsArchive) {
                localStorage.reportsArchive = '[' + JSON.stringify(data) + ']';
            } else {
                var reports = JSON.parse(localStorage.reportsArchive);
                reports.push(JSON.stringify(data));
                localStorage.reportsArchive = JSON.stringify(reports);
            }

            this.submitJob({f: 'json', data: JSON.stringify(data)}, AGRC.urls.newCollectionEvent);
        },
        onSuccessfulSubmit: function () {
            // summary:
            //        description
            console.log('app/NewCollectionEvent:onSuccessfulSubmit', arguments);

            this.clearReport();

            domClass.remove(this.successMsgContainer, 'hidden');
            window.scrollTo(0,0);

            $(AGRC.app.header.submitBtn).button('reset');
        },
        validateReport: function () {
            // summary:
            //      validates all of the values neccessary to submit the report to the server
            // returns: String (if invalid) || true (if valid)
            console.log('app/NewCollectionEvent:validateReport', arguments);

            var valid;
            var validationMethods = [
                // [method, scope, tabID]
                [this.locationTb.hasValidLocation, this.locationTb, 'locationTab'],
                [this.methodTb.isValid, this.methodTb, 'methodTab'],
                [this.catchTb.isValid, this.catchTb, 'catchTab'],
                [this.habitatTb.isValid, this.habitatTb, 'habitatTab']
            ];
            var validationReturn;
            var that = this;

            valid = array.every(validationMethods, function (a) {
                validationReturn = a[0].apply(a[1]);
                if (validationReturn !== true) {
                    that.showTab(a[2]);
                    return false;
                } else {
                    return true;
                }
            });

            if (valid) {
                return true;
            } else {
                return validationReturn;
            }
        },
        clearReport: function () {
            // summary:
            //        clears all of the values in the report
            console.log('app/NewCollectionEvent:clearReport', arguments);

            AGRC.eventId = '{' + generateRandomUuid() + '}';
            this.locationTb.clear();
            this.methodTb.clear();
            this.catchTb.clear();
            this.habitatTb.clear();
            this.validateMsg.innerHTML = '';
            domClass.add(this.validateMsg, 'hidden');
        },
        buildFeatureObject: function () {
            // summary:
            //      builds a json object suitable for submitting to the NewCollectionEvent service
            console.log('app/NewCollectionEvent:buildFeatureObject', arguments);

            var fn = AGRC.fieldNames.samplingEvents;
            var atts = {};

            // location fields
            atts[fn.EVENT_ID] = AGRC.eventId;
            atts[fn.GEO_DEF] = this.locationTb.currentGeoDef.geoDef;
            atts[fn.LOCATION_NOTES] = this.locationTb.additionalNotesTxt.value;
            atts[fn.EVENT_DATE] = this.locationTb.dateTxt.value;
            atts[fn.STATION_ID] = this.locationTb.station.getStationId();
            atts[fn.SEGMENT_LENGTH] = helpers.getNumericValue(this.locationTb.streamLengthTxt.value);
            atts[fn.NUM_PASSES] = this.catchTb.getNumberOfPasses();

            return {
                geometry: this.locationTb.utmGeo,
                attributes: atts
            };
        },
        showTab: function (tabID) {
            // summary:
            //      shows the pass in tab
            // tabID: String
            console.log('app/NewCollectionEvent:showTab', arguments);

            $('.nav-tabs a[href="#' + tabID + '"]').tab('show');
        },
        onError: function () {
            // summary:
            //      displayes an error message when the submit service fails
            // err: error object
            console.log('app/NewCollectionEvent:onError', arguments);

            this.validateMsg.innerHTML = this.submitErrMsg;
            domClass.remove(this.validateMsg, 'hidden');
            window.scrollTo(0,0);
            $(AGRC.app.header.submitBtn).button('reset');
        }
    });
});
