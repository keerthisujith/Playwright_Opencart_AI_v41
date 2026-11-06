import { test, expect } from '../../fixtures/pageFixtures';
import { RandomDataUtil } from '../../utils/dataGenerator';

test('Customer registration @master @sanity @web', async ({ homePage, registerPage, accountPage }) => {
    const customer = RandomDataUtil.generateCustomerRegistration();

    await test.step('1) Open the registration page', async () => {
        await homePage.openRegisterPage();
        expect(await registerPage.isRegistrationPageExists()).toBeTruthy();
    });

    await test.step('2) Register a new customer with generated details', async () => {
        await registerPage.register(customer);
        expect(await registerPage.isAccountCreated()).toBeTruthy();
    });

    await test.step('3) Verify the new account through account navigation', async () => {
        await registerPage.continueToAccount();
        expect(await accountPage.isMyAccountPageExists()).toBeTruthy();
    });

    console.log('Customer registration completed successfully.');
});