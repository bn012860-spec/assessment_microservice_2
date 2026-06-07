
async function testBulkImport() {
  const API_URL = 'http://localhost:3000/api';
  
  // 1. Login to get token
  console.log('Logging in...');
  const loginRes = await fetch(`${API_URL}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      email: 'admin@test.com',
      password: 'password'
    })
  });
  
  const { token } = await loginRes.json();
  if (!token) {
    console.error('Login failed');
    process.exit(1);
  }
  console.log('Login successful');

  // 2. Test Bulk Import
  console.log('Testing bulk import...');
  const importData = {
    defaultPassword: 'Student@2026',
    users: [
      { name: 'Student One', email: 's1@test.com' },
      { name: 'Student Two', email: 's2@test.com' },
      { name: 'Student Three', email: 's3@test.com' }
    ]
  };

  const importRes = await fetch(`${API_URL}/admin/bulk-import-students`, {
    method: 'POST',
    headers: { 
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify(importData)
  });

  const results = await importRes.json();
  console.log('Import results:', JSON.stringify(results, null, 2));

  if (results.count === 3) {
    console.log('✅ Bulk import test passed!');
  } else {
    console.error('❌ Bulk import test failed!');
  }
}

testBulkImport().catch(console.error);
