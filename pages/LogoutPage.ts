import { Page } from '@playwright/test';

export class LogoutPage {
    private readonly page: Page;

    constructor(page: Page) {
        this.page = page;
    }

    /** Checks whether the account logout confirmation is displayed. */
    async isLogoutConfirmationVisible(): Promise<boolean> {
        const heading = this.page.getByRole('heading', { name: 'Account Logout', exact: true });
        try {
            await heading.waitFor({ state: 'visible', timeout: 5000 });
            return true;
        } catch {
            return false;
        }
    }

    /** Continues to the store after logout. */
    async continueToStore(): Promise<void> {
        await this.page.getByRole('link', { name: 'Continue', exact: true }).click();
    }
}