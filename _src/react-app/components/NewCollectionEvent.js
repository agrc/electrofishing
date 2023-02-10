import * as React from 'react';
import localforage from 'localforage';
import config from '../config';
import useSubscriptions from '../hooks/useSubscriptions';
import Location from './location/Location';
import Method from 'app/method/Method';
import Catch from 'app/catch/Catch';
import Habitat from 'app/habitat/Habitat';
import SummaryReport from 'app/SummaryReport';
import submitJob from '../helpers/submitJob';
import toastify from 'react-toastify';
import useDojoWidget from '../hooks/useDojoWidget';
import { AppContext, actionTypes as appActionTypes } from '../App';
import { useImmerReducer } from 'use-immer';
import NumericInputValidator from 'ijit/modules/NumericInputValidator';
import getGUID from '../helpers/getGUID';

export const EventContext = React.createContext();
export const actionTypes = {
  LOCATION: 'LOCATION',
  CLEAR: 'CLEAR',
  OTHER: 'OTHER',
  HYDRATE: 'HYDRATE',
};
const getBlankState = () => {
  const fn = config.fieldNames.samplingEvents;
  const guid = getGUID();

  // this can be removed once these widgets are converted to components and use eventState:
  // Catch, Habitat, Equipment
  config.eventId = guid;

  return {
    [config.tableNames.samplingEvents]: {
      attributes: {
        [fn.EVENT_ID]: guid,
        [fn.GEO_DEF]: null,
        [fn.LOCATION_NOTES]: null,
        [fn.EVENT_DATE]: null,
        [fn.EVENT_TIME]: null,
        [fn.OBSERVERS]: null,
        [fn.PURPOSE]: null,
        [fn.WEATHER]: null,
        [fn.STATION_ID]: null,
        [fn.SEGMENT_LENGTH]: null,
        [fn.NUM_PASSES]: null,
      },
      geometry: null,
    },
    other: {
      selectedStationName: '',
    },
  };
};
const initialState = getBlankState();

const reducer = (draft, action) => {
  switch (action.type) {
    case actionTypes.LOCATION:
      if (action.meta === 'geometry') {
        draft[config.tableNames.samplingEvents].geometry = action.payload.geometry;
        draft[config.tableNames.samplingEvents].attributes[config.fieldNames.samplingEvents.GEO_DEF] =
          action.payload.geoDef;
      } else {
        draft[config.tableNames.samplingEvents].attributes[action.meta] = action.payload;
      }

      break;

    case actionTypes.OTHER:
      draft.other[action.meta] = action.payload;

      break;

    case actionTypes.CLEAR:
      return getBlankState();

    case actionTypes.HYDRATE:
      // this can be removed once these widgets are converted to components and use eventState:
      // Catch, Habitat, Equipment
      config.eventId =
        action.payload[config.tableNames.samplingEvents].attributes[config.fieldNames.samplingEvents.EVENT_ID];

      return action.payload;

    default:
      break;
  }
};

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
  const [eventState, eventDispatch] = useImmerReducer(reducer, initialState);
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

  React.useEffect(() => {
    const validator = new NumericInputValidator();
    validator.init();

    return () => {
      validator.destroy();
    };
  }, []);

  // dojo widgets
  const methodTbDiv = React.useRef();
  const catchTbDiv = React.useRef();
  const habitatTbDiv = React.useRef();
  const reportSummaryDiv = React.useRef();
  const methodTb = useDojoWidget(methodTbDiv, Method);
  const catchTb = useDojoWidget(catchTbDiv, Catch);
  const habitatTb = useDojoWidget(habitatTbDiv, Habitat);
  const reportSummary = useDojoWidget(reportSummaryDiv, SummaryReport);

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

    // older validation methods...
    let valid = true;
    const validationMethods = [
      // [method, scope, tabID]
      [methodTb.isValid, methodTb, 'methodTab'],
      [catchTb.isValid, catchTb, 'catchTab'],
      [habitatTb.isValid, habitatTb, 'habitatTab'],
    ];
    let validationReturn;

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
      if (a[2] === 'catchTab' && allowNoFish) {
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
  }, [allowNoFish, catchTb, eventState, habitatTb, methodTb]);

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
        methodTb.clear();
        catchTb.clear();
        habitatTb.clear();
        setValidateMsg(null);
        setAllowNoFish(false);
      });
  }, [catchTb, eventDispatch, habitatTb, methodTb]);

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

    appDispatch({
      type: appActionTypes.SUBMIT_LOADING,
      payload: false,
    });
  }, [appDispatch, clearReport]);

  const onError = React.useCallback(
    (message) => {
      console.log('app/NewCollectionEvent:onError');

      setValidateMsg(`${submitErrMsg}: ${typeof message === 'string' ? message : message.message || message}`);
      window.scrollTo(0, 0);
      appDispatch({
        type: appActionTypes.SUBMIT_LOADING,
        payload: false,
      });
    },
    [appDispatch]
  );

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
    data[config.tableNames.samplingEvents] = {
      // clone this so that we can add number of passes
      attributes: { ...eventState[config.tableNames.samplingEvents].attributes },
      geometry: eventState[config.tableNames.samplingEvents].geometry,
    };
    data[config.tableNames.samplingEvents].attributes[config.fieldNames.samplingEvents.NUM_PASSES] =
      catchTb.getNumberOfPasses();
    data[config.tableNames.equipment] = methodTb.getData();
    data[config.tableNames.anodes] = methodTb.getAnodesData();
    data[config.tableNames.fish] = catchTb.getData();
    data[config.tableNames.diet] = catchTb.moreInfoDialog.getData('diet');
    data[config.tableNames.tags] = catchTb.moreInfoDialog.getData('tags');
    data[config.tableNames.health] = catchTb.moreInfoDialog.getData('health');
    data[config.tableNames.habitat] = habitatTb.getData();
    data[config.tableNames.transect] = habitatTb.getTransectData();
    data[config.tableNames.transectMeasurements] = habitatTb.getTransectMeasurementData();

    const data_txt = JSON.stringify(data);

    return reportSummary.verify(data).then(
      async () => {
        try {
          await submitJob({ data: data_txt }, config.urls.newCollectionEvent);

          onSuccessfulSubmit();
        } catch (error) {
          onError(error.message);
        }

        // stringify, parse is so that we have a clean object to store in localforage
        return archivesLocalForage.current.setItem(
          data[config.tableNames.samplingEvents].attributes[config.fieldNames.samplingEvents.EVENT_ID],
          JSON.parse(JSON.stringify(data))
        );
      },
      () => {
        appDispatch({
          type: appActionTypes.SUBMIT_LOADING,
          payload: false,
        });
      }
    );
  }, [
    appDispatch,
    catchTb,
    eventState,
    habitatTb,
    methodTb,
    onError,
    onSuccessfulSubmit,
    reportSummary,
    validateReport,
  ]);

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
    <EventContext.Provider value={{ eventState, eventDispatch }}>
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
    </EventContext.Provider>
  );
};

export default NewCollectionEvent;
