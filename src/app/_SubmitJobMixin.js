define([
    'dojo/request/xhr',
    'dojo/_base/array',
    'dojo/_base/declare'
], function (
    xhr,
    array,
    declare
) {
    // summary:
    //      A mixin that adds functionality for submitting gp jobs to arcgis server.
    return declare(null, {
        submitJob: function (data, url) {
            // summary:
            //      submits a job to a gp service
            // data: {}
            // url: String
            // returns: Deferred
            console.log(this.declaredClass + '::submitJob', arguments);

            var that = this;
            var intId;
            var params = {
                data: data,
                handleAs: 'json',
                method: 'POST'
            };

            return xhr(url + '/submitJob', params).then(function (response) {
                if (response.error) {
                    that.onError(response.error);
                } else {
                    intId = setInterval(function () {
                        that.checkJobStatus(url, response.jobId, intId);
                    }, 500);
                    return true;
                }
            }, function (err) {
                that.onError(err);
            });
        },
        checkJobStatus: function (url, jobId, intId) {
            // summary:
            //      description
            // url: String
            // jobId: String
            // intId: setInterval handle for clearing it
            console.log(this.declaredClass + '::checkJobStatus', arguments);

            var that = this;
            var params = {
                data: {f: 'json'},
                handleAs: 'json',
                method: 'POST'
            };

            xhr(url + '/jobs/' + jobId, params).then(function (jobStatus) {
                array.forEach(jobStatus.messages, function (m) {
                    console.log(m.description);
                });
                if (jobStatus.jobStatus === 'esriJobSucceeded') {
                    clearInterval(intId);
                    that.onSuccessfulSubmit();
                } else if (jobStatus.jobStatus === 'esriJobFailed') {
                    clearInterval(intId);
                    console.log('jobErr', jobStatus.messages);
                    that.onError();
                }
            }, function (jobErr) {
                clearInterval(intId);
                that.onError(jobErr);
            });
        }
    });
});
