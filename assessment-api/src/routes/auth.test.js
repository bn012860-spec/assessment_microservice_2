import { describe, it, expect } from 'vitest';
import request from 'supertest';
import app from '../app.js';

describe('Auth API', () => {
  const testUser = {
    name: 'Test User',
    email: 'test@example.com',
    password: 'password123',
    role: 'student'
  };

  it('POST /api/auth/register should create a new user', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send(testUser);
    
    expect(res.status).toBe(201);
    expect(res.body.user).toBeDefined();
    expect(res.body.user.email).toBe(testUser.email);
    expect(res.body.token).toBeDefined();
  });

  it('POST /api/auth/login should authenticate a user', async () => {
    // First register
    await request(app)
      .post('/api/auth/register')
      .send(testUser);

    // Then login
    const res = await request(app)
      .post('/api/auth/login')
      .send({
        email: testUser.email,
        password: testUser.password
      });

    expect(res.status).toBe(200);
    expect(res.body.token).toBeDefined();
    expect(res.body.user.email).toBe(testUser.email);
  });

  it('POST /api/auth/login should fail with wrong credentials', async () => {
    // First register
    await request(app)
      .post('/api/auth/register')
      .send(testUser);

    // Then login with wrong password
    const res = await request(app)
      .post('/api/auth/login')
      .send({
        email: testUser.email,
        password: 'wrongpassword'
      });

    if (res.status !== 401) {
      console.log('Login failed as expected but with status:', res.status, res.body);
    }

    expect(res.status).toBe(401);
    expect(res.body.message || res.body.msg).toBeDefined();
  });
});
