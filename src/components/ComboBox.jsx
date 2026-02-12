import { clsx } from 'clsx';
import { useCombobox } from 'downshift';
import PropTypes from 'prop-types';
import * as React from 'react';

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
      stateReducer: (state, actionAndChanges) => {
        const { type, changes } = actionAndChanges;
        // clear input on blur if there is no selected item or if the input value is empty
        if (
          type === useCombobox.stateChangeTypes.InputBlur &&
          (changes.inputValue !== changes.selectedItem?.label || state.inputValue === '')
        ) {
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
    <div className={clsx('combobox', 'dropdown', isOpen && 'show', minimal && 'minimal')}>
      <div className="input-group">
        <input
          className={clsx(!minimal && 'form-control')}
          {...getInputProps({
            onFocus: () => {
              if (!isOpen) {
                openMenu();
              }
            },
            onKeyDown: (event) => {
              if (onKeyDown) {
                onKeyDown(event);
              }
            },
            ref,
          })}
        />
        {!minimal ? (
          <>
            {value && value.toString().length > 0 ? (
              <button className="btn btn-secondary" type="button" onClick={reset} tabIndex="-1">
                <span className="bi bi-x-lg" />
              </button>
            ) : (
              <button
                className="btn btn-secondary"
                type="button"
                {...getToggleButtonProps()}
                tabIndex="-1"
                id={`${id}_button`}
              >
                <span className="bi bi-caret-down-fill" />
              </button>
            )}
          </>
        ) : null}
      </div>
      <ul className={clsx('dropdown-menu', isOpen && 'show')} {...getMenuProps()}>
        {inputItems.length ? (
          inputItems.map((item, index) => (
            <li key={`${item.value}${index}`}>
              <button
                className={`btn btn-link w-100 rounded-0 border-0 text-decoration-none ${highlightedIndex === index && 'active'}`}
                {...getItemProps({ item, index })}
                tabIndex="-1" // prevent focus from moving to body when tabbing out of the input
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
  items: PropTypes.array.isRequired,
  onChange: PropTypes.func.isRequired,
  value: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  id: PropTypes.string,
  minimal: PropTypes.bool,
  onKeyDown: PropTypes.func,
};

export default ComboBox;
