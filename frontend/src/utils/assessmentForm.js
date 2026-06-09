export function getApiErrorMessage(error, fallback) {
  const data = error?.response?.data;
  if (Array.isArray(data?.errors) && data.errors.length > 0) {
    return data.errors.join('. ');
  }
  return data?.msg || data?.message || fallback;
}

export function validateAssessmentForm(formData) {
  const errors = [];
  const duration = Number(formData.durationMinutes);
  const start = new Date(formData.startTime);
  const end = new Date(formData.endTime);

  if (!formData.title?.trim()) errors.push('Title is required');
  if (!Number.isFinite(duration) || duration <= 0) errors.push('Duration must be greater than zero');
  if (!formData.startTime || Number.isNaN(start.getTime())) errors.push('Start time is required');
  if (!formData.endTime || Number.isNaN(end.getTime())) errors.push('End time is required');
  if (!Number.isNaN(start.getTime()) && !Number.isNaN(end.getTime()) && start >= end) {
    errors.push('End time must be after start time');
  }
  if (!Array.isArray(formData.allowedLanguages) || formData.allowedLanguages.length === 0) {
    errors.push('Select at least one allowed language');
  }
  if (!Array.isArray(formData.problems) || formData.problems.length === 0) {
    errors.push('Add at least one problem');
  } else if (formData.problems.some((problem) => Number(problem.maxScore) <= 0)) {
    errors.push('Every problem score must be greater than zero');
  }

  return errors;
}
