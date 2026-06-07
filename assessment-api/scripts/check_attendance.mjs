
async function checkAttendance() {
  const API_URL = 'http://localhost:3000/api';
  
  // 1. Login as admin
  const loginRes = await fetch(`${API_URL}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: 'admin@test.com', password: 'password' })
  });
  const { token } = await loginRes.json();

  // 2. Get first assessment
  const assessmentsRes = await fetch(`${API_URL}/assessments`, {
    headers: { 'Authorization': `Bearer ${token}` }
  });
  const assessments = await assessmentsRes.json();
  if (assessments.length === 0) {
    console.log('No assessments found');
    return;
  }
  const assessmentId = assessments[0]._id;

  // 3. Get attendance
  console.log(`Checking attendance for assessment: ${assessmentId}`);
  const attendanceRes = await fetch(`${API_URL}/assessments/${assessmentId}/attendance`, {
    headers: { 'Authorization': `Bearer ${token}` }
  });
  
  if (!attendanceRes.ok) {
    const error = await attendanceRes.text();
    console.error(`Error: ${attendanceRes.status} - ${error}`);
    return;
  }

  const attendance = await attendanceRes.json();
  console.log('Attendance count:', attendance.length);
  if (attendance.length > 0) {
    console.log('Sample entry:', attendance[0]);
  }
}

checkAttendance().catch(console.error);
