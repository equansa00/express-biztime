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


