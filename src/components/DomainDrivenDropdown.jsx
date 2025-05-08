import PropTypes from 'prop-types';
import { forwardRef, useCallback, useEffect, useRef, useState } from 'react';
import { createRoot } from 'react-dom/client';
import ComboBox from './ComboBox.jsx';
import OtherOptionHandler from './OtherOptionHandler.jsx';
import { useQuery } from '@tanstack/react-query';
import ky from 'ky';

async function makeRequest(url, fieldName) {
  const URL = `${url}?f=json`;

  const responseJson = await ky(URL).json();

  const fields = responseJson.fields;

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

  return newItems;
}

const otherTxt = '[other]';
const DomainDrivenDropdown = forwardRef(function DomainDrivenDropdown(
  { featureServiceUrl, fieldName, value, onChange, id, minimal, onKeyDown },
  ref,
) {
  const otherOptionHandlerRoot = useRef(null);
  const {
    status,
    data = [],
    error,
  } = useQuery({ queryKey: [featureServiceUrl], queryFn: () => makeRequest(featureServiceUrl, fieldName) });
  const [items, setItems] = useState([]);

  useEffect(() => {
    if (status === 'success') {
      setItems(data);
    }
  }, [data, status]);

  const [showOtherOptions, setShowOtherOptions] = useState(false);
  const onOtherOptionAdded = useCallback(
    (option) => {
      const newItems = [...items];
      newItems.push({ value: option.code, label: option.code });
      setItems(newItems);
      onChange({ target: { value: option.code } });
    },
    [items, onChange],
  );

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
      />,
    );
  }, [items, onOtherOptionAdded, showOtherOptions]);

  const onSelectionChange = (newValue) => {
    if (newValue !== otherTxt) {
      onChange({ target: { value: newValue } });

      return;
    }

    setShowOtherOptions(true);
  };

  if (status === 'pending') {
    return ' loading...';
  }

  if (error) {
    return ' Error getting domain values';
  }

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
