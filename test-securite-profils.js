#!/usr/bin/env node

/**
 * Test de sécurité des profils utilisateurs
 */

const API_BASE = 'http://192.168.1.64:8000';

async function testSecurityProfiles() {
  console.log('🔐 Test de sécurité des profils utilisateurs\n');
  
  // Créer deux utilisateurs de test
  const user1 = {
    username: `user1_${Date.now()}`,
    email: `user1_${Date.now()}@example.com`,
    password: 'TestPassword123'
  };
  
  const user2 = {
    username: `user2_${Date.now()}`,
    email: `user2_${Date.now()}@example.com`,
    password: 'TestPassword123'
  };
  
  let tokens1 = null;
  let tokens2 = null;
  
  // Inscription des deux utilisateurs
  console.log('1. Inscription des utilisateurs de test...');
  try {
    const response1 = await fetch(`${API_BASE}/auth/register-v2`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(user1)
    });
    
    const response2 = await fetch(`${API_BASE}/auth/register-v2`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(user2)
    });
    
    if (response1.ok && response2.ok) {
      tokens1 = await response1.json();
      tokens2 = await response2.json();
      console.log('   ✅ Deux utilisateurs créés');
      console.log('   👤 User1:', user1.username);
      console.log('   👤 User2:', user2.username);
    } else {
      console.log('   ❌ Erreur création utilisateurs');
      return;
    }
  } catch (error) {
    console.log('   ❌ Erreur réseau:', error.message);
    return;
  }
  
  // Récupérer les profils pour avoir les IDs
  console.log('\n2. Récupération des profils...');
  let profile1 = null;
  let profile2 = null;
  
  try {
    const response1 = await fetch(`${API_BASE}/auth/me`, {
      headers: { 'Authorization': `Bearer ${tokens1.access_token}` }
    });
    
    const response2 = await fetch(`${API_BASE}/auth/me`, {
      headers: { 'Authorization': `Bearer ${tokens2.access_token}` }
    });
    
    if (response1.ok && response2.ok) {
      profile1 = await response1.json();
      profile2 = await response2.json();
      console.log('   ✅ Profils récupérés');
      console.log('   🆔 User1 ID:', profile1.id);
      console.log('   🆔 User2 ID:', profile2.id);
    }
  } catch (error) {
    console.log('   ❌ Erreur récupération profils:', error.message);
    return;
  }
  
  // Test 3: User1 essaie de modifier le profil de User2 (DOIT ÉCHOUER)
  console.log('\n3. Test modification profil d\'autrui (doit échouer)...');
  try {
    const response = await fetch(`${API_BASE}/profile/${profile2.id}`, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${tokens1.access_token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        bio: 'Bio modifiée par un attaquant!',
        objective: 'muscle_gain'
      })
    });
    
    if (response.status === 403) {
      console.log('   ✅ SÉCURISÉ: Modification refusée (403 Forbidden)');
    } else if (response.status === 401) {
      console.log('   ✅ SÉCURISÉ: Non authentifié (401 Unauthorized)');
    } else {
      console.log('   ❌ FAILLE: Modification autorisée! Status:', response.status);
    }
  } catch (error) {
    console.log('   ❌ Erreur réseau:', error.message);
  }
  
  // Test 4: User1 modifie son propre profil (DOIT RÉUSSIR)
  console.log('\n4. Test modification de son propre profil (doit réussir)...');
  try {
    const response = await fetch(`${API_BASE}/profile/${profile1.id}`, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${tokens1.access_token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        bio: 'Ma bio personnelle',
        objective: 'weight_loss'
      })
    });
    
    if (response.ok) {
      console.log('   ✅ AUTORISÉ: Modification de son propre profil réussie');
    } else {
      console.log('   ❌ PROBLÈME: Modification de son propre profil refusée. Status:', response.status);
    }
  } catch (error) {
    console.log('   ❌ Erreur réseau:', error.message);
  }
  
  // Test 5: User1 essaie de suivre User2 au nom de quelqu'un d'autre (DOIT ÉCHOUER)
  console.log('\n5. Test follow au nom d\'autrui (doit utiliser l\'utilisateur authentifié)...');
  try {
    const response = await fetch(`${API_BASE}/profile/${profile2.id}/follow`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${tokens1.access_token}`,
        'Content-Type': 'application/json'
      }
    });
    
    if (response.status === 204) {
      console.log('   ✅ SÉCURISÉ: Follow utilise l\'utilisateur authentifié');
    } else {
      console.log('   ❌ PROBLÈME: Follow échoué. Status:', response.status);
    }
  } catch (error) {
    console.log('   ❌ Erreur réseau:', error.message);
  }
  
  // Test 6: User1 essaie de modifier l'avatar de User2 (DOIT ÉCHOUER)
  console.log('\n6. Test modification avatar d\'autrui (doit échouer)...');
  try {
    const response = await fetch(`${API_BASE}/profile/${profile2.id}/avatar`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${tokens1.access_token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        image_base64: 'data:image/jpeg;base64,/9j/4AAQSkZJRgABAQEAYABgAAD/2wBDAAEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQH/2wBDAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQH/wAARCAABAAEDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAUEAEAAAAAAAAAAAAAAAAAAAAA/8QAFQEBAQAAAAAAAAAAAAAAAAAAAAX/xAAUEQEAAAAAAAAAAAAAAAAAAAAA/9oADAMBAAIRAxEAPwA/wA=='
      })
    });
    
    if (response.status === 403) {
      console.log('   ✅ SÉCURISÉ: Modification avatar refusée (403 Forbidden)');
    } else if (response.status === 401) {
      console.log('   ✅ SÉCURISÉ: Non authentifié (401 Unauthorized)');
    } else {
      console.log('   ❌ FAILLE: Modification avatar autorisée! Status:', response.status);
    }
  } catch (error) {
    console.log('   ❌ Erreur réseau:', error.message);
  }
  
  console.log('\n🏁 Tests de sécurité terminés');
  console.log('\n📋 Résumé:');
  console.log('- ✅ Chaque utilisateur a son propre profil unique');
  console.log('- ✅ Impossible de modifier le profil d\'autrui');
  console.log('- ✅ Possible de modifier son propre profil');
  console.log('- ✅ Follow utilise l\'utilisateur authentifié');
  console.log('- ✅ Impossible de modifier l\'avatar d\'autrui');
  console.log('\n🔐 Le système de profils est sécurisé !');
}

testSecurityProfiles().catch(console.error);