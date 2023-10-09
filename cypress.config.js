const { defineConfig } = require('cypress');

module.exports = defineConfig({
  defaultCommandTimeout: 20000,
  pageLoadTimeout: 120000,
  video: true,
  chromeWebSecurity: false,
  e2e: {
    // We've imported your old cypress plugins here.
    // You may want to clean this up later by importing these.
    setupNodeEvents(on) {
      require('cypress-terminal-report/src/installLogsPrinter')(on);
    },
    experimentalRunAllSpecs: true,
  },
  retries: {
    runMode: 2,
  }
});
