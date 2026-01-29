#!/usr/bin/env node

async function debugProfile() {
  console.log('🔍 Debug du profil complet\n');
  
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
  
  // 2. Configuration profil complet
  console.log('\n2. Configuration profil complet...');
  const profileData = {
    location: 'Lyon, France',
    height: 175,
    weight: 70.5,
    gender: 'male',
    experience_level: 'beginner',
    training_frequency: 3,
    equipment_available: JSON.stringify(['Haltères', 'Banc']),
    consent_to_public_share: true,
    profile_completed: true
  };
  
  console.log('Données envoyées:', profileData);
  
  const completeResponse = await fetch('http://localhost:8000/users/profile/complete', {
    method: 'POST',
    headers: { 
      'Authorization': `Bearer ${tokens.access_token}`,
      'Content-Type': 'application/json' 
    },
    body: JSON.stringify(profileData)
  });
  
  console.log('Status complete:', completeResponse.status);
  
  if (completeResponse.ok) {
    const completeResult = await completeResponse.json();
    console.log('✅ Profil complété:', completeResult);
  } else {
    const error = await completeResponse.text();
    console.log('❌ Erreur complete:', error);
    return;
  }
  
  // 3. Vérification via /users/profile/status
  console.log('\n3. Vérification via /users/profile/status...');
  const statusResponse = await fetch('http://localhost:8000/users/profile/status', {
    headers: { 
      'Authorization': `Bearer ${tokens.access_token}`,
      'Content-Type': 'application/json' 
    }
  });
  
  console.log('Status status:', statusResponse.status);
  
  if (statusResponse.ok) {
    const statusData = await statusResponse.json();
    console.log('✅ Données récupérées:');
    console.log('   Location:', statusData.location);
    console.log('   Height:', statusData.height);
    console.log('   Weight:', statusData.weight);
    console.log('   Gender:', statusData.gender);
    console.log('   Experience:', statusData.experience_level);
    console.log('   Frequency:', statusData.training_frequency);
    console.log('   Equipment:', statusData.equipment_available);
    console.log('   Consent:', statusData.consent_to_public_share);
    console.log('   Completed:', statusData.profile_completed);
  } else {
    const error = await statusResponse.text();
    console.log('❌ Erreur status:', error);
  }
  
  // 4. Vérification via /auth/me
  console.log('\n4. Vérification via /auth/me...');
  const meResponse = await fetch('http://localhost:8000/auth/me', {
    headers: { 
      'Authorization': `Bearer ${tokens.access_token}`,
      'Content-Type': 'application/json' 
    }
  });
  
  if (meResponse.ok) {
    const meData = await meResponse.json();
    console.log('✅ Données /auth/me:');
    console.log('   Profile completed:', meData.profile_completed);
  } else {
    console.log('❌ Erreur /auth/me');
  }
}

debugProfile().catch(console.error);