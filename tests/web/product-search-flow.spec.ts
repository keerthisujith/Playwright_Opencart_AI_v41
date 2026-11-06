import { test, expect } from '../../fixtures/pageFixtures';
import { Helper } from '../../utils/helper';

test('Product search @master @sanity @web', async ({ homePage, searchResultsPage }) => {
    const { productName } = Helper.getProductDetails();

    await test.step('1) Search for the configured product', async () => {
        await homePage.searchProduct(productName);
    });

    await test.step('2) Verify the search results page is displayed', async () => {
        expect(await searchResultsPage.isSearchResultsPageExists(productName)).toBeTruthy();
    });

    await test.step('3) Verify the exact product name appears in results', async () => {
        expect(await searchResultsPage.isProductVisible(productName)).toBeTruthy();
        expect(await searchResultsPage.getProductName(productName)).toBe(productName);
    });

    console.log('Product search completed successfully.');
});