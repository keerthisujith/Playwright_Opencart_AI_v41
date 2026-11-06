import { test, expect } from '../../fixtures/pageFixtures';
import { Helper } from '../../utils/helper';

test('Add product to cart @master @sanity @web', async ({
    homePage,
    searchResultsPage,
    productPage,
    cartPage,
}) => {
    const { productName, productQuantity } = Helper.getProductDetails();

    await test.step('1) Search for and open the configured product', async () => {
        await homePage.searchProduct(productName);
        expect(await searchResultsPage.isSearchResultsPageExists(productName)).toBeTruthy();
        expect(await searchResultsPage.isProductVisible(productName)).toBeTruthy();
        await searchResultsPage.openProduct(productName);
        expect(await productPage.isProductDetailsVisible(productName)).toBeTruthy();
    });

    await test.step('2) Set the required quantity and add the product to cart', async () => {
        await productPage.setQuantity(productQuantity);
        await productPage.addToCart();
        expect(await productPage.isAddedToCartMessageVisible()).toBeTruthy();
    });

    await test.step('3) Verify the product and quantity in the shopping cart', async () => {
        await homePage.openShoppingCart();
        expect(await cartPage.isProductInCart(productName)).toBeTruthy();
        expect(await cartPage.getProductQuantity(productName)).toBe(productQuantity);
    });

    console.log('Product was added to the cart successfully.');
});