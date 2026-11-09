import { test, expect } from '@playwright/test';
import dotenv from 'dotenv';
import { Routes } from '../../api/endpoints/routes';
import { RandomDataUtil } from '../../utils/dataGenerator';

dotenv.config();

const BASE_URL = process.env.API_BASE_URL || Routes.BASE_URL;
const USER_ID = Number(process.env.USER_ID);

test.describe('FakeStore authentication API', () => {
    test('POST - Successful login @master @sanity @api', async ({ request }) => {
        expect(Number.isInteger(USER_ID), 'USER_ID must be configured for the successful login test.').toBe(true);

        const userRoute = Routes.GET_USER_BY_ID.replace('{id}', String(USER_ID));
        const userResponse = await request.get(`${BASE_URL}${userRoute}`);
        expect(userResponse.status(), 'Loading the configured user should return HTTP 200.').toBe(200);

        const user = await userResponse.json();
        expect(user.id).toBe(USER_ID);
        expect(typeof user.username).toBe('string');
        expect(user.username.length).toBeGreaterThan(0);
        expect(typeof user.password).toBe('string');
        expect(user.password.length).toBeGreaterThan(0);

        const response = await request.post(`${BASE_URL}${Routes.AUTH_LOGIN}`, {
            data: { username: user.username, password: user.password },
        });

        expect(response.status(), 'A successful login should return HTTP 201.').toBe(201);

        const responseBody = await response.json();
        expect(responseBody).toHaveProperty('token');
        expect(typeof responseBody.token, 'The login token should be a string.').toBe('string');
        expect(responseBody.token.length, 'The login token should not be empty.').toBeGreaterThan(0);
    });

    test('POST - Invalid login @master @regression @api', async ({ request }) => {
        const invalidCredentials = RandomDataUtil.generateInvalidLoginPayload();
        const response = await request.post(`${BASE_URL}${Routes.AUTH_LOGIN}`, {
            data: invalidCredentials,
        });

        expect(response.status(), 'Invalid credentials should return HTTP 401.').toBe(401);
        const responseText = await response.text();
        expect(responseText).toBe('username or password is incorrect');
    });
});