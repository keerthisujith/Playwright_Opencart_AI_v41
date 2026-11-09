import path from 'node:path';
import Ajv from 'ajv';
import { test, expect } from '@playwright/test';
import dotenv from 'dotenv';
import { Routes } from '../../api/endpoints/routes';
import { DataProvider } from '../../utils/DataReader';

dotenv.config();

const BASE_URL = process.env.API_BASE_URL || Routes.BASE_URL;
const PRODUCT_ID = Number(process.env.PRODUCT_ID ?? 1);
const LIMIT = Number(process.env.LIMIT ?? 3);
const PRODUCT_CATEGORY = 'electronics';
const PRODUCT_DATA = {
    title: 'Playwright API test product',
    price: 42.5,
    description: 'Deterministic product data for Playwright API tests.',
    image: 'https://example.com/playwright-api-product.png',
    category: PRODUCT_CATEGORY,
};
const UPDATED_PRODUCT_DATA = {
    ...PRODUCT_DATA,
    title: 'Updated Playwright API test product',
    price: 45.75,
};

test.describe('FakeStore products API', () => {
    test('GET - All products @master @sanity @api', async ({ request }) => {
        const response = await request.get(`${BASE_URL}${Routes.GET_ALL_PRODUCTS}`);
        expect(response.status(), 'Getting all products should return HTTP 200.').toBe(200);

        const products = await response.json();
        expect(Array.isArray(products), 'The products response should be an array.').toBe(true);
        expect(products.length, 'The products response should not be empty.').toBeGreaterThan(0);

        for (const product of products) {
            expect(product).toHaveProperty('id');
            expect(typeof product.id).toBe('number');
            expect(typeof product.title).toBe('string');
            expect(typeof product.price).toBe('number');
            expect(typeof product.category).toBe('string');
            expect(typeof product.image).toBe('string');
        }
    });

    test('GET - Product by ID @master @sanity @api', async ({ request }) => {
        const route = Routes.GET_PRODUCT_BY_ID.replace('{id}', String(PRODUCT_ID));
        const response = await request.get(`${BASE_URL}${route}`);
        expect(response.status(), 'Getting a product by ID should return HTTP 200.').toBe(200);

        const product = await response.json();
        expect(product.id).toBe(PRODUCT_ID);
        expect(typeof product.title).toBe('string');
        expect(typeof product.price).toBe('number');
        expect(typeof product.category).toBe('string');
        expect(typeof product.image).toBe('string');
    });

    test('GET - Products with limit @master @sanity @api', async ({ request }) => {
        const route = Routes.GET_PRODUCTS_WITH_LIMIT.replace('{limit}', String(LIMIT));
        const response = await request.get(`${BASE_URL}${route}`);
        expect(response.status(), 'Getting products with a limit should return HTTP 200.').toBe(200);

        const products = await response.json();
        expect(Array.isArray(products)).toBe(true);
        expect(products.length, 'The product count should match LIMIT.').toBe(LIMIT);
    });

    test('GET - Products sorted ascending @master @regression @api', async ({ request }) => {
        const route = Routes.GET_PRODUCTS_SORTED.replace('{order}', 'asc');
        const response = await request.get(`${BASE_URL}${route}`);
        expect(response.status(), 'Ascending product sort should return HTTP 200.').toBe(200);

        const products = await response.json();
        const productIds = products.map((product: { id: number }) => product.id);
        expect(productIds).toEqual([...productIds].sort((firstId: number, secondId: number) => firstId - secondId));
    });

    test('GET - Products sorted descending @master @regression @api', async ({ request }) => {
        const route = Routes.GET_PRODUCTS_SORTED.replace('{order}', 'desc');
        const response = await request.get(`${BASE_URL}${route}`);
        expect(response.status(), 'Descending product sort should return HTTP 200.').toBe(200);

        const products = await response.json();
        const productIds = products.map((product: { id: number }) => product.id);
        expect(productIds).toEqual([...productIds].sort((firstId: number, secondId: number) => secondId - firstId));
    });

    test('GET - All product categories @master @sanity @api', async ({ request }) => {
        const response = await request.get(`${BASE_URL}${Routes.GET_ALL_CATEGORIES}`);
        expect(response.status(), 'Getting product categories should return HTTP 200.').toBe(200);

        const categories = await response.json();
        expect(Array.isArray(categories)).toBe(true);
        expect(categories.length, 'The category list should not be empty.').toBeGreaterThan(0);
    });

    test('GET - Products by category @master @sanity @api', async ({ request }) => {
        const route = Routes.GET_PRODUCTS_BY_CATEGORY.replace('{category}', encodeURIComponent(PRODUCT_CATEGORY));
        const response = await request.get(`${BASE_URL}${route}`);
        expect(response.status(), 'Getting products by category should return HTTP 200.').toBe(200);

        const products = await response.json();
        expect(Array.isArray(products)).toBe(true);
        expect(products.length, 'The selected category should return products.').toBeGreaterThan(0);
        expect(products.every((product: { category: string }) => product.category === PRODUCT_CATEGORY)).toBe(true);
    });

    test('POST - Create product @master @regression @api', async ({ request }) => {
        const response = await request.post(`${BASE_URL}${Routes.CREATE_PRODUCT}`, { data: PRODUCT_DATA });
        expect(response.status(), 'Creating a product should return HTTP 201.').toBe(201);

        const createdProduct = await response.json();
        expect(typeof createdProduct.id).toBe('number');
        expect(createdProduct.title).toBe(PRODUCT_DATA.title);
        expect(createdProduct.price).toBe(PRODUCT_DATA.price);
        expect(createdProduct.description).toBe(PRODUCT_DATA.description);
        expect(createdProduct.image).toBe(PRODUCT_DATA.image);
        expect(createdProduct.category).toBe(PRODUCT_DATA.category);
    });

    test('PUT - Update product @master @regression @api', async ({ request }) => {
        const route = Routes.UPDATE_PRODUCT.replace('{id}', String(PRODUCT_ID));
        const response = await request.put(`${BASE_URL}${route}`, { data: UPDATED_PRODUCT_DATA });
        expect(response.status(), 'Updating a product should return HTTP 200.').toBe(200);

        const updatedProduct = await response.json();
        expect(updatedProduct.id).toBe(PRODUCT_ID);
        expect(updatedProduct.title).toBe(UPDATED_PRODUCT_DATA.title);
        expect(updatedProduct.price).toBe(UPDATED_PRODUCT_DATA.price);
        expect(updatedProduct.description).toBe(UPDATED_PRODUCT_DATA.description);
        expect(updatedProduct.category).toBe(UPDATED_PRODUCT_DATA.category);
    });

    test('DELETE - Product @master @regression @api', async ({ request }) => {
        const route = Routes.DELETE_PRODUCT.replace('{id}', String(PRODUCT_ID));
        const response = await request.delete(`${BASE_URL}${route}`);
        expect(response.status(), 'Deleting a product should return HTTP 200.').toBe(200);

        const deletedProduct = await response.json();
        expect(deletedProduct.id).toBe(PRODUCT_ID);
    });

    test('GET - Product response schema @master @regression @api', async ({ request }) => {
        const route = Routes.GET_PRODUCT_BY_ID.replace('{id}', String(PRODUCT_ID));
        const response = await request.get(`${BASE_URL}${route}`);
        expect(response.status(), 'Getting a product for schema validation should return HTTP 200.').toBe(200);

        const product = await response.json();
        const schemaPath = path.resolve(__dirname, '../../api/schemas/product_api_schema.json');
        const schema = DataProvider.readJson(schemaPath);
        const ajv = new Ajv();
        const validate = ajv.compile(schema);
        const isValid = validate(product);
        expect(isValid, `Product schema validation failed: ${ajv.errorsText(validate.errors)}`).toBe(true);
    });

    test('E2E - Product CRUD workflow @master @regression @api', async ({ request }) => {
        const createResponse = await request.post(`${BASE_URL}${Routes.CREATE_PRODUCT}`, { data: PRODUCT_DATA });
        expect(createResponse.status(), 'Workflow product creation should return HTTP 201.').toBe(201);
        const createdProduct = await createResponse.json();
        expect(typeof createdProduct.id).toBe('number');

        const updateRoute = Routes.UPDATE_PRODUCT.replace('{id}', String(createdProduct.id));
        const updateResponse = await request.put(`${BASE_URL}${updateRoute}`, { data: UPDATED_PRODUCT_DATA });
        expect(updateResponse.status(), 'Workflow product update should return HTTP 200.').toBe(200);
        const updatedProduct = await updateResponse.json();
        expect(updatedProduct.id).toBe(createdProduct.id);
        expect(updatedProduct.title).toBe(UPDATED_PRODUCT_DATA.title);
        expect(updatedProduct.price).toBe(UPDATED_PRODUCT_DATA.price);

        const deleteRoute = Routes.DELETE_PRODUCT.replace('{id}', String(createdProduct.id));
        const deleteResponse = await request.delete(`${BASE_URL}${deleteRoute}`);
        expect(deleteResponse.status(), 'Workflow product deletion should return HTTP 200.').toBe(200);
    });
});