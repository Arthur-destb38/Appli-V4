import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import { router } from 'expo-router';

export default function DebugRegisterScreen() {
  const [logs, setLogs] = useState<string[]>([]);
  
  const addLog = (message: string) => {
    const timestamp = new Date().toLocaleTimeString();
    setLogs(prev => [...prev, `[${timestamp}] ${message}`]);
    console.log(message);
  };
  
  const clearLogs = () => {
    setLogs([]);
  };
  
  const testSimpleNavigation = () => {
    addLog('🧪 Test navigation simple...');
    router.push('/profile-setup-simple');
  };
  
  const testApiCall = async () => {
    addLog('🌐 Test appel API...');
    
    try {
      const response = await fetch('http://localhost:8000/health');
      addLog(`📡 Health check: ${response.status}`);
      
      if (response.ok) {
        addLog('✅ API accessible');
        
        // Test inscription
        const testUser = {
          username: `debuguser${Date.now()}`,
          email: `debug${Date.now()}@example.com`,
          password: 'DebugPassword123'
        };
        
        addLog(`📤 Test inscription: ${testUser.username}`);
        
        const registerResponse = await fetch('http://localhost:8000/auth/register-v2', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(testUser)
        });
        
        addLog(`📥 Inscription response: ${registerResponse.status}`);
        
        if (registerResponse.ok) {
          addLog('✅ Inscription réussie !');
          addLog('🔄 Navigation vers profil...');
          router.push('/profile-setup-simple');
        } else {
          const error = await registerResponse.text();
          addLog(`❌ Erreur inscription: ${error}`);
        }
        
      } else {
        addLog('❌ API non accessible');
      }
      
    } catch (error) {
      addLog(`💥 Erreur: ${error}`);
    }
  };
  
  return (
    <View style={styles.container}>
      <Text style={styles.title}>🔍 Debug Inscription</Text>
      
      <View style={styles.buttonContainer}>
        <TouchableOpacity style={styles.button} onPress={testSimpleNavigation}>
          <Text style={styles.buttonText}>🧪 Test Navigation Simple</Text>
        </TouchableOpacity>
        
        <TouchableOpacity style={[styles.button, styles.apiButton]} onPress={testApiCall}>
          <Text style={styles.buttonText}>🌐 Test API + Inscription</Text>
        </TouchableOpacity>
        
        <TouchableOpacity style={[styles.button, styles.clearButton]} onPress={clearLogs}>
          <Text style={styles.buttonText}>🗑️ Effacer logs</Text>
        </TouchableOpacity>
        
        <TouchableOpacity style={[styles.button, styles.backButton]} onPress={() => router.back()}>
          <Text style={styles.buttonText}>← Retour</Text>
        </TouchableOpacity>
      </View>
      
      <ScrollView style={styles.logsContainer}>
        <Text style={styles.logsTitle}>📋 Logs:</Text>
        {logs.map((log, index) => (
          <Text key={index} style={styles.logText}>{log}</Text>
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
    padding: 20,
    paddingTop: 60,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 30,
  },
  buttonContainer: {
    marginBottom: 20,
  },
  button: {
    backgroundColor: '#007bff',
    padding: 15,
    borderRadius: 10,
    marginBottom: 10,
    alignItems: 'center',
  },
  apiButton: {
    backgroundColor: '#28a745',
  },
  clearButton: {
    backgroundColor: '#ffc107',
  },
  backButton: {
    backgroundColor: '#6c757d',
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  logsContainer: {
    flex: 1,
    backgroundColor: '#000',
    borderRadius: 10,
    padding: 10,
  },
  logsTitle: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  logText: {
    color: '#00ff00',
    fontSize: 12,
    fontFamily: 'monospace',
    marginBottom: 2,
  },
});