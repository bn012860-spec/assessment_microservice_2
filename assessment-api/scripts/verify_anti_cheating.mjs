
async function verifyAntiCheating() {
  const API_URL = 'http://localhost:3000/api';
  
  // 1. Login as Admin to create a fresh assessment
  console.log('🔑 Logging in as admin...');
  const adminLoginRes = await fetch(`${API_URL}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: 'admin@test.com', password: 'password' })
  });
  const { token: adminToken } = await adminLoginRes.json();

  // Get a problem ID
  const problemsRes = await fetch(`${API_URL}/problems`, {
    headers: { 'Authorization': `Bearer ${adminToken}` }
  });
  const problems = await problemsRes.json();
  const problemId = problems[0]._id;

  console.log('📝 Creating test assessment...');
  const assessmentRes = await fetch(`${API_URL}/assessments`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${adminToken}` },
    body: JSON.stringify({
      title: 'Anti-Cheating Verification',
      startTime: new Date().toISOString(),
      endTime: new Date(Date.now() + 3600000).toISOString(),
      durationMinutes: 60,
      problems: [{ problemId, maxScore: 100 }],
      status: 'Published'
    })
  });
  const assessment = await assessmentRes.json();
  const assessmentId = assessment._id;

  // 2. Login as student
  console.log('👤 Logging in as student...');
  const studentLoginRes = await fetch(`${API_URL}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: 's1@test.com', password: 'Student@2026' })
  });
  const { token: studentToken } = await studentLoginRes.json();

  // 3. Start Assessment
  console.log('🏁 Starting assessment...');
  const startRes = await fetch(`${API_URL}/assessments/${assessmentId}/start`, {
    method: 'POST',
    headers: { 'Authorization': `Bearer ${studentToken}` }
  });
  const attempt = await startRes.json();
  const attemptId = attempt._id;

  // 4. Simulate Anti-Cheating Events
  console.log('🕵️ Simulating suspicious behavior...');
  
  // Log 3 tab switches
  await fetch(`${API_URL}/assessments/attempts/${attemptId}/log-event`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${studentToken}` },
    body: JSON.stringify({ eventType: 'TAB_SWITCH' })
  });
  await fetch(`${API_URL}/assessments/attempts/${attemptId}/log-event`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${studentToken}` },
    body: JSON.stringify({ eventType: 'TAB_SWITCH' })
  });
  await fetch(`${API_URL}/assessments/attempts/${attemptId}/log-event`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${studentToken}` },
    body: JSON.stringify({ eventType: 'TAB_SWITCH' })
  });

  // Log 1 paste
  await fetch(`${API_URL}/assessments/attempts/${attemptId}/log-event`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${studentToken}` },
    body: JSON.stringify({ eventType: 'PASTE' })
  });

  // Log 1 fullscreen exit
  await fetch(`${API_URL}/assessments/attempts/${attemptId}/log-event`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${studentToken}` },
    body: JSON.stringify({ eventType: 'FULLSCREEN_EXIT' })
  });

  // 5. Verify via Admin Attendance API
  console.log('📊 Verifying counts via admin dashboard...');
  const attendanceRes = await fetch(`${API_URL}/assessments/${assessmentId}/attendance`, {
    headers: { 'Authorization': `Bearer ${adminToken}` }
  });
  const attendance = await attendanceRes.json();
  const studentData = attendance.find(a => a.studentId === attempt.studentId);

  console.log('\n--- Anti-Cheating Verification Report ---');
  console.log(`Tab Switches:    ${studentData.tabSwitchCount} (Expected: 3)`);
  console.log(`Paste Events:    ${studentData.pasteCount} (Expected: 1)`);
  console.log(`Fullscreen Exits: ${studentData.fullscreenExitCount} (Expected: 1)`);
  
  if (studentData.tabSwitchCount === 3 && studentData.pasteCount === 1 && studentData.fullscreenExitCount === 1) {
    console.log('\n✅ Anti-cheating verification PASSED!');
  } else {
    console.error('\n❌ Anti-cheating verification FAILED!');
  }
}

verifyAntiCheating().catch(console.error);
