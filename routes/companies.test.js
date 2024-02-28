process.env.NODE_ENV = 'test';

const request = require('supertest');
const app = require('../app');
const db = require('../db');

beforeEach(async () => {
  // Clear the companies table before each test
  await db.query('DELETE FROM companies');
});

afterAll(async () => {
  // Close the database connection after all tests
  await db.end();
});

describe('GET /companies', () => {
  test('should return an array of companies', async () => {
    const response = await request(app).get('/companies');
    expect(response.status).toBe(200);
    expect(response.body.companies).toEqual([]);
  });
});

describe('GET /companies/:code', () => {
  test('should return a company with the specified code', async () => {
    // Insert a company into the database
    await db.query('INSERT INTO companies (code, name, description) VALUES ($1, $2, $3)', ['ABC', 'Company ABC', 'Description ABC']);

    const response = await request(app).get('/companies/ABC');
    expect(response.status).toBe(200);
    expect(response.body.company).toEqual({
      code: 'ABC',
      name: 'Company ABC',
      description: 'Description ABC',
      invoices: []
    });
  });

  test('should return a 404 error if the company does not exist', async () => {
    const response = await request(app).get('/companies/XYZ');
    expect(response.status).toBe(404);
    expect(response.body.message).toBe('No such company: XYZ');
  });
});

describe('POST /companies', () => {
  test('should create a new company', async () => {
    const response = await request(app)
      .post('/companies')
      .send({ code: 'XYZ', name: 'Company XYZ', description: 'Description XYZ' });

    expect(response.status).toBe(201);
    expect(response.body.company).toEqual({
      code: 'XYZ',
      name: 'Company XYZ',
      description: 'Description XYZ'
    });
  });
});

describe('PUT /companies/:code', () => {
  test('should update an existing company', async () => {
    // Insert a company into the database
    await db.query('INSERT INTO companies (code, name, description) VALUES ($1, $2, $3)', ['ABC', 'Company ABC', 'Description ABC']);

    const response = await request(app)
      .put('/companies/ABC')
      .send({ name: 'Updated Company ABC', description: 'Updated Description ABC' });

    expect(response.status).toBe(200);
    expect(response.body.company).toEqual({
      code: 'ABC',
      name: 'Updated Company ABC',
      description: 'Updated Description ABC'
    });
  });

  test('should return a 404 error if the company does not exist', async () => {
    const response = await request(app)
      .put('/companies/XYZ')
      .send({ name: 'Updated Company XYZ', description: 'Updated Description XYZ' });

    expect(response.status).toBe(404);
    expect(response.body.message).toBe('No such company: XYZ');
  });
});

describe('DELETE /companies/:code', () => {
  test('should delete an existing company', async () => {
    // Insert a company into the database
    await db.query('INSERT INTO companies (code, name, description) VALUES ($1, $2, $3)', ['ABC', 'Company ABC', 'Description ABC']);

    const response = await request(app).delete('/companies/ABC');
    expect(response.status).toBe(200);
    expect(response.body.status).toBe('deleted');
  });

  test('should return a 404 error if the company does not exist', async () => {
    const response = await request(app).delete('/companies/XYZ');
    expect(response.status).toBe(404);
    expect(response.body.message).toBe('No such company: XYZ');
  });
});