
async function testLogin() {
  const API_URL = 'http://localhost:3000/api';
  
  const loginData = {
    email: 'admin@assessment.com',
    password: 'Admin@2026'
  };

  console.log('Testing login for:', loginData.email);
  const res = await fetch(`${API_URL}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(loginData)
  });

  if (res.ok) {
    const data = await res.json();
    console.log('✅ Login successful!');
    console.log('Token:', data.token.substring(0, 20) + '...');
  } else {
    const err = await res.json();
    console.error('❌ Login failed:', res.status, JSON.stringify(err));
  }
}

testLogin().catch(console.error);
