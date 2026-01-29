import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
} from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useAppTheme } from '@/theme/ThemeProvider';
import { useAuth } from '@/hooks/useAuth';
import { apiCall } from '@/utils/api';

const OBJECTIVES = [
  { key: 'muscle_gain', label: 'Prise de masse', icon: '💪' },
  { key: 'weight_loss', label: 'Perte de poids', icon: '🔥' },
  { key: 'strength', label: 'Force', icon: '🏋️' },
  { key: 'endurance', label: 'Endurance', icon: '🏃' },
  { key: 'general_fitness', label: 'Forme générale', icon: '✨' },
  { key: 'sport_specific', label: 'Sport spécifique', icon: '⚽' },
];

const EXPERIENCE_LEVELS = [
  { key: 'beginner', label: 'Débutant', description: 'Moins de 6 mois' },
  { key: 'intermediate', label: 'Intermédiaire', description: '6 mois - 2 ans' },
  { key: 'advanced', label: 'Avancé', description: 'Plus de 2 ans' },
];

export default function ProfileSetupSimpleFixed() {
  const { theme } = useAppTheme();
  const { user } = useAuth();
  const insets = useSafeAreaInsets();
  
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  
  // Données du profil
  const [bio, setBio] = useState('');
  const [objective, setObjective] = useState('');
  const [experienceLevel, setExperienceLevel] = useState('');
  const [trainingFrequency, setTrainingFrequency] = useState(3);
  const [consentToShare, setConsentToShare] = useState(false);

  const handleComplete = async () => {
    setLoading(true);
    try {
      // Sauvegarder les données de profil
      const profileData = {
        bio: bio.trim() || undefined,
        objective: objective || undefined,
        experience_level: experienceLevel || undefined,
        training_frequency: trainingFrequency,
        consent_to_public_share: consentToShare,
        profile_completed: true,
      };

      const response = await apiCall('/users/profile/complete', {
        method: 'POST',
        body: JSON.stringify(profileData),
      });

      if (response.ok) {
        console.log('✅ Profil setup complété !');
        router.replace('/(tabs)');
      } else {
        console.log('⚠️ Erreur sauvegarde, navigation quand même...');
        router.replace('/(tabs)');
      }
    } catch (error) {
      console.log('⚠️ Erreur setup profil:', error);
      // Navigation quand même pour ne pas bloquer l'utilisateur
      router.replace('/(tabs)');
    } finally {
      setLoading(false);
    }
  };

  const handleSkip = () => {
    console.log('⏭️ Setup profil ignoré');
    router.replace('/(tabs)');
  };

  const renderStep1 = () => (
    <View style={styles.stepContainer}>
      <Text style={[styles.stepTitle, { color: theme.colors.textPrimary }]}>
        Parle-nous de toi
      </Text>
      <Text style={[styles.stepSubtitle, { color: theme.colors.textSecondary }]}>
        Ces informations nous aideront à personnaliser ton expérience
      </Text>

      <View style={styles.inputGroup}>
        <Text style={[styles.inputLabel, { color: theme.colors.textPrimary }]}>
          Bio (optionnel)
        </Text>
        <TextInput
          style={[styles.textArea, { backgroundColor: theme.colors.surface, color: theme.colors.textPrimary, borderColor: theme.colors.border }]}
          value={bio}
          onChangeText={setBio}
          placeholder="Décris-toi en quelques mots..."
          placeholderTextColor={theme.colors.textSecondary}
          multiline
          numberOfLines={3}
          maxLength={150}
        />
        <Text style={[styles.charCount, { color: theme.colors.textSecondary }]}>
          {bio.length}/150
        </Text>
      </View>

      <View style={styles.inputGroup}>
        <Text style={[styles.inputLabel, { color: theme.colors.textPrimary }]}>
          Objectif principal
        </Text>
        <View style={styles.objectivesGrid}>
          {OBJECTIVES.map((obj) => (
            <TouchableOpacity
              key={obj.key}
              style={[
                styles.objectiveCard,
                { backgroundColor: theme.colors.surface, borderColor: theme.colors.border },
                objective === obj.key && { backgroundColor: theme.colors.accent + '20', borderColor: theme.colors.accent },
              ]}
              onPress={() => setObjective(obj.key)}
            >
              <Text style={styles.objectiveIcon}>{obj.icon}</Text>
              <Text
                style={[
                  styles.objectiveText,
                  { color: theme.colors.textPrimary },
                  objective === obj.key && { color: theme.colors.accent },
                ]}
              >
                {obj.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>
    </View>
  );

  const renderStep2 = () => (
    <View style={styles.stepContainer}>
      <Text style={[styles.stepTitle, { color: theme.colors.textPrimary }]}>
        Ton niveau fitness
      </Text>
      <Text style={[styles.stepSubtitle, { color: theme.colors.textSecondary }]}>
        Aide-nous à créer des programmes adaptés
      </Text>

      <View style={styles.inputGroup}>
        <Text style={[styles.inputLabel, { color: theme.colors.textPrimary }]}>
          Niveau d'expérience
        </Text>
        {EXPERIENCE_LEVELS.map((level) => (
          <TouchableOpacity
            key={level.key}
            style={[
              styles.levelCard,
              { backgroundColor: theme.colors.surface, borderColor: theme.colors.border },
              experienceLevel === level.key && { backgroundColor: theme.colors.accent + '20', borderColor: theme.colors.accent },
            ]}
            onPress={() => setExperienceLevel(level.key)}
          >
            <View style={styles.levelContent}>
              <Text
                style={[
                  styles.levelTitle,
                  { color: theme.colors.textPrimary },
                  experienceLevel === level.key && { color: theme.colors.accent },
                ]}
              >
                {level.label}
              </Text>
              <Text
                style={[
                  styles.levelDescription,
                  { color: theme.colors.textSecondary },
                  experienceLevel === level.key && { color: theme.colors.accent },
                ]}
              >
                {level.description}
              </Text>
            </View>
            {experienceLevel === level.key && (
              <Ionicons name="checkmark-circle" size={24} color={theme.colors.accent} />
            )}
          </TouchableOpacity>
        ))}
      </View>

      <View style={styles.inputGroup}>
        <Text style={[styles.inputLabel, { color: theme.colors.textPrimary }]}>
          Fréquence d'entraînement souhaitée
        </Text>
        <View style={styles.frequencyContainer}>
          {[1, 2, 3, 4, 5, 6, 7].map((freq) => (
            <TouchableOpacity
              key={freq}
              style={[
                styles.frequencyButton,
                { backgroundColor: theme.colors.surface, borderColor: theme.colors.border },
                trainingFrequency === freq && { backgroundColor: theme.colors.accent, borderColor: theme.colors.accent },
              ]}
              onPress={() => setTrainingFrequency(freq)}
            >
              <Text
                style={[
                  styles.frequencyText,
                  { color: theme.colors.textPrimary },
                  trainingFrequency === freq && { color: '#fff' },
                ]}
              >
                {freq}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
        <Text style={[styles.frequencyLabel, { color: theme.colors.textSecondary }]}>
          fois par semaine
        </Text>
      </View>
    </View>
  );

  const renderStep3 = () => (
    <View style={styles.stepContainer}>
      <Text style={[styles.stepTitle, { color: theme.colors.textPrimary }]}>
        Dernière étape !
      </Text>
      <Text style={[styles.stepSubtitle, { color: theme.colors.textSecondary }]}>
        Configure tes préférences de partage
      </Text>

      <View style={styles.consentContainer}>
        <TouchableOpacity
          style={styles.consentCard}
          onPress={() => setConsentToShare(!consentToShare)}
        >
          <View style={styles.consentLeft}>
            <View style={[
              styles.checkbox,
              { borderColor: theme.colors.border },
              consentToShare && { backgroundColor: theme.colors.accent, borderColor: theme.colors.accent }
            ]}>
              {consentToShare && (
                <Ionicons name="checkmark" size={16} color="#fff" />
              )}
            </View>
            <View style={styles.consentText}>
              <Text style={[styles.consentTitle, { color: theme.colors.textPrimary }]}>
                Partage public
              </Text>
              <Text style={[styles.consentDescription, { color: theme.colors.textSecondary }]}>
                J'accepte de partager mes séances publiquement
              </Text>
            </View>
          </View>
        </TouchableOpacity>
        
        <Text style={[styles.consentNote, { color: theme.colors.textSecondary }]}>
          Tu pourras modifier ce paramètre à tout moment dans les réglages
        </Text>
      </View>

      <View style={styles.summaryContainer}>
        <Text style={[styles.summaryTitle, { color: theme.colors.textPrimary }]}>
          Récapitulatif
        </Text>
        <View style={[styles.summaryCard, { backgroundColor: theme.colors.surface, borderColor: theme.colors.border }]}>
          {bio && (
            <View style={styles.summaryItem}>
              <Ionicons name="person" size={16} color={theme.colors.textSecondary} />
              <Text style={[styles.summaryText, { color: theme.colors.textSecondary }]}>
                Bio: {bio}
              </Text>
            </View>
          )}
          {objective && (
            <View style={styles.summaryItem}>
              <Ionicons name="flag" size={16} color={theme.colors.textSecondary} />
              <Text style={[styles.summaryText, { color: theme.colors.textSecondary }]}>
                Objectif: {OBJECTIVES.find(o => o.key === objective)?.label}
              </Text>
            </View>
          )}
          {experienceLevel && (
            <View style={styles.summaryItem}>
              <Ionicons name="trophy" size={16} color={theme.colors.textSecondary} />
              <Text style={[styles.summaryText, { color: theme.colors.textSecondary }]}>
                Niveau: {EXPERIENCE_LEVELS.find(l => l.key === experienceLevel)?.label}
              </Text>
            </View>
          )}
          <View style={styles.summaryItem}>
            <Ionicons name="calendar" size={16} color={theme.colors.textSecondary} />
            <Text style={[styles.summaryText, { color: theme.colors.textSecondary }]}>
              Fréquence: {trainingFrequency} fois/semaine
            </Text>
          </View>
        </View>
      </View>
    </View>
  );

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      {/* Header */}
      <LinearGradient
        colors={theme.dark ? ['#1e1b4b', '#312e81'] : ['#6366f1', '#8b5cf6']}
        style={[styles.header, { paddingTop: insets.top + 10 }]}
      >
        <Text style={styles.headerTitle}>🦍 Configuration du profil</Text>
        <Text style={styles.headerSubtitle}>Finalise ton inscription</Text>
        
        {/* Progress bar */}
        <View style={styles.progressContainer}>
          <View style={styles.progressBar}>
            <View style={[styles.progressFill, { width: `${(step / 3) * 100}%` }]} />
          </View>
          <Text style={styles.progressText}>Étape {step} sur 3</Text>
        </View>
      </LinearGradient>

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.content}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {step === 1 && renderStep1()}
          {step === 2 && renderStep2()}
          {step === 3 && renderStep3()}
        </ScrollView>

        {/* Footer avec boutons */}
        <View style={[styles.footer, { backgroundColor: theme.colors.background, borderTopColor: theme.colors.border }]}>
          <View style={styles.buttonRow}>
            {step > 1 && (
              <TouchableOpacity
                style={[styles.backButton, { backgroundColor: theme.colors.surface, borderColor: theme.colors.border }]}
                onPress={() => setStep(step - 1)}
              >
                <Ionicons name="arrow-back" size={18} color={theme.colors.textPrimary} />
                <Text style={[styles.backButtonText, { color: theme.colors.textPrimary }]}>
                  Retour
                </Text>
              </TouchableOpacity>
            )}
            
            <TouchableOpacity
              style={[styles.nextButton, { flex: step === 1 ? 1 : 0.7 }]}
              onPress={step === 3 ? handleComplete : () => setStep(step + 1)}
              disabled={loading}
            >
              <LinearGradient
                colors={['#6366f1', '#8b5cf6']}
                style={styles.nextButtonGradient}
              >
                {loading ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <>
                    <Text style={styles.nextButtonText}>
                      {step === 3 ? 'Terminer' : 'Suivant'}
                    </Text>
                    <Ionicons
                      name={step === 3 ? 'checkmark' : 'arrow-forward'}
                      size={18}
                      color="#fff"
                    />
                  </>
                )}
              </LinearGradient>
            </TouchableOpacity>
          </View>

          <TouchableOpacity style={styles.skipButton} onPress={handleSkip}>
            <Text style={[styles.skipButtonText, { color: theme.colors.textSecondary }]}>
              Passer pour l'instant
            </Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingHorizontal: 20,
    paddingBottom: 20,
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '800',
    color: '#fff',
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 16,
    color: 'rgba(255,255,255,0.8)',
    marginBottom: 20,
  },
  progressContainer: {
    width: '100%',
    alignItems: 'center',
  },
  progressBar: {
    width: '100%',
    height: 4,
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: 2,
    marginBottom: 8,
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#fff',
    borderRadius: 2,
  },
  progressText: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.8)',
    fontWeight: '500',
  },
  content: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 120,
  },
  stepContainer: {
    flex: 1,
  },
  stepTitle: {
    fontSize: 28,
    fontWeight: '800',
    marginBottom: 8,
  },
  stepSubtitle: {
    fontSize: 16,
    marginBottom: 32,
    lineHeight: 22,
  },
  inputGroup: {
    marginBottom: 24,
  },
  inputLabel: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 12,
  },
  textArea: {
    borderWidth: 1,
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    minHeight: 80,
    textAlignVertical: 'top',
  },
  charCount: {
    fontSize: 12,
    textAlign: 'right',
    marginTop: 4,
  },
  objectivesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  objectiveCard: {
    width: '48%',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    alignItems: 'center',
    gap: 8,
  },
  objectiveIcon: {
    fontSize: 24,
  },
  objectiveText: {
    fontSize: 14,
    fontWeight: '500',
    textAlign: 'center',
  },
  levelCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 8,
  },
  levelContent: {
    flex: 1,
  },
  levelTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  levelDescription: {
    fontSize: 14,
  },
  frequencyContainer: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 8,
    flexWrap: 'wrap',
  },
  frequencyButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  frequencyText: {
    fontSize: 16,
    fontWeight: '600',
  },
  frequencyLabel: {
    fontSize: 14,
    textAlign: 'center',
  },
  consentContainer: {
    marginBottom: 24,
  },
  consentCard: {
    padding: 16,
    marginBottom: 12,
  },
  consentLeft: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
  },
  checkbox: {
    width: 20,
    height: 20,
    borderRadius: 4,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 2,
  },
  consentText: {
    flex: 1,
  },
  consentTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  consentDescription: {
    fontSize: 14,
    lineHeight: 20,
  },
  consentNote: {
    fontSize: 12,
    textAlign: 'center',
    fontStyle: 'italic',
  },
  summaryContainer: {
    marginTop: 8,
  },
  summaryTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 12,
  },
  summaryCard: {
    borderRadius: 12,
    borderWidth: 1,
    padding: 16,
    gap: 12,
  },
  summaryItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  summaryText: {
    fontSize: 14,
    flex: 1,
  },
  footer: {
    padding: 20,
    borderTopWidth: 1,
  },
  buttonRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 12,
  },
  backButton: {
    flex: 0.3,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 16,
    borderRadius: 12,
    borderWidth: 1,
  },
  backButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
  nextButton: {
    borderRadius: 12,
    overflow: 'hidden',
  },
  nextButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 16,
  },
  nextButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  skipButton: {
    alignItems: 'center',
  },
  skipButtonText: {
    fontSize: 14,
    fontWeight: '500',
  },
});