import React, { useState, useEffect, useCallback, useRef } from 'react';
import ReactDOM from 'react-dom';
import propTypes from 'prop-types';
import OtherOptionHandler from './OtherOptionHandler';
import ComboBox from './ComboBox';

const otherTxt = '[other]';
export default function DomainDrivenDropdown({ featureServiceUrl, fieldName, value, onChange, id }) {
  const [items, setItems] = useState([]);

  useEffect(() => {
    if (items.length) {
      return;
    }

    const controller = new AbortController();
    const makeRequest = async () => {
      const signal = controller.signal;
      const response = await fetch(`${featureServiceUrl}?f=json`, { signal });
      const responseJson = await response.json();

      let codedValues;
      responseJson.fields.some((field) => {
        if (field.name === fieldName) {
          codedValues = field.domain.codedValues;

          return true;
        }

        return false;
      });

      const newItems = codedValues.map(({ code, name }) => {
        return { value: code, label: name };
      });

      newItems.push({ value: otherTxt, label: otherTxt });
      setItems(newItems);
    };

    makeRequest();

    return () => {
      controller.abort();
    };
  }, [featureServiceUrl, fieldName, items]);

  const [showOtherOptions, setShowOtherOptions] = useState(false);
  const onOtherOptionAdded = useCallback(
    (option) => {
      const newItems = [...items];
      newItems.push({ value: option.code, label: option.code });
      setItems(newItems);
      onChange({ target: { value: option.code } });
    },
    [items, onChange]
  );

  const otherOptionHandlerDiv = useRef(null);
  useEffect(() => {
    otherOptionHandlerDiv.current = document.createElement('div');
    document.body.appendChild(otherOptionHandlerDiv.current);
  }, []);

  useEffect(() => {
    ReactDOM.render(
      <OtherOptionHandler
        existingOptions={items.filter((item) => item.value).map((item) => item.value)}
        otherTxt={otherTxt}
        onOtherOptionAdded={onOtherOptionAdded}
        show={showOtherOptions}
        setShow={setShowOtherOptions}
      />,
      otherOptionHandlerDiv.current
    );
  }, [items, onOtherOptionAdded, showOtherOptions]);

  const onSelectionChange = useCallback(
    (newValue) => {
      if (newValue !== otherTxt) {
        onChange({ target: { value: newValue } });

        return;
      }

      setShowOtherOptions(true);
    },
    [onChange]
  );

  return <ComboBox items={items} onChange={onSelectionChange} value={value} id={id} />;
}
DomainDrivenDropdown.propTypes = {
  featureServiceUrl: propTypes.string.isRequired,
  fieldName: propTypes.string.isRequired,
  value: propTypes.string,
  onChange: propTypes.func,
  id: propTypes.string,
};
