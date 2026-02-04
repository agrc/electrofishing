// @ts-check
import { test, expect } from './baseTest';
import { loadAndSignIn, mockRequests } from './utilities';

test('successfully zooms to a stream', async ({ page }) => {
  await mockRequests(page);
  await loadAndSignIn(page);

  await page.getByTestId('stream-search').first().fill('Red Butte');
  await page.getByRole('option', { name: 'RED BUTTE CR' }).first().click();

  const stream = page.locator('path[stroke="yellow"]:not([d="M0 0"])');

  await expect(stream).toBeVisible();

  await expect(stream).toBeVisible();

  await expect(stream).toBeVisible();
});
