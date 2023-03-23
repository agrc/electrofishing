import topic from 'pubsub-js';
import { useCallback, useEffect, useRef, useState } from 'react';
import { useAppContext } from '../../App.jsx';
import config from '../../config';
import getControlledInputProps from '../../helpers/getControlledInputProps';
import { actionTypes, useSamplingEventContext } from '../../hooks/samplingEventContext.jsx';
import useSubscriptions from '../../hooks/useSubscriptions';
import DomainDrivenDropdown from '../DomainDrivenDropdown.jsx';
import StartDistDirGeoDef from './StartDistDirGeoDef.jsx';
import StartEndGeoDef from './StartEndGeoDef.jsx';
import Station from './Station.jsx';
import VerifyMap from './VerifyMap.jsx';

// successfullyVerifiedMsg: String
//      message displayed on the verify location button after success
const successfullyVerifiedMsg = 'Successfully verified!';
const fieldNames = config.fieldNames.samplingEvents;
const featureServiceUrl = config.urls.samplingEventsFeatureService;
const START_END = 'START_END';
const emptyStartEndParams = {
  start: config.emptyPoint,
  end: config.emptyPoint,
};
const emptyStartDistDirParams = {
  start: config.emptyPoint,
  distance: '',
  direction: 'up',
};

const Location = () => {
  const { eventState, eventDispatch } = useSamplingEventContext();
  const [validateMsg, setValidateMsg] = useState(null);
  const verifyMapBtn = useRef(null);
  const { appState } = useAppContext();
  const [mainMap, setMainMap] = useState(null);
  const [startEndParams, setStartEndParams] = useState(emptyStartEndParams);
  const [startDistDirParams, setStartDistDirParams] = useState(emptyStartDistDirParams);
  const [currentGeoDef, setCurrentGeoDef] = useState(START_END);

  const path = useRef(null);
  const geometry = eventState[config.tableNames.samplingEvents].geometry;
  const clearGeometry = useCallback(() => {
    // summary:
    //      removes the polyline from the map if one exists
    if (path.current) {
      appState.map.removeLayer(path.current);
      path.current = null;
    }
  }, [appState.map]);

  const clearValidation = useCallback(() => {
    $(verifyMapBtn.current).button('reset');
    setValidateMsg(null);
    clearGeometry();
  }, [clearGeometry]);

  useEffect(() => {
    if (!geometry) {
      clearValidation();
      setStartEndParams(emptyStartEndParams);
      setStartDistDirParams(emptyStartDistDirParams);
    }
  }, [clearValidation, geometry]);

  useEffect(() => {
    clearValidation();
    setStartEndParams(emptyStartEndParams);
    setStartDistDirParams(emptyStartDistDirParams);
  }, [clearValidation, currentGeoDef]);

  const addLineToMap = (newPath) => {
    // summary:
    //      adds the path to the map
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

  const getXHRParams = (name, params) => {
    if (name === START_END) {
      return {
        query: {
          f: 'json',
          points: JSON.stringify({
            displayFieldName: '',
            geometryType: 'esriGeometryPoint',
            spatialReference: {
              wkid: 26912,
              latestWkid: 26912,
            },
            fields: [
              {
                name: 'OBJECTID',
                type: 'esriFieldTypeOID',
                alias: 'OBJECTID',
              },
            ],
            features: [
              {
                geometry: {
                  x: Math.round(params.start.x),
                  y: Math.round(params.start.y),
                  spatialReference: { wkid: 26912 },
                },
                attributes: { OBJECTID: 1 },
              },
              {
                geometry: {
                  x: Math.round(params.end.x),
                  y: Math.round(params.end.y),
                  spatialReference: { wkid: 26912 },
                },
                attributes: { OBJECTID: 2 },
              },
            ],
          }),
        },
        options: {
          handleAs: 'json',
          headers: {
            'X-Requested-With': null,
          },
        },
      };
    } else {
      return {
        query: {
          f: 'json',
          point: JSON.stringify({
            displayFieldName: '',
            geometryType: 'esriGeometryPoint',
            spatialReference: {
              wkid: 26912,
              latestWkid: 26912,
            },
            fields: [
              {
                name: 'OBJECTID',
                type: 'esriFieldTypeOID',
                alias: 'OBJECTID',
              },
            ],
            features: [
              {
                geometry: {
                  x: Math.round(params.start.x),
                  y: Math.round(params.start.y),
                  spatialReference: { wkid: 26912 },
                },
                attributes: { OBJECTID: 1 },
              },
            ],
          }),
          distance: params.distance,
          direction: params.direction,
        },
        handleAs: 'json',
        headers: {
          'X-Requested-With': null,
        },
      };
    }
  };

  const getJobResults = (data) => {
    if (data.error) {
      throw new Error(data.error.message);
    }

    const returnData = {};

    const setSegmentWGS = function (value) {
      if (value.features.length > 0) {
        var feature = value.features[0];
        var paths = [];
        feature.geometry.paths.forEach(function (path) {
          // flip lats and lngs. Thanks, ESRI :P
          paths.push(
            path.map(function (c) {
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

    return returnData;
  };

  const getGeometry = async (name, params) => {
    let geoDef;
    let url;
    let xhrParams;
    if (name === START_END) {
      const { start, end } = params;

      if (!start) {
        return 'Valid start point required!';
      } else if (!end) {
        return 'Valid end point required!';
      }

      geoDef = 'start:' + JSON.stringify(start) + '|end:' + JSON.stringify(end);

      xhrParams = getXHRParams(name, params);

      url = `${config.urls.getSegmentFromCoords}/execute`;
    } else {
      var { start, distance, direction } = params;

      topic.publishSync(config.topics.startDistDirGeoDef_onDistanceChange, distance);

      if (!start) {
        return 'Start point required!';
      } else if (distance === '') {
        return 'Distance required!';
      }

      geoDef = 'start:' + JSON.stringify(start) + '|dist:' + distance + '|dir:' + direction;

      xhrParams = getXHRParams(name, params);

      url = `${config.urls.getSegmentFromStartDistDir}/execute`;
    }

    try {
      const response = await fetch(`${url}?${new URLSearchParams(xhrParams.query)}`, xhrParams.options);
      const data = await response.json();

      const geometry = getJobResults(data);
      if (!geometry) {
        throw new Error('There was an error with the verify service.');
      }

      return {
        ...geometry,
        geoDef,
      };
    } catch (error) {
      const msg = `There was an error with the ${url} service: `;
      throw new Error(msg + error.message);
    }
  };

  const validateGeometry = async () => {
    $(verifyMapBtn.current).button('loading');

    setValidateMsg(null);

    const onError = (msg) => {
      setValidateMsg(msg);
      $(verifyMapBtn.current).button('reset');
    };

    let response;
    try {
      response = await getGeometry(currentGeoDef, currentGeoDef === START_END ? startEndParams : startDistDirParams);
    } catch (error) {
      onError(error.message);
    }

    if (typeof response === 'string') {
      onError(response);
    } else {
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
    }
  };

  // subscriptions
  const addSubscription = useSubscriptions();
  useEffect(() => {
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

  useEffect(() => {
    if (appState.settings.currentTab === 'locationTab') {
      // this prevents the map from getting messed up when it's hidden by another tab
      mainMap?.invalidateSize();
    }
  }, [appState.settings.currentTab, mainMap]);

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

  const today = new Date();
  let month = today.getMonth() + 1;
  if (month < 10) {
    month = '0' + month;
  }
  const inputMax = `${today.getFullYear()}-${month}-${today.getDate()}`;

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
          <a id="startEndTab" href="#loc_startend" data-toggle="tab" onClick={() => setCurrentGeoDef(START_END)}>
            Start | End
          </a>
        </li>
        <li>
          <a
            id="startDistDirTab"
            href="#loc_startdistdir"
            data-toggle="tab"
            onClick={() => setCurrentGeoDef('START_DIST_DIR')}
          >
            Start | Distance | Direction
          </a>
        </li>
      </ul>
      <div className="tab-content">
        <div className="tab-pane fade in active" id="loc_startend">
          <StartEndGeoDef map={mainMap} coordinatePairs={startEndParams} setCoordinatePairs={setStartEndParams} />
        </div>
        <div className="tab-pane fade" id="loc_startdistdir">
          <StartDistDirGeoDef map={mainMap} params={startDistDirParams} setParams={setStartDistDirParams} />
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
          <input type="date" max={inputMax} {...getLocationInputProps(fieldNames.EVENT_DATE)} />
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
