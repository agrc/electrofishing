export function loadAndSignIn() {
  cy.viewport(1200, 1000);
  cy.visit('http://localhost:8000/src');
  // cy.visit('https://dwrapps.dev.utah.gov/fishsample/dataentry/');
  cy.get('#add-account-button > .mdc-button > .mdc-button__ripple', { timeout: 120000 }).click();
  cy.get('#autogen-button > .mdc-button__ripple').click();
  cy.get('#sign-in').click();
}
