define([
    'dojo/Deferred',
    'dojo/promise/all',
    'dojo/request/xhr',
    'dojo/_base/array',
    'dojo/_base/declare'
], function (
    Deferred,
    all,
    xhr,
    array,
    declare
) {
    return declare(null, {
        // defs: app/location/*Def[]
        //      all of the controls that this uses to define geometry
        //      This should be set in the post create method of the parent class
        defs: null,

        // defaultXHRParams: {}
        defaultXHRParams: {
            query: {f: 'json'},
            handleAs: 'json'
        },

        // geoDef: String
        //      The value that will be put in GEO_DEF in SamplingEvents feature class
        geoDef: null,

        clearGeometry: function () {
            // summary:
            //      should fire when the tab is hidden
            console.log('app/location/_GeoDefMixin:clearGeometry', arguments);

            array.forEach(this.defs, function (def) {
                def.clear();
            });
        },
        onInvalidate: function () {
            // summary:
            //      fires when a point is changed, Location connects to it
            //      to know when to reset the validate button
            console.log('app/location/_GeoDefMixin:onInvalidate', arguments);
        },
        onGetSegsCallback: function (data, def) {
            // summary:
            //      fires when the getSegmentFrom* service returns
            // data: {}
            //      The json object as returned by the submit job service
            // def: dojo.Deferred
            //      The original deferred object so that we can pass it on to checkJobStatus
            console.log('app/location/_GeoDefMixin:onGetSegsCallback', arguments);

            var intId;
            var that = this;

            if (data.error) {
                var msg = 'error with: ' + this.gpServiceUrl;
                console.error(msg, data.error.message);
                return false;
            } else {
                intId = setInterval(function () {
                    that.checkJobStatus(data.jobId, def, intId);
                }, 500);
                return true;
            }
        },
        checkJobStatus: function (jobId, def, intId) {
            // summary:
            //      checks the status of the gp job to see if it's finished
            // jobId: String
            // def: dojo.Deferred
            //      original deferred from checkJobStatus so that we can reject it, if needed
            // intId: Number
            //      The setInterval id for passing into clearInterval
            console.log('app/location/_GeoDefMixin:checkJobStatus', arguments);

            var that = this;

            xhr(this.gpServiceUrl + '/jobs/' + jobId + '?', this.defaultXHRParams).then(function (jobStatus) {
                if (jobStatus.jobStatus === 'esriJobSucceeded') {
                    clearInterval(intId);
                    that.getJobResults(jobId, def);
                } else if (jobStatus.jobStatus === 'esriJobFailed') {
                    clearInterval(intId);
                    console.log('jobErr', jobStatus.messages);
                    def.reject(that.verifiedFailedMsg);
                }
            }, function (jobErr) {
                clearInterval(intId);
                console.log('jobErr', jobErr);
                def.reject(that.verifiedFailedMsg);
            });
        },
        getJobResults: function (jobId, def) {
            // summary:
            //      gets the results from the gp job
            // jobId: String
            // def: dojo.Deferred
            console.log('app/location/_GeoDefMixin:getJobResults', arguments);

            var returnPaths;
            var streamGeo;
            var that = this;
            var promises = [];
            var success;
            var error_message;

            function getResult(paramName, successCallback) {
                var msg = 'There was an error getting the ' + paramName + ' result.';
                return xhr(that.gpServiceUrl + '/jobs/' + jobId + '/results/' + paramName + '?', that.defaultXHRParams)
                    .then(function (results) {
                        if (results) {
                            successCallback(results.value);
                        } else {
                            def.reject(msg);
                        }
                    }, function () {
                        def.reject(msg);
                    });
            }

            promises.push(getResult('segmentWGS', function (value) {
                if (value.features.length > 0) {
                    var feature = value.features[0];
                    var paths = [];
                    array.forEach(feature.geometry.paths, function (path) {
                        // flip lats and lngs. Thanks, ESRI :P
                        paths.push(array.map(path, function (c) {
                            return [c[1], c[0]];
                        }));
                    });
                    returnPaths = paths;
                }
            }));
            promises.push(getResult('segmentUTM', function (value) {
                if (value.features.length > 0) {
                    streamGeo = value.features[0].geometry;
                }
            }));
            promises.push(getResult('success', function (value) {
                success = value;
            }));
            promises.push(getResult('error_message', function (value) {
                error_message = value;
            }));

            all(promises).then(function () {
                def.resolve({
                    path: returnPaths,
                    utm: streamGeo,
                    success: success,
                    error_message: error_message
                });
            }, function (er) {
                console.error(er);
            });
        }
    });
});
