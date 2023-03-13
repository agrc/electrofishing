import { useEffect, useRef, useState } from 'react';
import clsx from 'clsx';
import PropTypes from 'prop-types';

export function getValidationMessage(value, min, max, step) {
  // summary:
  //      validates the value against the min, max, and/or step
  // value: Number
  // min: String
  // max: String
  // step: String
  // returns: Null | String
  //      returns null if valid or error message otherwise

  // convert values to numbers
  const parsedValue = parseFloat(value, 10);
  const parsedMin = parseFloat(min, 10);
  const parsedMax = parseFloat(max, 10);
  const parsedStep = parseFloat(step, 10);

  // check for NaN
  if (Number.isNaN(parsedValue)) {
    return 'Value must be a number!';
  }

  // check for whole numbers
  const isInteger = function (num) {
    return num % 1 === 0;
  };
  if (((step && isInteger(parsedStep)) || !step) && !isInteger(parsedValue)) {
    return 'Value must be a whole number!';
  }

  if (Number.isNaN(parsedMin) && Number.isNaN(parsedMax)) {
    return null;
  } else {
    // check for single min or max value
    if (!Number.isNaN(parsedMax)) {
      if (parsedValue > parsedMax) {
        return `Value must be less than ${max}!`;
      }
    }
    if (!Number.isNaN(parsedMin)) {
      if (parsedValue < parsedMin) {
        return `Value must be greater than ${min}!`;
      }
    }

    return null;
  }
}

function NumericInputValidator({ children }) {
  // summary:
  //      A module that adds automated validation to <input type='number'> elements.
  //
  // description:
  //      Uses `min` and `max` to validate that the value is within a range.
  //      Uses `step` to validate if the value is a whole number or not. Does not
  //      take into account the number of decimal places at the moment.
  const [validation, setValidationMessage] = useState(null);

  const isInvalid = validation !== null;

  const validate = (event) => {
    const input = event.target;
    const value = input.valueAsNumber || input.value;

    if (value.toString().length === 0 || Number.isNaN(input.valueAsNumber)) {
      // don't valid on empty values
      setValidationMessage(null);
    } else {
      setValidationMessage(getValidationMessage(value, input.min, input.max, input.step));
    }
  };

  const inputRef = useRef();
  const getInputProps = (originalProps) => {
    return {
      ...originalProps,
      onChange: (event) => {
        originalProps.onChange(event);

        validate(event);
      },
      onKeyUp: validate,
      type: 'number',
      className: clsx(isInvalid && 'has-error', originalProps.className),
      ref: inputRef,
    };
  };

  // validate on load in case there is cached data that is invalid
  useEffect(() => {
    if (inputRef.current) {
      validate({ target: inputRef.current });
    }
  }, []);

  const getGroupClassName = (originalClassName) => clsx(originalClassName, isInvalid && 'has-error');
  const validationMessage =
    validation?.length > 0 ? <p className={clsx('help-block', isInvalid && 'has-error')}>{validation}</p> : null;

  return <>{children(getInputProps, getGroupClassName, validationMessage)}</>;
}

NumericInputValidator.propTypes = {
  children: PropTypes.func.isRequired,
};

export default NumericInputValidator;
