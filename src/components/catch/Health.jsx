import config from '../../config';
import DomainDrivenDropdown from '../DomainDrivenDropdown.jsx';
import NumericInputValidator from '../NumericInputValidator.jsx';
import PropTypes from 'prop-types';

const fn = config.fieldNames.health;

function Health({ state, onChange }) {
  const onHealthChange = (fieldName, newValue) => {
    onChange({
      ...state,
      [fieldName]: newValue,
    });
  };

  const getHealthInputProps = (fieldName, parser) => {
    return {
      className: 'form-control',
      onChange: (event) => {
        let newValue = event.target.value?.length ? event.target.value : null;
        if (newValue && parser) {
          newValue = parser(newValue);
        }

        return onHealthChange(fieldName, newValue);
      },
      value: state[fieldName] || '',
      id: `${fieldName}_input`,
    };
  };

  return (
    <div className="health">
      <div className="form-group">
        <label className="control-label">Eye Condition</label>
        <DomainDrivenDropdown
          featureServiceUrl={config.urls.healthFeatureService}
          fieldName={fn.EYE}
          {...getHealthInputProps(fn.EYE)}
        />
      </div>

      <div className="form-group">
        <label className="control-label">Gill Condition</label>
        <DomainDrivenDropdown
          featureServiceUrl={config.urls.healthFeatureService}
          fieldName={fn.GILL}
          {...getHealthInputProps(fn.GILL)}
        />
      </div>

      <div className="form-group">
        <label className="control-label">Pseudobranches Condition</label>
        <DomainDrivenDropdown
          featureServiceUrl={config.urls.healthFeatureService}
          fieldName={fn.PSBR}
          {...getHealthInputProps(fn.PSBR)}
        />
      </div>

      <div className="form-group">
        <label className="control-label">Thymus Condition</label>
        <DomainDrivenDropdown
          featureServiceUrl={config.urls.healthFeatureService}
          fieldName={fn.THYMUS}
          {...getHealthInputProps(fn.THYMUS)}
        />
      </div>

      <div className="form-group">
        <label className="control-label">Fat Index</label>
        <DomainDrivenDropdown
          featureServiceUrl={config.urls.healthFeatureService}
          fieldName={fn.FAT}
          {...getHealthInputProps(fn.FAT)}
        />
      </div>

      <div className="form-group">
        <label className="control-label">Spleen Condition</label>
        <DomainDrivenDropdown
          featureServiceUrl={config.urls.healthFeatureService}
          fieldName={fn.SPLEEN}
          {...getHealthInputProps(fn.SPLEEN)}
        />
      </div>

      <div className="form-group">
        <label className="control-label">Hind Gut Condition</label>
        <DomainDrivenDropdown
          featureServiceUrl={config.urls.healthFeatureService}
          fieldName={fn.HIND}
          {...getHealthInputProps(fn.HIND)}
        />
      </div>

      <div className="form-group">
        <label className="control-label">Kidney Condition</label>
        <DomainDrivenDropdown
          featureServiceUrl={config.urls.healthFeatureService}
          fieldName={fn.KIDNEY}
          {...getHealthInputProps(fn.KIDNEY)}
        />
      </div>

      <div className="form-group">
        <label className="control-label">Liver Condition</label>
        <DomainDrivenDropdown
          featureServiceUrl={config.urls.healthFeatureService}
          fieldName={fn.LIVER}
          {...getHealthInputProps(fn.LIVER)}
        />
      </div>

      <div className="form-group">
        <label className="control-label">Bile Color</label>
        <DomainDrivenDropdown
          featureServiceUrl={config.urls.healthFeatureService}
          fieldName={fn.BILE}
          {...getHealthInputProps(fn.BILE)}
        />
      </div>

      <div className="form-group">
        <label className="control-label">Gender</label>
        <DomainDrivenDropdown
          featureServiceUrl={config.urls.healthFeatureService}
          fieldName={fn.GENDER}
          {...getHealthInputProps(fn.GENDER)}
        />
      </div>

      <div className="form-group">
        <label className="control-label">Reproductive Condition</label>
        <DomainDrivenDropdown
          featureServiceUrl={config.urls.healthFeatureService}
          fieldName={fn.REPRODUCTIVE}
          {...getHealthInputProps(fn.REPRODUCTIVE)}
        />
      </div>

      <NumericInputValidator>
        {(getInputProps, getGroupClassName, validationMessage) => (
          <div className={getGroupClassName('form-group')}>
            <label>Hematocrit Count (%)</label>
            <input min="0" max="100" {...getInputProps(getHealthInputProps(fn.HEMATOCRIT, parseInt))} />
            {validationMessage}
          </div>
        )}
      </NumericInputValidator>

      <NumericInputValidator>
        {(getInputProps, getGroupClassName, validationMessage) => (
          <div className={getGroupClassName('form-group')}>
            <label>Leukocrit Count (%)</label>
            <input min="0" max="100" {...getInputProps(getHealthInputProps(fn.LEUKOCRIT, parseInt))} />
            {validationMessage}
          </div>
        )}
      </NumericInputValidator>

      <NumericInputValidator>
        {(getInputProps, getGroupClassName, validationMessage) => (
          <div className={getGroupClassName('form-group')}>
            <label>Plasma Protein (g/100 ml)</label>
            <input min="0.1" max="100.0" step="0.1" {...getInputProps(getHealthInputProps(fn.PLPRO, parseFloat))} />
            {validationMessage}
          </div>
        )}
      </NumericInputValidator>

      <div className="form-group">
        <label className="control-label">Fin Condition</label>
        <DomainDrivenDropdown
          featureServiceUrl={config.urls.healthFeatureService}
          fieldName={fn.FIN}
          {...getHealthInputProps(fn.FIN)}
        />
      </div>

      <div className="form-group">
        <label className="control-label">Opercle Condition</label>
        <DomainDrivenDropdown
          featureServiceUrl={config.urls.healthFeatureService}
          fieldName={fn.OPERCLE}
          {...getHealthInputProps(fn.OPERCLE)}
        />
      </div>
    </div>
  );
}

Health.propTypes = {
  state: PropTypes.object.isRequired,
  onChange: PropTypes.func.isRequired,
};

export default Health;
