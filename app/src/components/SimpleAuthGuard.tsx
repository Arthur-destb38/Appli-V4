import React from 'react';
import { View, ActivityIndicator, StyleSheet } from 'react-native';
import { usePathname } from 'expo-router';
import { useAuth } from '@/hooks/useAuth';
import { useAppTheme } from '@/theme/ThemeProvider';

interface SimpleAuthGuardProps {
  children: React.ReactNode;
}

export const SimpleAuthGuard: React.FC<SimpleAuthGuardProps> = ({ children }) => {
  const { isAuthenticated, isLoading } = useAuth();
  const pathname = usePathname();
  const { theme } = useAppTheme();

  // Pages publiques (pas besoin d'authentification)
  const publicPages = ['/login', '/register', '/profile-setup', '/profile-setup-simple'];
  const isPublicPage = publicPages.includes(pathname);

  // Si on est sur une page publique, on affiche le contenu
  if (isPublicPage) {
    return <>{children}</>;
  }

  // Si on charge l'auth, on affiche un loader
  if (isLoading) {
    return (
      <View style={[styles.loadingContainer, { backgroundColor: theme.colors.background }]}>
        <ActivityIndicator size="large" color={theme.colors.accent} />
      </View>
    );
  }

  // Si pas authentifié sur une page privée, on affiche quand même le contenu
  // (la logique de redirection sera gérée manuellement dans les pages)
  return <>{children}</>;
};

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});