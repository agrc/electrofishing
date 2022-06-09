export default function commonIntercepts() {
  const baseRoutes = [
    'mapservice/0',
    'mapservice/1',
    'mapservice/2',
    'mapservice/3',
    'mapservice/4',
    'mapservice/5',
    'mapservice/6',
    'mapservice/7',
    'mapservice/8',
    'mapservice/9',
    'mapservice/10',
    'reference/0',
    'reference/1',
  ];
  baseRoutes.forEach((route) => {
    cy.intercept('GET', new RegExp(`.*/maps/${route}$`), { fixture: `${route}.json` });
    cy.intercept('GET', `**/maps/${route}?*`, { fixture: `${route}.json` });
  });

  const queryRoutes = ['mapservice/0', 'reference/0', 'reference/1'];

  queryRoutes.forEach((route) => {
    // query requests - these are going to return duplicate features since query
    // is called more than once per layer, but I don't think that's an issue
    cy.intercept('GET', `**/maps/${route}/query*`, { fixture: `${route}/query.json` });
  });

  const taskRoutes = ['toolbox/NewCollectionEvent/execute', 'toolbox/GetSegmentFromCoords/execute'];

  taskRoutes.forEach((route) => {
    cy.intercept(`**/maps/${route}*`, { fixture: `${route}.json`, delay: 250 });
  });
}
