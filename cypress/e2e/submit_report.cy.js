/* eslint-disable cypress/no-unnecessary-waiting */
import commonIntercepts from './common_intercepts';
import { loadAndSignIn } from './utils';

describe('SubmitReport', () => {
  beforeEach(() => {
    indexedDB.deleteDatabase('electrofishing');
  });

  it('submits a report', () => {
    commonIntercepts();

    loadAndSignIn();

    // select station marker
    cy.get('.leaflet-marker-icon').first().click();

    cy.get('.location>.verify-map>.map').as('map');

    // define stream reach via start/end
    cy.get('#loc_startend .form-inline .btn .glyphicon').as('startEndButtons');
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
    cy.findByRole('combobox', {
      name: /survey purpose \(purpose of collection\)/i,
    }).type('Cat{enter}');
    cy.findByRole('combobox', {
      name: /weather/i,
    }).type('cl{enter}');
    cy.findByRole('textbox', {
      name: /observers/i,
    }).type('some friendly observers');

    // method tab
    cy.get('a[href="#methodTab"]').click();
    cy.get('#MODEL_input').type('s{enter}');
    cy.get('#NUM_NETTERS_input').type('3');
    cy.get('#NUM_ANODES_input').type('2');

    // anode diameter
    cy.get('.equipment tbody > :nth-child(1) > :nth-child(1) > div > input').type('1');
    // stock diameter
    cy.get('.equipment tbody > :nth-child(1) > :nth-child(2) > div > input').type('2');
    // anode shape
    cy.get('.equipment tbody > :nth-child(2) > :nth-child(3) .combobox input').type('R');

    // catch tab
    cy.get('a[href="#catchTab"]').click();

    cy.get('#dropdown-0-SPECIES_CODE').type('B');
    cy.get('#dropdown-0-LENGTH_TYPE').type('s');
    cy.get('#numeric-input-cell-0-LENGTH').type('1');
    cy.get('#numeric-input-cell-0-WEIGHT').type('1');
    cy.focused().tab().tab().tab().tab();

    // add fish notes
    cy.findByRole('button', {
      name: /notes/i,
    }).click();
    cy.get('#notesTxtArea').type('test notes');
    cy.get('.more-info-dialog .modal-footer button').click();

    // habitat tab
    cy.get('a[href="#habitatTab"]').click();
    cy.get('#BANKVEG_input').type('15');
    cy.get('#DUND_input').as('dund').type('d');
    cy.get('@dund').tab();
    cy.get('#SUB_FINES_input').type('10');
    cy.get('#SUB_SAND_input').type('10');
    cy.get('#SUB_GRAV_input').type('80');

    // transect
    cy.get('#BWID_input_1').type('3');
    cy.get('#WWID_input_1').type('2');

    // measurement grid
    cy.findByRole('button', { name: /add row/i }).click();
    cy.get('#numeric-input-cell-0-DEPTH').type('1');

    // submit
    cy.get('.header button.btn-success[data-loading-text="submitting report..."]').click();

    cy.get('[data-testid="summaryConfirmBtn"]').click({ force: true });

    cy.findByText(/the report has been submitted successfully\./i, { timeout: 60000 }).should('be.visible');

    // clear all of the data
    cy.get('#stationTxt').should('have.value', '');
    cy.get('#loc_startend input.form-control').should('have.value', '');
  });
});
