import { test, expect } from '@playwright/test';
import { CableGuyPage } from '../pages/CableGuyPage';
import { Verify } from 'crypto';


test.beforeEach(async ({ page }) => {
  const cableGuyPage = new CableGuyPage(page);
  await cableGuyPage.goto();
  await cableGuyPage.acceptCookies();
  await expect(page.locator('.spicy-consent-wrapper')).toBeHidden();
});

test.describe('Thomann.de CableGuy navigation', () => {
  test('should navigate to CableGuy page and accept cookies', async ({ page }) => {
    // Execute the following actions as part of a single test scenario:
    // ○​ Step 1:
    //   ■​ Click on the "Cable Beginning" section.
    
    await page.getByRole('button', { name: 'cable beginning' }).click();
    
    //   ■​ Select a random Cable Type and then the random Cable.
    
    
    // ○​ Step 2:
    
    //   ■​ Click on the "Cable End" section.
    
    //   ■​ Select another random Cable Type and then random Cable.
    
    // ○​ Step 3:
    
    //   ■​ Choose a random Manufacturer from the available options.
    
    //   ■​ Validate that the number of products displayed matches the expected number indicated below the manufacturer’s logo.
    
    // ○​ Step 4:
    
    //   ■​ Click on one of the products filtered by the selection.
    
    //   ■​ Verify that the correct product page is opened.
    
    // ○​ Step 5:
    
    //   ■​ Add the selected product (cable) to the shopping basket.
    
    //   ■​ Verify the Basket Notification Popup for accuracy.

  });
})