export default function commonIntercepts() {
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

  const taskRoutes = ['Toolbox/GPServer/NewCollectionEvent/execute', 'Toolbox/GPServer/GetSegmentFromCoords/execute'];

  taskRoutes.forEach((route) => {
    cy.intercept(`/arcgis/rest/services/Electrofishing/${route}*`, { fixture: `${route}.json`, delay: 250 });
  });
}
