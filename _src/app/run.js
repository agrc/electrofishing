require({ baseUrl: './' }, ['jquery', 'react', 'react-dom', 'react-app/App', 'bootstrap', 'dojo/domReady!'], function (
  _,
  React,
  ReactDOM,
  App
) {
  ReactDOM.render(React.createElement(App.default), document.getElementById('root'));
});
