import PropTypes from 'prop-types';

function AddRemoveButtons({ addNew, remove, isLast, isFirst }) {
  return (
    <>
      {isLast ? (
        <div className="btn-group" role="group">
          <button className="btn btn-success btn-sm" onClick={addNew}>
            <span className="bi bi-plus-lg"></span>
          </button>
          {!isFirst ? <RemoveButton onClick={remove} /> : null}
        </div>
      ) : (
        <RemoveButton onClick={remove} />
      )}
      <hr className="hr--bold" />
    </>
  );
}

AddRemoveButtons.propTypes = {
  addNew: PropTypes.func.isRequired,
  remove: PropTypes.func.isRequired,
  isLast: PropTypes.bool.isRequired,
  isFirst: PropTypes.bool.isRequired,
};

export default AddRemoveButtons;

function RemoveButton({ onClick }) {
  return (
    <button className="btn btn-danger btn-sm" onClick={onClick}>
      <span className="bi bi-dash-lg"></span>
    </button>
  );
}

RemoveButton.propTypes = {
  onClick: PropTypes.func.isRequired,
};
