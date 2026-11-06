import { Locator, Page } from '@playwright/test';

export class ProductPage {
    private readonly page: Page;
    private readonly quantityField: Locator;
    private readonly addedToCartMessage: Locator;

    constructor(page: Page) {
        this.page = page;
        this.quantityField = page.getByRole('textbox', { name: 'Qty' });
        this.addedToCartMessage = page.getByText('Success: You have added', { exact: false });
    }

    /** Checks whether the requested product details are displayed. */
    async isProductDetailsVisible(productName: string): Promise<boolean> {
        const heading = this.page.getByRole('heading', { name: productName, exact: true, level: 1 });
        try {
            await heading.waitFor({ state: 'visible', timeout: 5000 });
            return true;
        } catch {
            return false;
        }
    }

    /** Returns the product price shown on its details page. */
    async getProductPrice(): Promise<string> {
        return (await this.page.getByRole('heading', { level: 2 }).innerText()).trim();
    }

    /** Sets the requested product quantity. */
    async setQuantity(quantity: string): Promise<void> {
        await this.quantityField.fill(quantity);
    }

    /** Adds the product to the shopping cart. */
    async addToCart(): Promise<void> {
        await this.page.getByRole('button', { name: 'Add to Cart', exact: true }).click();
    }

    /** Checks whether the store confirms that the product was added. */
    async isAddedToCartMessageVisible(): Promise<boolean> {
        try {
            await this.addedToCartMessage.waitFor({ state: 'visible', timeout: 5000 });
            return true;
        } catch {
            return false;
        }
    }
}