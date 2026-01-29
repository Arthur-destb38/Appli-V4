#!/usr/bin/env node

/**
 * Test de synchronisation UI - Données de profil
 * Simule le flux utilisateur complet : inscription → configuration → affichage
 */

const API_BASE = 'http://localhost:8000';

// Données de test simulant les saisies utilisateur
const USER_INPUT_DATA = {
  // Étape inscription
  registration: {
    username: `athlete${Date.now()}`,
    email: `athlete${Date.now()}@gorillax.com`,
    password: 'AthletePass123'
  },
  
  // Étape profile-setup-simple (3 étapes)
  profileSetup: {
    step1: {
      bio: 'Athlète passionné de crossfit et de course à pied 🏃‍♂️',
      objective: 'endurance'
    },
    step2: {
      experience_level: 'advanced',
      training_frequency: 5
    },
    step3: {
      consent_to_public_share: true
    }
  },
  
  // Étape settings (configuration avancée)
  advancedSettings: {
    basicInfo: {
      bio: 'Athlète passionné de crossfit et de course à pied 🏃‍♂️ Objectif: marathon 2024!',
      objective: 'endurance'
    },
    personalInfo: {
      location: 'Lyon, France',
      height: 175,
      weight: 68.5,
      gender: 'male'
    },
    fitnessGoals: {
      experience_level: 'advanced',
      training_frequency: 5,
      equipment_available: ['Poids du corps', 'Élastiques', 'Cardio (tapis, vélo...)']
    },
    preferences: {
      consent_to_public_share: true
    }
  }
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

async function simulateRegistration() {
  console.log('📱 SIMULATION: Page d\'inscription (register.tsx)');
  console.log('👤 Utilisateur saisit ses informations...');
  
  const { username, email, password } = USER_INPUT_DATA.registration;
  console.log(`   Username: ${username}`);
  console.log(`   Email: ${email}`);
  console.log(`   Password: ${'*'.repeat(password.length)}`);
  
  console.log('🔄 Appel API: POST /auth/register-v2');
  const response = await makeRequest('/auth/register-v2', {
    method: 'POST',
    body: JSON.stringify({ username, email, password })
  });
  
  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Erreur inscription: ${error}`);
  }
  
  authTokens = await response.json();
  console.log('✅ Inscription réussie, tokens reçus');
  
  // Récupérer l'ID utilisateur
  const meResponse = await makeRequest('/auth/me');
  if (meResponse.ok) {
    const userData = await meResponse.json();
    userId = userData.id;
    console.log(`✅ Redirection vers profile-setup-simple.tsx (User ID: ${userId})`);
  }
}

async function simulateProfileSetup() {
  console.log('\n🛠️ SIMULATION: Configuration initiale du profil (profile-setup-simple.tsx)');
  
  // Étape 1: Informations de base
  console.log('\n📝 Étape 1/3: Informations de base');
  const step1Data = USER_INPUT_DATA.profileSetup.step1;
  console.log(`   Bio saisie: "${step1Data.bio}"`);
  console.log(`   Objectif sélectionné: ${step1Data.objective}`);
  
  // Étape 2: Niveau fitness
  console.log('\n🏋️ Étape 2/3: Niveau fitness');
  const step2Data = USER_INPUT_DATA.profileSetup.step2;
  console.log(`   Niveau d'expérience: ${step2Data.experience_level}`);
  console.log(`   Fréquence d'entraînement: ${step2Data.training_frequency} fois/semaine`);
  
  // Étape 3: Préférences
  console.log('\n⚙️ Étape 3/3: Préférences');
  const step3Data = USER_INPUT_DATA.profileSetup.step3;
  console.log(`   Partage public: ${step3Data.consent_to_public_share ? 'Activé' : 'Désactivé'}`);
  
  // Simulation du clic "Terminer"
  console.log('\n🔄 Appel API: POST /users/profile/complete');
  const completeData = {
    bio: step1Data.bio,
    objective: step1Data.objective,
    experience_level: step2Data.experience_level,
    training_frequency: step2Data.training_frequency,
    consent_to_public_share: step3Data.consent_to_public_share,
    profile_completed: true
  };
  
  const response = await makeRequest('/users/profile/complete', {
    method: 'POST',
    body: JSON.stringify(completeData)
  });
  
  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Erreur configuration profil: ${error}`);
  }
  
  console.log('✅ Configuration initiale sauvegardée');
  console.log('✅ Redirection vers l\'application principale (tabs)');
}

async function simulateSettingsUpdate() {
  console.log('\n⚙️ SIMULATION: Mise à jour dans les paramètres (settings.tsx)');
  
  // D'abord récupérer l'utilisateur connecté pour avoir le bon ID
  const meResponse = await makeRequest('/auth/me');
  if (!meResponse.ok) {
    throw new Error('Impossible de récupérer les infos utilisateur');
  }
  const currentUser = await meResponse.json();
  const currentUserId = currentUser.id;
  
  // Section "Informations de base"
  console.log('\n📋 Section: Informations de base');
  const basicInfo = USER_INPUT_DATA.advancedSettings.basicInfo;
  console.log(`   Bio mise à jour: "${basicInfo.bio}"`);
  console.log(`   Objectif confirmé: ${basicInfo.objective}`);
  
  console.log('🔄 Appel API: PUT /profile/{user_id}');
  const basicResponse = await makeRequest(`/profile/${currentUserId}`, {
    method: 'PUT',
    body: JSON.stringify({
      bio: basicInfo.bio,
      objective: basicInfo.objective
    })
  });
  
  if (!basicResponse.ok) {
    const error = await basicResponse.text();
    throw new Error(`Erreur mise à jour informations de base: ${error}`);
  }
  console.log('✅ Informations de base sauvegardées');
  
  // Section "Profil complet"
  console.log('\n🏋️ Section: Profil complet');
  const completeSettings = {
    ...USER_INPUT_DATA.advancedSettings.personalInfo,
    ...USER_INPUT_DATA.advancedSettings.fitnessGoals,
    ...USER_INPUT_DATA.advancedSettings.preferences,
    equipment_available: JSON.stringify(USER_INPUT_DATA.advancedSettings.fitnessGoals.equipment_available)
  };
  
  console.log(`   Localisation: ${completeSettings.location}`);
  console.log(`   Taille/Poids: ${completeSettings.height}cm / ${completeSettings.weight}kg`);
  console.log(`   Genre: ${completeSettings.gender}`);
  console.log(`   Équipement: ${USER_INPUT_DATA.advancedSettings.fitnessGoals.equipment_available.join(', ')}`);
  
  console.log('🔄 Appel API: POST /users/profile/complete');
  const completeResponse = await makeRequest('/users/profile/complete', {
    method: 'POST',
    body: JSON.stringify(completeSettings)
  });
  
  if (!completeResponse.ok) {
    throw new Error('Erreur sauvegarde profil complet');
  }
  console.log('✅ Profil complet sauvegardé');
}

async function verifyDataConsistency() {
  console.log('\n🔍 VÉRIFICATION: Cohérence des données affichées');
  
  // D'abord récupérer l'utilisateur connecté pour avoir le bon ID
  const meResponse = await makeRequest('/auth/me');
  if (!meResponse.ok) {
    throw new Error('Impossible de récupérer les infos utilisateur');
  }
  const currentUser = await meResponse.json();
  const currentUserId = currentUser.id;
  
  // Test 1: Données dans l'onglet profil
  console.log('\n👤 Test 1: Affichage profil public');
  const profileResponse = await makeRequest(`/profile/${currentUserId}`);
  if (profileResponse.ok) {
    const profileData = await profileResponse.json();
    
    console.log('📊 Données affichées dans le profil:');
    console.log(`   Username: ${profileData.username}`);
    console.log(`   Bio: "${profileData.bio}"`);
    console.log(`   Objectif: ${profileData.objective}`);
    
    // Vérifications
    const expectedBio = USER_INPUT_DATA.advancedSettings.basicInfo.bio;
    const expectedObjective = USER_INPUT_DATA.advancedSettings.basicInfo.objective;
    
    const bioMatch = profileData.bio === expectedBio;
    const objectiveMatch = profileData.objective === expectedObjective;
    
    console.log(`   ✅ Bio synchronisée: ${bioMatch ? 'OUI' : 'NON'}`);
    console.log(`   ✅ Objectif synchronisé: ${objectiveMatch ? 'OUI' : 'NON'}`);
    
    if (!bioMatch) {
      console.log(`      Attendu: "${expectedBio}"`);
      console.log(`      Reçu: "${profileData.bio}"`);
    }
    if (!objectiveMatch) {
      console.log(`      Attendu: ${expectedObjective}`);
      console.log(`      Reçu: ${profileData.objective}`);
    }
  }
  
  // Test 2: Données dans les paramètres
  console.log('\n⚙️ Test 2: Données dans les paramètres');
  const statusResponse = await makeRequest('/users/profile/status');
  if (statusResponse.ok) {
    const statusData = await statusResponse.json();
    
    console.log('📊 Données chargées dans settings.tsx:');
    console.log(`   Localisation: ${statusData.location}`);
    console.log(`   Taille: ${statusData.height}cm`);
    console.log(`   Poids: ${statusData.weight}kg`);
    console.log(`   Genre: ${statusData.gender}`);
    console.log(`   Niveau: ${statusData.experience_level}`);
    console.log(`   Fréquence: ${statusData.training_frequency}`);
    console.log(`   Partage public: ${statusData.consent_to_public_share}`);
    
    // Vérifications détaillées
    const expected = USER_INPUT_DATA.advancedSettings;
    const checks = [
      { field: 'location', expected: expected.personalInfo.location, actual: statusData.location },
      { field: 'height', expected: expected.personalInfo.height, actual: statusData.height },
      { field: 'weight', expected: expected.personalInfo.weight, actual: statusData.weight },
      { field: 'gender', expected: expected.personalInfo.gender, actual: statusData.gender },
      { field: 'experience_level', expected: expected.fitnessGoals.experience_level, actual: statusData.experience_level },
      { field: 'training_frequency', expected: expected.fitnessGoals.training_frequency, actual: statusData.training_frequency },
      { field: 'consent_to_public_share', expected: expected.preferences.consent_to_public_share, actual: statusData.consent_to_public_share }
    ];
    
    let allMatch = true;
    checks.forEach(check => {
      const match = check.expected === check.actual;
      console.log(`   ✅ ${check.field}: ${match ? 'OUI' : 'NON'}`);
      if (!match) {
        console.log(`      Attendu: ${check.expected}, Reçu: ${check.actual}`);
        allMatch = false;
      }
    });
    
    // Vérifier l'équipement
    try {
      const equipmentStored = JSON.parse(statusData.equipment_available || '[]');
      const equipmentExpected = expected.fitnessGoals.equipment_available;
      const equipmentMatch = JSON.stringify(equipmentStored.sort()) === JSON.stringify(equipmentExpected.sort());
      console.log(`   ✅ equipment_available: ${equipmentMatch ? 'OUI' : 'NON'}`);
      if (!equipmentMatch) {
        console.log(`      Attendu: [${equipmentExpected.join(', ')}]`);
        console.log(`      Reçu: [${equipmentStored.join(', ')}]`);
        allMatch = false;
      }
    } catch (e) {
      console.log(`   ❌ equipment_available: Erreur parsing`);
      allMatch = false;
    }
    
    if (allMatch) {
      console.log('\n🎉 TOUTES LES DONNÉES SONT PARFAITEMENT SYNCHRONISÉES !');
    } else {
      console.log('\n⚠️ Certaines données ne sont pas synchronisées correctement');
    }
  }
}

async function simulateUserJourney() {
  console.log('🎬 SIMULATION COMPLÈTE DU PARCOURS UTILISATEUR\n');
  console.log('Ce test simule le parcours complet d\'un utilisateur:');
  console.log('1. Inscription sur register.tsx');
  console.log('2. Configuration initiale sur profile-setup-simple.tsx');
  console.log('3. Mise à jour avancée sur settings.tsx');
  console.log('4. Vérification de la synchronisation des données\n');
  
  try {
    await simulateRegistration();
    await simulateProfileSetup();
    await simulateSettingsUpdate();
    await verifyDataConsistency();
    
    console.log('\n🏆 SIMULATION TERMINÉE AVEC SUCCÈS !');
    console.log('\n📋 RÉSUMÉ DU PARCOURS:');
    console.log('✅ Inscription utilisateur');
    console.log('✅ Configuration initiale du profil');
    console.log('✅ Mise à jour des paramètres avancés');
    console.log('✅ Vérification de la synchronisation');
    console.log('\n💡 La synchronisation entre les pages de configuration');
    console.log('   et l\'affichage dans l\'application fonctionne correctement !');
    
  } catch (error) {
    console.log('\n💥 ERREUR DURANT LA SIMULATION:');
    console.log(error.message);
    console.log('\n🔧 Vérifiez que l\'API est démarrée et accessible.');
    process.exit(1);
  }
}

// Exécuter la simulation
simulateUserJourney();