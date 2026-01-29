#!/usr/bin/env node

async function debugAuthMe() {
  console.log('🔍 Debug de /auth/me\n');
  
  const testUser = {
    username: `debug${Date.now()}`,
    email: `debug${Date.now()}@example.com`,
    password: 'DebugPass123'
  };
  
  // 1. Inscription
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
  console.log('✅ Inscription réussie');
  console.log('   Access token:', tokens.access_token ? 'Présent' : 'Absent');
  
  // 2. Test /auth/me immédiatement après inscription
  console.log('\n2. Test /auth/me...');
  const meResponse = await fetch('http://localhost:8000/auth/me', {
    headers: { 
      'Authorization': `Bearer ${tokens.access_token}`,
      'Content-Type': 'application/json' 
    }
  });
  
  console.log('Status /auth/me:', meResponse.status);
  
  if (meResponse.ok) {
    const userData = await meResponse.json();
    console.log('✅ Données utilisateur récupérées:');
    console.log('   ID:', userData.id);
    console.log('   Username:', userData.username);
    console.log('   Email:', userData.email);
  } else {
    const error = await meResponse.text();
    console.log('❌ Erreur /auth/me:', error);
  }
  
  // 3. Configuration profil
  console.log('\n3. Configuration profil...');
  const profileData = {
    bio: 'Test bio',
    objective: 'test',
    experience_level: 'beginner',
    training_frequency: 3,
    consent_to_public_share: true,
    profile_completed: true
  };
  
  const completeResponse = await fetch('http://localhost:8000/users/profile/complete', {
    method: 'POST',
    headers: { 
      'Authorization': `Bearer ${tokens.access_token}`,
      'Content-Type': 'application/json' 
    },
    body: JSON.stringify(profileData)
  });
  
  console.log('Status profile/complete:', completeResponse.status);
  
  if (completeResponse.ok) {
    console.log('✅ Profil configuré');
  } else {
    const error = await completeResponse.text();
    console.log('❌ Erreur profile/complete:', error);
  }
  
  // 4. Re-test /auth/me après configuration
  console.log('\n4. Re-test /auth/me après configuration...');
  const meResponse2 = await fetch('http://localhost:8000/auth/me', {
    headers: { 
      'Authorization': `Bearer ${tokens.access_token}`,
      'Content-Type': 'application/json' 
    }
  });
  
  console.log('Status /auth/me (après config):', meResponse2.status);
  
  if (meResponse2.ok) {
    const userData2 = await meResponse2.json();
    console.log('✅ Données utilisateur après config:');
    console.log('   Profile completed:', userData2.profile_completed);
  } else {
    const error2 = await meResponse2.text();
    console.log('❌ Erreur /auth/me (après config):', error2);
  }
}

debugAuthMe().catch(console.error);