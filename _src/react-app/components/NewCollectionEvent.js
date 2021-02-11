import * as React from 'react';
import localforage from 'localforage';
import pubSub from 'pubsub-js';
import config from '../config';
import useSubscriptions from '../hooks/useSubscriptions';
import NumericInputValidator from 'ijit/modules/NumericInputValidator';
import Location from 'app/location/Location';
import Method from 'app/method/Method';
import Catch from 'app/catch/Catch';
import Habitat from 'app/habitat/Habitat';
import SummaryReport from 'app/SummaryReport';
import helpers from 'app/helpers';
import submitJob from '../helpers/submitJob';
import toastify from 'react-toastify';
import { v4 as uuid } from 'uuid';


// cancelConfirmMsg: String
//      The message displayed in the cancel confirm dialog
const cancelConfirmMsg = 'Are you sure? This will clear all values in the report.';

// submitErrMsg: String
const submitErrMsg = 'There was an error submitting the report!';

// invalidInputMsg: String
const invalidInputMsg = 'Invalid value for ';

// archivesStoreName: String
//      the localforage store name used to store the object that contains
//      archives of all submitted reports
const archivesStoreName = 'submitted_reports';

const NewCollectionEvent = () => {
  const allowNoFish = React.useRef(false);
  const [showSuccess, setShowSuccess] = React.useState(false);
  const thisDomNode = React.useRef();
  const [validateMsg, setValidateMsg] = React.useState();

  // archivesLocalForage: localforage instance
  //      used to manage archives in a separate instance that the inprogress stuff
  //      this allows for easy clearing of inprogress without messing with archives
  const archivesLocalForage = React.useRef();
  React.useEffect(() => {
    archivesLocalForage.current = localforage.createInstance({
      name: archivesStoreName
    });

    return () => {
      archivesLocalForage.current.destroy();
    };
  }, []);

  React.useEffect(() => {
    const validator = new NumericInputValidator();
    validator.init();

    return () => {
      validator.destroy();
    };
  }, []);

  // dojo widgets
  const locationTb = React.useRef();
  const methodTb = React.useRef();
  const catchTb = React.useRef();
  const habitatTb = React.useRef();
  const reportSummary = React.useRef();

  const locationTbDiv = React.useRef();
  const methodTbDiv = React.useRef();
  const catchTbDiv = React.useRef();
  const habitatTbDiv = React.useRef();
  const reportSummaryDiv = React.useRef();
  React.useEffect(() => {
    console.log('NewCollectionEvent:initializing widgets');
    const widgetInfos = [
      [locationTb.current, locationTbDiv.current, Location],
      [methodTb.current, methodTbDiv.current, Method],
      [catchTb.current, catchTbDiv.current, Catch],
      [habitatTb.current, habitatTbDiv.current, Habitat],
      [reportSummary.current, reportSummaryDiv.current, SummaryReport]
    ];

    const widgets = widgetInfos.map(([widgetRef, div, WidgetClass]) => {
      widgetRef = new WidgetClass(null, div);
      widgetRef.startup();
    });

    return () => {
      widgets.forEach(widget => widget.destroy());
    };
  }, []);

  const showTab = (tabID) => {
    // summary:
    //      shows the pass in tab
    // tabID: String
    console.log('app/NewCollectionEvent:showTab', arguments);

    $('a[href="#' + tabID + '"]').tab('show');
  };

  const validateReport = () => {
      // summary:
      //      validates all of the values necessary to submit the report to the server
      //
      // returns: String (if invalid) || true (if valid)
      console.log('app/NewCollectionEvent:validateReport');

      var valid = true;
      const validationMethods = [
        // [method, scope, tabID]
        [locationTb.current.hasValidLocation, locationTb.current, 'locationTab'],
        [methodTb.current.isValid, methodTb.current, 'methodTab'],
        [catchTb.current.isValid, catchTb.current, 'catchTab'],
        [habitatTb.current.isValid, habitatTb.current, 'habitatTab']
      ];
      var validationReturn;

      const invalidInputs = thisDomNode.current.querySelectorAll('.form-group.has-error input');
      if (invalidInputs.length > 0) {
        const labels = thisDomNode.current.querySelectorAll('.form-group.has-error label');
        valid = invalidInputMsg + labels[0].textContent + '.';
        const parentTab = labels.closest('.tab-pane')[0];
        showTab(parentTab.id);

        return valid;
      }

      valid = validationMethods.every((a) => {
        validationReturn = a[0].apply(a[1]);
        if (a[2] === 'catchTab' && allowNoFish.current) {
          return true;
        } else if (validationReturn !== true) {
          showTab(a[2]);

          return false;
        }

        return true;
      });

      if (valid) {
        return true;
      }

      return validationReturn;
  };

  const buildFeatureObject = () => {
      // summary:
      //      builds a json object suitable for submitting to the NewCollectionEvent service
      console.log('app/NewCollectionEvent:buildFeatureObject');

      const fn = config.fieldNames.samplingEvents;
      const attributes = {};

      // location fields
      attributes[fn.EVENT_ID] = config.eventId;
      attributes[fn.GEO_DEF] = locationTb.current.currentGeoDef.geoDef;
      attributes[fn.LOCATION_NOTES] = locationTb.current.additionalNotesTxt.value;
      attributes[fn.EVENT_DATE] = locationTb.current.dateTxt.value;
      attributes[fn.EVENT_TIME] = locationTb.current.timeTxt.value;
      attributes[fn.OBSERVERS] = locationTb.current.observersTxt.value;
      attributes[fn.PURPOSE] = locationTb.current.surveyPurposeSelect.value;
      attributes[fn.WEATHER] = locationTb.current.weatherSelect.value;
      attributes[fn.STATION_ID] = locationTb.current.station.getStationId();
      attributes[fn.SEGMENT_LENGTH] = helpers.getNumericValue(locationTb.current.streamLengthTxt.value);
      attributes[fn.NUM_PASSES] = catchTb.current.getNumberOfPasses();

      return {
          geometry: this.locationTb.utmGeo,
          attributes
      };
  };

  const clearReport = () => {
    console.log('NewCollectionEvent:clearReport');

    const onError = (error) => {
      toastify.toast.error(`Error with localforage clearing: \n ${error.message}`);
    };

    return localforage.clear().catch(onError).finally(() => {
      config.eventId = '{' + uuid() + '}';
      locationTb.current.clear();
      methodTb.current.clear();
      catchTb.current.clear();
      habitatTb.current.clear();
      setValidateMsg(null);
      allowNoFish.current = false;
    });
  };

  const onSuccessfulSubmit = () => {
      console.log('app/NewCollectionEvent:onSuccessfulSubmit');

      showTab('locationTab');
      clearReport();
      showSuccess(false);

      window.setTimeout(() => {
          window.scrollTo({
              top: 0,
              behavior: 'smooth'
          });
      }, 500);

      $(config.app.header.submitBtn).button('reset');
  };

  const onError = () => {
    console.log('app/NewCollectionEvent:onError', arguments);

    setValidateMsg(submitErrMsg);
    window.scrollTo(0, 0);
    $(config.app.header.submitBtn).button('reset');
  };

  const onSubmit = () => {
    console.log('NewCollectionEvent:onSubmit');

    setShowSuccess(false);

    const valid = validateReport(allowNoFish.current);
    if (valid !== true) {
      setValidateMsg(valid);

      window.scrollTo(0, 0);

      return;
    }

    setValidateMsg(null);
    $(config.app.header.submitBtn).button('loading');

    const data = {};
    data[config.tableNames.samplingEvents] = buildFeatureObject();
    data[config.tableNames.equipment] = methodTb.current.getData();
    data[config.tableNames.anodes] = methodTb.current.getAnodesData();
    data[config.tableNames.fish] = catchTb.current.getData();
    data[config.tableNames.diet] = catchTb.current.moreInfoDialog.getData('diet');
    data[config.tableNames.tags] = catchTb.current.moreInfoDialog.getData('tags');
    data[config.tableNames.health] = catchTb.current.moreInfoDialog.getData('health');
    data[config.tableNames.habitat] = habitatTb.current.getData();
    data[config.tableNames.transect] = habitatTb.current.getTransectData();
    data[config.tableNames.transectMeasurements] = habitatTb.current.getTransectMeasurementData();

    const data_txt = JSON.stringify(data);

    return reportSummary.current.verify(data).then(async () => {
      try {
        await submitJob({f: 'json', data: data_txt}, config.urls.newCollectionEvent);

        onSuccessfulSubmit();
      } catch (error) {
        onError();
      }

      // stringify, parse is so that we have a clean object to store in localforage
      return archivesLocalForage.setItem(config.eventId, JSON.parse(data_txt));
    }, function () {
      $(config.app.header.submitBtn).button('reset');
    });
  };

  const onCancel = () => {
    console.log('NewCollectionEvent:onCancel');

    if (window.confirm(cancelConfirmMsg)) {
      clearReport();
    }
  };

  // subscriptions
  const addSubscription = useSubscriptions();
  React.useEffect(() => {
    addSubscription(
      pubSub.subscribe(config.topics.onSubmitReportClick, onSubmit),
    );
    addSubscription(
      pubSub.subscribe(config.topics.onCancelReportClick, onCancel)
    );
    addSubscription(
      pubSub.subscribe(config.topics.noFish, (_, newValue) => {
        allowNoFish.current = newValue;
      })
    );
  }, []);

  return (
    <div className="new-collection-event" ref={thisDomNode}>
      { validateMsg ? <div className="alert alert-danger hidden">{validateMsg}</div> : null }
      { showSuccess ? <div className="alert alert-success">
          The report has been submitted successfully.
          <button className="btn btn-success pull-right" onClick={() => setShowSuccess(false)}>
            Close
          </button>
        </div> : null }
      <div className="tab-content">
        <div className="tab-pane fade in active" id="locationTab">
          <div ref={locationTbDiv}></div>
        </div>
        <div className="tab-pane fade" id="methodTab">
          <div ref={methodTbDiv}></div>
        </div>
        <div className="tab-pane fade" id="catchTab">
          <div ref={catchTbDiv}></div>
        </div>
        <div className="tab-pane fade" id="habitatTab">
          <div ref={habitatTbDiv}></div>
        </div>
      </div>
      <div ref={reportSummaryDiv}></div>
    </div>
  );
};

export default NewCollectionEvent;
