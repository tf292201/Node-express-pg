process.env.NODE_ENV = 'test';

const request = require('supertest');
const app = require('../app');
const db = require('../db');

beforeEach(async () => {
  // Clear the invoices table before each test
  await db.query('DELETE FROM invoices');
});

afterAll(async () => {
  // Close the database connection after all tests
  await db.end();
});

describe('GET /invoices', () => {
  test('should return an array of invoices', async () => {
    const response = await request(app).get('/invoices');
    expect(response.status).toBe(200);
    expect(response.body.invoices).toEqual([]);
  });
});

describe('GET /invoices/:id', () => {
  test('should return an invoice with the specified id', async () => {
    // Insert an invoice into the database
    const invoice = await db.query('INSERT INTO invoices (comp_code, amt) VALUES ($1, $2) RETURNING *', ['ABC', 100]);
    const invoiceId = invoice.rows[0].id;

    const response = await request(app).get(`/invoices/${invoiceId}`);
    expect(response.status).toBe(200);
    expect(response.body.invoice).toEqual({
      id: invoiceId,
      comp_code: 'ABC',
      amt: 100
    });
  });

  test('should return a 404 error if the invoice does not exist', async () => {
    const response = await request(app).get('/invoices/123');
    expect(response.status).toBe(404);
    expect(response.body.message).toBe('No such invoice: 123');
  });
});

describe('POST /invoices', () => {
  test('should create a new invoice', async () => {
    const response = await request(app)
      .post('/invoices')
      .send({ comp_code: 'XYZ', amt: 200 });

    expect(response.status).toBe(201);
    expect(response.body.invoice).toEqual({
      id: expect.any(Number),
      comp_code: 'XYZ',
      amt: 200
    });
  });
});

describe('PUT /invoices/:id', () => {
  test('should update an existing invoice', async () => {
    // Insert an invoice into the database
    const invoice = await db.query('INSERT INTO invoices (comp_code, amt) VALUES ($1, $2) RETURNING *', ['ABC', 100]);
    const invoiceId = invoice.rows[0].id;

    const response = await request(app)
      .put(`/invoices/${invoiceId}`)
      .send({ amt: 150 });

    expect(response.status).toBe(200);
    expect(response.body.invoice).toEqual({
      id: invoiceId,
      comp_code: 'ABC',
      amt: 150
    });
  });

  test('should return a 404 error if the invoice does not exist', async () => {
    const response = await request(app)
      .put('/invoices/123')
      .send({ amt: 150 });

    expect(response.status).toBe(404);
    expect(response.body.message).toBe('No such invoice: 123');
  });
});

describe('DELETE /invoices/:id', () => {
  test('should delete an existing invoice', async () => {
    // Insert an invoice into the database
    const invoice = await db.query('INSERT INTO invoices (comp_code, amt) VALUES ($1, $2) RETURNING *', ['ABC', 100]);
    const invoiceId = invoice.rows[0].id;

    const response = await request(app).delete(`/invoices/${invoiceId}`);
    expect(response.status).toBe(200);
    expect(response.body.status).toBe('deleted');
  });

  test('should return a 404 error if the invoice does not exist', async () => {
    const response = await request(app).delete('/invoices/123');
    expect(response.status).toBe(404);
    expect(response.body.message).toBe('No such invoice: 123');
  });
});