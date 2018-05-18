define([
    'app/config',
    'app/helpers',
    'app/_SubmitJobMixin',

    'dijit/_TemplatedMixin',
    'dijit/_WidgetBase',
    'dijit/_WidgetsInTemplateMixin',

    'dojo/dom-class',
    'dojo/dom-construct',
    'dojo/json',
    'dojo/query',
    'dojo/request/xhr',
    'dojo/text!app/templates/NewCollectionEvent.html',
    'dojo/topic',
    'dojo/_base/array',
    'dojo/_base/declare',
    'dojo/_base/fx',
    'dojo/_base/lang',

    'dojox/uuid/generateRandomUuid',

    'ijit/modules/NumericInputValidator',

    'localforage',

    'app/catch/Catch',
    'app/habitat/Habitat',
    'app/location/Location',
    'app/method/Method',
    'app/SummaryReport',
    'dojo/NodeList-traverse'
], function (
    config,
    helpers,
    _SubmitJobMixin,

    _TemplatedMixin,
    _WidgetBase,
    _WidgetsInTemplateMixin,

    domClass,
    domConstruct,
    json,
    query,
    xhr,
    template,
    topic,
    array,
    declare,
    fx,
    lang,

    generateRandomUuid,

    NumericInputValidator,

    localforage
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

        // invalidInputMsg: String
        invalidInputMsg: 'Invalid value for ',

        // archivesStoreName: String
        //      the localforage store name used to store the object that contains
        //      archives of all submitted reports
        archivesStoreName: 'submitted_reports',

        // noFish: boolean
        //      allows submission with no fish
        noFish: false,

        // archivesLocalForage: localforage instance
        //      used to manage archives in a separate instance that the inprogress stuff
        //      this allows for easy clearing of inprogress without messing with archives
        archivesLocalForage: null,


        constructor: function () {
            console.log('app/NewCollectionEvent:constructor', arguments);

            this.archivesLocalForage = localforage.createInstance({
                name: this.archivesStoreName
            });
        },
        postCreate: function () {
            // summary:
            //      dom is ready
            console.log('app/NewCollectionEvent:postCreate', arguments);

            this.wireEvents();

            var validator = new NumericInputValidator();
            validator.init();

            var that = this;
            this.own(topic.subscribe(config.topics.noFish, function (allowFish) {
                that.noFish = allowFish;
            }));

            this.locationTb.verifyMap.initMap();
        },
        wireEvents: function () {
            // summary:
            //      description
            console.log('app/NewCollectionEvent:wireEvents', arguments);

            this.own(
                topic.subscribe(config.topics.onSubmitReportClick, lang.hitch(this, 'onSubmit')),
                topic.subscribe(config.topics.onCancelReportClick, lang.hitch(this, 'onCancel'))
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

            var valid = this.validateReport(this.noFish);
            domConstruct.empty(this.validateMsg);

            if (valid !== true) {
                if (typeof valid === 'string' || valid instanceof String) {
                    this.validateMsg.innerHTML = valid;
                } else {
                    this.validateMsg.appendChild(valid);
                }

                domClass.remove(this.validateMsg, 'hidden');
                window.scrollTo(0, 0);

                return;
            }

            domClass.add(this.validateMsg, 'hidden');
            $(config.app.header.submitBtn).button('loading');

            var data = {};
            data[config.tableNames.samplingEvents] = this.buildFeatureObject();
            data[config.tableNames.equipment] = this.methodTb.getData();
            data[config.tableNames.anodes] = this.methodTb.getAnodesData();
            data[config.tableNames.fish] = this.catchTb.getData();
            data[config.tableNames.diet] = this.catchTb.moreInfoDialog.getData('diet');
            data[config.tableNames.tags] = this.catchTb.moreInfoDialog.getData('tags');
            data[config.tableNames.health] = this.catchTb.moreInfoDialog.getData('health');
            data[config.tableNames.habitat] = this.habitatTb.getData();
            data[config.tableNames.transect] = this.habitatTb.getTransectData();
            data[config.tableNames.transectMeasurements] = this.habitatTb.getTransectMeasurementData();

            var data_txt = JSON.stringify(data);
            var that = this;

            return this.reportSummary.verify(data).then(function () {
                that.submitJob({f: 'json', data: data_txt}, config.urls.newCollectionEvent);

                // stringify, parse is so that we have a clean object to store in localforage
                return that.archivesLocalForage.setItem(config.eventId, JSON.parse(data_txt));
            }, function () {
                $(config.app.header.submitBtn).button('reset');
            });
        },
        onSuccessfulSubmit: function () {
            // summary:
            //        description
            console.log('app/NewCollectionEvent:onSuccessfulSubmit', arguments);

            this.showTab('locationTab');
            this.clearReport();

            domClass.remove(this.successMsgContainer, 'hidden');
            window.scrollTo(0, 0);

            var that = this;
            window.setTimeout(function hideSuccessMsg() {
                domClass.add(that.successMsgContainer, 'hidden');
            }, 5000);

            $(config.app.header.submitBtn).button('reset');
        },
        validateReport: function (allowNoFish) {
            // summary:
            //      validates all of the values neccessary to submit the report to the server
            // allowNoFish: Boolean
            //
            // returns: String (if invalid) || true (if valid)
            console.log('app/NewCollectionEvent:validateReport', arguments);

            var valid = true;
            var validationMethods = [
                // [method, scope, tabID]
                [this.locationTb.hasValidLocation, this.locationTb, 'locationTab'],
                [this.methodTb.isValid, this.methodTb, 'methodTab'],
                [this.catchTb.isValid, this.catchTb, 'catchTab'],
                [this.habitatTb.isValid, this.habitatTb, 'habitatTab']
            ];
            var validationReturn;
            var that = this;

            var invalidInputs = query('.form-group.has-error input', this.domNode);
            if (invalidInputs.length > 0) {
                var labels = query('.form-group.has-error label');
                valid = this.invalidInputMsg + labels[0].textContent + '.';
                var parentTab = labels.closest('.tab-pane')[0];
                this.showTab(parentTab.id);

                return valid;
            }

            valid = array.every(validationMethods, function (a) {
                validationReturn = a[0].apply(a[1]);
                if (a[2] === 'catchTab' && allowNoFish) {
                    return true;
                } else if (validationReturn !== true) {
                    that.showTab(a[2]);

                    return false;
                }

                return true;
            });

            if (valid) {
                return true;
            }

            return validationReturn;
        },
        clearReport: function () {
            // summary:
            //        clears all of the values in the report
            console.log('app/NewCollectionEvent:clearReport', arguments);

            const onError = (error) => {
                topic.publish(config.topics.toaster, `Error with localforage clearing: \n ${error.message}`);
            };

            return localforage.clear().catch(onError).finally(() => {
                config.eventId = '{' + generateRandomUuid() + '}';
                this.locationTb.clear();
                this.methodTb.clear();
                this.catchTb.clear();
                this.habitatTb.clear();
                this.validateMsg.innerHTML = '';
                domClass.add(this.validateMsg, 'hidden');
                this.noFish = false;
            });
        },
        buildFeatureObject: function () {
            // summary:
            //      builds a json object suitable for submitting to the NewCollectionEvent service
            console.log('app/NewCollectionEvent:buildFeatureObject', arguments);

            var fn = config.fieldNames.samplingEvents;
            var atts = {};

            // location fields
            atts[fn.EVENT_ID] = config.eventId;
            atts[fn.GEO_DEF] = this.locationTb.currentGeoDef.geoDef;
            atts[fn.LOCATION_NOTES] = this.locationTb.additionalNotesTxt.value;
            atts[fn.EVENT_DATE] = this.locationTb.dateTxt.value;
            atts[fn.EVENT_TIME] = this.locationTb.timeTxt.value;
            atts[fn.OBSERVERS] = this.locationTb.observersTxt.value;
            atts[fn.WEATHER] = this.locationTb.weatherSelect.value;
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

            $('a[href="#' + tabID + '"]').tab('show');
        },
        onError: function () {
            // summary:
            //      displayes an error message when the submit service fails
            // err: error object
            console.log('app/NewCollectionEvent:onError', arguments);

            this.validateMsg.innerHTML = this.submitErrMsg;
            domClass.remove(this.validateMsg, 'hidden');
            window.scrollTo(0, 0);
            $(config.app.header.submitBtn).button('reset');
        }
    });
});
