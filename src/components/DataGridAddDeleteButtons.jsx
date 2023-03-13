import PropTypes from 'prop-types';

function DataGridAddDeleteButtons({ deleteCurrent, addNew, deleteDisabled }) {
  return (
    <div className="btn-group">
      <button className="btn btn-danger" onClick={deleteCurrent} disabled={deleteDisabled}>
        Delete Row
      </button>
      <button className="btn btn-success" onClick={addNew}>
        Add Row
      </button>
    </div>
  );
}

DataGridAddDeleteButtons.propTypes = {
  deleteCurrent: PropTypes.func.isRequired,
  addNew: PropTypes.func.isRequired,
  deleteDisabled: PropTypes.bool.isRequired,
};

export default DataGridAddDeleteButtons;
