export function loadAndSignIn(tab) {
  cy.viewport(1200, 1000);
  cy.visit('http://localhost:5173/');
  cy.get('body').then(($body) => {
    if ($body.find('#logout').length > 0) {
      return cy.get('#logout').click();
    }
  });
  cy.get('#login').click();

  cy.get('#add-account-button', { timeout: 120000 }).click();
  cy.get('#autogen-button > .mdc-button__ripple').click();
  cy.get('#sign-in').click();
  cy.get('body.loaded');

  if (tab) {
    // eslint-disable-next-line cypress/no-unnecessary-waiting
    cy.wait(1000);
    cy.get(`a[href="#${tab}Tab"]`).click();
  }
}
