import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  Pressable,
  StyleSheet,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useAuth } from '@/hooks/useAuth';
import { useAppTheme } from '@/theme/ThemeProvider';
import { AppButton } from '@/components/AppButton';

export default function LoginScreen() {
  const router = useRouter();
  const { login, isAuthenticated, isLoading } = useAuth();
  const { theme } = useAppTheme();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  // Redirection automatique si déjà authentifié
  useEffect(() => {
    if (!isLoading && isAuthenticated) {
      console.log('User already authenticated, checking profile completion...');
      // Laisser l'AuthGuard gérer la redirection
    }
  }, [isAuthenticated, isLoading]);

  const handleLogin = async () => {
    if (!username.trim() || !password.trim()) {
      Alert.alert('Erreur', 'Veuillez remplir tous les champs');
      return;
    }

    setLoading(true);
    try {
      console.log('=== LOGIN SIMPLIFIÉ ===');
      
      // Appel direct à l'API sans passer par le hook useAuth
      const response = await fetch('http://172.20.10.2:8000/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: username.trim(), password })
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.detail || 'Erreur de connexion');
      }
      
      const data = await response.json();
      console.log('✅ Connexion réussie');
      
      // Redirection directe
      router.push('/(tabs)');
      
    } catch (error) {
      console.error('❌ Erreur de connexion:', error);
      Alert.alert(
        'Erreur de connexion',
        error instanceof Error ? error.message : 'Nom d\'utilisateur ou mot de passe incorrect'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={[styles.container, { backgroundColor: theme.colors.background }]}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.header}>
          <Text style={[styles.title, { color: theme.colors.textPrimary }]}>🦍 Gorillax</Text>
          <Text style={[styles.subtitle, { color: theme.colors.textSecondary }]}>Connecte-toi pour continuer</Text>
        </View>

        <View style={styles.form}>
          <View style={styles.inputContainer}>
            <Text style={[styles.label, { color: theme.colors.textPrimary }]}>Nom d'utilisateur</Text>
            <TextInput
              style={[styles.input, { backgroundColor: theme.colors.surface, color: theme.colors.textPrimary, borderColor: theme.colors.border }]}
              value={username}
              onChangeText={setUsername}
              placeholder="Entrez votre nom d'utilisateur"
              placeholderTextColor={theme.colors.textSecondary}
              autoCapitalize="none"
              autoCorrect={false}
              editable={!loading}
            />
          </View>

          <View style={styles.inputContainer}>
            <Text style={[styles.label, { color: theme.colors.textPrimary }]}>Mot de passe</Text>
            <TextInput
              style={[styles.input, { backgroundColor: theme.colors.surface, color: theme.colors.textPrimary, borderColor: theme.colors.border }]}
              value={password}
              onChangeText={setPassword}
              placeholder="Entrez votre mot de passe"
              placeholderTextColor={theme.colors.textSecondary}
              secureTextEntry
              autoCapitalize="none"
              editable={!loading}
            />
          </View>

          <AppButton
            title="Se connecter"
            onPress={handleLogin}
            loading={loading}
            disabled={loading}
            style={styles.button}
          />

          <AppButton
            title="🚀 Test Navigation"
            onPress={() => router.push('/(tabs)')}
            variant="secondary"
            style={[styles.button, { marginTop: 10 }]}
          />

          <Pressable
            style={styles.linkButton}
            onPress={() => router.push('/register')}
            disabled={loading}
          >
            <Text style={[styles.linkText, { color: theme.colors.accent }]}>
              Pas encore de compte ? S'inscrire
            </Text>
          </Pressable>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: 20,
  },
  header: {
    alignItems: 'center',
    marginBottom: 40,
  },
  title: {
    fontSize: 48,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
  },
  form: {
    width: '100%',
  },
  inputContainer: {
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 8,
  },
  input: {
    height: 50,
    borderRadius: 12,
    paddingHorizontal: 16,
    fontSize: 16,
    borderWidth: 1,
  },
  button: {
    marginTop: 10,
  },
  linkButton: {
    marginTop: 20,
    alignItems: 'center',
  },
  linkText: {
    fontSize: 14,
    fontWeight: '500',
  },
});

