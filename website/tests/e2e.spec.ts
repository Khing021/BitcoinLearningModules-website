import { test, expect } from '@playwright/test';

test.describe('E2E Verification', () => {
  test('Home page renders tracks', async ({ page }) => {
    await page.goto('/');
    await expect(page.locator('h1')).toHaveText(/Bitcoin Learning Modules/i);
    // Based on the mock data, there should be "Full Curriculum" track
    await expect(page.locator('text=Full Curriculum')).toBeVisible();
  });

  test('Builder can select units', async ({ page }) => {
    await page.goto('/builder');
    await expect(page.locator('h1')).toHaveText(/Custom Deck Builder/i);
    // Check if mock units are visible
    await expect(page.locator('text=What is Money?')).toBeVisible();
    
    // Select the first unit checkbox
    const firstCheckbox = page.locator('input[type="checkbox"]').first();
    await firstCheckbox.check();
    
    // Ensure "Play Selected" is not disabled
    const playBtn = page.locator('text=Play Selected');
    await expect(playBtn).not.toHaveClass(/disabled/);
  });
});
