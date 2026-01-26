import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { router } from 'expo-router';

export default function ProfileSetupSimple() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>🦍 Configuration du profil</Text>
      <Text style={styles.subtitle}>Version simplifiée pour test</Text>
      
      <TouchableOpacity
        style={styles.button}
        onPress={() => {
          console.log('Bouton cliqué !');
          Alert.alert(
            'Profil configuré !',
            'Redirection vers l\'application...',
            [{ text: 'Continuer', onPress: () => router.replace('/(tabs)') }]
          );
        }}
      >
        <Text style={styles.buttonText}>✅ Terminer la configuration</Text>
      </TouchableOpacity>
      
      <TouchableOpacity
        style={[styles.button, styles.skipButton]}
        onPress={() => router.replace('/(tabs)')}
      >
        <Text style={styles.buttonText}>⏭️ Passer pour l'instant</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#f8f9fa',
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    marginBottom: 10,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    marginBottom: 40,
    textAlign: 'center',
  },
  button: {
    backgroundColor: '#007bff',
    paddingVertical: 15,
    paddingHorizontal: 30,
    borderRadius: 10,
    marginBottom: 15,
    minWidth: 250,
  },
  skipButton: {
    backgroundColor: '#6c757d',
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
  },
});