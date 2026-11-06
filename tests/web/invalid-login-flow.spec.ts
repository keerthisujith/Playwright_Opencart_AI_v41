import path from 'node:path';
import { test, expect } from '../../fixtures/pageFixtures';
import { DataProvider } from '../../utils/DataReader';

type LoginTestData = {
    email: string;
    password: string;
    expected: 'success' | 'failure';
};

const loginDataPath = path.resolve(__dirname, '../../testdata/opencart_logindata.json');
const invalidCredentials = (DataProvider.readJson(loginDataPath) as LoginTestData[]).find(
    (row) => row.expected === 'failure' && row.email.trim() !== '' && row.password.trim() !== '',
);

if (!invalidCredentials) {
    throw new Error('A nonblank invalid-login row is required in opencart_logindata.json.');
}

test('Invalid customer login is rejected @master @regression @web', async ({ homePage, loginPage, accountPage }) => {
    await test.step('1) Navigate to My Account and open Login', async () => {
        await homePage.openLoginPage();
        expect(await loginPage.isLoginPageExists()).toBeTruthy();
    });

    await test.step('2) Submit invalid customer credentials', async () => {
        await loginPage.login(invalidCredentials.email, invalidCredentials.password);
    });

    await test.step('3) Verify the warning and unauthenticated state', async () => {
        expect(await loginPage.isWarningVisible()).toBeTruthy();
        expect(await loginPage.getWarningText()).toContain(
            'Warning: No match for E-Mail Address and/or Password.',
        );
        expect(await accountPage.isMyAccountPageExists()).toBeFalsy();
    });

    console.log('Invalid customer login was rejected as expected.');
});