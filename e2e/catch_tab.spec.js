// @ts-check
import { test, expect } from './baseTest';
import { loadAndSignIn, mockRequests } from './utilities';

test('can add additional passes', async ({ page }) => {
  await mockRequests(page);
  await loadAndSignIn(page, 'catch');

  await page.locator('#dropdown-0-SPECIES_CODE').click();
  await page.locator('#dropdown-0-SPECIES_CODE').fill('s');
  await page.locator('#dropdown-0-SPECIES_CODE').press('ArrowDown');
  await page.locator('#dropdown-0-SPECIES_CODE').press('Enter');
  await page.locator('#dropdown-0-SPECIES_CODE').press('Tab');
  await page.locator('#dropdown-0-LENGTH_TYPE').fill('s');
  await page.locator('#dropdown-0-LENGTH_TYPE').press('Tab');
  await page.locator('#numeric-input-cell-0-LENGTH').fill('2');
  await page.locator('#numeric-input-cell-0-LENGTH').press('Tab');
  await page.locator('#numeric-input-cell-0-WEIGHT').fill('2');
  await page.locator('#numeric-input-cell-0-WEIGHT').press('Tab');
  await page.locator('#numeric-input-cell-0-COUNT').press('Tab');
  await page.locator('#dropdown-1-SPECIES_CODE').press('Tab');
  await page.getByRole('button', { name: '+' }).click();
  await page.locator('#dropdown-2-SPECIES_CODE').click();
  await page.locator('#dropdown-2-SPECIES_CODE').fill('b');
  await page.locator('#dropdown-2-SPECIES_CODE').press('Tab');
  await page.locator('#dropdown-2-LENGTH_TYPE').fill('s');
  await page.locator('#dropdown-2-LENGTH_TYPE').press('Tab');
  await page.locator('#numeric-input-cell-2-LENGTH').fill('1');
  await page.locator('#numeric-input-cell-2-LENGTH').press('Tab');
  await page.locator('#numeric-input-cell-2-WEIGHT').fill('2');
  await page.locator('#numeric-input-cell-2-WEIGHT').press('Tab');
  await page.locator('#catchTab label').filter({ hasText: '1' }).click();

  expect(await page.locator('table.data-grid tbody tr').count()).toBe(2);

  await page.locator('#catchTab label').filter({ hasText: '2' }).click();

  expect(await page.locator('table.data-grid tbody tr').count()).toBe(1);
});

test('batch weights', async ({ page }) => {
  await mockRequests(page);
  await loadAndSignIn(page, 'catch');

  await page.locator('#dropdown-0-SPECIES_CODE').click();
  await page.locator('#dropdown-0-SPECIES_CODE').fill('b');
  await page.locator('#dropdown-0-SPECIES_CODE').press('Tab');
  await page.locator('#dropdown-0-LENGTH_TYPE').fill('s');
  await page.locator('#dropdown-0-LENGTH_TYPE').press('Tab');
  await page.locator('#numeric-input-cell-0-LENGTH').fill('1');
  await page.locator('#numeric-input-cell-0-LENGTH').press('Tab');
  await page.locator('#numeric-input-cell-0-WEIGHT').press('Tab');
  await page.locator('#numeric-input-cell-0-COUNT').press('Tab');
  await page.locator('#dropdown-1-SPECIES_CODE').press('Tab');
  await page.locator('#dropdown-1-LENGTH_TYPE').press('Tab');
  await page.locator('#numeric-input-cell-1-LENGTH').fill('3');
  await page.locator('#numeric-input-cell-1-LENGTH').press('Tab');
  await page.locator('#numeric-input-cell-1-WEIGHT').press('Tab');
  await page.locator('#numeric-input-cell-1-COUNT').press('Tab');
  await page.locator('#dropdown-2-SPECIES_CODE').press('Tab');
  await page.locator('#dropdown-2-LENGTH_TYPE').press('Tab');
  await page.locator('#numeric-input-cell-2-LENGTH').press('Tab');
  await page.locator('#numeric-input-cell-2-WEIGHT').press('Tab');
  await page.locator('#numeric-input-cell-2-COUNT').press('Tab');
  await page.getByRole('button', { name: 'Batch' }).click();
  await page.getByRole('tooltip', { name: 'Weight Go' }).getByRole('spinbutton').click();
  await page.getByRole('tooltip', { name: 'Weight Go' }).getByRole('spinbutton').fill('8');
  await page.getByRole('button', { name: 'Go', exact: true }).click();

  await expect(page.locator('#numeric-input-cell-0-WEIGHT')).toHaveValue('2');
  await expect(page.locator('#numeric-input-cell-1-WEIGHT')).toHaveValue('2');
  await expect(page.locator('#numeric-input-cell-2-WEIGHT')).toHaveValue('2');
  await expect(page.locator('#numeric-input-cell-3-WEIGHT')).toHaveValue('2');
});

test('add/delete row buttons', async ({ page }) => {
  await mockRequests(page);
  await loadAndSignIn(page, 'catch');

  await page.getByRole('button', { name: 'Add Row' }).click();
  await page.getByRole('button', { name: 'Add Row' }).click();
  await page.getByRole('button', { name: 'Add Row' }).click();

  expect(await page.locator('table.data-grid tbody tr').count()).toBe(4);

  await page.getByRole('cell', { name: '4' }).click();
  await page.getByRole('button', { name: 'Delete Row' }).click();

  expect(await page.locator('table.data-grid tbody tr').count()).toBe(3);
});
