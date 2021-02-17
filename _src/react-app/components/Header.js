import * as React from 'react';
import config from '../config';
import topic from 'pubsub-js';

export default function Header({ submitLoading }) {
  const submitButtonRef = React.useRef();

  React.useEffect(() => {
    $(submitButtonRef.current).button(submitLoading ? 'loading' : 'reset');
  }, [submitLoading]);

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
            <a className="version" href="ChangeLog.html" target="_blank">
              {config.version}
            </a>
          </span>
          <button
            onClick={() => topic.publishSync(config.topics.onSubmitReportClick)}
            data-loading-text="submitting report..."
            className="btn btn-success navbar-btn"
            ref={submitButtonRef}
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
              <a href="../query" target="_blank">
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
