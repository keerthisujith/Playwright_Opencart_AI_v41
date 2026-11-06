import { Locator, Page } from '@playwright/test';

export class CartPage {
    private readonly page: Page;

    constructor(page: Page) {
        this.page = page;
    }

    private productRow(productName: string): Locator {
        return this.page.getByRole('row').filter({ hasText: productName });
    }

    /** Checks whether the requested product is displayed in the cart. */
    async isProductInCart(productName: string): Promise<boolean> {
        try {
            await this.productRow(productName).waitFor({ state: 'visible', timeout: 5000 });
            return true;
        } catch {
            return false;
        }
    }

    /** Returns the displayed quantity for the requested cart product. */
    async getProductQuantity(productName: string): Promise<string> {
        return this.productRow(productName).getByRole('textbox').inputValue();
    }

    /** Returns the unit price displayed for the requested cart product. */
    async getProductPrice(productName: string): Promise<string> {
        return (await this.productRow(productName).getByRole('cell').nth(4).innerText()).trim();
    }

    /** Returns the cart grand total. */
    async getCartTotal(): Promise<string> {
        const totalRow = this.page.getByRole('row').filter({ hasText: 'Total:' });
        return (await totalRow.getByRole('cell').last().innerText()).trim();
    }
}