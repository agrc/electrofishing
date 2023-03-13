// ***********************************************************
// This example support/index.js is processed and
// loaded automatically before your test files.
//
// This is a great place to put global configuration and
// behavior that modifies Cypress.
//
// You can change the location of this file or turn off
// automatically serving support files with the
// 'supportFile' configuration option.
//
// You can read more here:
// https://on.cypress.io/configuration
// ***********************************************************

// Import commands.js using ES2015 syntax:
import 'cypress-plugin-tab';
import init from 'cypress-terminal-report/src/installLogsCollector';
import './commands';

init();

// ignore uncaught exceptions in app
Cypress.on('uncaught:exception', () => false);
