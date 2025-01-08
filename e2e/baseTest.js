import { test as baseTest } from '@playwright/test';

export const test = baseTest.extend({
  context: async ({ context }, use) => {
    await context.addInitScript(() => {
      window.IS_PLAYWRIGHT = true;
    });
    // eslint-disable-next-line react-hooks/rules-of-hooks
    await use(context);
  },
});

export { expect } from '@playwright/test';
