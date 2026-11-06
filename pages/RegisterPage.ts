import { Locator, Page } from '@playwright/test';

export type CustomerRegistration = {
    firstName: string;
    lastName: string;
    email: string;
    telephone: string;
    password: string;
};

export class RegisterPage {
    private readonly page: Page;
    private readonly firstNameField: Locator;
    private readonly lastNameField: Locator;
    private readonly emailField: Locator;
    private readonly telephoneField: Locator;
    private readonly passwordField: Locator;
    private readonly passwordConfirmField: Locator;
    private readonly privacyPolicyCheckbox: Locator;

    constructor(page: Page) {
        this.page = page;
        this.firstNameField = page.getByPlaceholder('First Name');
        this.lastNameField = page.getByPlaceholder('Last Name');
        this.emailField = page.getByPlaceholder('E-Mail');
        this.telephoneField = page.getByPlaceholder('Telephone');
        this.passwordField = page.getByPlaceholder('Password', { exact: true });
        this.passwordConfirmField = page.getByPlaceholder('Password Confirm');
        this.privacyPolicyCheckbox = page.getByRole('checkbox');
    }

    /** Checks whether the registration form is displayed. */
    async isRegistrationPageExists(): Promise<boolean> {
        const heading = this.page.getByRole('heading', { name: 'Register Account', exact: true });
        try {
            await heading.waitFor({ state: 'visible', timeout: 5000 });
            return true;
        } catch {
            return false;
        }
    }

    /** Fills and submits the registration form after accepting the privacy policy. */
    async register(customer: CustomerRegistration): Promise<void> {
        await this.firstNameField.fill(customer.firstName);
        await this.lastNameField.fill(customer.lastName);
        await this.emailField.fill(customer.email);
        await this.telephoneField.fill(customer.telephone);
        await this.passwordField.fill(customer.password);
        await this.passwordConfirmField.fill(customer.password);
        await this.privacyPolicyCheckbox.check();
        await this.page.getByRole('button', { name: 'Continue', exact: true }).click();
    }

    /** Checks whether the account-created confirmation is displayed. */
    async isAccountCreated(): Promise<boolean> {
        const heading = this.page.getByRole('heading', { name: 'Your Account Has Been Created!', exact: true });
        try {
            await heading.waitFor({ state: 'visible', timeout: 5000 });
            return true;
        } catch {
            return false;
        }
    }

    /** Continues from the confirmation page to the account dashboard. */
    async continueToAccount(): Promise<void> {
        await this.page.getByRole('link', { name: 'Continue', exact: true }).click();
    }
}