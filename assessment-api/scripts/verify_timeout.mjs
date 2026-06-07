
async function testTimeout() {
  const API_URL = 'http://localhost:3000/api';
  
  // 1. Login
  console.log('Logging in as admin...');
  const adminLoginRes = await fetch(`${API_URL}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: 'admin@test.com', password: 'password' })
  });
  const { token: adminToken } = await adminLoginRes.json();

  // 2. Create a short-lived assessment
  console.log('Creating short-lived assessment...');
  const startTime = new Date();
  const endTime = new Date(startTime.getTime() + 5000); // Ends in 5 seconds
  
  // Get a problem ID
  const problemsRes = await fetch(`${API_URL}/problems`, {
    headers: { 'Authorization': `Bearer ${adminToken}` }
  });
  const problems = await problemsRes.json();
  const problemId = problems[0]._id;

  const assessmentRes = await fetch(`${API_URL}/assessments`, {
    method: 'POST',
    headers: { 
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${adminToken}`
    },
    body: JSON.stringify({
      title: 'Timeout Test',
      startTime: startTime.toISOString(),
      endTime: endTime.toISOString(),
      durationMinutes: 0.1, // 6 seconds
      problems: [{ problemId, maxScore: 100 }],
      status: 'Published'
    })
  });
  const assessment = await assessmentRes.json();
  console.log('Assessment created:', assessment._id);

  // 3. Login as student
  console.log('Logging in as student...');
  const studentLoginRes = await fetch(`${API_URL}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: 's1@test.com', password: 'Student@2026' })
  });
  const { token: studentToken } = await studentLoginRes.json();

  // 4. Start assessment
  console.log('Starting assessment...');
  const startRes = await fetch(`${API_URL}/assessments/${assessment._id}/start`, {
    method: 'POST',
    headers: { 'Authorization': `Bearer ${studentToken}` }
  });
  const attempt = await startRes.json();
  console.log('Attempt started:', attempt._id);

  // 5. Wait for 7 seconds (longer than duration and end time)
  console.log('Waiting for timeout (7 seconds)...');
  await new Promise(resolve => setTimeout(resolve, 7000));

  // 6. Try to submit
  console.log('Attempting to submit after timeout...');
  const submitRes = await fetch(`${API_URL}/assessments/attempts/${attempt._id}/submit`, {
    method: 'POST',
    headers: { 'Authorization': `Bearer ${studentToken}` }
  });
  const finalAttempt = await submitRes.json();
  console.log('Final attempt status:', finalAttempt.status);

  if (finalAttempt.status === 'TimedOut') {
    console.log('✅ Timeout enforcement test passed!');
  } else {
    console.error('❌ Timeout enforcement test failed! Status:', finalAttempt.status);
  }
}

testTimeout().catch(console.error);
