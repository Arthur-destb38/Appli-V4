#!/usr/bin/env node

async function testAuthMe() {
  console.log('🧪 Test de l\'endpoint /auth/me\n');
  
  const testUser = {
    username: `testuser${Date.now()}`,
    email: `test${Date.now()}@example.com`,
    password: 'TestPassword123'
  };
  
  console.log('1. Inscription...');
  const registerResponse = await fetch('http://localhost:8000/auth/register-v2', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(testUser)
  });
  
  if (!registerResponse.ok) {
    console.log('❌ Erreur inscription:', await registerResponse.text());
    return;
  }
  
  const tokens = await registerResponse.json();
  console.log('✅ Inscription réussie, token reçu');
  
  console.log('\n2. Test /auth/me...');
  const meResponse = await fetch('http://localhost:8000/auth/me', {
    headers: { 
      'Authorization': `Bearer ${tokens.access_token}`,
      'Content-Type': 'application/json'
    }
  });
  
  console.log('Status:', meResponse.status);
  
  if (meResponse.ok) {
    const userData = await meResponse.json();
    console.log('✅ Données utilisateur récupérées:');
    console.log('   ID:', userData.id);
    console.log('   Username:', userData.username);
    console.log('   Email:', userData.email);
    console.log('   Email vérifié:', userData.email_verified);
  } else {
    const error = await meResponse.text();
    console.log('❌ Erreur /auth/me:', error);
  }
}

testAuthMe().catch(console.error);