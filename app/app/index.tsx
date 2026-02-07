import React, { useEffect } from 'react';
import { View, ActivityIndicator, StyleSheet } from 'react-native';
import { Redirect } from 'expo-router';
import { useAuth } from '@/hooks/useAuth';
import { useAppTheme } from '@/theme/ThemeProvider';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function Index() {
  const { isAuthenticated, isLoading, user } = useAuth();
  const { theme } = useAppTheme();

  // 🧹 EFFACER LE STORAGE AU PREMIER LANCEMENT
  useEffect(() => {
    AsyncStorage.clear().then(() => console.log('🧹 Storage effacé'));
  }, []);

  console.log('🏠 Index - isLoading:', isLoading, 'isAuthenticated:', isAuthenticated, 'user:', user?.username);

  // Afficher un loader pendant la vérification de l'auth
  if (isLoading) {
    console.log('⏳ Chargement de l\'authentification...');
    return (
      <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
        <ActivityIndicator size="large" color={theme.colors.accent} />
      </View>
    );
  }

  // Si authentifié → app principale
  // Si non authentifié → page de login
  const destination = isAuthenticated ? '/(tabs)' : '/login';
  console.log('🎯 Redirection vers:', destination);
  
  return <Redirect href={destination} />;
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});



