import { useState, useEffect, useCallback, useRef, forwardRef } from 'react';
import { createRoot } from 'react-dom/client';
import PropTypes from 'prop-types';
import OtherOptionHandler from './OtherOptionHandler.jsx';
import ComboBox from './ComboBox.jsx';

const CACHE = {};
const otherTxt = '[other]';
const DomainDrivenDropdown = forwardRef(function DomainDrivenDropdown(
  { featureServiceUrl, fieldName, value, onChange, id, minimal, onKeyDown },
  ref
) {
  const [items, setItems] = useState([]);

  useEffect(() => {
    if (items.length) {
      return;
    }

    const controller = new AbortController();
    const makeRequest = async () => {
      const URL = `${featureServiceUrl}?f=json`;

      let fields;
      if (CACHE[URL]) {
        fields = CACHE[URL];
      } else {
        const signal = controller.signal;
        const response = await fetch(URL, { signal });
        const responseJson = await response.json();

        fields = responseJson.fields;
        CACHE[URL] = fields;
      }

      let codedValues;
      fields.some((field) => {
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

  const otherOptionHandlerRoot = useRef(null);
  useEffect(() => {
    const otherOptionHandlerDiv = document.createElement('div');
    document.body.appendChild(otherOptionHandlerDiv);
    otherOptionHandlerRoot.current = createRoot(otherOptionHandlerDiv);
  }, []);

  useEffect(() => {
    otherOptionHandlerRoot.current.render(
      <OtherOptionHandler
        existingOptions={items.filter((item) => item.value).map((item) => item.value)}
        otherTxt={otherTxt}
        onOtherOptionAdded={onOtherOptionAdded}
        show={showOtherOptions}
        setShow={setShowOtherOptions}
      />
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

  return (
    <ComboBox
      items={items}
      onChange={onSelectionChange}
      value={value}
      id={id}
      minimal={minimal}
      ref={ref}
      onKeyDown={onKeyDown}
    />
  );
});

DomainDrivenDropdown.propTypes = {
  featureServiceUrl: PropTypes.string.isRequired,
  fieldName: PropTypes.string.isRequired,
  value: PropTypes.string,
  onChange: PropTypes.func,
  id: PropTypes.string,
  minimal: PropTypes.bool,
  onKeyDown: PropTypes.func,
};

export default DomainDrivenDropdown;
