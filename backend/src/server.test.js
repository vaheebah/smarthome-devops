const request = require('supertest');
const mongoose = require('mongoose');
const app = require('./server');

beforeAll(async () => {
  const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/smarthome_test';
  await mongoose.connect(MONGO_URI);
});

afterAll(async () => {
  await mongoose.connection.dropDatabase();
  await mongoose.connection.close();
});

describe('Health Check', () => {
  test('GET /api/health returns OK', async () => {
    const res = await request(app).get('/api/health');
    expect(res.status).toBe(200);
    expect(res.body.status).toBe('OK');
  });
});

describe('Rooms API', () => {
  test('GET /api/rooms returns array', async () => {
    const res = await request(app).get('/api/rooms');
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
  });

  test('POST /api/rooms creates room', async () => {
    const res = await request(app)
      .post('/api/rooms')
      .send({ name: 'TestRoom', icon: '🧪', floor: 1 });
    expect(res.status).toBe(201);
    expect(res.body.name).toBe('TestRoom');
  });
});

describe('Devices API', () => {
  let deviceId;

  test('POST /api/devices creates device', async () => {
    const res = await request(app)
      .post('/api/devices')
      .send({ name: 'Test Light', type: 'light', room: 'TestRoom', icon: '💡' });
    expect(res.status).toBe(201);
    expect(res.body.name).toBe('Test Light');
    deviceId = res.body._id;
  });

  test('GET /api/devices returns array', async () => {
    const res = await request(app).get('/api/devices');
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
  });

  test('PATCH /api/devices/:id/toggle toggles status', async () => {
    const res = await request(app).patch(`/api/devices/${deviceId}/toggle`);
    expect(res.status).toBe(200);
    expect(typeof res.body.status).toBe('boolean');
  });

  test('DELETE /api/devices/:id deletes device', async () => {
    const res = await request(app).delete(`/api/devices/${deviceId}`);
    expect(res.status).toBe(200);
  });
});

describe('Readings API', () => {
  test('GET /api/readings/latest returns array', async () => {
    const res = await request(app).get('/api/readings/latest');
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
  });
});
