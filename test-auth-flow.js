#!/usr/bin/env node

/**
 * Script de test pour vérifier le flux d'authentification
 * Usage: node test-auth-flow.js
 */

const API_BASE = 'http://localhost:8000';

async function testAuthFlow() {
  console.log('🧪 Test du flux d\'authentification\n');
  
  // Test 1: Vérifier que l'API est accessible
  console.log('1. Test de connexion à l\'API...');
  try {
    const response = await fetch(`${API_BASE}/health`);
    if (response.ok) {
      console.log('✅ API accessible');
    } else {
      console.log('❌ API non accessible');
      return;
    }
  } catch (error) {
    console.log('❌ Erreur de connexion à l\'API:', error.message);
    return;
  }
  
  // Test 2: Test d'inscription
  console.log('\n2. Test d\'inscription...');
  const testUser = {
    username: `testuser${Date.now()}`,
    email: `test${Date.now()}@example.com`,
    password: 'TestPassword123'
  };
  
  try {
    const response = await fetch(`${API_BASE}/auth/register-v2`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(testUser)
    });
    
    if (response.ok) {
      console.log('✅ Inscription réussie');
      console.log('   Username:', testUser.username);
      console.log('   Email:', testUser.email);
    } else {
      const error = await response.json();
      console.log('❌ Erreur inscription:', error.detail);
    }
  } catch (error) {
    console.log('❌ Erreur inscription:', error.message);
  }
  
  // Test 3: Test de connexion
  console.log('\n3. Test de connexion...');
  try {
    const response = await fetch(`${API_BASE}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        username: testUser.username,
        password: testUser.password
      })
    });
    
    if (response.ok) {
      const tokens = await response.json();
      console.log('✅ Connexion réussie');
      console.log('   Token reçu:', tokens.access_token ? 'Oui' : 'Non');
    } else {
      const error = await response.json();
      console.log('❌ Erreur connexion:', error.detail);
    }
  } catch (error) {
    console.log('❌ Erreur connexion:', error.message);
  }
  
  // Test 4: Test avec utilisateur demo
  console.log('\n4. Test avec utilisateur demo...');
  try {
    const response = await fetch(`${API_BASE}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        username: 'demo',
        password: 'DemoPassword123'
      })
    });
    
    if (response.ok) {
      console.log('✅ Connexion demo réussie');
    } else {
      const error = await response.json();
      console.log('❌ Erreur connexion demo:', error.detail);
    }
  } catch (error) {
    console.log('❌ Erreur connexion demo:', error.message);
  }
  
  console.log('\n🏁 Tests terminés');
}

// Exécuter les tests
testAuthFlow().catch(console.error);