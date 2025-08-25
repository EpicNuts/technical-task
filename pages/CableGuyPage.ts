import { BasePage } from './BasePage';

export class CableGuyPage extends BasePage {
    async goto() {
        await this.page.goto('https://www.thomann.de/intl/cableguy.html');
        await this.acceptCookies();
    }

    
}