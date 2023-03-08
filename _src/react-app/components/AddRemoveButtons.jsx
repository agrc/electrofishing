import React from 'react';
import PropTypes from 'prop-types';

function AddRemoveButtons({ addNew, remove, isLast, isFirst }) {
  return (
    <>
      {isLast ? (
        <div className="btn-group" role="group">
          <button className="btn btn-success btn-sm" onClick={addNew}>
            <span className="glyphicon glyphicon-plus"></span>
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
      <span className="glyphicon glyphicon-minus"></span>
    </button>
  );
}

RemoveButton.propTypes = {
  onClick: PropTypes.func.isRequired,
};
