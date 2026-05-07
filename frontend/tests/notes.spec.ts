import { test, expect } from '@playwright/test';

test.describe('Fun Facts App', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('http://localhost:5174/');
  });

  test('page loads correctly', async ({ page }) => {
    await expect(page).toHaveURL('http://localhost:5174/');
    await expect(page.getByRole('heading', { name: 'Fun Facts' })).toBeVisible();
  });

  test('notes are displayed', async ({ page }) => {
    await expect(page.locator('.note')).toHaveCount(10);
  });

  test('first note title is visible', async ({ page }) => {
    await expect(page.getByRole('heading', { name: /JavaScript Was Created in 10 Days/i })).toBeVisible();
  });

  test('pagination is visible', async ({ page }) => {
    await expect(page.locator('.pagination')).toBeVisible();
  });
});