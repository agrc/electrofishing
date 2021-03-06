import * as React from 'react';
import config from '../../config';
import { actionTypes, EventContext } from '../NewCollectionEvent';
import VerifyMap from './VerifyMap';
import useDojoWidget from '../../hooks/useDojoWidget';
import Station from './Station';
import on from 'dojo/on';
import StartEndGeoDef from 'app/location/StartEndGeoDef';
import StartDistDirGeoDef from 'app/location/StartDistDirGeoDef';
import useSubscriptions from '../../hooks/useSubscriptions';
import { AppContext } from '../../App';
import DomainDrivenDropdown from '../DomainDrivenDropdown';
import getControlledInputProps from '../../helpers/getControlledInputProps';

// successfullyVerifiedMsg: String
//      message displayed on the verify location button after success
const successfullyVerifiedMsg = 'Successfully verified!';
const fieldNames = config.fieldNames.samplingEvents;
const featureServiceUrl = config.urls.samplingEventsFeatureService;

const Location = () => {
  const { eventState, eventDispatch } = React.useContext(EventContext);
  const [validateMsg, setValidateMsg] = React.useState(null);
  const verifyMapBtn = React.useRef(null);
  const { appState } = React.useContext(AppContext);
  const [mainMap, setMainMap] = React.useState(null);

  // dojo widgets
  const startEndGeoDefDiv = React.useRef(null);
  const startEndGeoDef = useDojoWidget(startEndGeoDefDiv, StartEndGeoDef);

  const startDistDirGeoDefDiv = React.useRef(null);
  const startDistDirGeoDef = useDojoWidget(startDistDirGeoDefDiv, StartDistDirGeoDef);

  React.useEffect(() => {
    if (appState.map && startEndGeoDef && startDistDirGeoDef) {
      startEndGeoDef.setMap(appState.map);
      startDistDirGeoDef.setMap(appState.map);
    }
  }, [appState.map, startEndGeoDef, startDistDirGeoDef]);

  const path = React.useRef(null);
  const geometry = eventState[config.tableNames.samplingEvents].geometry;
  const clearGeometry = React.useCallback(() => {
    // summary:
    //      removes the polyline from the map if one exists
    console.log('app/components/location/Location:clearGeometry');

    if (path.current) {
      appState.map.removeLayer(path.current);
      path.current = null;
    }
  }, [appState.map]);

  const clearValidation = React.useCallback(() => {
    console.log('app/components/location/Location:clearValidation');

    $(verifyMapBtn.current).button('reset');
    setValidateMsg(null);
    clearGeometry();
  }, [clearGeometry]);

  React.useEffect(() => {
    if (!geometry) {
      clearValidation();
      currentGeoDef.current?.clearGeometry();
    }
  }, [clearValidation, geometry]);

  const geoDevWidgets = {
    startEnd: startEndGeoDef,
    startDistDir: startDistDirGeoDef,
  };
  const currentGeoDef = React.useRef(null);
  const invalidateConnectHandle = React.useRef(null);
  const onGeoDefChange = (event) => {
    // summary:
    //      fires when the user clicks on the geo def tab pills
    // event: OnclickEventObject
    console.log('app/components/location/Location:onGeoDefChange');

    let geoDefID;

    currentGeoDef.current.clearGeometry();
    geoDefID = event.target.id.slice(0, -3);

    setCurrentGeoDef(geoDevWidgets[geoDefID]);
  };

  const setCurrentGeoDef = React.useCallback(
    (geoDef) => {
      currentGeoDef.current = geoDef;
      if (invalidateConnectHandle.current) {
        invalidateConnectHandle.current.remove();
      }
      invalidateConnectHandle.current = on(currentGeoDef.current, 'invalidate', clearValidation);
      clearValidation();
    },
    [clearValidation]
  );

  React.useEffect(() => {
    // default to start end on init
    if (startEndGeoDef) {
      setCurrentGeoDef(startEndGeoDef);
    }
  }, [setCurrentGeoDef, startEndGeoDef]);

  const addLineToMap = (newPath) => {
    // summary:
    //      adds the path to the map
    console.log('app/components/location/Location:addLineToMap');

    const calculateDistance = (line) => {
      const latLngArray = line._latlngs[0];
      let distance = 0;
      for (var i = 0; i < latLngArray.length - 1; i++) {
        distance += latLngArray[i].distanceTo(latLngArray[i + 1]);
      }

      return distance;
    };

    verifyMapBtn.current.innerHTML = successfullyVerifiedMsg;
    verifyMapBtn.current.dataset.successful = true;

    const line = L.polyline(newPath, { color: 'red' }).addTo(appState.map);
    path.current = line;
    appState.map.fitBounds(line.getBounds().pad(0.1));
    const streamDistance = calculateDistance(line);

    eventDispatch({
      type: actionTypes.LOCATION,
      meta: fieldNames.SEGMENT_LENGTH,
      payload: streamDistance.toFixed(),
    });
  };

  const validateGeometry = () => {
    console.log('app/components/location/Location:validateGeometry');

    let returnedValue;

    $(verifyMapBtn.current).button('loading');

    setValidateMsg(null);

    returnedValue = currentGeoDef.current.getGeometry();

    const onError = (msg) => {
      setValidateMsg(msg);
      $(verifyMapBtn.current).button('reset');
      eventDispatch({
        type: actionTypes.LOCATION,
        meta: 'geometry',
        payload: { geometry: null, geoDef: null },
      });
    };

    if (typeof returnedValue === 'string') {
      onError(returnedValue);
    } else {
      returnedValue.then((response) => {
        if (response.success) {
          addLineToMap(response.path);
          eventDispatch({
            type: actionTypes.LOCATION,
            meta: 'geometry',
            payload: {
              geometry: {
                ...response.utm,
                spatialReference: {
                  wkid: 26912,
                },
              },
              geoDef: response.geoDef,
            },
          });
        } else {
          onError(response.error_message);
        }
      }, onError);
    }
  };

  // subscriptions
  const addSubscription = useSubscriptions();
  React.useEffect(() => {
    addSubscription(config.topics.startDistDirGeoDef_onDistanceChange, (_, dist) => {
      eventDispatch({
        type: actionTypes.LOCATION,
        meta: fieldNames.SEGMENT_LENGTH,
        payload: dist,
      });
    });
  }, [addSubscription, eventDispatch]);

  const getLocationInputProps = (fieldName, parser) => {
    return getControlledInputProps(
      eventState,
      eventDispatch,
      actionTypes.LOCATION,
      config.tableNames.samplingEvents,
      fieldName,
      parser
    );
  };

  React.useEffect(() => {
    if (appState.currentTab === 'locationTab') {
      // this prevents the map from getting messed up when it's hidden by another tab
      mainMap?.invalidateSize();
    }
  }, [appState.currentTab, mainMap]);

  const selectStation = (name, id) => {
    eventDispatch({
      type: actionTypes.OTHER,
      meta: 'selectedStationName',
      payload: name || '',
    });

    eventDispatch({
      type: actionTypes.LOCATION,
      meta: config.fieldNames.samplingEvents.STATION_ID,
      payload: id,
    });
  };

  return (
    <div className="location">
      <h4>Water Body</h4>
      <VerifyMap className="v-map" isMainMap={true} setMap={setMainMap} selectStation={selectStation} />
      <Station
        mainMap={mainMap}
        selectStation={selectStation}
        selectedStationName={eventState.other.selectedStationName}
      />
      <h4>
        Stream Reach <span className="text-danger required">*</span>
      </h4>
      <ul className="nav nav-pills">
        <li className="active">
          <a id="startEndTab" href="#loc_startend" data-toggle="tab" onClick={onGeoDefChange}>
            Start | End
          </a>
        </li>
        <li>
          <a id="startDistDirTab" href="#loc_startdistdir" data-toggle="tab" onClick={onGeoDefChange}>
            Start | Distance | Direction
          </a>
        </li>
      </ul>
      <div className="tab-content">
        <div className="tab-pane fade in active" id="loc_startend">
          <div ref={startEndGeoDefDiv}></div>
        </div>
        <div className="tab-pane fade" id="loc_startdistdir">
          <div ref={startDistDirGeoDefDiv}></div>
        </div>
      </div>
      <button
        ref={verifyMapBtn}
        className="btn btn-success"
        data-loading-text="Verifying...this may take a few seconds."
        onClick={validateGeometry}
      >
        Verify Location
      </button>
      {validateMsg ? <div className="alert alert-danger">{validateMsg}</div> : null}

      <div className="row">
        <div className="form-group col-md-6">
          <label
            className="control-label"
            id={fieldNames.SEGMENT_LENGTH}
            htmlFor={`${fieldNames.SEGMENT_LENGTH}_input`}
          >
            Stream Length (meters)
          </label>
          <span className="text-danger required">*</span>
          <input type="number" {...getLocationInputProps(fieldNames.SEGMENT_LENGTH, parseInt)} />
        </div>
      </div>

      <div className="row">
        <div className="form-group col-md-3">
          <label className="control-label" id={fieldNames.EVENT_DATE} htmlFor={`${fieldNames.EVENT_DATE}_input`}>
            Collection Date
          </label>
          <span className="text-danger required">*</span>
          <input type="date" {...getLocationInputProps(fieldNames.EVENT_DATE)} />
        </div>
        <div className="form-group col-md-3">
          <label className="control-label" htmlFor={`${fieldNames.EVENT_TIME}_input`}>
            Collection Time
          </label>
          <input type="time" {...getLocationInputProps(fieldNames.EVENT_TIME)} />
        </div>
      </div>
      <div className="row">
        <div className="form-group col-md-6">
          <label className="control-label" id={fieldNames.PURPOSE} htmlFor={`${fieldNames.PURPOSE}_input`}>
            Survey Purpose (Purpose of Collection)
          </label>
          <span className="text-danger required">*</span>
          <DomainDrivenDropdown
            featureServiceUrl={featureServiceUrl}
            fieldName={fieldNames.PURPOSE}
            {...getLocationInputProps(fieldNames.PURPOSE)}
          />
        </div>
      </div>
      <div className="row">
        <div className="form-group col-md-6">
          <label className="control-label" htmlFor={`${fieldNames.WEATHER}_input`}>
            Weather
          </label>
          <DomainDrivenDropdown
            featureServiceUrl={featureServiceUrl}
            fieldName={fieldNames.WEATHER}
            {...getLocationInputProps(fieldNames.WEATHER)}
          />
        </div>
      </div>

      <div className="row">
        <div className="form-group col-md-6">
          <label className="control-label" htmlFor={`${fieldNames.LOCATION_NOTES}_input`}>
            Additional Location Notes (optional)
          </label>
          <textarea {...getLocationInputProps(fieldNames.LOCATION_NOTES)} maxLength={1000} rows={5} />
        </div>
      </div>

      <div className="row">
        <div className="form-group col-md-6">
          <label className="control-label" id={fieldNames.OBSERVERS} htmlFor={`${fieldNames.OBSERVERS}_input`}>
            Observers
          </label>
          <span className="text-danger required">*</span>
          <textarea {...getLocationInputProps(fieldNames.OBSERVERS)} maxLength={255} rows={5} />
        </div>
      </div>
    </div>
  );
};

export default Location;
