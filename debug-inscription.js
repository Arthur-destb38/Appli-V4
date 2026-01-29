#!/usr/bin/env node

/**
 * Script de debug pour l'inscription
 * Usage: node debug-inscription.js
 */

const API_BASE = 'http://localhost:8000';

async function debugInscription() {
  console.log('🔍 Debug de l\'inscription\n');
  
  // Test 1: Vérifier l'API
  console.log('1. Vérification de l\'API...');
  try {
    const healthResponse = await fetch(`${API_BASE}/health`);
    console.log('   Status health:', healthResponse.status);
    
    if (healthResponse.ok) {
      console.log('   ✅ API accessible');
    } else {
      console.log('   ❌ API non accessible');
      return;
    }
  } catch (error) {
    console.log('   ❌ Erreur connexion:', error.message);
    return;
  }
  
  // Test 2: Tester l'endpoint d'inscription
  console.log('\n2. Test de l\'endpoint d\'inscription...');
  
  const testUsers = [
    {
      username: 'testuser1',
      email: 'test1@example.com',
      password: 'TestPassword123'
    },
    {
      username: `user${Date.now()}`,
      email: `test${Date.now()}@example.com`,
      password: 'TestPassword123'
    }
  ];
  
  for (let i = 0; i < testUsers.length; i++) {
    const user = testUsers[i];
    console.log(`\n   Test ${i + 1}: ${user.username}`);
    
    try {
      const response = await fetch(`${API_BASE}/auth/register-v2`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify(user)
      });
      
      console.log('   Status:', response.status);
      console.log('   Headers:', Object.fromEntries(response.headers.entries()));
      
      const responseText = await response.text();
      console.log('   Response body:', responseText);
      
      if (response.ok) {
        console.log('   ✅ Inscription réussie');
      } else {
        console.log('   ❌ Inscription échouée');
        try {
          const errorData = JSON.parse(responseText);
          console.log('   Erreur détaillée:', errorData);
        } catch (e) {
          console.log('   Réponse non-JSON:', responseText);
        }
      }
      
    } catch (error) {
      console.log('   💥 Erreur réseau:', error.message);
    }
    
    // Attendre un peu entre les tests
    await new Promise(resolve => setTimeout(resolve, 500));
  }
  
  // Test 3: Vérifier les CORS
  console.log('\n3. Test des CORS...');
  try {
    const corsResponse = await fetch(`${API_BASE}/auth/register-v2`, {
      method: 'OPTIONS',
      headers: {
        'Origin': 'http://localhost:8081',
        'Access-Control-Request-Method': 'POST',
        'Access-Control-Request-Headers': 'Content-Type'
      }
    });
    
    console.log('   CORS Status:', corsResponse.status);
    console.log('   CORS Headers:', Object.fromEntries(corsResponse.headers.entries()));
    
  } catch (error) {
    console.log('   ❌ Erreur CORS:', error.message);
  }
  
  console.log('\n🏁 Debug terminé');
}

// Exécuter le debug
debugInscription().catch(console.error);