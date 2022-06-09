import { loadAndSignIn } from './utils';

describe('SettingsDialog', () => {
  it('toggles the coordinates type', () => {
    loadAndSignIn();

    // utm is default
    cy.findAllByText(/northing/i).should('exist');
    cy.findAllByText(/latitude/i).should('not.exist');

    // switch to lat/long
    cy.findByRole('button', {
      name: /settings/i,
    }).click();
    cy.findByText(/lat\/long/i).click();

    cy.findByText(/close/i).click();

    cy.findAllByText(/northing/i).should('not.exist');
    cy.findAllByText(/latitude/i).should('exist');
  });
});
