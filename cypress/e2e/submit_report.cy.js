import commonIntercepts from './common_intercepts';
import { loadAndSignIn } from './utils';

/* eslint-disable cypress/no-unnecessary-waiting */
describe('SubmitReport', () => {
  beforeEach(() => {
    // TODO: import the db name (appName) from react-app/config once it's converted to
    // an es module
    indexedDB.deleteDatabase('electrofishing');
  });

  it('submits a report', () => {
    commonIntercepts();

    loadAndSignIn();

    // select station marker
    cy.get('.leaflet-marker-icon').first().click();

    cy.get('.location>.verify-map>.map').as('map');

    // define stream reach via start/end
    cy.get('.start-end-geodef [data-dojo-attach-point="mapBtn"]').as('startEndButtons');
    cy.get('@startEndButtons').first().click();
    cy.get('@map').click();

    cy.get('@startEndButtons').last().click();
    cy.get('@map').click('right');

    cy.findByRole('button', {
      name: /verify location/i,
    }).click();
    cy.findByRole('button', {
      name: /successfully verified/i,
    });

    // fill out the rest of the location tab
    cy.findByLabelText(/collection date/i).type('2020-11-19');
    cy.findByRole('textbox', {
      name: /survey purpose \(purpose of collection\)/i,
    }).type('Cat{enter}');
    cy.findByRole('textbox', {
      name: /weather/i,
    }).type('cl{enter}');
    cy.findByRole('textbox', {
      name: /observers/i,
    }).type('some friendly observers');

    // method tab
    cy.get('a[href="#methodTab"]').click();
    cy.get('[data-dojo-attach-point="numberNettersTxt"]').type('3');

    cy.get('[data-dojo-attach-point="numberAnodesTxt"]').type('{backspace}2');

    cy.get('.equipment .dgrid-scroller table td.field-ANODE_DIAMETER').type('1');
    cy.get('.equipment .dgrid .dgrid-row > .dgrid-row-table > tr > .dgrid-column-3').first().type('2');
    cy.get('.equipment .dgrid .dgrid-row > .dgrid-row-table > tr > .dgrid-column-4').first().type('R');

    // catch tab
    cy.get('a[href="#catchTab"]').click();

    const GRID_DROPDOWN_DELAY = 500; // give the drop downs some time to catch up
    cy.get('.catch .dgrid-scroller table td.field-SPECIES_CODE').type('B');
    cy.wait(GRID_DROPDOWN_DELAY);
    cy.get('.catch .dgrid-scroller table td.field-LENGTH_TYPE').type('s');
    cy.wait(GRID_DROPDOWN_DELAY);
    cy.get('.catch .dgrid-scroller table td.field-LENGTH').type('1');
    cy.get('.catch .dgrid-scroller table td.field-WEIGHT').type('1');
    cy.focused().tab().tab().tab().tab();

    // add fish notes
    cy.get('[data-tab="Notes_tab"]').click();
    cy.get('[data-dojo-attach-point="notesTxtArea"]').type('test notes');
    cy.get('.more-info-dialog [data-dojo-attach-point="submitBtn"]').click();

    cy.get('.header button.btn-success[data-loading-text="submitting report..."]').click();

    cy.get('[data-testid="summaryConfirmBtn"]').click({ force: true });

    cy.findByText(/the report has been submitted successfully\./i, { timeout: 20000 }).should('be.visible');

    // clear all of the data
    cy.get('#stationTxt').should('have.value', '');
    cy.findAllByRole('textbox', { name: /northing/i }).should('have.value', '');
  });
});
