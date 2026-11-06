import { Page } from '@playwright/test';

export class SearchResultsPage {
    private readonly page: Page;

    constructor(page: Page) {
        this.page = page;
    }

    /** Checks whether the search results page is displayed for the query. */
    async isSearchResultsPageExists(searchTerm: string): Promise<boolean> {
        const heading = this.page.getByRole('heading', { name: `Search - ${searchTerm}`, exact: true });
        try {
            await heading.waitFor({ state: 'visible', timeout: 5000 });
            return true;
        } catch {
            return false;
        }
    }

    /** Checks whether the exact product appears in search results. */
    async isProductVisible(productName: string): Promise<boolean> {
        const productHeading = this.page.getByRole('heading', { name: productName, exact: true, level: 4 });
        try {
            await productHeading.waitFor({ state: 'visible', timeout: 5000 });
            return true;
        } catch {
            return false;
        }
    }

    /** Returns the displayed exact product name from search results. */
    async getProductName(productName: string): Promise<string> {
        return (await this.page.getByRole('heading', { name: productName, exact: true, level: 4 }).innerText()).trim();
    }

    /** Opens the exact product from search results. */
    async openProduct(productName: string): Promise<void> {
        const productHeading = this.page.getByRole('heading', { name: productName, exact: true, level: 4 });
        await productHeading.getByRole('link', { name: productName, exact: true }).click();
        await this.page.waitForURL(/route=product\/product/);
    }
}