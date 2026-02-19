/**
 * Point d'entrée de l'application — logique identique à OPPS home() :
 *   - auth en cours  → splash screen
 *   - authentifié    → app principale (tabs)
 *   - non authentifié → écran de connexion
 */
import React from 'react';
import { View, Text, ActivityIndicator, StyleSheet } from 'react-native';
import { Redirect } from 'expo-router';
import { useAuth } from '@/hooks/useAuth';
import { useAppTheme } from '@/theme/ThemeProvider';

export default function Index() {
  const { isAuthenticated, isLoading } = useAuth();
  const { theme } = useAppTheme();

  // Pendant la vérification des tokens stockés → splash
  if (isLoading) {
    return (
      <View style={[styles.splash, { backgroundColor: theme.colors.background }]}>
        <Text style={[styles.logo, { color: theme.colors.textPrimary }]}>🦍</Text>
        <Text style={[styles.appName, { color: theme.colors.textPrimary }]}>Gorillax</Text>
        <ActivityIndicator
          style={styles.loader}
          size="large"
          color={theme.colors.accent}
        />
      </View>
    );
  }

  // Même logique que OPPS : home() → dashboard si connecté, login sinon
  return <Redirect href={isAuthenticated ? '/(tabs)' : '/login'} />;
}

const styles = StyleSheet.create({
  splash: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  logo: {
    fontSize: 72,
    marginBottom: 8,
  },
  appName: {
    fontSize: 32,
    fontWeight: '800',
    letterSpacing: 1,
    marginBottom: 40,
  },
  loader: {
    marginTop: 16,
  },
});
