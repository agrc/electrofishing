import React from 'react';
import NumericInputValidator from './NumericInputValidator';

const story = {
  title: 'NumericInputValidator',
  component: NumericInputValidator,
};

export default story;

export const Default = () => {
  const [value, setValue] = React.useState(5);

  return (
    <NumericInputValidator>
      {(getInputProps, getGroupClassName, validationMessage) => (
        <div className={getGroupClassName('form-group col-md-3')}>
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
  );
};
