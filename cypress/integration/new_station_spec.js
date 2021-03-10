describe('AddNewStation', () => {
  it('creates a new station', () => {
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

    cy.intercept('POST', 'addFeatures', { addResults: [{ objectId: 6579, success: true }] });

    const newStationName = 'new station name';

    cy.viewport(1200, 600);
    cy.visit('http://localhost:8000/src');
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
    cy.get('#uniqName_1_0 > :nth-child(1) > .btn > .glyphicon').click();
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
