import path from 'node:path';
import Ajv from 'ajv';
import { test, expect } from '@playwright/test';
import dotenv from 'dotenv';
import { Routes } from '../../api/endpoints/routes';
import { DataProvider } from '../../utils/DataReader';

dotenv.config();

const BASE_URL = process.env.API_BASE_URL || Routes.BASE_URL;
const CART_ID = Number(process.env.CART_ID ?? 1);
const USER_ID = Number(process.env.USER_ID ?? 1);
const PRODUCT_ID = Number(process.env.PRODUCT_ID ?? 1);
const LIMIT = Number(process.env.LIMIT ?? 3);
const START_DATE = process.env.START_DATE || '2019-12-10';
const END_DATE = process.env.END_DATE || '2020-10-10';
const CART_DATA = {
    userId: USER_ID,
    date: START_DATE,
    products: [{ productId: PRODUCT_ID, quantity: 1 }],
};
const UPDATED_CART_DATA = {
    ...CART_DATA,
    products: [{ productId: PRODUCT_ID, quantity: 3 }],
};

test.describe('FakeStore carts API', () => {
    test('GET - All carts @master @sanity @api', async ({ request }) => {
        const response = await request.get(`${BASE_URL}${Routes.GET_ALL_CARTS}`);
        expect(response.status(), 'Getting all carts should return HTTP 200.').toBe(200);

        const carts = await response.json();
        expect(Array.isArray(carts)).toBe(true);
        expect(carts.length, 'The cart response should not be empty.').toBeGreaterThan(0);
    });

    test('GET - Cart by ID @master @sanity @api', async ({ request }) => {
        const route = Routes.GET_CART_BY_ID.replace('{id}', String(CART_ID));
        const response = await request.get(`${BASE_URL}${route}`);
        expect(response.status(), 'Getting a cart by ID should return HTTP 200.').toBe(200);

        const cart = await response.json();
        expect(cart.id).toBe(CART_ID);
        expect(typeof cart.userId).toBe('number');
        expect(Array.isArray(cart.products)).toBe(true);
    });

    test('GET - Carts by date range @master @regression @api', async ({ request }) => {
        const route = Routes.GET_CARTS_BY_DATE_RANGE
            .replace('{startdate}', encodeURIComponent(START_DATE))
            .replace('{enddate}', encodeURIComponent(END_DATE));
        const response = await request.get(`${BASE_URL}${route}`);
        expect(response.status(), 'Getting carts by date range should return HTTP 200.').toBe(200);

        const carts = await response.json();
        expect(Array.isArray(carts)).toBe(true);
        const startTime = new Date(`${START_DATE}T00:00:00.000Z`).getTime();
        const endTime = new Date(`${END_DATE}T23:59:59.999Z`).getTime();
        for (const cart of carts) {
            const cartTime = Date.parse(cart.date);
            expect(cartTime, 'Each cart should have a parseable date.').not.toBeNaN();
            expect(cartTime).toBeGreaterThanOrEqual(startTime);
            expect(cartTime).toBeLessThanOrEqual(endTime);
        }
    });

    test('GET - Carts by user @master @sanity @api', async ({ request }) => {
        const route = Routes.GET_USER_CART.replace('{userId}', String(USER_ID));
        const response = await request.get(`${BASE_URL}${route}`);
        expect(response.status(), 'Getting carts by user should return HTTP 200.').toBe(200);

        const carts = await response.json();
        expect(Array.isArray(carts)).toBe(true);
        expect(carts.length, 'The configured user should have carts.').toBeGreaterThan(0);
        expect(carts.every((cart: { userId: number }) => cart.userId === USER_ID)).toBe(true);
    });

    test('GET - Carts with limit @master @sanity @api', async ({ request }) => {
        const route = Routes.GET_CARTS_WITH_LIMIT.replace('{limit}', String(LIMIT));
        const response = await request.get(`${BASE_URL}${route}`);
        expect(response.status(), 'Getting carts with a limit should return HTTP 200.').toBe(200);

        const carts = await response.json();
        expect(Array.isArray(carts)).toBe(true);
        expect(carts.length, 'The cart count should match LIMIT.').toBe(LIMIT);
    });

    test('GET - Carts sorted ascending @master @regression @api', async ({ request }) => {
        const route = Routes.GET_CARTS_SORTED.replace('{order}', 'asc');
        const response = await request.get(`${BASE_URL}${route}`);
        expect(response.status(), 'Ascending cart sort should return HTTP 200.').toBe(200);

        const carts = await response.json();
        const cartIds = carts.map((cart: { id: number }) => cart.id);
        expect(cartIds).toEqual([...cartIds].sort((firstId: number, secondId: number) => firstId - secondId));
    });

    test('GET - Carts sorted descending @master @regression @api', async ({ request }) => {
        const route = Routes.GET_CARTS_SORTED.replace('{order}', 'desc');
        const response = await request.get(`${BASE_URL}${route}`);
        expect(response.status(), 'Descending cart sort should return HTTP 200.').toBe(200);

        const carts = await response.json();
        const cartIds = carts.map((cart: { id: number }) => cart.id);
        expect(cartIds).toEqual([...cartIds].sort((firstId: number, secondId: number) => secondId - firstId));
    });

    test('POST - Create cart @master @regression @api', async ({ request }) => {
        const response = await request.post(`${BASE_URL}${Routes.CREATE_CART}`, { data: CART_DATA });
        expect(response.status(), 'Creating a cart should return HTTP 201.').toBe(201);

        const createdCart = await response.json();
        expect(typeof createdCart.id).toBe('number');
        expect(createdCart.userId).toBe(CART_DATA.userId);
        expect(createdCart.products).toEqual(CART_DATA.products);
    });

    test('PUT - Update cart @master @regression @api', async ({ request }) => {
        const route = Routes.UPDATE_CART.replace('{id}', String(CART_ID));
        const response = await request.put(`${BASE_URL}${route}`, { data: UPDATED_CART_DATA });
        expect(response.status(), 'Updating a cart should return HTTP 200.').toBe(200);

        const updatedCart = await response.json();
        expect(updatedCart.id).toBe(CART_ID);
        expect(updatedCart.userId).toBe(UPDATED_CART_DATA.userId);
        expect(updatedCart.products).toEqual(UPDATED_CART_DATA.products);
    });

    test('DELETE - Cart @master @regression @api', async ({ request }) => {
        const route = Routes.DELETE_CART.replace('{id}', String(CART_ID));
        const response = await request.delete(`${BASE_URL}${route}`);
        expect(response.status(), 'Deleting a cart should return HTTP 200.').toBe(200);

        const deletedCart = await response.json();
        expect(deletedCart.id).toBe(CART_ID);
    });

    test('GET - Cart response schema @master @regression @api', async ({ request }) => {
        const route = Routes.GET_CART_BY_ID.replace('{id}', String(CART_ID));
        const response = await request.get(`${BASE_URL}${route}`);
        expect(response.status(), 'Getting a cart for schema validation should return HTTP 200.').toBe(200);

        const cart = await response.json();
        const schemaPath = path.resolve(__dirname, '../../api/schemas/cart_api_schema.json');
        const schema = DataProvider.readJson(schemaPath);
        const ajv = new Ajv();
        const validate = ajv.compile(schema);
        const isValid = validate(cart);
        expect(isValid, `Cart schema validation failed: ${ajv.errorsText(validate.errors)}`).toBe(true);
    });

    test('E2E - Cart CRUD workflow @master @regression @api', async ({ request }) => {
        const createResponse = await request.post(`${BASE_URL}${Routes.CREATE_CART}`, { data: CART_DATA });
        expect(createResponse.status(), 'Workflow cart creation should return HTTP 201.').toBe(201);
        const createdCart = await createResponse.json();
        expect(typeof createdCart.id).toBe('number');
        expect(createdCart.userId).toBe(CART_DATA.userId);
        expect(createdCart.products).toEqual(CART_DATA.products);

        const updateRoute = Routes.UPDATE_CART.replace('{id}', String(createdCart.id));
        const updateResponse = await request.put(`${BASE_URL}${updateRoute}`, { data: UPDATED_CART_DATA });
        expect(updateResponse.status(), 'Workflow cart update should return HTTP 200.').toBe(200);
        const updatedCart = await updateResponse.json();
        expect(updatedCart.id).toBe(createdCart.id);
        expect(updatedCart.userId).toBe(UPDATED_CART_DATA.userId);
        expect(updatedCart.products).toEqual(UPDATED_CART_DATA.products);

        const deleteRoute = Routes.DELETE_CART.replace('{id}', String(createdCart.id));
        const deleteResponse = await request.delete(`${BASE_URL}${deleteRoute}`);
        expect(deleteResponse.status(), 'Workflow cart deletion should return HTTP 200.').toBe(200);
    });
});