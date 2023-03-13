import 'bootstrap';
import PropTypes from 'prop-types';
import topic from 'pubsub-js';
import * as React from 'react';
import { actionTypes, useAppContext } from '../App.jsx';
import config from '../config';
import useAuthentication from '../hooks/useAuthentication';

function Header({ submitLoading }) {
  const submitButtonRef = React.useRef();
  const { appDispatch } = useAppContext();

  React.useEffect(() => {
    $(submitButtonRef.current).button(submitLoading ? 'loading' : 'reset');
  }, [submitLoading]);

  React.useEffect(() => {
    $('.header a[data-toggle="tab"]').on('shown.bs.tab', (event) => {
      appDispatch({
        type: actionTypes.SETTINGS,
        payload: {
          currentTab: event.target.href.split('#')[1],
        },
      });
    });
  }, [appDispatch]);

  const { user } = useAuthentication();

  return (
    <div className="navbar navbar-inverse navbar-fixed-top header">
      <div className="container-fluid">
        <div className="navbar-header">
          <button
            type="button"
            className="navbar-toggle collapsed"
            data-toggle="collapse"
            data-target="#navbar-collapse"
            aria-expanded="false"
          >
            <span className="sr-only">Toggle navigation</span>
            <span className="icon-bar"></span>
            <span className="icon-bar"></span>
            <span className="icon-bar"></span>
          </button>
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
            data-loading-text="submitting report..."
            className="btn btn-success navbar-btn"
            ref={submitButtonRef}
            disabled={!user}
          >
            Submit Report
          </button>
          <button
            onClick={() => topic.publishSync(config.topics.onCancelReportClick)}
            className="btn btn-default navbar-btn"
          >
            Cancel
          </button>
        </div>
        <div className="collapse navbar-collapse" id="navbar-collapse">
          <ul className="nav navbar-nav">
            <li className="active">
              <a href="#locationTab" data-toggle="tab">
                Location
              </a>
            </li>
            <li>
              <a href="#methodTab" data-toggle="tab">
                Method
              </a>
            </li>
            <li>
              <a href="#catchTab" data-toggle="tab">
                Catch
              </a>
            </li>
            <li>
              <a href="#habitatTab" data-toggle="tab">
                Habitat
              </a>
            </li>
          </ul>
          <ul className="nav navbar-nav navbar-right">
            <li>
              <a
                href={`https://electrofishing-query.${import.meta.env.VITE_BUILD === 'prod' ? 'ugrc' : 'dev'}.utah.gov`}
                target="_blank"
                rel="noopener noreferrer"
              >
                Search
              </a>
            </li>
            <li>
              <a role="button" data-toggle="modal" href="#settingsModal">
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
