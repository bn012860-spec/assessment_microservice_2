import { describe, it, expect, beforeEach } from 'vitest';
import request from 'supertest';
import app from '../app.js';
import Problem from '../../models/Problem.mjs';
import Assessment from '../../models/Assessment.mjs';

describe('Assessments API', () => {
  let adminToken;
  let adminId;
  let studentToken;
  let problemId;

  beforeEach(async () => {
    // Create admin user
    const adminRes = await request(app)
      .post('/api/auth/register')
      .send({
        name: 'Admin User',
        email: `admin-${Date.now()}@test.com`,
        password: 'password123',
        role: 'admin'
      });
    adminToken = adminRes.body.token;
    adminId = adminRes.body.user.id;

    // Create student user
    const studentRes = await request(app)
      .post('/api/auth/register')
      .send({
        name: 'Student User',
        email: `student-${Date.now()}@test.com`,
        password: 'password123',
        role: 'student'
      });
    studentToken = studentRes.body.token;

    // Seed a problem
    const problem = await Problem.create({
      title: 'Test Problem',
      description: 'Test Description',
      difficulty: 'Easy',
      functionName: 'solve',
      parameters: [{ name: 'n', type: 'number' }],
      returnType: 'number',
      testCases: [{ inputs: [1], expected: 1, isSample: true }],
      referenceSolution: 'function solve(n) { return n; }',
      solutionLanguage: 'javascript'
    });
    problemId = problem._id;

    // Seed an assessment
    await Assessment.create({
      title: 'Standard Assessment',
      description: 'Description',
      problems: [{ problemId: problemId, maxScore: 100 }],
      durationMinutes: 60,
      startTime: new Date(),
      endTime: new Date(Date.now() + 86400000),
      createdBy: adminId,
      status: 'Published'
    });
  });

  it('GET /api/assessments should return list of assessments for authenticated user', async () => {
    const res = await request(app)
      .get('/api/assessments')
      .set('Authorization', `Bearer ${studentToken}`);
    
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body.length).toBe(1);
  });

  it('POST /api/assessments should create an assessment for admin', async () => {
    const newAssessment = {
      title: 'New Assessment',
      description: 'New Description',
      problems: [{ problemId: problemId.toString(), maxScore: 100 }],
      durationMinutes: 30,
      startTime: new Date(),
      endTime: new Date(Date.now() + 86400000),
      status: 'Published'
    };

    const res = await request(app)
      .post('/api/assessments')
      .set('Authorization', `Bearer ${adminToken}`)
      .send(newAssessment);
    
    expect(res.status).toBe(201);
    expect(res.body.title).toBe('New Assessment');
  });

  it('POST /api/assessments/:id/start should start an assessment for student', async () => {
    const listRes = await request(app)
      .get('/api/assessments')
      .set('Authorization', `Bearer ${studentToken}`);
    const assessmentId = listRes.body[0]._id;

    const res = await request(app)
      .post(`/api/assessments/${assessmentId}/start`)
      .set('Authorization', `Bearer ${studentToken}`);
    
    expect(res.status).toBe(200);
    expect(res.body.assessmentId).toBe(assessmentId);
  });
});
