import commonIntercepts from './common_intercepts';
import { loadAndSignIn } from './utils';

describe('AddNewStation', () => {
  it('creates a new station', () => {
    commonIntercepts();

    cy.intercept('POST', 'addFeatures', { addResults: [{ objectId: 6579, success: true }] });

    const newStationName = 'new station name';

    loadAndSignIn();

    cy.findByRole('link', {
      name: /add new station/i,
    }).click();
    cy.wait(500);
    cy.findByRole('textbox', {
      name: /name/i,
    }).type(newStationName);
    cy.findByRole('textbox', {
      name: /stream type/i,
    }).type('c{enter}');
    cy.get('.modal-body > .point-def > :nth-child(1) > .btn > .glyphicon').click();
    cy.get('.station .leaflet-container').click();
    cy.get('.stream-lake-button-container > :nth-child(2) > .btn > .glyphicon').click();
    cy.get('[d="M-76 14L-87 0L-88 -4"]').click({ force: true });
    cy.findByRole('button', {
      name: /add station/i,
    }).click();

    cy.findByText(/station added successfully!/i);
    cy.get('#stationModal').should('not.be.visible');
    cy.get('#stationTxt').should('have.value', newStationName);
  });
});
