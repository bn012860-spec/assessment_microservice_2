import { describe, it, expect } from 'vitest';
import { sanitizeResultDetails, isSampleTestCase } from './submissions.service.js';

describe('Submission Sanitization Logic', () => {
  const testCases = [
    { inputs: [1], expected: 1, isSample: true, isHidden: false },
    { inputs: [2], expected: 2, isSample: false, isHidden: true },
    { inputs: [3], expected: 3, isSample: false, isHidden: true }
  ];

  const details = [
    { test: 1, input: [1], expected: 1, output: 1, stdout: 'log 1', passed: true },
    { Test: 2, Input: [2], Expected: 2, Output: 2, Stdout: 'log 2', Passed: true },
    { test: 3, input: [3], expected: 3, output: 2, stdout: 'log 3', passed: false }
  ];

  it('should correctly identify sample test cases', () => {
    expect(isSampleTestCase(testCases[0])).toBe(true);
    expect(isSampleTestCase(testCases[1])).toBe(false);
    expect(isSampleTestCase(testCases[2])).toBe(false);
  });

  it('should normalize fields for sample test cases (lowercase)', () => {
    const sanitized = sanitizeResultDetails([details[0]], testCases, false);
    expect(sanitized[0].inputs).toEqual([1]);
    expect(sanitized[0].expected).toBe(1);
    expect(sanitized[0].output).toBe(1);
    expect(sanitized[0].stdout).toBe('log 1');
    expect(sanitized[0].isHidden).toBeUndefined();
  });

  it('should normalize fields for sample test cases (capitalized)', () => {
    // Force the first test case to be sample for this test
    const customTestCases = [{ ...testCases[1], isSample: true, isHidden: false }];
    const sanitized = sanitizeResultDetails([details[1]], customTestCases, false);
    expect(sanitized[0].inputs).toEqual([2]);
    expect(sanitized[0].expected).toBe(2);
    expect(sanitized[0].output).toBe(2);
    expect(sanitized[0].stdout).toBe('log 2');
  });

  it('should sanitize hidden test cases for practice (show logs, capitalized)', () => {
    const sanitized = sanitizeResultDetails([details[1]], testCases, false);
    expect(sanitized[0].isHidden).toBe(true);
    expect(sanitized[0].inputs).toBeUndefined();
    expect(sanitized[0].Input).toBeUndefined(); // We stopped spreading the original object
    expect(sanitized[0].expected).toBeUndefined();
    expect(sanitized[0].stdout).toBe('log 2');
  });

  it('should sanitize hidden test cases for assessments (hide logs)', () => {
    const sanitized = sanitizeResultDetails([details[1]], testCases, true);
    expect(sanitized[0].isHidden).toBe(true);
    expect(sanitized[0].stdout).toBeUndefined();
    expect(sanitized[0].stderr).toBeUndefined();
  });

  it('should include pass/fail status for hidden cases', () => {
    const sanitized = sanitizeResultDetails([details[2]], testCases, false);
    expect(sanitized[0].passed).toBe(false);
    expect(sanitized[0].isHidden).toBe(true);
  });
});
