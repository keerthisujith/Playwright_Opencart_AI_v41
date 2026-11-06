import { test, expect } from '../../fixtures/pageFixtures';
import { Helper } from '../../utils/helper';

test('Valid customer login @master @sanity @web', async ({ homePage, loginPage, accountPage }) => {
    const { email, password } = Helper.getLoginDetails();

    await test.step('1) Navigate to My Account and open Login', async () => {
        await homePage.openLoginPage();
        expect(await loginPage.isLoginPageExists()).toBeTruthy();
    });

    await test.step('2) Log in with configured customer credentials', async () => {
        await loginPage.login(email, password);
        expect(await accountPage.isMyAccountPageExists()).toBeTruthy();
    });

    console.log('Valid customer login completed successfully.');
});