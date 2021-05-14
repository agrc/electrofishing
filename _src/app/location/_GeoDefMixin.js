define(['dojo/Deferred', 'dojo/promise/all', 'dojo/request/xhr', 'dojo/_base/array', 'dojo/_base/declare'], function (
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
      query: { f: 'json' },
      handleAs: 'json',
      headers: {
        'X-Requested-With': null,
      },
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
    getJobResults: function (data, def) {
      // summary:
      //      gets the results from the gp job
      // jobId: String
      // def: dojo.Deferred
      /*
        If job fails, data looks like {error: {code: 500, details: [], message: 'error message'}}
      */
      console.log('app/location/_GeoDefMixin:getJobResults', arguments);

      if (data.error) {
        def.reject(data.error.message);
      }

      const returnData = {
        geoDef: this.geoDef,
      };

      const setSegmentWGS = function (value) {
        if (value.features.length > 0) {
          var feature = value.features[0];
          var paths = [];
          array.forEach(feature.geometry.paths, function (path) {
            // flip lats and lngs. Thanks, ESRI :P
            paths.push(
              array.map(path, function (c) {
                return [c[1], c[0]];
              })
            );
          });
          returnData.path = paths;
        }
      };
      const setSegmentUTM = function (value) {
        if (value.features.length > 0) {
          returnData.utm = value.features[0].geometry;
        }
      };
      const setSuccess = function (value) {
        returnData.success = value;
      };
      const setErrorMessage = function (value) {
        returnData.error_message = value;
      };
      const setters = {
        segmentWGS: setSegmentWGS,
        segmentUTM: setSegmentUTM,
        success: setSuccess,
        error_message: setErrorMessage,
      };

      data.results.forEach((result) => {
        setters[result.paramName](result.value);
      });

      def.resolve(returnData);
    },
  });
});
