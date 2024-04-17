// @ts-check
import { test, expect } from './baseTest';
import { loadAndSignIn, mockRequests } from './utilities';

test('successfully zooms to a stream', async ({ page }) => {
  await mockRequests(page);
  await loadAndSignIn(page);

  await page.getByTestId('stream-search').first().fill('fish');
  await page.locator('[role=listbox] .first-cell').first().click();

  const stream = page.locator(
    '[d="M570 287L631 280L658 264L676 237L668 217L628 176L622 144L614 121L598 121L570 108L547 107L524 114L509 122L497 137L473 157L464 215L462 260L464 284L491 290z"]',
  );

  await expect(stream).toBeVisible();
});
