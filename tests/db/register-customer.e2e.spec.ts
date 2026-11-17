import dotenv from 'dotenv';
import { test, expect } from '../../fixtures/pageFixtures';
import { RandomDataUtil } from '../../utils/dataGenerator';
import { executeQuery } from '../../utils/dbClient';

dotenv.config();

type CustomerRecord = {
    firstname: string;
    lastname: string;
    email: string;
    status: number | string;
    date_added?: string | Date | null;
};

test('Register customer and verify Admin and database records @master @regression @db @web @e2e', async ({
    page,
    dbTestHomePage,
    registerPage,
    adminCustomersPage,
}) => {
    const appUrl = process.env.DB_TEST_WEB_APP_URL;
    const adminUsername = process.env.ADMIN_USERNAME;
    const adminPassword = process.env.ADMIN_PASSWORD;

    if (!appUrl) {
        throw new Error('DB_TEST_WEB_APP_URL must be configured for database end-to-end tests.');
    }
    if (!adminUsername || !adminPassword) {
        throw new Error('ADMIN_USERNAME and ADMIN_PASSWORD must be configured for database end-to-end tests.');
    }
    if (!process.env.DB_HOST || !process.env.DB_USER || !process.env.DB_NAME) {
        throw new Error('DB_HOST, DB_USER, and DB_NAME must be configured for database end-to-end tests.');
    }

    const adminUrl = process.env.ADMIN_APP_URL
        || new URL('admin/index.php', appUrl.endsWith('/') ? appUrl : `${appUrl}/`).toString();
    const customer = RandomDataUtil.generateCustomerRegistration();

    await test.step('Register a new customer through the storefront', async () => {
        await dbTestHomePage.openRegisterPage();
        expect(await registerPage.isRegistrationPageExists()).toBeTruthy();
        await registerPage.register(customer);
        expect(await registerPage.isAccountCreated()).toBeTruthy();
        await expect(page.getByRole('heading', { name: 'Your Account Has Been Created!', exact: true })).toBeVisible();
    });

    await test.step('Find and validate the customer in the Admin Portal', async () => {
        await adminCustomersPage.login(adminUrl, adminUsername, adminPassword);
        await adminCustomersPage.openCustomersPage();
        await adminCustomersPage.searchCustomerByEmail(customer.email);

        const customerRow = await adminCustomersPage.getCustomerRowText(customer.email);
        expect(customerRow, 'The Admin customer row should contain the registered first name.').toContain(customer.firstName);
        expect(customerRow, 'The Admin customer row should contain the registered last name.').toContain(customer.lastName);
        expect(customerRow, 'The Admin customer row should contain the registered email.').toContain(customer.email);
        expect(customerRow, 'A newly registered customer should be enabled in the Admin Portal.').toContain('Enabled');
    });

    await test.step('Validate the customer record in MySQL', async () => {
        const records = await executeQuery(
            'SELECT * FROM oc_customer WHERE email = ?',
            [customer.email],
        ) as CustomerRecord[];

        expect(records, 'Exactly one database customer should match the registered email.').toHaveLength(1);
        const [record] = records;
        expect(record.firstname, 'The database first name should match the registered customer.').toBe(customer.firstName);
        expect(record.lastname, 'The database last name should match the registered customer.').toBe(customer.lastName);
        expect(record.email, 'The database email should match the registered customer.').toBe(customer.email);
        expect(Number(record.status), 'A newly registered customer should have status 1.').toBe(1);

        if ('date_added' in record) {
            const dateAdded = record.date_added instanceof Date
                ? record.date_added
                : new Date(record.date_added ?? '');
            expect(Number.isNaN(dateAdded.getTime()), 'The database date_added value should be valid.').toBe(false);
        }
    });
});
