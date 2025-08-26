import { Page } from '@playwright/test';

export class BasePage {
    protected page: Page;

    constructor(page: Page) {
        this.page = page;
    }

    async acceptCookies() {
        const acceptCookieButton = this.page.locator('button.js-accept-all-cookies');
        
        if (await acceptCookieButton.isVisible()) {
            await acceptCookieButton.click();
        }
    }

    async rejectCookies() {
        const rejectCookiesButton = this.page.locator('button.js-deny-cookies');
        
        if (await rejectCookiesButton.isVisible()) {
            await rejectCookiesButton.click();
        }
    }
}