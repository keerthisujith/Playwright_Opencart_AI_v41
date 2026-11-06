import { Locator, Page } from '@playwright/test';

export class LoginPage {
    private readonly page: Page;
    private readonly emailField: Locator;
    private readonly passwordField: Locator;
    private readonly warningMessage: Locator;

    constructor(page: Page) {
        this.page = page;
        this.emailField = page.getByRole('textbox', { name: 'E-Mail Address' });
        this.passwordField = page.getByRole('textbox', { name: 'Password' });
        this.warningMessage = page.getByText('Warning: No match for E-Mail Address and/or Password.', { exact: false });
    }

    /** Checks whether the returning-customer login form is displayed. */
    async isLoginPageExists(): Promise<boolean> {
        const heading = this.page.getByRole('heading', { name: 'Returning Customer', exact: true });
        try {
            await heading.waitFor({ state: 'visible', timeout: 5000 });
            return true;
        } catch {
            return false;
        }
    }

    /** Submits the provided customer credentials. */
    async login(email: string, password: string): Promise<void> {
        await this.emailField.fill(email.trim());
        await this.passwordField.fill(password.trim());
        await this.page.getByRole('button', { name: 'Login', exact: true }).click();
    }

    /** Checks whether the invalid-credentials warning is displayed. */
    async isWarningVisible(): Promise<boolean> {
        try {
            await this.warningMessage.waitFor({ state: 'visible', timeout: 5000 });
            return true;
        } catch {
            return false;
        }
    }

    /** Returns the displayed invalid-credentials warning. */
    async getWarningText(): Promise<string> {
        return (await this.warningMessage.innerText()).trim();
    }
}