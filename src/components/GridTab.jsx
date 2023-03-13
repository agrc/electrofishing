import clsx from 'clsx';
import PropTypes from 'prop-types';

function GridTab({ name, numTabs, addTab, currentTab, setCurrentTab }) {
  return (
    <div className="grid-tab">
      <b>{name} </b>
      <div className="btn-group" data-toggle="buttons">
        {Array.from({ length: numTabs }, (_, i) => {
          const tabNumber = i + 1;
          return (
            <label
              key={tabNumber}
              className={clsx('btn btn-primary', tabNumber === currentTab && 'active')}
              onClick={() => setCurrentTab(tabNumber)}
            >
              <input type="radio" name="tab" />
              {tabNumber}
            </label>
          );
        })}
      </div>
      <button
        className="btn btn-success btn-sm"
        onClick={() => {
          setCurrentTab(numTabs + 1);
          addTab();
        }}
      >
        <i className="glyphicon glyphicon-plus"></i>
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
