import { Locator, Page } from '@playwright/test';

export class AdminCustomersPage {
    private readonly page: Page;
    private readonly usernameField: Locator;
    private readonly passwordField: Locator;

    constructor(page: Page) {
        this.page = page;
        this.usernameField = page.getByRole('textbox', { name: 'Username', exact: true });
        this.passwordField = page.getByRole('textbox', { name: 'Password', exact: true });
    }

    async login(adminUrl: string, username: string, password: string): Promise<void> {
        await this.page.goto(adminUrl);
        await this.usernameField.fill(username);
        await this.passwordField.fill(password);
        await this.page.getByRole('button', { name: 'Login' }).click();
        await this.page.getByRole('heading', { name: 'Dashboard', exact: true }).waitFor();
    }

    async openCustomersPage(): Promise<void> {
        await this.page.locator('#menu-customer > a').click();
        await this.page.locator('#menu-customer a[href*="route=customer/customer&"]').click();
        await this.page.waitForURL(/route=customer\/customer/);
    }

    async searchCustomerByEmail(email: string): Promise<void> {
        await this.page.locator('#input-email').fill(email);
        await this.page.locator('#button-filter').click();
    }

    async getCustomerRowText(email: string): Promise<string> {
        const customerRow = this.page.getByRole('row').filter({ hasText: email });
        await customerRow.waitFor({ state: 'visible' });
        return customerRow.innerText();
    }
}
