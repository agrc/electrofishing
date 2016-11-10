define([
    'app/config',

    'dijit/_TemplatedMixin',
    'dijit/_WidgetBase',

    'dojo/Deferred',
    'dojo/text!app/templates/SummaryReport.html',
    'dojo/text!app/templates/SummaryReportTemplate.html',
    'dojo/_base/declare',

    'handlebars/handlebars',

    'bootstrap'
], function (
    config,

    _TemplatedMixin,
    _WidgetBase,

    Deferred,
    template,
    reportTemplate,
    declare,

    Handlebars
) {
    return declare([_WidgetBase, _TemplatedMixin], {
        // description:
        //      Shows a summary of the report that is to be submitted
        templateString: template,
        baseClass: 'summary-report',

        // Properties to be sent into constructor

        postCreate: function () {
            // summary:
            //      Overrides method of same name in dijit._Widget.
            console.log('app/SummaryReport:postCreate', arguments);

            var that = this;
            $(this.modal).on('hidden.bs.modal', function () {
                if (that.promise) {
                    // user has cancelled or closed the dialog without confirming
                    that.promise.reject();
                }
            });

            this.inherited(arguments);
        },
        verify: function (data) {
            // summary:
            //      description
            // data: Object
            console.log('app/SummaryReport:verify', arguments);

            this.promise = new Deferred();

            this.displayReport(data);

            return this.promise;
        },
        displayReport: function (reportData) {
            // summary:
            //      parses the report submission data and displays a summary
            // reportData
            console.log('app/SummaryReport:displayReport', arguments);

            var passes = {};
            // this builds something like this
            // {
            //     1: {
            //         BH: 15,
            //         CD: 2
            //     },
            //     2: {
            //         AC: 55,
            //         FLS: 234
            //     }
            // }
            reportData[config.tableNames.fish].forEach(function filterFish(fish) {
                var passName = fish[config.fieldNames.fish.PASS_NUM];
                if (!passes[passName]) {
                    passes[passName] = {}
                }
                var pass = passes[passName];

                var speciesName = fish[config.fieldNames.fish.SPECIES_CODE];
                if (!pass[speciesName]) {
                    pass[speciesName] = 1;
                } else {
                    pass[speciesName]++;
                }
            });

            // convert to something like this:
            // {
            //     passes: [{
            //         name: 1,
            //         species: [{
            //             name: "BH",
            //             count: 15
            //         }, {
            //             name: "CD",
            //             count: 2
            //         }]
            //     }, {
            //         name: 2,
            //         species: [{
            //             name: "AC",
            //             count: 55
            //         }, {
            //             name: "FLS",
            //             count: 245
            //         }, {
            //             name: "HSD",
            //             count: 235
            //         }]
            //     }]
            // }
            var summaryReport = {
                passes: []
            };
            for (var passName in passes) {
                if (passes.hasOwnProperty(passName)) {
                    var speciesReport = [];
                    var pass = passes[passName];
                    for (var speciesName in pass) {
                        if (pass.hasOwnProperty(speciesName)) {
                            speciesReport.push({
                                name: speciesName,
                                count: pass[speciesName]
                            });
                        }
                    }
                    summaryReport.passes.push({
                        name: passName,
                        species: speciesReport
                    });
                }
            }

            this.report.innerHTML = Handlebars.compile(reportTemplate)(summaryReport);

            $(this.modal).modal('show');

            return summaryReport;
        },
        onConfirm: function () {
            // summary:
            //      user has confirmed the report
            // param or return
            console.log('app/SummaryReport:onConfirm', arguments);

            this.promise.resolve();

            this.promise = null;

            $(this.modal).modal('hide');
        }
    });
});
