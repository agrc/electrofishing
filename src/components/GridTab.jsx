import PropTypes from 'prop-types';
import React from 'react';

function GridTab({ name, numTabs, addTab, currentTab, setCurrentTab }) {
  return (
    <div className="grid-tab">
      <b>{name} </b>
      <div className="btn-group" role="group">
        {Array.from({ length: numTabs }, (_, i) => {
          const tabNumber = i + 1;
          const id = `${name.replace(/\s/g, '')}-tab-${tabNumber}`;
          return (
            <React.Fragment key={tabNumber}>
              <input
                type="radio"
                className="btn-check"
                name={name}
                id={id}
                autoComplete="off"
                checked={tabNumber === currentTab}
                onChange={() => setCurrentTab(tabNumber)}
              />
              <label className="btn btn-primary" htmlFor={id}>
                {tabNumber}
              </label>
            </React.Fragment>
          );
        })}
      </div>
      <button
        className="btn btn-success btn-sm"
        onClick={() => {
          setCurrentTab(numTabs + 1);
          addTab();
        }}
        aria-label="+"
      >
        <i className="bi bi-plus-lg"></i>
      </button>
    </div>
  );
}

GridTab.propTypes = {
  name: PropTypes.string.isRequired,
  numTabs: PropTypes.number.isRequired,
  addTab: PropTypes.func.isRequired,
  currentTab: PropTypes.number.isRequired,
  setCurrentTab: PropTypes.func.isRequired,
};

export default GridTab;
