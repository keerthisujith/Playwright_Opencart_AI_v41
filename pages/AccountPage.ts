import { Page } from '@playwright/test';

export class AccountPage {
    private readonly page: Page;

    constructor(page: Page) {
        this.page = page;
    }

    /** Checks whether the authenticated customer account dashboard is displayed. */
    async isMyAccountPageExists(): Promise<boolean> {
        if (new URL(this.page.url()).searchParams.get('route') !== 'account/account') {
            return false;
        }

        const heading = this.page.getByRole('heading', { name: 'My Account', exact: true }).first();
        try {
            await heading.waitFor({ state: 'visible', timeout: 5000 });
            return true;
        } catch {
            return false;
        }
    }
}