const request = require("supertest");
const app = require("./app");
const db = require("./db");

beforeEach(async () => {
  // Before each test, set up the database with sample data
  await db.query("INSERT INTO companies (code, name, description) VALUES ('testco', 'Test Company', 'Test Description')");
});

afterEach(async () => {
  // After each test, clear the sample data
  await db.query("DELETE FROM companies WHERE code='testco'");
});

afterAll(async () => {
  // Close the database connection after all tests
  await db.end();
});

describe("GET /companies", () => {
  test("Gets a list of companies", async () => {
    const response = await request(app).get('/companies');
    expect(response.statusCode).toBe(200);
    expect(response.body.companies).toHaveLength(3);
    expect(response.body.companies[2]).toEqual({
        code: 'testco',
        name: 'Test Company'
      });
  });
});

describe("GET /companies/:code", () => {
    test("Gets a company by code", async () => {
      const response = await request(app).get('/companies/testco');
      expect(response.statusCode).toBe(200);
      expect(response.body.company).toHaveProperty("code");
      expect(response.body.company).toHaveProperty("industries");
      // Add more assertions as needed
    });
  });
  

describe("POST /companies", () => {
    test("Creates a new company with a slugified code", async () => {
        const response = await request(app)
            .post('/companies')
            .send({ name: "The Tech Corp!", description: "Tech Innovators" });

        expect(response.statusCode).toBe(201);
        expect(response.body.company).toEqual({
            code: 'the-tech-corp', // This should match the slugified version of "The Tech Corp!"
            name: 'The Tech Corp!',
            description: 'Tech Innovators'
        });

        // Cleanup: delete the added company
        await db.query("DELETE FROM companies WHERE code='the-tech-corp'");
    });
});

describe("POST /industries", () => {
    test("Creates a new industry", async () => {
      const timestamp = Date.now();
      const response = await request(app).post('/industries').send({
        code: `testind-${timestamp}`,
        industry: `Test Industry ${timestamp}`
      });
      expect(response.statusCode).toBe(201);
      // Add more assertions as needed
    });
});
  
  describe("POST /industries/company_industries", () => {
    test("Associates a company with an industry", async () => {
      const response = await request(app).post('/industries/company_industries').send({
        company_code: "testco",
        industry_code: "testind"
      });
      expect(response.statusCode).toBe(200);
      expect(response.body.message).toBe("Associated!");
      // Add more assertions as needed
    });
});
