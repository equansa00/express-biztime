const request = require('supertest');
const app = require('./app');
const db = require("./db");

describe('Company and Industry operations', () => {
    // Set up the necessary data before each test
    beforeEach(async () => {
        await db.query(`INSERT INTO companies (code, name, description) VALUES ('testco', 'Test Company', 'Test Description')`);
        await db.query(`INSERT INTO industries (code, industry) VALUES ('testind', 'Test Industry')`);
    });

    // Remember to clean up after each test to avoid potential conflicts
    afterEach(async () => {
        await db.query("DELETE FROM companies WHERE code='testco'");
        await db.query("DELETE FROM industries WHERE code='testind'");
    });

    test("Creates a new industry", async () => {
        const timestamp = Date.now();
        const response = await request(app).post('/industries').send({
            code: `testind-${timestamp}`,
            industry: `Test Industry ${timestamp}`
        });
        expect(response.statusCode).toBe(201);
        
    });

    // Associate the company with the industry
    test("Associates a company with an industry", async () => {
        // Since 'testco' company and 'testind' industry are created in beforeEach, 
        // we can directly associate them
        const response = await request(app).post('/industries/company_industries').send({
            company_code: "testco",
            industry_code: "testind"
        });
        expect(response.statusCode).toBe(200);
        expect(response.body.message).toBe("Associated!");
    });

    // Insert a new company
    test("Creates a new company with a slugified code", async () => {
        const response = await request(app)
            .post('/companies')
            .send({ name: "The Tech Corp!", description: "Tech Innovators" });
        expect(response.statusCode).toBe(201);
        expect(response.body.company).toEqual({
            code: 'the-tech-corp',
            name: 'The Tech Corp!',
            description: 'Tech Innovators'
        });
        // Cleanup: delete the added company
        await db.query("DELETE FROM companies WHERE code='the-tech-corp'");
    });

    // Create a new industry

    // Update the company details
    test("Updates a company", async () => {
        const response = await request(app)
            .put('/companies/testco')
            .send({ name: "Updated Test Company", description: "Updated Test Description" });
        expect(response.statusCode).toBe(200);
        expect(response.body.company).toEqual({
            code: 'testco',
            name: 'Updated Test Company',
            description: 'Updated Test Description'
        });
    });

    // Delete the company
    test("Deletes a company", async () => {
        const response = await request(app).delete('/companies/testco');
        expect(response.statusCode).toBe(200);
        expect(response.body).toEqual({ status: 'deleted' });
    });

});

describe('GET /companies/:code', () => {

    // Set up the necessary data before each test
    beforeEach(async () => {
        await db.query(`INSERT INTO companies (code, name, description) VALUES ('testco', 'Test Company', 'Test Description')`);
        await db.query(`INSERT INTO industries (code, industry) VALUES ('testind', 'Test Industry')`);
        await db.query(`INSERT INTO company_industries (company_code, industry_code) VALUES ('testco', 'testind')`);
        await db.query(`INSERT INTO invoices (comp_code, amt) VALUES ('testco', 100)`);
    });

    // Clean up after each test
    afterEach(async () => {
        await db.query("DELETE FROM company_industries WHERE company_code='testco'");
        await db.query("DELETE FROM industries WHERE code='testind'");
        await db.query("DELETE FROM invoices WHERE comp_code='testco'");
        await db.query("DELETE FROM companies WHERE code='testco'");
    });

    it('should return detailed information about a company', async () => {
        const response = await request(app).get('/companies/testco');

        expect(response.statusCode).toBe(200);
        expect(response.body.company).toHaveProperty('code', 'testco');
        expect(response.body.company).toHaveProperty('name', 'Test Company');
        expect(response.body.company).toHaveProperty('description', 'Test Description');
        expect(response.body.company.invoices).toHaveLength(1);
        expect(response.body.company.invoices[0]).toHaveProperty('id');
        expect(response.body.company.industries).toContain('Test Industry');
    });

    it('should return 404 for non-existing company', async () => {
        const response = await request(app).get('/companies/nonexistentco');

        expect(response.statusCode).toBe(404);
    });
});

// Add this to close the database connection after all tests are done
afterAll(async () => {
  await db.end();
});
