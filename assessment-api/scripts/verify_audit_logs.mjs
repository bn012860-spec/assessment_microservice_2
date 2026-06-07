
async function testAuditLogs() {
  const API_URL = 'http://localhost:3000/api';
  
  // 1. Login as admin
  console.log('Logging in as admin...');
  const loginRes = await fetch(`${API_URL}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: 'admin@test.com', password: 'password' })
  });
  const { token } = await loginRes.json();

  // 2. Fetch logs
  console.log('Fetching audit logs...');
  const logsRes = await fetch(`${API_URL}/admin/audit-logs`, {
    headers: { 'Authorization': `Bearer ${token}` }
  });
  const logs = await logsRes.json();
  
  console.log(`Found ${logs.length} logs.`);
  if (logs.length > 0) {
    console.log('Latest log:', JSON.stringify(logs[0], null, 2));
    console.log('✅ Audit logging test passed!');
  } else {
    console.error('❌ No audit logs found!');
  }
}

testAuditLogs().catch(console.error);
