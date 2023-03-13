import clsx from 'clsx';
import config from '../config';
import PropTypes from 'prop-types';

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
              <button type="button" className="close" data-dismiss="modal" aria-hidden="true">
                &times;
              </button>
              <h4 className="modal-title">Settings</h4>
            </div>
            <div className="modal-body">
              <h4>Coordinate Type</h4>
              <div className="btn-group" data-toggle="buttons">
                {coordTypeOptions.map(([value, label]) => (
                  <label
                    key={value}
                    className={clsx('btn btn-primary', coordType === value && 'active')}
                    onClick={() => onCoordTypeChange(value)}
                  >
                    <input type="radio" name="coord_options" />
                    {label}
                  </label>
                ))}
              </div>

              <h4>Map Settings</h4>
              <div className="checkbox">
                <label>
                  <input
                    type="checkbox"
                    checked={mouseWheelZooming}
                    onChange={() => {
                      onChange('mouseWheelZooming', !mouseWheelZooming);
                    }}
                  />
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
