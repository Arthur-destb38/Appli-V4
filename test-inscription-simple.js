#!/usr/bin/env node

/**
 * Test simple d'inscription
 */

async function testInscription() {
  console.log('🧪 Test inscription simple\n');
  
  const testUser = {
    username: `user${Date.now()}`,
    email: `test${Date.now()}@example.com`,
    password: 'TestPassword123'
  };
  
  console.log('Utilisateur test:', testUser);
  
  try {
    const response = await fetch('http://localhost:8000/auth/register-v2', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(testUser)
    });
    
    console.log('Status:', response.status);
    
    if (response.ok) {
      const data = await response.json();
      console.log('✅ INSCRIPTION RÉUSSIE !');
      console.log('Token reçu:', data.access_token ? 'Oui' : 'Non');
    } else {
      const error = await response.text();
      console.log('❌ Erreur:', error);
    }
    
  } catch (error) {
    console.log('💥 Erreur réseau:', error.message);
  }
}

testInscription();