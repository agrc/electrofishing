// @ts-check
import { test, expect } from './baseTest';
import { loadAndSignIn, mockRequests } from './utilities';

test('creates a new station', async ({ page }) => {
  await mockRequests(page);
  await loadAndSignIn(page);

  await page.route('**/addFeatures', async (route) => {
    await route.fulfill({ json: { addResults: [{ objectId: 6579, success: true }] } });
  });

  const newStationName = 'new station name';

  await page
    .getByRole('link', {
      name: /add new station/i,
    })
    .click();

  await page.waitForTimeout(500);

  await page
    .getByRole('textbox', {
      name: /name/i,
    })
    .fill(newStationName);
  const streamTypeSelect = page.locator('#streamTypeSelect');
  await streamTypeSelect.fill('c');
  await streamTypeSelect.press('Enter');
  await page.locator('.modal-body > .point-def > :nth-child(1) > .btn > .glyphicon').click();
  await page.locator('.station .leaflet-container').click();
  await page.locator('.stream-lake-button-container > :nth-child(2) > .btn > .glyphicon').click();
  await page.locator('[d="M-76 14L-87 0L-88 -4"]').click();
  await page
    .getByRole('button', {
      name: /add station/i,
    })
    .click();

  await page.getByText(/station added successfully!/i).waitFor();
  const stationTxt = page.locator('#stationTxt');
  await expect(stationTxt).toHaveValue(newStationName);
});
