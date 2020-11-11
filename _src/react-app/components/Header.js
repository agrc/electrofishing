import config from 'app/config';
import topic from 'pubsub-js';

export default function Header() {
  return (
    <div className="navbar navbar-inverse navbar-fixed-top header">
      <div className="container">
        <span className="navbar-brand">
          Electro-Fishing Data Collection
        </span>
        <a className="version pull-left" href="ChangeLog.html" target="_blank">
          {config.version}
        </a>
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
        <button
          onClick={() => topic.publishSync(config.topics.onSubmitReportClick)}
          data-loading-text="submitting report..."
          className="btn btn-success navbar-btn"
        >
          Submit Report
        </button>
        <button
          onClick={() => topic.publishSync(config.topics.onCancelReportClick)}
          className="btn btn-default navbar-btn"
        >
          Cancel
        </button>
        <ul className="nav navbar-nav navbar-right">
          <li>
            <a href="../query" target="_blank">
              Search
            </a>
          </li>
          <li>
            <a
              role="button"
              data-toggle="modal"
              href="#settingsModal"
              className="btn btn-small pull-right"
            >
              Settings <i className="icon-wrench"></i>
            </a>
          </li>
        </ul>
      </div>
    </div>
  );
}
