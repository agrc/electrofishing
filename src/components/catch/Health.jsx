import PropTypes from 'prop-types';
import config from '../../config';
import DomainDrivenDropdown from '../DomainDrivenDropdown.jsx';
import NumericInputValidator from '../NumericInputValidator.jsx';

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
      <div className="mb-3">
        <label>Eye Condition</label>
        <DomainDrivenDropdown
          featureServiceUrl={config.urls.healthFeatureService}
          fieldName={fn.EYE}
          {...getHealthInputProps(fn.EYE)}
        />
      </div>

      <div className="mb-3">
        <label>Gill Condition</label>
        <DomainDrivenDropdown
          featureServiceUrl={config.urls.healthFeatureService}
          fieldName={fn.GILL}
          {...getHealthInputProps(fn.GILL)}
        />
      </div>

      <div className="mb-3">
        <label>Pseudobranches Condition</label>
        <DomainDrivenDropdown
          featureServiceUrl={config.urls.healthFeatureService}
          fieldName={fn.PSBR}
          {...getHealthInputProps(fn.PSBR)}
        />
      </div>

      <div className="mb-3">
        <label>Thymus Condition</label>
        <DomainDrivenDropdown
          featureServiceUrl={config.urls.healthFeatureService}
          fieldName={fn.THYMUS}
          {...getHealthInputProps(fn.THYMUS)}
        />
      </div>

      <div className="mb-3">
        <label>Fat Index</label>
        <DomainDrivenDropdown
          featureServiceUrl={config.urls.healthFeatureService}
          fieldName={fn.FAT}
          {...getHealthInputProps(fn.FAT)}
        />
      </div>

      <div className="mb-3">
        <label>Spleen Condition</label>
        <DomainDrivenDropdown
          featureServiceUrl={config.urls.healthFeatureService}
          fieldName={fn.SPLEEN}
          {...getHealthInputProps(fn.SPLEEN)}
        />
      </div>

      <div className="mb-3">
        <label>Hind Gut Condition</label>
        <DomainDrivenDropdown
          featureServiceUrl={config.urls.healthFeatureService}
          fieldName={fn.HIND}
          {...getHealthInputProps(fn.HIND)}
        />
      </div>

      <div className="mb-3">
        <label>Kidney Condition</label>
        <DomainDrivenDropdown
          featureServiceUrl={config.urls.healthFeatureService}
          fieldName={fn.KIDNEY}
          {...getHealthInputProps(fn.KIDNEY)}
        />
      </div>

      <div className="mb-3">
        <label>Liver Condition</label>
        <DomainDrivenDropdown
          featureServiceUrl={config.urls.healthFeatureService}
          fieldName={fn.LIVER}
          {...getHealthInputProps(fn.LIVER)}
        />
      </div>

      <div className="mb-3">
        <label>Bile Color</label>
        <DomainDrivenDropdown
          featureServiceUrl={config.urls.healthFeatureService}
          fieldName={fn.BILE}
          {...getHealthInputProps(fn.BILE)}
        />
      </div>

      <div className="mb-3">
        <label>Gender</label>
        <DomainDrivenDropdown
          featureServiceUrl={config.urls.healthFeatureService}
          fieldName={fn.GENDER}
          {...getHealthInputProps(fn.GENDER)}
        />
      </div>

      <div className="mb-3">
        <label>Reproductive Condition</label>
        <DomainDrivenDropdown
          featureServiceUrl={config.urls.healthFeatureService}
          fieldName={fn.REPRODUCTIVE}
          {...getHealthInputProps(fn.REPRODUCTIVE)}
        />
      </div>

      <NumericInputValidator>
        {(getInputProps, validationMessage) => (
          <div className="mb-3">
            <label>Hematocrit Count (%)</label>
            <input min="0" max="100" {...getInputProps(getHealthInputProps(fn.HEMATOCRIT, parseInt))} />
            {validationMessage}
          </div>
        )}
      </NumericInputValidator>

      <NumericInputValidator>
        {(getInputProps, validationMessage) => (
          <div className="mb-3">
            <label>Leukocrit Count (%)</label>
            <input min="0" max="100" {...getInputProps(getHealthInputProps(fn.LEUKOCRIT, parseInt))} />
            {validationMessage}
          </div>
        )}
      </NumericInputValidator>

      <NumericInputValidator>
        {(getInputProps, validationMessage) => (
          <div className="mb-3">
            <label>Plasma Protein (g/100 ml)</label>
            <input min="0.1" max="100.0" step="0.1" {...getInputProps(getHealthInputProps(fn.PLPRO, parseFloat))} />
            {validationMessage}
          </div>
        )}
      </NumericInputValidator>

      <div className="mb-3">
        <label>Fin Condition</label>
        <DomainDrivenDropdown
          featureServiceUrl={config.urls.healthFeatureService}
          fieldName={fn.FIN}
          {...getHealthInputProps(fn.FIN)}
        />
      </div>

      <div className="mb-3">
        <label>Opercle Condition</label>
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
