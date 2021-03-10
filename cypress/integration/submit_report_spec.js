/* eslint-disable cypress/no-unnecessary-waiting */
describe('SubmitReport', () => {
  beforeEach(() => {
    // TODO: import the db name (appName) from react-app/config once it's converted to
    // an es module
    indexedDB.deleteDatabase('electrofishing');
  });

  it('submits a report', () => {
    const baseRoutes = [
      'MapService/FeatureServer/0',
      'MapService/FeatureServer/1',
      'MapService/FeatureServer/2',
      'MapService/FeatureServer/3',
      'MapService/FeatureServer/4',
      'MapService/FeatureServer/5',
      'MapService/FeatureServer/6',
      'MapService/FeatureServer/7',
      'MapService/FeatureServer/8',
      'MapService/FeatureServer/9',
      'MapService/FeatureServer/10',
      'Reference/MapServer/0',
      'Reference/MapServer/1',
    ];
    baseRoutes.forEach((route) => {
      cy.intercept('GET', new RegExp(`/arcgis/rest/services/Electrofishing/${route}$`), { fixture: `${route}.json` });
      cy.intercept('GET', `/arcgis/rest/services/Electrofishing/${route}?`, { fixture: `${route}.json` });
    });

    const queryRoutes = ['MapService/FeatureServer/0', 'Reference/MapServer/0', 'Reference/MapServer/1'];

    queryRoutes.forEach((route) => {
      // query requests - these are going to return duplicate features since query
      // is called more than once per layer, but I don't think that's an issue
      cy.intercept('GET', `/arcgis/rest/services/Electrofishing/${route}/query*`, { fixture: `${route}/query.json` });
    });

    const postRoutes = ['Toolbox/GPServer/NewCollectionEvent/submitJob', 'Toolbox/GPServer/NewCollectionEvent/jobs/id'];

    postRoutes.forEach((route) => {
      cy.route('POST', `/arcgis/rest/services/Electrofishing/${route}*`, `fixture:${route}.json`);
    });

    cy.viewport(1200, 600);
    cy.visit('http://localhost:8000/src');

    // select station marker
    cy.get('.leaflet-marker-icon').first().click();

    cy.get('.map').as('map');

    // define stream reach via start/end
    cy.get('.start-end-geodef [data-dojo-attach-point="mapBtn"]').as('startEndButtons');
    cy.get('@startEndButtons').first().click();
    cy.get('@map').click();

    cy.get('@startEndButtons').last().click();
    cy.get('@map').click('right');

    cy.get('[data-dojo-attach-point="verifyMapBtn"]').click();
    cy.get('[data-dojo-attach-point="verifyMapBtn"][data-successful="true"]');

    // fill out the rest of the location tab
    cy.get('[data-dojo-attach-point="dateTxt"]').type('2020-11-19');
    cy.get('[data-dojo-attach-point="surveyPurposeSelect"]').select('Catch and Effort', { force: true });
    cy.get('[data-dojo-attach-point="weatherSelect"]').select('clear', { force: true });
    cy.get('[data-dojo-attach-point="observersTxt"]').type('some people');

    // method tab
    cy.get('a[href="#methodTab"]').click();
    cy.get('[data-dojo-attach-point="numberNettersTxt"]').type('3');

    cy.get('[data-dojo-attach-point="numberAnodesTxt"]').type('{backspace}2');

    cy.get('.equipment .dgrid-scroller table td.field-ANODE_DIAMETER').type('1');
    cy.focused().tab().tab().type('2');
    cy.focused().tab().tab().type('R');

    // catch tab
    cy.get('a[href="#catchTab"]').click();

    const GRID_DROPDOWN_DELAY = 500; // give the drop downs some time to catch up
    cy.get('.catch .dgrid-scroller table td.field-SPECIES_CODE').type('B');
    cy.wait(GRID_DROPDOWN_DELAY);
    cy.focused().tab().tab().type('s');
    cy.wait(GRID_DROPDOWN_DELAY);
    cy.focused().tab().tab().type('1');
    cy.focused().tab().tab().type('1');

    // add fish notes
    cy.get('[data-tab="Notes_tab"]').click();
    cy.get('[data-dojo-attach-point="notesTxtArea"]').type('test notes');
    cy.get('.more-info-dialog [data-dojo-attach-point="submitBtn"]').click();

    cy.get('.header button.btn-success').click();

    cy.get('[data-testid="summaryConfirmBtn"]').click();

    cy.get('[data-dojo-attach-point="successMsgContainer"]:not(.hidden)');
  });
});
