import { test, expect } from '@playwright/test';
import { CableGuyPage } from '../pages/CableGuyPage';

let cableGuyPage;

test.beforeEach(async ({ page }) => {
  cableGuyPage = new CableGuyPage(page);
  await cableGuyPage.goto();
  await expect(page.locator('.spicy-consent-wrapper')).toBeHidden();
});

test.describe("Testing the CableGuy, Thomann's cable selection manager", () => {
  test('frontend cable selection, manufacturer/product validation and basket operations', async ({ page }) => {

    // Step 1: Select the Beginning Cable
    await cableGuyPage.clickCableBeginning();
    const selectedTypeFirst = await cableGuyPage.selectRandomActiveCableTypeInModal();
    console.log(`[DEBUG] Selected cable type (beginning): ${selectedTypeFirst}`);
    const selectedCableFirst = await cableGuyPage.selectRandomCableInModal();
    console.log(`[DEBUG] Selected cable (beginning): ${selectedCableFirst}`);
    await page.waitForSelector('.cg-plugmodal', { state: 'hidden', timeout: 5000 });

    
    // Step 2: End cable
    await Promise.all([
      cableGuyPage.clickCableEnd(),
      page.waitForResponse(resp => resp.url().includes('cableguy_ajax.html') && resp.status() === 200)
    ]);
    await page.waitForSelector('.cg-plugmodal', { state: 'visible', timeout: 5000 });
    const selectedTypeSecond = await cableGuyPage.selectRandomActiveCableTypeInModal();
    console.log(`[DEBUG] Selected cable type (end): ${selectedTypeSecond}`);   
    const selectedCableSecond = await cableGuyPage.selectRandomCableInModal();
    console.log(`[DEBUG] Selected cable (end): ${selectedCableSecond}`);
    
    await page.waitForSelector('.cg-plugmodal', { state: 'hidden', timeout: 5000 });


    
    // Step 3: Manufacturer selection and product count validation
    await cableGuyPage.waitForManufacturerListStable();
    const { manufacturerName, expectedCount } = await cableGuyPage.selectRandomManufacturer();
    await cableGuyPage.validateProductsBelongToManufacturer(manufacturerName);
    console.log(`[DEBUG] Product count matches: ${expectedCount}`);


    // Step 4: Click on a random filtered product and verify product page
    const selectedProductName = await cableGuyPage.selectRandomProduct();
    console.log(`[DEBUG] Selected product: ${selectedProductName}`);
    await cableGuyPage.verifyProductPage({ name: selectedProductName, manufacturer: manufacturerName });
    
    await page.goBack();
    await cableGuyPage.waitForProductListStable();


    // Step 5: Add to basket and verify notification
    await cableGuyPage.addProductFromListToBasket(selectedProductName);
    await cableGuyPage.verifyBasketNotification(selectedProductName);
  });
});