import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.jsx';
import './index.scss';
import { ErrorBoundary } from 'react-error-boundary';
import PropTypes from 'prop-types';
import { getAuth } from 'firebase/auth';

function Fallback({ error }) {
  function reload() {
    window.location.reload();
  }

  function clearSettings() {
    localStorage.clear();
    reload();
  }

  function clearData() {
    if (window.confirm('Are you sure you want to clear any in-progress data? This cannot be undone.')) {
      window.indexedDB.deleteDatabase('electrofishing');
      reload();
    }
  }

  function signOut() {
    const auth = getAuth();
    auth.signOut();
  }

  return (
    <div className="error-boundary">
      <div role="alert" className="alert alert-danger" style={{ width: '50%' }}>
        <p>Something went wrong:</p>
        <pre>{error.message}</pre>
        <p>You can try:</p>
        <button onClick={reload} className="btn btn-block btn-info">
          Reload the page
        </button>
        <button onClick={signOut} className="btn btn-block btn-default">
          Log out
        </button>
        <button onClick={clearSettings} className="btn btn-block btn-warning">
          Clear cached settings
        </button>
        <button onClick={clearData} className="btn btn-block btn-danger">
          Clear in-progress report data
        </button>
      </div>
    </div>
  );
}

Fallback.propTypes = {
  error: PropTypes.object,
  resetErrorBoundary: PropTypes.func,
};

const container = document.getElementById('root');
const root = createRoot(container);
root.render(
  <React.StrictMode>
    <ErrorBoundary
      FallbackComponent={Fallback}
      onReset={() => {
        window.location.reload();
      }}
    >
      <App />
    </ErrorBoundary>
  </React.StrictMode>
);
