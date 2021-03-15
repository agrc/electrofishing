import * as React from 'react';
import propTypes from 'prop-types';
import { useCombobox } from 'downshift';

const ComboBox = ({ items, onChange, value, id }) => {
  const [inputItems, setInputItems] = React.useState(items);
  const {
    getComboboxProps,
    getInputProps,
    getItemProps,
    getMenuProps,
    getToggleButtonProps,
    highlightedIndex,
    isOpen,
    openMenu,
    reset,
  } = useCombobox({
    inputId: id,
    items: inputItems,
    defaultHighlightedIndex: 0,
    onInputValueChange: ({ inputValue }) => {
      setInputItems(items.filter((item) => item.label.toLowerCase().startsWith(inputValue.toLowerCase())));
    },
    onSelectedItemChange: ({ selectedItem }) => {
      console.log('onSelectedItemChange', selectedItem);
      onChange(selectedItem?.value || null);
    },
    itemToString: (item) => (item ? item.label : ''),
    selectedItem: items.filter((item) => item.value === value)[0] || '',
    stateReducer: (state, actionAndChanges) => {
      const { type, changes } = actionAndChanges;
      // clear input on blur if there is no selected item
      if (type === useCombobox.stateChangeTypes.InputBlur && state.inputValue !== state.selectedItem?.label) {
        setInputItems(items);
        return {
          ...changes,
          inputValue: '',
          selectedItem: null,
        };
      }

      return changes;
    },
  });

  React.useEffect(() => {
    setInputItems(items);
  }, [items]);

  return (
    <div className={`combobox dropdown ${isOpen && 'open'}`} {...getComboboxProps()}>
      <div className="input-group">
        <input
          className="form-control"
          {...getInputProps({
            onFocus: () => {
              if (!isOpen) {
                openMenu();
              }
            },
          })}
        />
        <span className="input-group-btn">
          {value && value.toString().length > 0 ? (
            <button className="btn btn-default" type="button" onClick={reset}>
              <span className="glyphicon glyphicon-remove" />
            </button>
          ) : (
            <button className="btn btn-default" type="button" {...getToggleButtonProps()}>
              <span className="caret" />
            </button>
          )}
        </span>
      </div>
      <ul className="dropdown-menu" {...getMenuProps()}>
        {inputItems.length ? (
          inputItems.map((item, index) => (
            <li key={`${item.value}${index}`}>
              <button
                className={`btn btn-link ${highlightedIndex === index && 'active'}`}
                {...getItemProps({ item, index })}
              >
                {item.label}
              </button>
            </li>
          ))
        ) : (
          <li className="empty-option disabled">no entries found!</li>
        )}
      </ul>
    </div>
  );
};

ComboBox.propTypes = {
  items: propTypes.array.isRequired,
  onChange: propTypes.func.isRequired,
  value: propTypes.oneOfType([propTypes.string, propTypes.number]),
  id: propTypes.string,
};

export default ComboBox;
