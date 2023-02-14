// WIP
import PropTypes from 'prop-types';

// minusIconClass: String
//      bootstrap icon class
const minusIconClass = 'glyphicon-minus';

// plusIconClass: String
//      bootstrap icon class
const plusIconClass = 'glyphicon-plus';

export default function useAddButton(container, onAdd, onRemove) {}

useAddButton.propTypes = {
  // a pointer to the parent container of this widget
  // set in post create or addAddBtnWidget of parent container
  container: PropTypes.object,
};
