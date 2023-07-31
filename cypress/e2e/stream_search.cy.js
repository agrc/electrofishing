import commonIntercepts from './common_intercepts';
import { loadAndSignIn } from './utils';

describe('StreamSearch', () => {
  it('successfully zooms to a stream', () => {
    commonIntercepts();
    loadAndSignIn();

    cy.findAllByTestId('stream-search').first().type('fish');
    cy.get('[role=listbox] .first-cell').first().click();

    cy.get(
      '[d="M570 287L631 280L658 264L676 237L668 217L628 176L622 144L614 121L598 121L570 108L547 107L524 114L509 122L497 137L473 157L464 215L462 260L464 284L491 290z"]',
    ).should('be.visible');
  });
});
