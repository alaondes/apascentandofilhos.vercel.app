import { test, expect } from '@playwright/test';

test('check for console errors', async ({ page }) => {
  const errors = [];
  page.on('pageerror', exception => {
    errors.push(exception);
  });
  page.on('requestfailed', request => {
    errors.push(`Request failed: ${request.url()} - ${request.failure()?.errorText || 'unknown'}`);
  });
  page.on('response', response => {
    if (response.status() >= 400) {
      errors.push(`Response error: ${response.url()} - ${response.status()}`);
    }
  });

  await page.goto('http://localhost:3000/');
  await page.waitForTimeout(3000);
  
  console.log("URL AFTER LOAD:", page.url());
  console.log("ERRORS:", errors);
  
  const root = await page.evaluate(() => document.getElementById('root')?.innerHTML);
  console.log("ROOT CONTENT LENGTH:", root?.length);
});
