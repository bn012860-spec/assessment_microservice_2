import { describe, it, expect, beforeEach } from 'vitest';
import request from 'supertest';
import app from '../app.js';
import Problem from '../../models/Problem.mjs';

describe('Submissions API', () => {
  let studentToken;
  let problemId;

  beforeEach(async () => {
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
      title: 'Two Sum',
      description: 'Sum of two numbers',
      difficulty: 'Easy',
      functionName: 'twoSum',
      parameters: [{ name: 'nums', type: 'array<number>' }, { name: 'target', type: 'number' }],
      returnType: 'array<number>',
      testCases: [{ inputs: [[2, 7, 11, 15], 9], expected: [0, 1], isSample: true }],
      referenceSolution: 'function twoSum(nums, target) { return [0, 1]; }',
      solutionLanguage: 'javascript'
    });
    problemId = problem._id;
  });

  it('POST /api/submissions should create a submission', async () => {
    const submission = {
      problemId: problemId.toString(),
      language: 'javascript',
      code: 'function twoSum(nums, target) { return [0, 1]; }'
    };

    const res = await request(app)
      .post('/api/submissions')
      .set('Authorization', `Bearer ${studentToken}`)
      .send(submission);
    
    expect(res.status).toBe(202);
    expect(res.body._id).toBeDefined();
    expect(res.body.status).toBe('Pending');
  });

  it('GET /api/submissions/:id should return submission status', async () => {
    // Create submission
    const subRes = await request(app)
      .post('/api/submissions')
      .set('Authorization', `Bearer ${studentToken}`)
      .send({
        problemId: problemId.toString(),
        language: 'javascript',
        code: 'function twoSum(nums, target) { return [0, 1]; }'
      });
    const submissionId = subRes.body._id;

    const res = await request(app)
      .get(`/api/submissions/${submissionId}`)
      .set('Authorization', `Bearer ${studentToken}`);
    
    expect(res.status).toBe(200);
    expect(res.body._id).toBe(submissionId);
    expect(res.body.status).toBeDefined();
  });
});
