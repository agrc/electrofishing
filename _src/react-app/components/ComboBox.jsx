import * as React from 'react';
import propTypes from 'prop-types';
import { useCombobox } from 'downshift';
import clsx from 'clsx';

const ComboBox = React.forwardRef(function ComboBox({ items, onChange, value, id, minimal, onKeyDown }, ref) {
  const [inputItems, setInputItems] = React.useState(items);
  const { getInputProps, getItemProps, getMenuProps, getToggleButtonProps, highlightedIndex, isOpen, openMenu, reset } =
    useCombobox({
      inputId: id,
      items: inputItems,
      defaultHighlightedIndex: 0,
      onInputValueChange: ({ inputValue }) => {
        setInputItems(items.filter((item) => item.label.toLowerCase().startsWith(inputValue.toLowerCase())));
      },
      onSelectedItemChange: ({ selectedItem }) => {
        onChange(selectedItem?.value || null);
      },
      itemToString: (item) => (item ? item.label : ''),
      selectedItem: items.filter((item) => item.value === value)[0] || '',
      stateReducer: (_, actionAndChanges) => {
        const { type, changes } = actionAndChanges;
        // clear input on blur if there is no selected item
        if (type === useCombobox.stateChangeTypes.InputBlur && changes.inputValue !== changes.selectedItem?.label) {
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
    <div className={clsx('combobox', 'dropdown', isOpen && 'open', minimal && 'minimal')}>
      <div className="input-group">
        <input
          className={clsx(!minimal && 'form-control')}
          {...getInputProps({
            onFocus: () => {
              if (!isOpen) {
                openMenu();
              }
            },
            onKeyDown,
            ref,
          })}
        />
        {!minimal ? (
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
        ) : null}
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
});

ComboBox.propTypes = {
  items: propTypes.array.isRequired,
  onChange: propTypes.func.isRequired,
  value: propTypes.oneOfType([propTypes.string, propTypes.number]),
  id: propTypes.string,
};

export default ComboBox;
