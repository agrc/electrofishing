import * as React from 'react';
import localforage from 'localforage';
import config from '../config';
import useSubscriptions from '../hooks/useSubscriptions';
import Location from './location/Location';
import Method from './method/Method';
import Habitat from 'app/habitat/Habitat';
import submitJob from '../helpers/submitJob';
import toastify from 'react-toastify';
import useDojoWidget from '../hooks/useDojoWidget';
import { AppContext, actionTypes as appActionTypes } from '../App';
import SummaryReport from './SummaryReport';
import Catch from './catch/Catch';
import { useSamplingEventContext, actionTypes } from '../hooks/samplingEventContext';
import { getFishDataForSubmission } from '../helpers/data';

// cancelConfirmMsg: String
//      The message displayed in the cancel confirm dialog
const cancelConfirmMsg = 'Are you sure? This will clear all values in the report.';

// submitErrMsg: String
const submitErrMsg = 'There was an error submitting the report';

// invalidInputMsg: String
const invalidInputMsg = 'Invalid value for ';

// archivesStoreName: String
//      the localforage store name used to store the object that contains
//      archives of all submitted reports
const archivesStoreName = 'submitted_reports';

const LOCAL_STORAGE_IN_PROGRESS_ITEM_ID = 'IN_PROGRESS';

const NoFishException = ({ allowNoFish, setAllowNoFish }) => {
  const onChange = (event) => {
    console.log('onChange');

    setAllowNoFish(event.target.checked);
  };

  return (
    <div className="no-fish-exception">
      <div>You must input at least one fish.</div>
      <label htmlFor="allowNoFish_checkbox">
        <input type="checkbox" onChange={onChange} id="allowNoFish_checkbox" checked={allowNoFish} /> Ignore Warning
      </label>
    </div>
  );
};

const NewCollectionEvent = () => {
  const [allowNoFish, setAllowNoFish] = React.useState(false);
  const [showSuccess, setShowSuccess] = React.useState(false);
  const thisDomNode = React.useRef();
  const [validateMsg, setValidateMsg] = React.useState();
  const { eventState, eventDispatch } = useSamplingEventContext();
  const { appDispatch } = React.useContext(AppContext);

  // archivesLocalForage: localforage instance
  //      used to manage archives in a separate instance that the inprogress stuff
  //      this allows for easy clearing of inprogress without messing with archives
  const archivesLocalForage = React.useRef();
  React.useEffect(() => {
    archivesLocalForage.current = localforage.createInstance({
      name: archivesStoreName,
    });
  }, []);

  // cache in-progress data so that we don't loose it on page refresh
  // TODO: look at using little state machine library for this
  React.useEffect(() => {
    localforage.setItem(LOCAL_STORAGE_IN_PROGRESS_ITEM_ID, eventState);
  }, [eventState]);
  React.useEffect(() => {
    console.log('getting cached data');
    // TODO: handle stream reach geometry once geodefs have been converted to react components

    localforage.getItem(LOCAL_STORAGE_IN_PROGRESS_ITEM_ID).then((data) => {
      if (!window.Cypress && data && Object.values(data).length) {
        console.log('hydrating with cached data');

        eventDispatch({
          type: actionTypes.HYDRATE,
          payload: data,
        });
      }
    });
  }, [eventDispatch]);

  // dojo widgets
  const habitatTbDiv = React.useRef();
  const habitatTb = useDojoWidget(habitatTbDiv, Habitat);

  const showTab = (tabID) => {
    // summary:
    //      shows the pass in tab
    // tabID: String
    console.log('app/NewCollectionEvent:showTab', tabID);

    $(`a[href="#${tabID}"]`).tab('show');
  };

  const validateReport = React.useCallback(() => {
    // summary:
    //      validates all of the values necessary to submit the report to the server
    //
    // returns: String (if invalid) || true (if valid)
    console.log('app/NewCollectionEvent:validateReport');

    // component validation
    // location-specific
    if (!eventState[config.tableNames.samplingEvents].geometry) {
      return 'No valid stream reach defined! You may need to verify the location.';
    } else if (!eventState[config.tableNames.samplingEvents].attributes[config.fieldNames.samplingEvents.STATION_ID]) {
      return 'Please select a station!';
    }

    const requireField = (fieldName) => {
      // label should have an id of the field name that it corresponds to
      const label = document.getElementById(fieldName);
      const value = eventState[config.tableNames.samplingEvents].attributes[fieldName];
      if (!value) {
        return `Missing value for ${label.innerText}!`;
      }

      return true;
    };

    const requiredFieldsValidation = config.requiredFields[config.tableNames.samplingEvents]
      .map(requireField)
      .reduce((previous, current) => {
        if (previous === true) {
          return current;
        }

        return previous;
      });

    if (typeof requiredFieldsValidation === 'string') {
      showTab('locationTab');

      return requiredFieldsValidation;
    }

    // catch tab
    if (
      (eventState[config.tableNames.fish].length === 0 ||
        eventState[config.tableNames.fish][0][config.fieldNames.fish.SPECIES_CODE] === null) &&
      !allowNoFish
    ) {
      showTab('catchTab');

      return config.noFish;
    }

    // older validation methods...
    let valid = true;
    const validationMethods = [
      // [method, scope, tabID]
      [habitatTb.isValid, habitatTb, 'habitatTab'],
    ];
    let validationReturn;

    const invalidInputs = thisDomNode.current.querySelectorAll('.form-group.has-error input');
    if (invalidInputs.length > 0) {
      const labels = thisDomNode.current.querySelectorAll('.form-group.has-error label');
      valid = invalidInputMsg + labels[0].textContent + '.';
      const parentTab = labels[0].closest('.tab-pane');
      showTab(parentTab.id);

      return valid;
    }

    // TODO: remove this once Habitat is converted to React
    valid = validationMethods.every((a) => {
      validationReturn = a[0].apply(a[1]);
      if (validationReturn !== true) {
        showTab(a[2]);

        return false;
      }

      return true;
    });

    if (valid) {
      return true;
    }

    return validationReturn;
  }, [allowNoFish, eventState, habitatTb]);

  const clearReport = React.useCallback(() => {
    console.log('NewCollectionEvent:clearReport');

    const onError = (error) => {
      toastify.toast.error(`Error with localforage clearing: \n ${error.message}`);
    };

    return localforage
      .clear()
      .catch(onError)
      .finally(() => {
        eventDispatch({ type: actionTypes.CLEAR });
        habitatTb.clear();
        setValidateMsg(null);
        setAllowNoFish(false);
      });
  }, [eventDispatch, habitatTb]);

  const onSuccessfulSubmit = React.useCallback(() => {
    console.log('app/NewCollectionEvent:onSuccessfulSubmit');

    showTab('locationTab');
    clearReport();
    setShowSuccess(true);

    window.setTimeout(() => {
      window.scrollTo({
        top: 0,
        behavior: 'smooth',
      });
    }, 500);
  }, [clearReport]);

  const onError = (message) => {
    console.log('app/NewCollectionEvent:onError');

    setValidateMsg(`${submitErrMsg}: ${typeof message === 'string' ? message : message.message || message}`);
    window.scrollTo(0, 0);
  };

  const [showSummary, setShowSummary] = React.useState(false);
  const [submitData, setSubmitData] = React.useState(null); // this could be replaced by eventState once everything is moved to React
  const onSubmit = React.useCallback(() => {
    console.log('NewCollectionEvent:onSubmit');

    setShowSuccess(false);

    const valid = validateReport();
    if (valid !== true) {
      setValidateMsg(valid);

      window.scrollTo(0, 0);

      return;
    }

    setValidateMsg(null);
    appDispatch({
      type: appActionTypes.SUBMIT_LOADING,
      payload: true,
    });

    const data = {};

    try {
      data[config.tableNames.samplingEvents] = {
        attributes: eventState[config.tableNames.samplingEvents].attributes,
        geometry: eventState[config.tableNames.samplingEvents].geometry,
      };
      data[config.tableNames.equipment] = eventState[config.tableNames.equipment];
      data[config.tableNames.anodes] = eventState[config.tableNames.anodes];

      data[config.tableNames.fish] = getFishDataForSubmission(eventState[config.tableNames.fish]);
      data[config.tableNames.diet] = eventState[config.tableNames.diet];
      data[config.tableNames.tags] = eventState[config.tableNames.tags];
      data[config.tableNames.health] = eventState[config.tableNames.health];

      data[config.tableNames.habitat] = habitatTb.getData();
      data[config.tableNames.transect] = habitatTb.getTransectData();
      data[config.tableNames.transectMeasurements] = habitatTb.getTransectMeasurementData();

      setSubmitData(data);
      setShowSummary(true);
    } catch (error) {
      appDispatch({
        type: appActionTypes.SUBMIT_LOADING,
        payload: false,
      });
      onError(error.message);
    }
  }, [appDispatch, eventState, habitatTb, validateReport]);

  const onConfirmSubmit = async () => {
    const data_txt = JSON.stringify(submitData);

    setShowSummary(false);
    try {
      await submitJob({ data: data_txt }, config.urls.newCollectionEvent);

      onSuccessfulSubmit();
    } catch (error) {
      onError(error.message);
    }

    appDispatch({
      type: appActionTypes.SUBMIT_LOADING,
      payload: false,
    });

    // stringify, parse is so that we have a clean object to store in localforage
    await archivesLocalForage.current.setItem(
      submitData[config.tableNames.samplingEvents].attributes[config.fieldNames.samplingEvents.EVENT_ID],
      JSON.parse(JSON.stringify(submitData))
    );
  };

  const onCancel = React.useCallback(() => {
    console.log('NewCollectionEvent:onCancel');

    if (window.confirm(cancelConfirmMsg)) {
      clearReport();
    }
  }, [clearReport]);

  // subscriptions
  const addSubscription = useSubscriptions();
  React.useEffect(() => {
    addSubscription(config.topics.onSubmitReportClick, onSubmit);
    addSubscription(config.topics.onCancelReportClick, onCancel);
  }, [addSubscription, onSubmit, onCancel]);

  return (
    <div className="new-collection-event" ref={thisDomNode}>
      {validateMsg ? (
        <div className="alert alert-danger">
          {validateMsg === config.noFish ? (
            <NoFishException allowNoFish={allowNoFish} setAllowNoFish={setAllowNoFish} />
          ) : (
            validateMsg
          )}
        </div>
      ) : null}
      {showSuccess ? (
        <div className="alert alert-success">
          The report has been submitted successfully.
          <button className="btn btn-success pull-right" onClick={() => setShowSuccess(false)}>
            Close
          </button>
        </div>
      ) : null}
      <div className="tab-content">
        <div className="tab-pane fade in active" id="locationTab">
          <Location />
        </div>
        <div className="tab-pane fade" id="methodTab">
          <Method />
        </div>
        <div className="tab-pane fade" id="catchTab">
          <Catch />
        </div>
        <div className="tab-pane fade" id="habitatTab">
          <div ref={habitatTbDiv}></div>
        </div>
      </div>
      <SummaryReport
        show={showSummary}
        onHide={() => {
          setShowSummary(false);
          appDispatch({
            type: appActionTypes.SUBMIT_LOADING,
            payload: false,
          });
        }}
        eventData={submitData}
        onConfirm={onConfirmSubmit}
      />
    </div>
  );
};

export default NewCollectionEvent;
