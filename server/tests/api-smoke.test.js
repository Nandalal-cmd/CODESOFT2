const test = require('node:test');
const assert = require('node:assert/strict');
const request = require('supertest');
const app = require('../index');

test('GET /api/health returns ok', async () => {
  const res = await request(app).get('/api/health');

  assert.equal(res.statusCode, 200);
  assert.equal(res.body.status, 'ok');
  assert.ok(res.body.timestamp);
});

test('GET /api/orders requires auth', async () => {
  const res = await request(app).get('/api/orders');

  assert.equal(res.statusCode, 401);
  assert.match(res.body.error, /authorization|token|session/i);
});
