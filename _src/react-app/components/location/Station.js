import * as React from 'react';
import StationPointDef from 'app/location/StationPointDef';
import useDojoWidget from '../../hooks/useDojoWidget';
import VerifyMap from './VerifyMap';
import DomainDrivenDropdown from '../DomainDrivenDropdown';
import config from '../../config';
import getGUID from '../../helpers/getGUID';
import topic from 'pubsub-js';
import useSubscriptions from '../../hooks/useSubscriptions';

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
  const verifyMap = React.useRef(null);
  const setVerifyMap = (map) => (verifyMap.current = map);
  const [streamType, setStreamType] = React.useState(null);
  const submitBtn = React.useRef(null);
  const [stationName, setStationName] = React.useState('');
  const [streamLake, setStreamLake] = React.useState('');
  const [validateMsg, setValidateMsg] = React.useState(null);
  const [showSuccessMsg, setShowSuccessMsg] = React.useState(false);
  const [streamLakeBtnIsActive, setStreamLakeBtnIsActive] = React.useState(false);
  const streamsLayer = React.useRef(null);
  const setStreamsLayer = (layer) => (streamsLayer.current = layer);
  const lakesLayer = React.useRef(null);
  const setLakesLayer = (layer) => (lakesLayer.current = layer);

  const pointDefDiv = React.useRef(null);
  const pointDef = useDojoWidget(pointDefDiv, StationPointDef);
  React.useEffect(() => {
    if (pointDef && verifyMap.current) {
      const fGroup = new L.FeatureGroup().addTo(verifyMap.current);
      pointDef.setMap(verifyMap.current, fGroup);
    }
  }, [pointDef]);
  const validate = () => {
    // summary:
    //      validates all of the values necessary to submit to create a new station.
    //      if the form does not validate then it shows an error message
    // returns: False || {}
    //      False if invalid, otherwise an object with all of the values
    console.log('react-app/location/Station:validate');

    const name = stationName.trim();
    const point = pointDef.getPoint();
    let message;
    let returnValue;

    /* eslint-disable no-negated-condition */
    if (name === '') {
      message = validateMsgs.name;
      returnValue = false;
    } else if (!streamType) {
      message = validateMsgs.type;
      returnValue = false;
    } else if (!point) {
      message = validateMsgs.point;
      returnValue = false;
    } else if (streamLake === '') {
      message = validateMsgs.waterId;
    } else {
      message = '';
      returnValue = {
        geometry: { x: point.x, y: point.y, spatialReference: { wkid: 26912 } },
        attributes: {},
      };
      returnValue.attributes[config.fieldNames.stations.NAME] = name;
      returnValue.attributes[config.fieldNames.stations.STREAM_TYPE] = streamType;
      returnValue.attributes[config.fieldNames.stations.WATER_ID] = streamLake;
    }
    /* eslint-enable no-negated-condition */

    setValidateMsg(message);

    return returnValue;
  };

  const onWaterBodyClick = React.useCallback((event) => {
    // summary:
    //      The user has clicks on a stream or lake feature on the map
    console.log('react-app/location/Station:onWaterBodyClick');

    streamsLayer.current.setStyle({ color: config.colors.default });
    lakesLayer.current.setStyle({ color: config.colors.default });

    event.layer.setStyle({ color: config.colors.selected });

    setStreamLake(event.layer.feature.properties[config.fieldNames.reference.Permanent_Identifier]);
  }, []);

  const onSuccessfulSubmit = (newStation) => {
    console.log('react-app/location/Station:onSuccessfulSubmit');

    setShowSuccessMsg(true);

    $(submitBtn.current).button('reset');

    // clear form
    setStationName('');
    setStreamType(null);
    pointDef.clear();
    setStreamLake('');
    onPointDefSelected();
    // TODO: clear selected stream or lake on map

    mainMap.eachLayer((layer) => layer?.refresh && layer.refresh());
    verifyMap.current.eachLayer((layer) => layer?.refresh && layer.refresh());

    setTimeout(() => {
      $(modal.current).modal('hide');
      setShowSuccessMsg(false);
      selectStation(
        newStation.attributes[config.fieldNames.stations.NAME],
        newStation.attributes[config.fieldNames.stations.STATION_ID]
      );
    }, 250);
  };

  const onError = (message) => {
    // summary:
    //      displayed an error message when the service fails
    // err: error object
    console.log('app/location/Station:onError');

    setValidateMsg(message || newStationErrMsg);
    $(submitBtn.current).button('reset');
  };

  const onSubmit = async () => {
    console.log('react-app/location/Station:onSubmit');

    const feature = validate();

    if (feature) {
      $(submitBtn.current).button('loading');

      feature.attributes[config.fieldNames.stations.STATION_ID] = getGUID();

      // TODO: we can probably go to json data and content-type: application/json when we upgrade arcgis server
      const formData = new FormData();
      formData.append('f', 'json');
      formData.append('features', JSON.stringify([feature]));

      const params = {
        headers: {
          'X-Requested-With': null,
        },
        method: 'POST',
        body: formData,
      };

      try {
        const response = await fetch(`${config.urls.stationsFeatureService}/addFeatures`, params);
        const responseJson = await response.json();

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

  const onPointDefSelected = React.useCallback(
    (_, widget) => {
      // if widget is not the toggle stream lake button, then setStreamLakeBtnIsActive(false)
      if (widget === pointDef) {
        setStreamLakeBtnIsActive(false);
      }
    },
    [pointDef]
  );
  const addSubscription = useSubscriptions();
  React.useEffect(() => {
    addSubscription(config.topics.pointDef_onBtnClick, onPointDefSelected);
  }, [addSubscription, onPointDefSelected]);
  React.useEffect(() => {
    const func = streamLakeBtnIsActive ? 'on' : 'off';
    if (streamLakeBtnIsActive) {
      topic.publishSync(config.topics.pointDef_onBtnClick, { isEnabled: () => streamLakeBtnIsActive });
    }
    if (verifyMap.current) {
      streamsLayer.current[func]('click', onWaterBodyClick);
      lakesLayer.current[func]('click', onWaterBodyClick);
    }
  }, [onWaterBodyClick, streamLakeBtnIsActive]);

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
      <p className="help-block">Select a station by clicking on the map above.</p>
      <div className="form-inline">
        <div className="form-group">
          <input type="text" disabled value={selectedStationName} className="form-control" id="stationTxt" />
        </div>
        <a className="btn btn-default" data-toggle="modal" href="#stationModal">
          <span className="glyphicon glyphicon-plus"></span>
          Add New Station
        </a>
      </div>
      <div className="modal fade" id="stationModal" role="dialog" tabIndex="-1" data-backdrop="static" ref={modal}>
        <div className="modal-dialog">
          <div className="modal-content">
            <div className="modal-header">
              <button className="close" type="button" data-dismiss="modal">
                &times;
              </button>
              <h4 className="modal-titled">Add New Station</h4>
            </div>
            <div className="modal-body">
              <div className="row">
                <div className="form-group col-md-3">
                  <label htmlFor="stationNameTxt" className="control-label">
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
                <div className="form-group col-md-3">
                  <label htmlFor="streamTypeSelect" className="control-label">
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
              <div ref={pointDefDiv}></div>
              <div className="stream-lake-button-container form-inline">
                <label>Stream/Lake</label>
                <div className="form-group">
                  <button
                    type="button"
                    className={`btn btn-default btn-sm ${streamLakeBtnIsActive ? 'active' : null}`}
                    onClick={() => setStreamLakeBtnIsActive(!streamLakeBtnIsActive)}
                  >
                    <span className="glyphicon glyphicon-map-marker"></span>
                  </button>
                </div>
                <div className="form-group">
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
            <div className="modal-footer">
              <div className="control-group has-error pull-left">
                <span className="help-block">{validateMsg}</span>
              </div>
              <div className="control-group has-success pull-left">
                {showSuccessMsg ? <span className="help-block">Station added successfully!</span> : null}
              </div>
              <button href="#" className="btn btn-link" data-dismiss="modal">
                Cancel
              </button>
              <button
                className="btn btn-primary"
                ref={submitBtn}
                data-loading-text="Submitting new station..."
                onClick={onSubmit}
              >
                Add Station
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Station;
