import { test, expect } from '../../fixtures/pageFixtures';
import { RandomDataUtil } from '../../utils/dataGenerator';
import { Helper } from '../../utils/helper';

test('End-to-end customer shopping journey @master @regression @end-to-end @web', async ({
    page,
    homePage,
    registerPage,
    accountPage,
    loginPage,
    logoutPage,
    searchResultsPage,
    productPage,
    cartPage,
}) => {
    const customer = RandomDataUtil.generateCustomerRegistration();
    const { productName, productQuantity, totalPrice } = Helper.getProductDetails();
    let productPrice = '';

    await test.step('1) Register a new customer with generated details', async () => {
        await homePage.openRegisterPage();
        expect(await registerPage.isRegistrationPageExists()).toBeTruthy();
        await registerPage.register(customer);
        expect(await registerPage.isAccountCreated()).toBeTruthy();
    });

    await test.step('2) Log out after registration and log in with the new credentials', async () => {
        await registerPage.continueToAccount();
        expect(await accountPage.isMyAccountPageExists()).toBeTruthy();
        await homePage.openLogoutPage();
        expect(await logoutPage.isLogoutConfirmationVisible()).toBeTruthy();
        await logoutPage.continueToStore();
        await expect(page).toHaveURL(/route=common\/home/);
        await homePage.openLoginPage();
        expect(await loginPage.isLoginPageExists()).toBeTruthy();
        await loginPage.login(customer.email, customer.password);
        expect(await accountPage.isMyAccountPageExists()).toBeTruthy();
    });

    await test.step('3) Search for and open the configured product', async () => {
        await homePage.searchProduct(productName);
        expect(await searchResultsPage.isSearchResultsPageExists(productName)).toBeTruthy();
        expect(await searchResultsPage.isProductVisible(productName)).toBeTruthy();
        await searchResultsPage.openProduct(productName);
        expect(await productPage.isProductDetailsVisible(productName)).toBeTruthy();
        productPrice = await productPage.getProductPrice();
    });

    await test.step('4) Add the product and validate the shopping cart', async () => {
        await productPage.setQuantity(productQuantity);
        await productPage.addToCart();
        expect(await productPage.isAddedToCartMessageVisible()).toBeTruthy();
        await homePage.openShoppingCart();
        expect(await cartPage.isProductInCart(productName)).toBeTruthy();
        expect(await cartPage.getProductQuantity(productName)).toBe(productQuantity);
        expect(await cartPage.getProductPrice(productName)).toBe(productPrice);
        expect(await cartPage.getCartTotal()).toBe(totalPrice);
    });

    console.log('End-to-end shopping journey completed successfully.');
});