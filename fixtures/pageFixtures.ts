import { test as base, expect } from '@playwright/test';
import dotenv from 'dotenv';
import { AccountPage } from '../pages/AccountPage';
import { HomePage } from '../pages/HomePage';
import { RegisterPage } from '../pages/RegisterPage';

dotenv.config();

const APP_URL = process.env.WEB_APP_URL;

if (!APP_URL) {
    throw new Error('WEB_APP_URL must be configured.');
}

type PageFixtures = {
    homePage: HomePage;
    registerPage: RegisterPage;
    accountPage: AccountPage;
};

export const test = base.extend<PageFixtures>({
    homePage: async ({ page }, use) => {
        await page.goto(APP_URL);
        await use(new HomePage(page));
    },
    registerPage: async ({ page }, use) => {
        await use(new RegisterPage(page));
    },
    accountPage: async ({ page }, use) => {
        await use(new AccountPage(page));
    },
});

test.afterEach(async ({ page, context }) => {
    if (!page.isClosed()) {
        await page.close();
    }
    await context.close();
});

export { expect };