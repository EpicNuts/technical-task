import { Page } from '@playwright/test';

export class BasePage {
    protected page: Page;

    constructor(page: Page) {
        this.page = page;
    }

    // accept the cookies
    async acceptCookies() {

        const acceptCookieButton = this.page.locator('button.js-accept-all-cookies');
        
        if (await acceptCookieButton.isVisible()) {
            await acceptCookieButton.click()
        }
    }

    // reject the cookies 
    async rejectCookies() {
        
        const rejectCookiesButton = this.page.locator('button.js-deny-cookies');
        
        if (await rejectCookiesButton.isVisible()) {
            await rejectCookiesButton.click();
        }
    }
}