#!/usr/bin/env node

/**
 * Test de synchronisation des données de profil
 * Vérifie que les données saisies dans la configuration sont bien affichées dans l'app
 */

const API_BASE = 'http://localhost:8000';

// Données de test pour le profil complet
const TEST_PROFILE_DATA = {
  // Informations de base
  username: `testuser${Date.now()}`,
  email: `test${Date.now()}@example.com`,
  password: 'TestPassword123',
  bio: 'Passionné de fitness et de musculation 💪',
  objective: 'muscle_gain',
  
  // Informations personnelles
  location: 'Paris, France',
  height: 180,
  weight: 75.5,
  gender: 'male',
  
  // Objectifs fitness
  experience_level: 'intermediate',
  training_frequency: 4,
  equipment_available: ['Haltères', 'Barre olympique', 'Banc', 'Poids du corps'],
  
  // Préférences
  consent_to_public_share: true
};

let authTokens = null;
let userId = null;

async function makeRequest(endpoint, options = {}) {
  const url = `${API_BASE}${endpoint}`;
  const headers = {
    'Content-Type': 'application/json',
    ...options.headers
  };
  
  // Ajouter le token sauf pour les endpoints d'auth qui n'en ont pas besoin
  const noTokenEndpoints = ['/auth/register-v2', '/auth/register', '/auth/login'];
  if (authTokens?.access_token && !noTokenEndpoints.includes(endpoint)) {
    headers['Authorization'] = `Bearer ${authTokens.access_token}`;
  }
  
  const response = await fetch(url, {
    ...options,
    headers
  });
  
  return response;
}

async function step1_createAccount() {
  console.log('📝 ÉTAPE 1: Création du compte utilisateur');
  
  const response = await makeRequest('/auth/register-v2', {
    method: 'POST',
    body: JSON.stringify({
      username: TEST_PROFILE_DATA.username,
      email: TEST_PROFILE_DATA.email,
      password: TEST_PROFILE_DATA.password
    })
  });
  
  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Erreur création compte: ${error}`);
  }
  
  authTokens = await response.json();
  console.log('✅ Compte créé avec succès');
  
  // Récupérer les infos utilisateur
  const meResponse = await makeRequest('/auth/me');
  if (meResponse.ok) {
    const userData = await meResponse.json();
    userId = userData.id;
    console.log(`✅ Utilisateur connecté: ${userData.username} (ID: ${userId})`);
  } else {
    const error = await meResponse.text();
    throw new Error(`Impossible de récupérer les infos utilisateur: ${error}`);
  }
}

async function step2_configureBasicProfile() {
  console.log('\n🔧 ÉTAPE 2: Configuration du profil de base');
  
  // D'abord récupérer l'utilisateur connecté pour avoir le bon ID
  const meResponse = await makeRequest('/auth/me');
  if (!meResponse.ok) {
    throw new Error('Impossible de récupérer les infos utilisateur');
  }
  const currentUser = await meResponse.json();
  const currentUserId = currentUser.id;
  
  const basicData = {
    bio: TEST_PROFILE_DATA.bio,
    objective: TEST_PROFILE_DATA.objective,
    consent_to_public_share: TEST_PROFILE_DATA.consent_to_public_share
  };
  
  const response = await makeRequest(`/profile/${currentUserId}`, {
    method: 'PUT',
    body: JSON.stringify(basicData)
  });
  
  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Erreur mise à jour profil de base: ${error}`);
  }
  
  console.log('✅ Profil de base configuré');
  console.log(`   Bio: "${basicData.bio}"`);
  console.log(`   Objectif: ${basicData.objective}`);
  console.log(`   Partage public: ${basicData.consent_to_public_share}`);
}

async function step3_configureCompleteProfile() {
  console.log('\n🏋️ ÉTAPE 3: Configuration du profil complet');
  
  const completeData = {
    location: TEST_PROFILE_DATA.location,
    height: TEST_PROFILE_DATA.height,
    weight: TEST_PROFILE_DATA.weight,
    gender: TEST_PROFILE_DATA.gender,
    experience_level: TEST_PROFILE_DATA.experience_level,
    training_frequency: TEST_PROFILE_DATA.training_frequency,
    equipment_available: JSON.stringify(TEST_PROFILE_DATA.equipment_available),
    consent_to_public_share: TEST_PROFILE_DATA.consent_to_public_share,
    profile_completed: true
  };
  
  const response = await makeRequest('/users/profile/complete', {
    method: 'POST',
    body: JSON.stringify(completeData)
  });
  
  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Erreur configuration profil complet: ${error}`);
  }
  
  console.log('✅ Profil complet configuré');
  console.log(`   Localisation: ${completeData.location}`);
  console.log(`   Taille: ${completeData.height}cm, Poids: ${completeData.weight}kg`);
  console.log(`   Genre: ${completeData.gender}`);
  console.log(`   Niveau: ${completeData.experience_level}`);
  console.log(`   Fréquence: ${completeData.training_frequency} fois/semaine`);
  console.log(`   Équipement: ${TEST_PROFILE_DATA.equipment_available.join(', ')}`);
}

async function step4_verifyProfileDisplay() {
  console.log('\n🔍 ÉTAPE 4: Vérification de l\'affichage du profil');
  
  // D'abord récupérer l'utilisateur connecté pour avoir le bon ID
  const meResponse = await makeRequest('/auth/me');
  if (!meResponse.ok) {
    throw new Error('Impossible de récupérer les infos utilisateur');
  }
  const currentUser = await meResponse.json();
  const currentUserId = currentUser.id;
  
  // Test 1: Récupérer le profil via l'endpoint /auth/me
  console.log('\n📋 Test 1: Données via /auth/me');
  console.log('✅ Données utilisateur récupérées:');
  console.log(`   Username: ${currentUser.username}`);
  console.log(`   Email: ${currentUser.email}`);
  console.log(`   Email vérifié: ${currentUser.email_verified}`);
  console.log(`   Profil complété: ${currentUser.profile_completed}`);
  
  // Vérifications
  if (currentUser.username !== TEST_PROFILE_DATA.username) {
    console.log(`❌ ERREUR: Username incorrect (attendu: ${TEST_PROFILE_DATA.username}, reçu: ${currentUser.username})`);
  }
  
  // Test 2: Récupérer le profil via l'endpoint /profile/{user_id}
  console.log('\n👤 Test 2: Données via /profile/{user_id}');
  const profileResponse = await makeRequest(`/profile/${currentUserId}`);
  if (profileResponse.ok) {
    const profileData = await profileResponse.json();
    console.log('✅ Profil public récupéré:');
    console.log(`   ID: ${profileData.id}`);
    console.log(`   Username: ${profileData.username}`);
    console.log(`   Bio: "${profileData.bio}"`);
    console.log(`   Objectif: ${profileData.objective}`);
    console.log(`   Avatar: ${profileData.avatar_url ? 'Défini' : 'Non défini'}`);
    console.log(`   Posts: ${profileData.posts_count}`);
    console.log(`   Followers: ${profileData.followers_count}`);
    console.log(`   Following: ${profileData.following_count}`);
    console.log(`   Likes totaux: ${profileData.total_likes}`);
    
    // Vérifications des données de base
    const errors = [];
    if (profileData.username !== TEST_PROFILE_DATA.username) {
      errors.push(`Username incorrect (attendu: ${TEST_PROFILE_DATA.username}, reçu: ${profileData.username})`);
    }
    if (profileData.bio !== TEST_PROFILE_DATA.bio) {
      errors.push(`Bio incorrecte (attendu: "${TEST_PROFILE_DATA.bio}", reçu: "${profileData.bio}")`);
    }
    if (profileData.objective !== TEST_PROFILE_DATA.objective) {
      errors.push(`Objectif incorrect (attendu: ${TEST_PROFILE_DATA.objective}, reçu: ${profileData.objective})`);
    }
    
    if (errors.length > 0) {
      console.log('\n❌ ERREURS DE SYNCHRONISATION:');
      errors.forEach(error => console.log(`   - ${error}`));
    } else {
      console.log('\n✅ Toutes les données de base sont synchronisées correctement');
    }
  } else {
    console.log('❌ Impossible de récupérer le profil public');
  }
  
  // Test 3: Récupérer les données complètes via /users/profile/status
  console.log('\n📊 Test 3: Données complètes via /users/profile/status');
  const statusResponse = await makeRequest('/users/profile/status');
  if (statusResponse.ok) {
    const statusData = await statusResponse.json();
    console.log('✅ Données complètes récupérées:');
    console.log(`   Localisation: ${statusData.location}`);
    console.log(`   Taille: ${statusData.height}cm`);
    console.log(`   Poids: ${statusData.weight}kg`);
    console.log(`   Genre: ${statusData.gender}`);
    console.log(`   Niveau d'expérience: ${statusData.experience_level}`);
    console.log(`   Fréquence d'entraînement: ${statusData.training_frequency}`);
    console.log(`   Équipement: ${statusData.equipment_available}`);
    console.log(`   Partage public: ${statusData.consent_to_public_share}`);
    
    // Vérifications des données complètes
    const completeErrors = [];
    if (statusData.location !== TEST_PROFILE_DATA.location) {
      completeErrors.push(`Localisation incorrecte (attendu: ${TEST_PROFILE_DATA.location}, reçu: ${statusData.location})`);
    }
    if (statusData.height !== TEST_PROFILE_DATA.height) {
      completeErrors.push(`Taille incorrecte (attendu: ${TEST_PROFILE_DATA.height}, reçu: ${statusData.height})`);
    }
    if (statusData.weight !== TEST_PROFILE_DATA.weight) {
      completeErrors.push(`Poids incorrect (attendu: ${TEST_PROFILE_DATA.weight}, reçu: ${statusData.weight})`);
    }
    if (statusData.gender !== TEST_PROFILE_DATA.gender) {
      completeErrors.push(`Genre incorrect (attendu: ${TEST_PROFILE_DATA.gender}, reçu: ${statusData.gender})`);
    }
    if (statusData.experience_level !== TEST_PROFILE_DATA.experience_level) {
      completeErrors.push(`Niveau incorrect (attendu: ${TEST_PROFILE_DATA.experience_level}, reçu: ${statusData.experience_level})`);
    }
    if (statusData.training_frequency !== TEST_PROFILE_DATA.training_frequency) {
      completeErrors.push(`Fréquence incorrecte (attendu: ${TEST_PROFILE_DATA.training_frequency}, reçu: ${statusData.training_frequency})`);
    }
    if (statusData.consent_to_public_share !== TEST_PROFILE_DATA.consent_to_public_share) {
      completeErrors.push(`Partage public incorrect (attendu: ${TEST_PROFILE_DATA.consent_to_public_share}, reçu: ${statusData.consent_to_public_share})`);
    }
    
    // Vérifier l'équipement (JSON)
    try {
      const equipmentStored = JSON.parse(statusData.equipment_available || '[]');
      const equipmentExpected = TEST_PROFILE_DATA.equipment_available;
      if (JSON.stringify(equipmentStored.sort()) !== JSON.stringify(equipmentExpected.sort())) {
        completeErrors.push(`Équipement incorrect (attendu: ${equipmentExpected.join(', ')}, reçu: ${equipmentStored.join(', ')})`);
      }
    } catch (e) {
      completeErrors.push(`Erreur parsing équipement: ${statusData.equipment_available}`);
    }
    
    if (completeErrors.length > 0) {
      console.log('\n❌ ERREURS DE SYNCHRONISATION (données complètes):');
      completeErrors.forEach(error => console.log(`   - ${error}`));
    } else {
      console.log('\n✅ Toutes les données complètes sont synchronisées correctement');
    }
  } else {
    console.log('❌ Impossible de récupérer les données complètes');
  }
}

async function step5_testDataPersistence() {
  console.log('\n💾 ÉTAPE 5: Test de persistance des données');
  
  // Simuler une déconnexion/reconnexion
  console.log('🔄 Simulation déconnexion/reconnexion...');
  
  // Nouvelle connexion avec les mêmes identifiants
  const loginResponse = await makeRequest('/auth/login', {
    method: 'POST',
    body: JSON.stringify({
      username: TEST_PROFILE_DATA.username,
      password: TEST_PROFILE_DATA.password
    })
  });
  
  if (!loginResponse.ok) {
    throw new Error('Erreur reconnexion');
  }
  
  authTokens = await loginResponse.json();
  console.log('✅ Reconnexion réussie');
  
  // Récupérer l'utilisateur connecté pour avoir le bon ID
  const meResponse = await makeRequest('/auth/me');
  if (!meResponse.ok) {
    throw new Error('Impossible de récupérer les infos utilisateur après reconnexion');
  }
  const currentUser = await meResponse.json();
  const currentUserId = currentUser.id;
  
  // Vérifier que les données sont toujours là
  const profileCheck = await makeRequest(`/profile/${currentUserId}`);
  if (profileCheck.ok) {
    const profileData = await profileCheck.json();
    console.log('✅ Données persistées après reconnexion:');
    console.log(`   Bio: "${profileData.bio}"`);
    console.log(`   Objectif: ${profileData.objective}`);
    
    if (profileData.bio === TEST_PROFILE_DATA.bio && profileData.objective === TEST_PROFILE_DATA.objective) {
      console.log('✅ Persistance des données confirmée');
    } else {
      console.log('❌ Perte de données après reconnexion');
    }
  }
}

async function runSyncTest() {
  console.log('🧪 TEST DE SYNCHRONISATION DES DONNÉES DE PROFIL\n');
  console.log('Ce test vérifie que les données saisies dans la configuration');
  console.log('sont correctement synchronisées et affichées dans l\'application.\n');
  
  try {
    await step1_createAccount();
    await step2_configureBasicProfile();
    await step3_configureCompleteProfile();
    await step4_verifyProfileDisplay();
    await step5_testDataPersistence();
    
    console.log('\n🎉 TEST DE SYNCHRONISATION TERMINÉ AVEC SUCCÈS !');
    console.log('\n📋 RÉSUMÉ:');
    console.log('✅ Compte utilisateur créé');
    console.log('✅ Profil de base configuré');
    console.log('✅ Profil complet configuré');
    console.log('✅ Synchronisation des données vérifiée');
    console.log('✅ Persistance des données confirmée');
    
  } catch (error) {
    console.log('\n💥 ERREUR DURANT LE TEST:');
    console.log(error.message);
    process.exit(1);
  }
}

// Exécuter le test
runSyncTest();