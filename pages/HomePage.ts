import { Page } from '@playwright/test';

export class HomePage {
    private readonly page: Page;

    constructor(page: Page) {
        this.page = page;
    }

    /** Opens the My Account menu. */
    async openMyAccountMenu(): Promise<void> {
        await this.page.getByRole('link', { name: /My Account/ }).first().click();
    }

    /** Navigates to customer registration. */
    async openRegisterPage(): Promise<void> {
        await this.openMyAccountMenu();
        await this.page.getByRole('link', { name: 'Register', exact: true }).click();
    }
}