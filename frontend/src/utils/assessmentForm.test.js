import { describe, expect, it } from 'vitest';
import { getApiErrorMessage, validateAssessmentForm } from './assessmentForm';

const validForm = {
  title: 'Assessment',
  durationMinutes: 60,
  startTime: '2026-06-09T10:00',
  endTime: '2026-06-09T12:00',
  allowedLanguages: ['javascript'],
  problems: [{ problemId: '1', maxScore: 100 }]
};

describe('assessment form validation', () => {
  it('accepts a valid assessment', () => {
    expect(validateAssessmentForm(validForm)).toEqual([]);
  });

  it('reports invalid schedule, languages, and scores', () => {
    const errors = validateAssessmentForm({
      ...validForm,
      durationMinutes: 0,
      startTime: '2026-06-09T12:00',
      endTime: '2026-06-09T10:00',
      allowedLanguages: [],
      problems: [{ problemId: '1', maxScore: 0 }]
    });

    expect(errors).toContain('Duration must be greater than zero');
    expect(errors).toContain('End time must be after start time');
    expect(errors).toContain('Select at least one allowed language');
    expect(errors).toContain('Every problem score must be greater than zero');
  });

  it('shows structured API validation errors', () => {
    const error = { response: { data: { errors: ['First issue', 'Second issue'] } } };
    expect(getApiErrorMessage(error, 'Fallback')).toBe('First issue. Second issue');
  });
});
