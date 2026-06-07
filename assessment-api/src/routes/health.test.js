import { describe, it, expect } from 'vitest';
import request from 'supertest';
import app from '../app.js';

describe('Health API', () => {
  it('GET /api/health should return 200 and healthy status', async () => {
    const res = await request(app).get('/api/health');
    expect(res.status).toBe(200);
    expect(res.body.status).toBe('healthy');
  });
});
