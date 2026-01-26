// Script de debug pour tester la navigation
// À exécuter dans la console du navigateur ou dans l'app

console.log('=== DEBUG NAVIGATION GORILLAX ===');

// Test 1: Vérifier si Expo Router fonctionne
console.log('1. Test Expo Router...');
try {
  const { useRouter } = require('expo-router');
  console.log('✅ Expo Router importé');
} catch (e) {
  console.log('❌ Erreur Expo Router:', e.message);
}

// Test 2: Vérifier l'état d'authentification
console.log('2. Test Auth...');
try {
  // Simuler un appel API
  fetch('http://172.20.10.2:8000/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username: 'demo', password: 'DemoPassword123' })
  })
  .then(response => response.json())
  .then(data => {
    if (data.access_token) {
      console.log('✅ API Auth fonctionne');
      console.log('Token:', data.access_token.substring(0, 20) + '...');
    } else {
      console.log('❌ Erreur API Auth:', data);
    }
  })
  .catch(e => console.log('❌ Erreur réseau Auth:', e.message));
} catch (e) {
  console.log('❌ Erreur test Auth:', e.message);
}

// Test 3: Vérifier les routes disponibles
console.log('3. Routes disponibles:');
console.log('- /login');
console.log('- /register'); 
console.log('- /(tabs)');
console.log('- /profile-setup');

console.log('=== FIN DEBUG ===');