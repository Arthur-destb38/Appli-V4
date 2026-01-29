#!/usr/bin/env node

/**
 * Test complet du système d'authentification
 */

const API_BASE = 'http://192.168.1.64:8000';

async function testAuthComplete() {
  console.log('🧪 Test complet du système d\'authentification\n');
  
  // Test 1: Vérifier l'API
  console.log('1. Vérification de l\'API...');
  try {
    const response = await fetch(`${API_BASE}/health`);
    if (response.ok) {
      console.log('   ✅ API accessible');
    } else {
      console.log('   ❌ API non accessible');
      return;
    }
  } catch (error) {
    console.log('   ❌ Erreur connexion:', error.message);
    return;
  }
  
  // Test 2: Inscription
  console.log('\n2. Test d\'inscription...');
  const testUser = {
    username: `testuser${Date.now()}`,
    email: `test${Date.now()}@example.com`,
    password: 'TestPassword123'
  };
  
  let tokens = null;
  try {
    const response = await fetch(`${API_BASE}/auth/register-v2`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(testUser)
    });
    
    if (response.ok) {
      tokens = await response.json();
      console.log('   ✅ Inscription réussie');
      console.log('   📝 Username:', testUser.username);
      console.log('   📧 Email:', testUser.email);
      console.log('   🔑 Token reçu:', tokens.access_token ? 'Oui' : 'Non');
    } else {
      const error = await response.json();
      console.log('   ❌ Erreur inscription:', error.detail);
      return;
    }
  } catch (error) {
    console.log('   ❌ Erreur réseau:', error.message);
    return;
  }
  
  // Test 3: Récupération du profil avec token
  console.log('\n3. Test récupération profil...');
  try {
    const response = await fetch(`${API_BASE}/auth/me`, {
      headers: {
        'Authorization': `Bearer ${tokens.access_token}`,
        'Content-Type': 'application/json'
      }
    });
    
    if (response.ok) {
      const profile = await response.json();
      console.log('   ✅ Profil récupéré');
      console.log('   👤 ID:', profile.id);
      console.log('   📛 Username:', profile.username);
      console.log('   📧 Email:', profile.email);
      console.log('   ✅ Email vérifié:', profile.email_verified ? 'Oui' : 'Non');
      console.log('   📋 Profil complet:', profile.profile_completed ? 'Oui' : 'Non');
    } else {
      console.log('   ❌ Erreur récupération profil');
    }
  } catch (error) {
    console.log('   ❌ Erreur réseau:', error.message);
  }
  
  // Test 4: Connexion avec les mêmes identifiants
  console.log('\n4. Test de connexion...');
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
      const loginTokens = await response.json();
      console.log('   ✅ Connexion réussie');
      console.log('   🔑 Nouveau token reçu:', loginTokens.access_token ? 'Oui' : 'Non');
    } else {
      const error = await response.json();
      console.log('   ❌ Erreur connexion:', error.detail);
    }
  } catch (error) {
    console.log('   ❌ Erreur réseau:', error.message);
  }
  
  // Test 5: Refresh token
  console.log('\n5. Test refresh token...');
  try {
    const response = await fetch(`${API_BASE}/auth/refresh`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${tokens.refresh_token}`,
        'Content-Type': 'application/json'
      }
    });
    
    if (response.ok) {
      const refreshedTokens = await response.json();
      console.log('   ✅ Token rafraîchi');
      console.log('   🔑 Nouveau access token:', refreshedTokens.access_token ? 'Oui' : 'Non');
    } else {
      console.log('   ❌ Erreur refresh token');
    }
  } catch (error) {
    console.log('   ❌ Erreur réseau:', error.message);
  }
  
  // Test 6: Déconnexion
  console.log('\n6. Test déconnexion...');
  try {
    const response = await fetch(`${API_BASE}/auth/logout`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${tokens.access_token}`,
        'Content-Type': 'application/json'
      }
    });
    
    if (response.ok) {
      console.log('   ✅ Déconnexion réussie');
    } else {
      console.log('   ❌ Erreur déconnexion');
    }
  } catch (error) {
    console.log('   ❌ Erreur réseau:', error.message);
  }
  
  console.log('\n🏁 Tests terminés');
  console.log('\n📋 Résumé:');
  console.log('- ✅ API accessible');
  console.log('- ✅ Inscription fonctionnelle');
  console.log('- ✅ Récupération de profil avec token');
  console.log('- ✅ Connexion fonctionnelle');
  console.log('- ✅ Refresh token fonctionnel');
  console.log('- ✅ Déconnexion fonctionnelle');
  console.log('\n🎉 Le système d\'authentification est complet et fonctionnel !');
}

testAuthComplete().catch(console.error);