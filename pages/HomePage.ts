import { Page } from '@playwright/test';

export class HomePage {
    private readonly page: Page;
    private readonly searchField;

    constructor(page: Page) {
        this.page = page;
        this.searchField = page.getByRole('textbox', { name: 'Search' });
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

    /** Navigates to customer login. */
    async openLoginPage(): Promise<void> {
        await this.openMyAccountMenu();
        await this.page.getByRole('link', { name: 'Login', exact: true }).first().click();
    }

    /** Navigates to the customer logout confirmation page. */
    async openLogoutPage(): Promise<void> {
        await this.openMyAccountMenu();
        await this.page.getByRole('link', { name: 'Logout', exact: true }).first().click();
    }

    /** Searches the store catalog for a product. */
    async searchProduct(productName: string): Promise<void> {
        await this.searchField.fill(productName);
        await this.searchField.press('Enter');
        await this.page.waitForURL(/route=product\/search/);
    }

    /** Opens the shopping cart from the store header. */
    async openShoppingCart(): Promise<void> {
        await this.page.getByRole('link', { name: /Shopping Cart/ }).first().click();
    }
}