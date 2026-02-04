import PropTypes from 'prop-types';
import topic from 'pubsub-js';
import React, { useRef, useState } from 'react';
import $ from 'jquery';
import 'bootstrap';
import config from '../../config';
import getGUID from '../../helpers/getGUID';
import submitJob from '../../helpers/submitJob';
import useSubscriptions from '../../hooks/useSubscriptions';
import useUniqueId from '../../hooks/useUniqueId';
import DomainDrivenDropdown from '../DomainDrivenDropdown.jsx';
import PointDef from './PointDef.jsx';
import VerifyMap from './VerifyMap.jsx';

// validateMsgs: Object
//      The invalid messages displayed for this dialog
const validateMsgs = {
  name: 'A station name is required!',
  type: 'A stream type is required!',
  point: 'A valid point location is required!',
  waterId: 'A stream or lake must be selected!',
};
// newStationErrMsg: String;
//      the message displayed when there is a problem with the new station service
const newStationErrMsg = 'There was an error submitting the station!';

const Station = ({ mainMap, selectedStationName, selectStation }) => {
  const verifyMap = useRef(null);
  const [streamType, setStreamType] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [stationName, setStationName] = useState('');
  const [streamLake, setStreamLake] = useState('');
  const [validateMsg, setValidateMsg] = useState(null);
  const [showSuccessMsg, setShowSuccessMsg] = useState(false);
  const [streamLakeBtnIsActive, setStreamLakeBtnIsActive] = useState(false);
  const streamsLayer = useRef(null);
  const setStreamsLayer = (layer) => (streamsLayer.current = layer);
  const lakesLayer = useRef(null);
  const setLakesLayer = (layer) => (lakesLayer.current = layer);
  const group = useRef(null);
  const [coordinates, setCoordinates] = useState(config.emptyPoint);

  const setVerifyMap = (map) => {
    verifyMap.current = map;

    group.current = new L.FeatureGroup().addTo(verifyMap.current);
  };

  const validate = () => {
    // summary:
    //      validates all of the values necessary to submit to create a new station.
    //      if the form does not validate then it shows an error message
    // returns: False || {}
    //      False if invalid, otherwise an object with all of the values
    const name = stationName.trim();
    let message;
    let returnValue;

    if (name === '') {
      message = validateMsgs.name;
      returnValue = false;
    } else if (!streamType) {
      message = validateMsgs.type;
      returnValue = false;
    } else if (coordinates.x === '' || coordinates.y === '') {
      message = validateMsgs.point;
      returnValue = false;
    } else if (streamLake === '') {
      message = validateMsgs.waterId;
    } else {
      message = '';
      returnValue = {
        geometry: { x: coordinates.x, y: coordinates.y, spatialReference: { wkid: 26912 } },
        attributes: {},
      };
      returnValue.attributes[config.fieldNames.stations.NAME] = name;
      returnValue.attributes[config.fieldNames.stations.STREAM_TYPE] = streamType;
      returnValue.attributes[config.fieldNames.stations.WATER_ID] = streamLake;
    }

    setValidateMsg(message);

    return returnValue;
  };

  const onWaterBodyClick = React.useCallback((event) => {
    // summary:
    //      The user has clicks on a stream or lake feature on the map
    streamsLayer.current.setStyle({ color: config.colors.default });
    lakesLayer.current.setStyle({ color: config.colors.default });

    event.layer.setStyle({ color: config.colors.selected });

    setStreamLake(event.layer.feature.properties[config.fieldNames.reference.Permanent_Identifier]);
  }, []);

  const onSuccessfulSubmit = (newStation) => {
    setShowSuccessMsg(true);

    setSubmitting(false);

    // clear form
    setStationName('');
    setStreamType(null);
    setCoordinates(config.emptyPoint);
    setStreamLake('');
    onPointDefSelected();

    mainMap.eachLayer((layer) => layer?.refresh && layer.refresh());
    verifyMap.current.eachLayer((layer) => layer?.refresh && layer.refresh());

    setTimeout(() => {
      $(modal.current).modal('hide');
      setShowSuccessMsg(false);
      // can't find a way to hook into when the layer is done refreshing...
      setTimeout(() => {
        selectStation(
          newStation.attributes[config.fieldNames.stations.NAME],
          newStation.attributes[config.fieldNames.stations.STATION_ID],
        );
      }, 1000);
    }, 500);
  };

  const onError = (message) => {
    // summary:
    //      displayed an error message when the service fails
    // err: error object
    console.log('app/location/Station:onError');

    setValidateMsg(message || newStationErrMsg);
    setSubmitting(false);
  };

  const onSubmit = async () => {
    const feature = validate();

    if (feature) {
      setSubmitting(true);

      feature.attributes[config.fieldNames.stations.STATION_ID] = getGUID();

      const body = { features: JSON.stringify([feature]) };

      try {
        const responseJson = await submitJob(body, `${config.urls.stationsFeatureService}/addFeatures`);

        if (responseJson?.addResults[0].success) {
          onSuccessfulSubmit(feature);
        } else {
          onError(responseJson?.error?.message);
        }
      } catch (error) {
        onError(error?.message);
      }
    }
  };

  const id = useUniqueId();
  const onPointDefSelected = React.useCallback(
    (_, widget) => {
      // if widget is not the toggle stream lake button, then setStreamLakeBtnIsActive(false)
      if (widget !== id) {
        setStreamLakeBtnIsActive(false);
      }
    },
    [id],
  );
  const addSubscription = useSubscriptions();
  React.useEffect(() => {
    addSubscription(config.topics.pointDef_onBtnClick, onPointDefSelected);
  }, [addSubscription, onPointDefSelected]);

  React.useEffect(() => {
    const func = streamLakeBtnIsActive ? 'on' : 'off';
    if (streamLakeBtnIsActive) {
      topic.publishSync(config.topics.pointDef_onBtnClick, id, true);
    }
    if (verifyMap.current) {
      streamsLayer.current[func]('click', onWaterBodyClick);
      lakesLayer.current[func]('click', onWaterBodyClick);
    }
  }, [id, onWaterBodyClick, streamLakeBtnIsActive]);

  const modal = React.useRef(null);
  React.useEffect(() => {
    if (verifyMap.current && mainMap) {
      $(modal.current).on('shown.bs.modal', () => {
        verifyMap.current.invalidateSize();

        verifyMap.current.setView(mainMap.getCenter(), mainMap.getZoom());
      });
      $(modal.current).on('hidden.bs.modal', () => {
        mainMap.setView(verifyMap.current.getCenter(), verifyMap.current.getZoom());
      });
    }
  }, [mainMap]);

  return (
    <div className="station">
      <h4 className="heading">
        Station <span className="text-danger required">*</span>
      </h4>
      <p className="form-text text-muted">Select a station by clicking on the map above.</p>
      <div className="row">
        <div className="col-6">
          <div className="input-group">
            <input type="text" disabled value={selectedStationName} className="form-control" id="stationTxt" />
            <div className="input-group-append">
              <a className="btn btn-secondary btn-success" data-toggle="modal" href="#stationModal">
                <span className="bi bi-plus-lg"></span>
                &nbsp;Add New Station
              </a>
            </div>
          </div>
        </div>
      </div>
      <div className="modal fade" id="stationModal" role="dialog" tabIndex="-1" data-backdrop="static" ref={modal}>
        <div className="modal-dialog modal-xl">
          <div className="modal-content">
            <div className="modal-header">
              <h5 className="modal-title">Add New Station</h5>
              <button className="close" type="button" data-dismiss="modal" aria-label="Close">
                <span aria-hidden="true">&times;</span>
              </button>
            </div>
            <div className="modal-body">
              <div className="row">
                <div className="form-group col-md-6">
                  <label htmlFor="stationNameTxt" className="font-weight-bold">
                    Name
                  </label>
                  <input
                    id="stationNameTxt"
                    type="text"
                    value={stationName}
                    className="form-control"
                    maxLength={50}
                    onChange={(event) => setStationName(event.target.value)}
                  />
                </div>
                <div className="form-group col-md-6">
                  <label htmlFor="streamTypeSelect" className="font-weight-bold">
                    Stream Type
                  </label>
                  <DomainDrivenDropdown
                    id="streamTypeSelect"
                    featureServiceUrl={config.urls.stationsFeatureService}
                    fieldName={config.fieldNames.stations.STREAM_TYPE}
                    value={streamType}
                    onChange={(event) => setStreamType(event.target.value)}
                  />
                </div>
              </div>
              <PointDef
                label="Station"
                map={verifyMap.current}
                coordinates={coordinates}
                setCoordinates={setCoordinates}
                twoLineLayout
              />
              <div className="stream-lake-button-container d-flex align-items-center mb-3">
                <label className="mr-2 mb-0 font-weight-bold">Stream/Lake</label>
                <div className="mr-2">
                  <button
                    type="button"
                    className={`btn btn-secondary btn-sm ${streamLakeBtnIsActive ? 'active' : null}`}
                    onClick={() => setStreamLakeBtnIsActive(!streamLakeBtnIsActive)}
                    aria-label="Select Stream/Lake on map"
                  >
                    <span className="bi bi-geo-alt-fill"></span>
                  </button>
                </div>
                <div className="flex-grow-1">
                  <input value={streamLake} className="form-control" type="text" disabled id="streamLakeInput" />
                </div>
              </div>
              <VerifyMap
                isMainMap={false}
                setMap={setVerifyMap}
                id="stationMap"
                setStreamsLayer={setStreamsLayer}
                setLakesLayer={setLakesLayer}
                selectStation={selectStation}
              />
            </div>
            <div className="modal-footer justify-content-between">
              <div>
                <small className="text-danger">{validateMsg}</small>
                {showSuccessMsg ? <small className="text-success">Station added successfully!</small> : null}
              </div>
              <div>
                <button type="button" className="btn btn-link" data-dismiss="modal">
                  Cancel
                </button>
                <button type="button" className="btn btn-primary" onClick={onSubmit} disabled={submitting}>
                  {submitting ? 'Submitting new station...' : 'Add Station'}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

Station.propTypes = { mainMap: PropTypes.object, selectStation: PropTypes.func, selectedStationName: PropTypes.string };

export default Station;
