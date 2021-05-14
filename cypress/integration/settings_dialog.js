describe('SettingsDialog', () => {
  it('toggles the coordinates type', () => {
    cy.viewport(1200, 1000);
    cy.visit('http://localhost:8000/src');
    // cy.visit('https://dwrapps.dev.utah.gov/fishsample/dataentry/');

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
