import React from 'react';
import NumericInputValidator from './NumericInputValidator.jsx';

const story = {
  title: 'NumericInputValidator',
  component: NumericInputValidator,
};

export default story;

export const Default = () => {
  const [value, setValue] = React.useState(5);

  return (
    <>
      <pre>min: 1, max: 5</pre>
      <NumericInputValidator>
        {(getInputProps, getGroupClassName, validationMessage) => (
          <div className={getGroupClassName('form-group')}>
            <label className="control-label"># Netters</label>
            <input
              value={value}
              min="1"
              max="5"
              {...getInputProps({
                onChange: (event) => setValue(event.target.value),
              })}
            />
            {validationMessage}
          </div>
        )}
      </NumericInputValidator>
      <pre>min: 5</pre>
      <NumericInputValidator>
        {(getInputProps, getGroupClassName, validationMessage) => (
          <div className={getGroupClassName('form-group')}>
            <label className="control-label"># Netters</label>
            <input
              value={value}
              min="5"
              {...getInputProps({
                onChange: (event) => setValue(event.target.value),
              })}
            />
            {validationMessage}
          </div>
        )}
      </NumericInputValidator>
    </>
  );
};
