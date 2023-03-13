import PropTypes from 'prop-types';
import config from '../../config';
import AddRemoveButtons from '../AddRemoveButtons.jsx';
import DomainDrivenDropdown from '../DomainDrivenDropdown.jsx';
import NumericInputValidator from '../NumericInputValidator.jsx';

const fn = config.fieldNames.tags;

function Tag({ state, onChange, addNew, remove, isLast, isFirst }) {
  const getTagInputProps = (field) => {
    return {
      className: 'form-control',
      value: state[field] || '',
      onChange: (event) => {
        onChange({
          ...state,
          [field]: event.target.value,
        });
      },
    };
  };

  return (
    <div>
      <div className="row">
        <div className="form-group col-md-3">
          <label>New Tag?</label>
          <DomainDrivenDropdown
            featureServiceUrl={config.urls.tagsFeatureService}
            fieldName={fn.NEW_TAG}
            {...getTagInputProps(fn.NEW_TAG)}
          />
        </div>
        <div className="form-group col-md-4">
          <label>Type</label>
          <DomainDrivenDropdown
            featureServiceUrl={config.urls.tagsFeatureService}
            fieldName={fn.TYPE}
            {...getTagInputProps(fn.TYPE)}
          />
        </div>
      </div>
      <div className="row">
        <div className="form-group col-md-4">
          <label>Tag #</label>
          <input type="text" maxLength="50" {...getTagInputProps(fn.NUMBER)} />
        </div>
        <div className="form-group col-md-3">
          <label>Color</label>
          <DomainDrivenDropdown
            featureServiceUrl={config.urls.tagsFeatureService}
            fieldName={fn.COLOR}
            {...getTagInputProps(fn.COLOR)}
          />
        </div>
        <div className="form-group col-md-4">
          <label>Location</label>
          <DomainDrivenDropdown
            featureServiceUrl={config.urls.tagsFeatureService}
            fieldName={fn.LOCATION}
            {...getTagInputProps(fn.LOCATION)}
          />
        </div>
      </div>
      <div className="row">
        <div className="form-group col-md-4">
          <label>Transponder Freq. (kHz)</label>
          <DomainDrivenDropdown
            featureServiceUrl={config.urls.tagsFeatureService}
            fieldName={fn.TRANSPONDER_FREQ}
            {...getTagInputProps(fn.TRANSPONDER_FREQ)}
          />
        </div>
        <NumericInputValidator>
          {(getInputProps, getGroupClassName, validationMessage) => (
            <div className={getGroupClassName('col-md-3')}>
              <label>Transmitter Freq.</label>
              <input min="1" max="3000" {...getInputProps(getTagInputProps(fn.TRANSMITTER_FREQ))} />
              {validationMessage}
            </div>
          )}
        </NumericInputValidator>

        <div className="form-group col-md-4">
          <label>Transmitter Freq. Type</label>
          <DomainDrivenDropdown
            featureServiceUrl={config.urls.tagsFeatureService}
            fieldName={fn.TRANSMITTER_FREQ_TYPE}
            {...getTagInputProps(fn.TRANSMITTER_FREQ_TYPE)}
          />
        </div>
      </div>
      <AddRemoveButtons addNew={addNew} remove={remove} isLast={isLast} isFirst={isFirst} />
    </div>
  );
}

Tag.propTypes = {
  state: PropTypes.object.isRequired,
  onChange: PropTypes.func.isRequired,
  addNew: PropTypes.func.isRequired,
  remove: PropTypes.func.isRequired,
  isLast: PropTypes.bool.isRequired,
  isFirst: PropTypes.bool.isRequired,
};

export default Tag;
