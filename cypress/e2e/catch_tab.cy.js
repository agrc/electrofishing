/* eslint-disable cypress/no-unnecessary-waiting */
import commonIntercepts from './common_intercepts';
import { loadAndSignIn } from './utils';

const COMBOBOX_TYPE_DELAY = 100;
function populateFishRow(row) {
  cy.get(`tbody > :nth-child(${row}) > :nth-child(2) input`).type('tm', { delay: COMBOBOX_TYPE_DELAY }).tab();
  cy.focused().type('s', { delay: COMBOBOX_TYPE_DELAY }).tab();
  cy.focused().type('1').tab();
  cy.focused().type('1').tab();
}

function addRow() {
  cy.get('.catch > .btn-toolbar .btn-success').click();
}

function addPass() {
  cy.get('.grid-tab > .btn-success > .glyphicon').click();
}

function goToPass(pass) {
  cy.get(`.catch > .grid-tab > .btn-group > :nth-child(${pass})`).click();
}

describe('Catch Tab Grid', () => {
  beforeEach(() => {
    indexedDB.deleteDatabase('electrofishing');
    commonIntercepts();
    loadAndSignIn('catch');
  });

  it('can add additional passes', () => {
    populateFishRow(1);
    addPass();
    populateFishRow(1);
    addRow();
    populateFishRow(2);
    addPass();
    populateFishRow(1);
    addRow();
    populateFishRow(2);
    addRow();
    populateFishRow(3);

    goToPass(1);
    cy.wait(500);
    cy.get('table.data-grid tbody').find('tr').should('have.length', 1);

    goToPass(2);
    cy.wait(500);
    cy.get('table.data-grid tbody').find('tr').should('have.length', 2);

    goToPass(3);
    cy.wait(500);
    cy.get('table.data-grid tbody').find('tr').should('have.length', 3);
  });
});
