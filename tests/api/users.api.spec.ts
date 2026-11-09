import path from 'node:path';
import Ajv from 'ajv';
import { test, expect } from '@playwright/test';
import dotenv from 'dotenv';
import { Routes } from '../../api/endpoints/routes';
import { DataProvider } from '../../utils/DataReader';

dotenv.config();

const BASE_URL = process.env.API_BASE_URL || Routes.BASE_URL;
const USER_ID = Number(process.env.USER_ID ?? 1);
const LIMIT = Number(process.env.LIMIT ?? 3);
const USER_DATA = {
    email: 'playwright.api.user@example.com',
    username: 'playwright-api-user',
    password: 'playwright-api-password',
    name: { firstname: 'Playwright', lastname: 'ApiTest' },
    address: {
        city: 'Test City',
        street: 'API Test Street',
        number: 42,
        zipcode: '10001',
        geolocation: { lat: '0', long: '0' },
    },
    phone: '5550100100',
};
const UPDATED_USER_DATA = {
    ...USER_DATA,
    username: 'updated-playwright-api-user',
    name: { firstname: 'Updated', lastname: 'ApiTest' },
};

test.describe('FakeStore users API', () => {
    test('GET - All users @master @sanity @api', async ({ request }) => {
        const response = await request.get(`${BASE_URL}${Routes.GET_ALL_USERS}`);
        expect(response.status(), 'Getting all users should return HTTP 200.').toBe(200);

        const users = await response.json();
        expect(Array.isArray(users)).toBe(true);
        expect(users.length, 'The user response should not be empty.').toBeGreaterThan(0);
    });

    test('GET - User by ID @master @sanity @api', async ({ request }) => {
        const route = Routes.GET_USER_BY_ID.replace('{id}', String(USER_ID));
        const response = await request.get(`${BASE_URL}${route}`);
        expect(response.status(), 'Getting a user by ID should return HTTP 200.').toBe(200);

        const user = await response.json();
        expect(user.id).toBe(USER_ID);
        expect(typeof user.email).toBe('string');
        expect(typeof user.username).toBe('string');
    });

    test('GET - Users with limit @master @sanity @api', async ({ request }) => {
        const route = Routes.GET_USERS_WITH_LIMIT.replace('{limit}', String(LIMIT));
        const response = await request.get(`${BASE_URL}${route}`);
        expect(response.status(), 'Getting users with a limit should return HTTP 200.').toBe(200);

        const users = await response.json();
        expect(Array.isArray(users)).toBe(true);
        expect(users.length, 'The user count should match LIMIT.').toBe(LIMIT);
    });

    test('GET - Users sorted ascending @master @regression @api', async ({ request }) => {
        const route = Routes.GET_USERS_SORTED.replace('{order}', 'asc');
        const response = await request.get(`${BASE_URL}${route}`);
        expect(response.status(), 'Ascending user sort should return HTTP 200.').toBe(200);

        const users = await response.json();
        const userIds = users.map((user: { id: number }) => user.id);
        expect(userIds).toEqual([...userIds].sort((firstId: number, secondId: number) => firstId - secondId));
    });

    test('GET - Users sorted descending @master @regression @api', async ({ request }) => {
        const route = Routes.GET_USERS_SORTED.replace('{order}', 'desc');
        const response = await request.get(`${BASE_URL}${route}`);
        expect(response.status(), 'Descending user sort should return HTTP 200.').toBe(200);

        const users = await response.json();
        const userIds = users.map((user: { id: number }) => user.id);
        expect(userIds).toEqual([...userIds].sort((firstId: number, secondId: number) => secondId - firstId));
    });

    test('POST - Create user @master @regression @api', async ({ request }) => {
        const response = await request.post(`${BASE_URL}${Routes.CREATE_USER}`, { data: USER_DATA });
        expect(response.status(), 'Creating a user should return HTTP 201.').toBe(201);

        const createdUser = await response.json();
        expect(typeof createdUser.id).toBe('number');
    });

    test('PUT - Update user @master @regression @api', async ({ request }) => {
        const route = Routes.UPDATE_USER.replace('{id}', String(USER_ID));
        const response = await request.put(`${BASE_URL}${route}`, { data: UPDATED_USER_DATA });
        expect(response.status(), 'Updating a user should return HTTP 200.').toBe(200);

        const updatedUser = await response.json();
        expect(updatedUser.username).toBe(UPDATED_USER_DATA.username);
        expect(updatedUser.name).toEqual(UPDATED_USER_DATA.name);
        expect(updatedUser.email).toBe(UPDATED_USER_DATA.email);
    });

    test('DELETE - User @master @regression @api', async ({ request }) => {
        const route = Routes.DELETE_USER.replace('{id}', String(USER_ID));
        const response = await request.delete(`${BASE_URL}${route}`);
        expect(response.status(), 'Deleting a user should return HTTP 200.').toBe(200);

        const deletedUser = await response.json();
        expect(deletedUser.id).toBe(USER_ID);
    });

    test('GET - User response schema @master @regression @api', async ({ request }) => {
        const route = Routes.GET_USER_BY_ID.replace('{id}', String(USER_ID));
        const response = await request.get(`${BASE_URL}${route}`);
        expect(response.status(), 'Getting a user for schema validation should return HTTP 200.').toBe(200);

        const user = await response.json();
        const schemaPath = path.resolve(__dirname, '../../api/schemas/user_api_schema.json');
        const schema = DataProvider.readJson(schemaPath);
        const ajv = new Ajv();
        const validate = ajv.compile(schema);
        const isValid = validate(user);
        expect(isValid, `User schema validation failed: ${ajv.errorsText(validate.errors)}`).toBe(true);
    });

    test('E2E - User CRUD workflow @master @regression @api', async ({ request }) => {
        const createResponse = await request.post(`${BASE_URL}${Routes.CREATE_USER}`, { data: USER_DATA });
        expect(createResponse.status(), 'Workflow user creation should return HTTP 201.').toBe(201);
        const createdUser = await createResponse.json();
        expect(typeof createdUser.id).toBe('number');

        const updateRoute = Routes.UPDATE_USER.replace('{id}', String(createdUser.id));
        const updateResponse = await request.put(`${BASE_URL}${updateRoute}`, { data: UPDATED_USER_DATA });
        expect(updateResponse.status(), 'Workflow user update should return HTTP 200.').toBe(200);
        const updatedUser = await updateResponse.json();
        expect(updatedUser.username).toBe(UPDATED_USER_DATA.username);
        expect(updatedUser.name).toEqual(UPDATED_USER_DATA.name);

        const deleteRoute = Routes.DELETE_USER.replace('{id}', String(createdUser.id));
        const deleteResponse = await request.delete(`${BASE_URL}${deleteRoute}`);
        expect(deleteResponse.status(), 'Workflow user deletion should return HTTP 200.').toBe(200);
    });
});