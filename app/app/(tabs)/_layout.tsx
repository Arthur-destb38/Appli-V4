import { Tabs, useRouter } from 'expo-router';
import React, { useEffect } from 'react';
import { View, StyleSheet, Platform, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useAppTheme } from '@/theme/ThemeProvider';
import { useTranslations } from '@/hooks/usePreferences';
import { useAuth } from '@/hooks/useAuth';

export default function TabLayout() {
  const { theme } = useAppTheme();
  const { t, isLoading } = useTranslations();
  const { isAuthenticated, isLoading: authLoading } = useAuth();
  const router = useRouter();
  const insets = useSafeAreaInsets();

  // 🔒 BLOQUER L'ACCÈS SI PAS AUTHENTIFIÉ
  useEffect(() => {
    console.log('🔒 TabLayout - authLoading:', authLoading, 'isAuthenticated:', isAuthenticated);
    if (!authLoading && !isAuthenticated) {
      console.log('❌ Accès refusé aux tabs - redirection vers login');
      router.replace('/login');
    }
  }, [authLoading, isAuthenticated, router]);

  // Afficher un loader pendant la vérification
  if (authLoading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: theme.colors.background }}>
        <ActivityIndicator size="large" color={theme.colors.accent} />
      </View>
    );
  }

  // Si pas authentifié, ne rien afficher (la redirection va se faire)
  if (!isAuthenticated) {
    return null;
  }

  // Si les traductions sont en cours de chargement, utiliser les valeurs par défaut
  const getTitle = (key: string, fallback: string) => {
    return isLoading ? fallback : t(key as any);
  };

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: theme.colors.accent,
        tabBarInactiveTintColor: theme.colors.textSecondary,
        tabBarStyle: {
          backgroundColor: theme.colors.surface,
          borderTopColor: theme.colors.border,
          borderTopWidth: StyleSheet.hairlineWidth,
          paddingTop: 8,
          paddingBottom: Platform.OS === 'ios' ? insets.bottom : 12,
          height: Platform.OS === 'ios' ? 84 : 64,
        },
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: '600',
          marginTop: 4,
        },
      }}
    >
        <Tabs.Screen
          name="index"
          options={{
            title: getTitle('home', 'Accueil'),
            tabBarIcon: ({ color, size, focused }) => (
              <Ionicons 
                name={focused ? 'home' : 'home-outline'} 
                size={24} 
                color={color} 
              />
            ),
          }}
        />
        <Tabs.Screen
          name="feed"
          options={{
            title: getTitle('feed', 'Réseau'),
            tabBarIcon: ({ color, size, focused }) => (
              <Ionicons 
                name={focused ? 'people' : 'people-outline'} 
                size={24} 
                color={color} 
              />
            ),
          }}
        />
        <Tabs.Screen
          name="messages"
          options={{
            title: getTitle('messages', 'Messages'),
            tabBarIcon: ({ color, size, focused }) => (
              <Ionicons 
                name={focused ? 'chatbubbles' : 'chatbubbles-outline'} 
                size={24} 
                color={color} 
              />
            ),
          }}
        />
        <Tabs.Screen
          name="explore"
          options={{
            title: getTitle('explore', 'Explorer'),
            tabBarIcon: ({ color, size, focused }) => (
              <Ionicons 
                name={focused ? 'compass' : 'compass-outline'} 
                size={24} 
                color={color} 
              />
            ),
          }}
        />
        <Tabs.Screen
          name="profile"
          options={{
            title: getTitle('profile', 'Profil'),
            tabBarIcon: ({ color, size, focused }) => (
              <Ionicons 
                name={focused ? 'person' : 'person-outline'} 
                size={24} 
                color={color} 
              />
            ),
          }}
        />
      </Tabs>
  );
}
