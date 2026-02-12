import PropTypes from 'prop-types';
import React from 'react';
import config from '../config';

function SettingsDialog({ state: { coordType, mouseWheelZooming }, onChange }) {
  const coordTypeOptions = [
    [config.coordTypes.utm83, 'UTM (NAD83)'],
    [config.coordTypes.ll, 'Lat/Long'],
    [config.coordTypes.utm27, 'UTM (NAD27)'],
  ];
  const onCoordTypeChange = (value) => {
    onChange('coordType', value);
  };

  return (
    <div>
      <div className="modal fade" id="settingsModal" aria-hidden="true" role="dialog" tabIndex="-1">
        <div className="modal-dialog">
          <div className="modal-content">
            <div className="modal-header">
              <h5 className="modal-title">Settings</h5>
              <button type="button" className="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
            </div>
            <div className="modal-body">
              <h4>Coordinate Type</h4>
              <div className="btn-group" role="group">
                {coordTypeOptions.map(([value, label], i) => (
                  <React.Fragment key={value}>
                    <input
                      type="radio"
                      className="btn-check"
                      name="coord_options"
                      id={`coord_option_${i}`}
                      autoComplete="off"
                      checked={coordType === value}
                      onChange={() => onCoordTypeChange(value)}
                    />
                    <label className="btn btn-primary" htmlFor={`coord_option_${i}`}>
                      {label}
                    </label>
                  </React.Fragment>
                ))}
              </div>

              <h4>Map Settings</h4>
              <div className="form-check">
                <input
                  className="form-check-input"
                  type="checkbox"
                  id="mouseWheelZooming"
                  checked={mouseWheelZooming}
                  onChange={() => {
                    onChange('mouseWheelZooming', !mouseWheelZooming);
                  }}
                />
                <label className="form-check-label" htmlFor="mouseWheelZooming">
                  Mouse wheel zooming (requires refresh)
                </label>
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn btn-primary" data-bs-dismiss="modal" aria-hidden="true">
                Close
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

SettingsDialog.propTypes = {
  state: PropTypes.shape({
    coordType: PropTypes.string.isRequired,
    mouseWheelZooming: PropTypes.bool.isRequired,
  }).isRequired,
  onChange: PropTypes.func.isRequired,
};

export default SettingsDialog;
