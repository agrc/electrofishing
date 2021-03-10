import * as React from 'react';
import propTypes from 'prop-types';
import OtherOptionHandler from 'app/OtherOptionHandler';
import ComboBox from './ComboBox';

const otherTxt = '[other]';
export default function DomainDrivenDropdown({ featureServiceUrl, fieldName, value, onChange, id }) {
  const [items, setItems] = React.useState([]);

  React.useEffect(() => {
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

  const onSelectionChange = React.useCallback(
    (newValue) => {
      if (newValue !== otherTxt) {
        onChange({ target: { value: newValue } });

        return;
      }

      const existingOptions = items.filter((item) => item.value).map((item) => item.value);

      const div = document.createElement('div');
      document.body.appendChild(div);
      const otherOptionHandler = new OtherOptionHandler(
        {
          existingOptions,
          otherTxt,
        },
        div
      );
      otherOptionHandler.startup();

      otherOptionHandler.on('add-new-value', (event) => {
        const newItems = [...items];
        newItems.push({ value: event.code, label: event.code });
        setItems(newItems);
        onChange({ target: { value: event.code } });
        otherOptionHandler.destroy();
      });
    },
    [items, onChange]
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
