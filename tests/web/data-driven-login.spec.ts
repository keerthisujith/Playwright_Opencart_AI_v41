import path from 'node:path';
import { test, expect } from '../../fixtures/pageFixtures';
import { DataProvider } from '../../utils/DataReader';

type LoginTestData = {
    testName?: string;
    TestName?: string;
    email: string;
    password: string;
    expected: 'success' | 'failure';
};

const loginDataPath = path.resolve(__dirname, '../../testdata/opencart_logindata.json');
const loginData = DataProvider.readJson(loginDataPath) as LoginTestData[];

test.describe('OpenCart data-driven customer login', () => {
    loginData.forEach((testData, index) => {
        const scenarioName = testData.testName ?? testData.TestName ?? 'Login test';

        test(`${scenarioName} row ${index + 1} @master @datadriven @web`, async ({
            homePage,
            loginPage,
            accountPage,
        }) => {
            await test.step('1) Open the OpenCart login page', async () => {
                await homePage.openLoginPage();
                expect(await loginPage.isLoginPageExists()).toBeTruthy();
            });

            await test.step('2) Submit the credentials from this data row', async () => {
                await loginPage.login(testData.email, testData.password);
            });

            await test.step('3) Validate the login result for this data row', async () => {
                if (testData.expected === 'success') {
                    expect(await accountPage.isMyAccountPageExists()).toBeTruthy();
                } else {
                    expect(await loginPage.isWarningVisible()).toBeTruthy();
                    expect(await loginPage.getWarningText()).toContain(
                        'Warning: No match for E-Mail Address and/or Password.',
                    );
                    expect(await accountPage.isMyAccountPageExists()).toBeFalsy();
                }
            });

            console.log(`Data-driven login row ${index + 1} completed.`);
        });
    });
});