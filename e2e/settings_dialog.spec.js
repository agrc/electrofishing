// @ts-check
import { test, expect } from './baseTest';
import { loadAndSignIn } from './utilities';

test('toggles the coordinates type', async ({ page }) => {
  await loadAndSignIn(page);

  // utm is default
  await expect(page.getByText('northing').nth(1)).toBeVisible();
  await expect(page.getByText('latitude').nth(1)).toBeHidden();

  // switch to lat/long
  await page.getByRole('button', { name: 'Settings' }).click();
  await page.click('text=lat/long');
  await page.click('text=close');

  await expect(page.getByText('northing').nth(1)).toBeHidden();
  await expect(page.getByText('latitude').nth(1)).toBeVisible();
});
