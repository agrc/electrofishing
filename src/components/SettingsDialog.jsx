import { clsx } from 'clsx';
import PropTypes from 'prop-types';
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
              <button type="button" className="close" data-dismiss="modal" aria-label="Close">
                <span aria-hidden="true">&times;</span>
              </button>
            </div>
            <div className="modal-body">
              <h4>Coordinate Type</h4>
              <div className="btn-group btn-group-toggle" data-toggle="buttons">
                {coordTypeOptions.map(([value, label]) => (
                  <label
                    key={value}
                    className={clsx('btn btn-primary', coordType === value && 'active')}
                    onClick={() => onCoordTypeChange(value)}
                  >
                    <input type="radio" name="coord_options" autoComplete="off" defaultChecked={coordType === value} />
                    {label}
                  </label>
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
              <button className="btn btn-primary" data-dismiss="modal" aria-hidden="true">
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
