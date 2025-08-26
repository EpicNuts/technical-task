
import { BasePage } from './BasePage';

export class CableGuyPage extends BasePage {
    
    async goto() {
        await this.page.goto('https://www.thomann.de/intl/cableguy.html', { waitUntil: 'domcontentloaded', timeout: 60000 });
        await this.acceptCookies();
    }

    // STEPS ONE & TWO 
    async clickCableBeginning() {
        await this.page.locator('.cg-plugButton--left').click();
    }

    async clickCableEnd() {
        await this.page.locator('.cg-plugButton--right').click();
    }

    // async getVisibleModal() {
    //     const modals = this.page.locator('.cg-plugmodal');
    //     const count = await modals.count();
    //     for (let i = 0; i < count; i++) {
    //         if (await modals.nth(i).isVisible()) {
    //             return modals.nth(i);
    //         }
    //     }
    //     throw new Error('No visible modal found');
    // }

    async getVisibleModal() {
        const modal = this.page.locator('.cg-plugmodal');
        if (await modal.isVisible()) {
            return modal;
        }
        throw new Error('No visible modal found');
    }

    async selectRandomActiveCableTypeInModal() {
        const modal = await this.getVisibleModal();
        const cableTypeLocators = modal.locator('.cg-plugmodal__category__item:not(.inactive)');
        const count = await cableTypeLocators.count();
        const enabledCableTypes: number[] = [];
        for (let i = 0; i < count; i++) {
            if (await cableTypeLocators.nth(i).isEnabled()) {
                enabledCableTypes.push(i);
            }
        }
        if (enabledCableTypes.length === 0) throw new Error('No enabled cable types available');
        const randomIndex = enabledCableTypes[Math.floor(Math.random() * enabledCableTypes.length)];
        const selectedType = await cableTypeLocators.nth(randomIndex).textContent();
        await cableTypeLocators.nth(randomIndex).click();
        // Wait for cable list to update and stabilize after selecting cable type
        await this.waitForCableListStableInModal(modal);
        return selectedType;
    }

    async waitForCableListStableInModal(modal, timeout = 5000) {
        const cableLocators = modal.locator('.cg-plugItem');
        let lastCount = -1;
        for (let i = 0; i < 10; i++) {
            const count = await cableLocators.count();
            if (count === lastCount) {
                await this.page.waitForTimeout(500);
                const newCount = await cableLocators.count();
                if (newCount === count) break;
            }
            lastCount = count;
            await this.page.waitForTimeout(100);
        }
    }

    async selectRandomCableInModal() {
        const modal = await this.getVisibleModal();
        const cableLocators = modal.locator('.cg-plugItem');
        const count = await cableLocators.count();
        const enabledIndices: number[] = [];
        for (let i = 0; i < count; i++) {
            if (await cableLocators.nth(i).isVisible() && await cableLocators.nth(i).isEnabled()) {
                enabledIndices.push(i);
            }
        }
        if (enabledIndices.length === 0) throw new Error('No enabled cables available');
        const randomIndex = enabledIndices[Math.floor(Math.random() * enabledIndices.length)];
        const selectedCableName = await cableLocators.nth(randomIndex).locator('.cg-plugItem__subheadline').textContent();
        await cableLocators.nth(randomIndex).click();
        return selectedCableName;
    }

    // STEP THREE

    async waitForManufacturerListStable(timeout = 5000) {
        // Wait for API response and for manufacturer items to be visible
        await Promise.race([
            this.page.waitForResponse(resp => resp.url().includes('cableguy_ajax.html') && resp.status() === 200),
            this.page.waitForSelector('.cg-brands__item', { state: 'visible', timeout })
        ]);
       
        // Wait for manufacturer count to stabilize (no change for 500ms)
        let lastCount = -1;
        for (let i = 0; i < 10; i++) {
            const count = await this.page.locator('.cg-brands__item').count();
            if (count === lastCount) {
                await this.page.waitForTimeout(500);
                const newCount = await this.page.locator('.cg-brands__item').count();
                if (newCount === count) break;
            }
            lastCount = count;
            await this.page.waitForTimeout(100);
        }
    }

    // Choose a random manufacturer, log all names and counts, and return locator, name, and expected product count
    async selectRandomManufacturer() {
        // Each manufacturer is a .cg-brands__item, with an IMG child (alt=name) and a sibling .cg-brands__item__count
        await this.waitForManufacturerListStable();
        const manufacturerItems = this.page.locator('.cg-brands__item');
        const countItems = this.page.locator('.cg-brands__item__count');
        const total = await manufacturerItems.count();
        if (total === 0) throw new Error('No manufacturers found');

        // Gather all manufacturer names and counts for logging
        const manufacturers: { name: string, count: number, index: number }[] = [];
        for (let i = 0; i < total; i++) {
            const img = manufacturerItems.nth(i).locator('img');
            const name = await img.getAttribute('alt') || 'Unknown';
            const countText = await countItems.nth(i).innerText();
            const count = parseInt(countText.replace(/\D/g, ''), 10);
            manufacturers.push({ name, count, index: i });
        }
        console.log(`[DEBUG] Found ${total} manufacturers:`);
        manufacturers.forEach((m, i) => {
            console.log(`  [${i}] ${m.name}: ${m.count} items`);
        });

        // Select a random manufacturer
        const randomIndex = Math.floor(Math.random() * total);
        const selected = manufacturers[randomIndex];
        const manufacturer = manufacturerItems.nth(selected.index);
        await manufacturer.click();
        console.log(`[DEBUG] Selected manufacturer: ${selected.name}, expected product count: ${selected.count}`);
        return { manufacturer, manufacturerName: selected.name, expectedCount: selected.count };
    }

    // Wait for product count to update after manufacturer selection
    async waitForProductCountUpdate(manufacturerName: string, timeout = 5000) {
        await this.page.waitForSelector('.cg-count', { state: 'visible', timeout });
        await this.page.waitForFunction(
            (name) => {
                const el = document.querySelector('.cg-count');
                return el && el.textContent && el.textContent.includes(name);
            },
            manufacturerName,
            { timeout }
        );
    }

    // Wait for product list to stabilize before validating
    async waitForProductListStable(timeout = 5000) {
        await this.page.waitForSelector('#cg-results .fx-product-list-entry', { state: 'visible', timeout });
        let lastCount = -1;
        for (let i = 0; i < 10; i++) {
            const count = await this.page.locator('#cg-results .fx-product-list-entry').count();
            if (count === lastCount) {
                await this.page.waitForTimeout(500);
                const newCount = await this.page.locator('#cg-results .fx-product-list-entry').count();
                if (newCount === count) break;
            }
            lastCount = count;
            await this.page.waitForTimeout(100);
        }
    }

    // Validate that the number of products displayed matches the expected count
    async validateProductsBelongToManufacturer(manufacturerName: string) {
        // await this.waitForProductListStable();
        await this.waitForProductCountUpdate(manufacturerName);
        // Get all visible product entries
        const products = this.page.locator('#cg-results .fx-product-list-entry');
        const count = await products.count();
        let mismatch = 0;
        for (let i = 0; i < count; i++) {
            const title = await products.nth(i).locator('.title__manufacturer').innerText();
            if (!title.includes(manufacturerName)) mismatch++;
        }
        if (mismatch > 0) {
            throw new Error(`Product manufacturer mismatch: expected all \"${manufacturerName}\", but found ${mismatch} mismatches.`);
        }
        console.log(`[DEBUG] All ${count} products belong to manufacturer: ${manufacturerName}`);
    }

    // STEP FOUR

    // Select a random product from filtered list and return its name
    async selectRandomProduct() {
        const productLocator = this.page.locator('.fx-product-list-entry');
        const count = await productLocator.count();
        
        if (count === 0) throw new Error('No products found');
        
        const randomIndex = Math.floor(Math.random() * count);
        const product = productLocator.nth(randomIndex);
        const productTitleLocator = product.locator('.product__title');
        const productName = await productTitleLocator.innerText();
        
        await product.locator('.product__content').click();
        return productName;
    }

    // Verify that the product page matches the selected product name
    async verifyProductPage(product: { name: string; manufacturer?: string; sku?: string }) {
        // Wait for product detail page to load
        await this.page.waitForLoadState('domcontentloaded');

        // Product title
        const titleLocator = this.page.locator('h1.font-sans.font-bold.text-3xl.tracking-tight');
        const titleText = (await titleLocator.textContent())?.trim() || '';
        const normalizedTitle = titleText.replace(/\s+/g, ' ').toLowerCase();
        const normalizedExpected = product.name.replace(/\s+/g, ' ').toLowerCase();

        // Manufacturer
        let manufacturerMatch = true;
        if (product.manufacturer) {
            const metaBrand = await this.page.locator('meta[itemprop="brand"]').getAttribute('content');
            manufacturerMatch = !!metaBrand && metaBrand.toLowerCase().includes(product.manufacturer.toLowerCase());
        }

        // Debug logging
        console.log(`[DEBUG] [verifyProductPage]:`);
        console.log(`   Title: '${titleText}'`);
        console.log(`   Expected: '${product.name}'`);
        console.log(`   Manufacturer: '${product.manufacturer}'`);

        if (!normalizedTitle.includes(normalizedExpected) || !manufacturerMatch) {
            throw new Error(`Product page validation failed. Title: '${titleText}', Expected: '${product.name}', Manufacturer match: ${manufacturerMatch}`);
        }

        console.log('[DEBUG] Product page verified successfully.');
        return true;
    }

    // STEP FIVE

    // Add product to basket (from product list page)
    async addProductFromListToBasket(productName: string) {
        const productLocator = this.page.locator('.fx-product-list-entry').filter({ hasText: productName });
        await productLocator.waitFor({ state: 'visible', timeout: 5000 });
        const basketButton = productLocator.locator('.basket-button');
        await basketButton.waitFor({ state: 'visible', timeout: 5000 });
        await basketButton.click();
    }

    // Verify basket notification popup for accuracy
    async verifyBasketNotification(productName?: string) {
        // Wait for either basket-notification-popup or notifications-display
        const popup = this.page.locator('.basket-notification-popup');
        const notification = this.page.locator('#notifications-display .fx-notification__content');

        let found = false;
        let notificationText = '';
        try {
            await popup.waitFor({ state: 'visible', timeout: 5000 });
            notificationText = await popup.innerText();
            if (notificationText.match(/added to your basket|in den warenkorb gelegt/i)) {
                found = true;
            }
        } catch {}

        if (!found) {
            try {
                await notification.waitFor({ state: 'visible', timeout: 5000 });
                notificationText = await notification.innerText();
                if (notificationText.match(/in your basket|im warenkorb/i)) {
                    found = true;
                }
            } catch {}
        }

        // Optionally check product name is mentioned
        if (productName && found && !notificationText.includes(productName)) {
            throw new Error(`Basket notification does not mention product name. Text: '${notificationText}', Expected: '${productName}'`);
        }

        if (!found) {
            throw new Error('Basket notification not shown or incorrect');
        }
        console.log('[DEBUG] Popup notification verified:', notificationText);
    }
}