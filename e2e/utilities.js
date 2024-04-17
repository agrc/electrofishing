// @ts-check
export async function loadAndSignIn(page, tab) {
  await page.goto('/');

  // I tried using these docs to persist the auth between tests but the app
  // doesn't seem to be able to persist the login session
  // https://playwright.dev/docs/auth#basic-shared-account-in-all-tests
  if (await page.isVisible('#logout')) {
    await page.click('#logout');
  }

  const popupPromise = page.waitForEvent('popup');
  await page.click('#login');
  const popup = await popupPromise;
  await popup.waitForLoadState();
  console.log('popup loaded', popup.url());

  await popup.click('#add-account-button');
  await popup.click('#autogen-button > .mdc-button__ripple');
  await popup.click('#sign-in');

  if (tab) {
    await page.waitForTimeout(1000);
    await page.click(`a[href="#${tab}Tab"]`);
  }
}

export async function mockRequests(page) {
  const basePath = './e2e/fixtures/';
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

  for (const baseRoute of baseRoutes) {
    await page.route(new RegExp(`.*/maps/${baseRoute}$`), async (route) => {
      await route.fulfill({ path: `${basePath}${baseRoute}.json` });
    });
    await page.route(`**/maps/${baseRoute}?*`, async (route) => {
      await route.fulfill({ path: `${basePath}${baseRoute}.json` });
    });
  }

  const queryRoutes = ['mapservice/0', 'reference/0', 'reference/1'];

  for (const queryRoute of queryRoutes) {
    // query requests - these are going to return duplicate features since query
    // is called more than once per layer, but I don't think that's an issue
    await page.route(`**/maps/${queryRoute}/query*`, async (route) => {
      await route.fulfill({ path: `${basePath}${queryRoute}/query.json` });
    });
  }

  const taskRoutes = ['toolbox/NewCollectionEvent/execute', 'toolbox/GetSegmentFromCoords/execute'];

  for (const taskRoute of taskRoutes) {
    await page.route(`**/maps/${taskRoute}*`, async (route) => {
      await route.fulfill({ path: `${basePath}${taskRoute}.json`, delay: 250 });
    });
  }
}
