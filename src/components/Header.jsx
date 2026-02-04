import 'bootstrap';
import PropTypes from 'prop-types';
import topic from 'pubsub-js';
import { actionTypes, useAppContext } from '../App.jsx';
import config from '../config';
import useAuthentication from '../hooks/useAuthentication';

function Header({ submitLoading }) {
  const { appState, appDispatch } = useAppContext();

  const changeTab = (tabId) => {
    appDispatch({
      type: actionTypes.SETTINGS,
      payload: {
        currentTab: tabId,
      },
    });
  };

  const { user } = useAuthentication();
  const { currentTab } = appState.settings;

  return (
    <div className="navbar navbar-dark bg-dark fixed-top header navbar-expand-lg">
      <div className="container-fluid">
        <div className="d-flex align-items-center justify-content-between">
          <div className="d-flex align-items-center">
            <span className="navbar-brand">
              Electro-Fishing Data Collection
              <a
                className="version"
                href={`https://github.com/agrc/electrofishing/releases/tag/v${config.version}`}
                target="_blank"
                rel="noreferrer"
              >
                {config.version}
              </a>
            </span>
            <button
              onClick={() => topic.publishSync(config.topics.onSubmitReportClick)}
              className="btn btn-success my-2 my-sm-0 mr-2"
              disabled={!user || submitLoading}
            >
              {submitLoading ? 'submitting report...' : 'Submit Report'}
            </button>
            <button
              onClick={() => topic.publishSync(config.topics.onCancelReportClick)}
              className="btn btn-secondary my-2 my-sm-0"
            >
              Cancel
            </button>
          </div>
          <button
            type="button"
            className="navbar-toggler collapsed"
            data-toggle="collapse"
            data-target="#navbar-collapse"
            aria-expanded="false"
          >
            <span className="navbar-toggler-icon"></span>
          </button>
        </div>
        <div className="collapse navbar-collapse" id="navbar-collapse">
          <ul className="navbar-nav mr-auto">
            <li className="nav-item">
              <a
                className={`nav-link ${currentTab === 'locationTab' ? 'active' : ''}`}
                href="#locationTab"
                onClick={(e) => {
                  e.preventDefault();
                  changeTab('locationTab');
                }}
              >
                Location
              </a>
            </li>
            <li className="nav-item">
              <a
                className={`nav-link ${currentTab === 'methodTab' ? 'active' : ''}`}
                href="#methodTab"
                onClick={(e) => {
                  e.preventDefault();
                  changeTab('methodTab');
                }}
              >
                Method
              </a>
            </li>
            <li className="nav-item">
              <a
                className={`nav-link ${currentTab === 'catchTab' ? 'active' : ''}`}
                href="#catchTab"
                onClick={(e) => {
                  e.preventDefault();
                  changeTab('catchTab');
                }}
              >
                Catch
              </a>
            </li>
            <li className="nav-item">
              <a
                className={`nav-link ${currentTab === 'habitatTab' ? 'active' : ''}`}
                href="#habitatTab"
                onClick={(e) => {
                  e.preventDefault();
                  changeTab('habitatTab');
                }}
              >
                Habitat
              </a>
            </li>
          </ul>
          <ul className="navbar-nav ml-auto">
            <li className="nav-item">
              <a
                className="nav-link"
                href={`https://electrofishing-query.${import.meta.env.VITE_BUILD === 'prod' ? 'ugrc' : 'dev'}.utah.gov`}
                target="_blank"
                rel="noopener noreferrer"
              >
                Search
              </a>
            </li>
            <li className="nav-item">
              <a className="nav-link" role="button" data-toggle="modal" href="#settingsModal">
                Settings <i className="icon-wrench"></i>
              </a>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}

Header.propTypes = {
  submitLoading: PropTypes.bool,
};

export default Header;
