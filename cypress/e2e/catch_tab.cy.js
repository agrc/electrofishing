/* eslint-disable cypress/no-unnecessary-waiting */
import commonIntercepts from './common_intercepts';
import { loadAndSignIn } from './utils';

const COMBOBOX_TYPE_DELAY = 100;
function populateFishRow(row) {
  const inputName = `input${row}`;
  cy.get(`tbody > :nth-child(${row}) > :nth-child(2) input`)
    .as(inputName)
    .type('tm', { delay: COMBOBOX_TYPE_DELAY, force: true });
  cy.get(`@${inputName}`).tab();
  const comboName = `combo${row}`;
  cy.focused().as(comboName).type('s', { delay: COMBOBOX_TYPE_DELAY, force: true });
  cy.get(`@${comboName}`).tab();
  const cell1Name = `cell1${row}`;
  cy.focused().as(cell1Name).type('1');
  cy.focused().tab();
  const cell2Name = `cell2${row}`;
  cy.focused().as(cell2Name).type('1');
  cy.focused().tab();
}

function addRow() {
  cy.get('.catch > .btn-toolbar .btn-success').click();
}

function addPass() {
  cy.get('.catch > .grid-tab > .btn-success').click();
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
