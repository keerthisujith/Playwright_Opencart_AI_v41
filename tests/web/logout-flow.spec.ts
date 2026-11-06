import { test, expect } from '../../fixtures/pageFixtures';
import { Helper } from '../../utils/helper';

test('Customer logout @master @sanity @web', async ({
    page,
    homePage,
    loginPage,
    logoutPage,
    accountPage,
}) => {
    const { email, password } = Helper.getLoginDetails();

    await test.step('1) Log in with configured customer credentials', async () => {
        await homePage.openLoginPage();
        expect(await loginPage.isLoginPageExists()).toBeTruthy();
        await loginPage.login(email, password);
        expect(await accountPage.isMyAccountPageExists()).toBeTruthy();
    });

    await test.step('2) Open Logout and verify its confirmation page', async () => {
        await homePage.openLogoutPage();
        expect(await logoutPage.isLogoutConfirmationVisible()).toBeTruthy();
    });

    await test.step('3) Continue to the homepage and verify the logged-out state', async () => {
        await logoutPage.continueToStore();
        await expect(page).toHaveURL(/route=common\/home/);
        await homePage.openMyAccountMenu();
        await expect(page.getByRole('link', { name: 'Login', exact: true })).toBeVisible();
        await expect(page.getByRole('link', { name: 'Logout', exact: true })).toHaveCount(0);
        expect(await accountPage.isMyAccountPageExists()).toBeFalsy();
    });

    console.log('Customer logout completed successfully.');
});