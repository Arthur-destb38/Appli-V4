import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';

import { useAppTheme } from '@/theme/ThemeProvider';
import { useAuth } from '@/hooks/useAuth';
import { apiCall } from '@/utils/api';

type FitnessLevel = 'beginner' | 'intermediate' | 'advanced' | 'expert';
type Goal = 'muscle_gain' | 'weight_loss' | 'strength' | 'endurance' | 'health';
type Frequency = '1-2' | '3-4' | '5-6' | '7+';

export default function ProfileSetupSimple() {
  const { theme } = useAppTheme();
  const { user, updateProfile } = useAuth();
  const insets = useSafeAreaInsets();

  const [step, setStep] = useState(1);
  const [saving, setSaving] = useState(false);

  // Données du profil
  const [bio, setBio] = useState('');
  const [fitnessLevel, setFitnessLevel] = useState<FitnessLevel | null>(null);
  const [goal, setGoal] = useState<Goal | null>(null);
  const [frequency, setFrequency] = useState<Frequency | null>(null);

  const fitnessLevels = [
    { value: 'beginner' as FitnessLevel, label: 'Débutant', icon: '🌱', desc: 'Je commence la musculation' },
    { value: 'intermediate' as FitnessLevel, label: 'Intermédiaire', icon: '💪', desc: 'Je m\'entraîne régulièrement' },
    { value: 'advanced' as FitnessLevel, label: 'Avancé', icon: '🔥', desc: 'J\'ai plusieurs années d\'expérience' },
    { value: 'expert' as FitnessLevel, label: 'Expert', icon: '🦍', desc: 'Je suis un athlète confirmé' },
  ];

  const goals = [
    { value: 'muscle_gain' as Goal, label: 'Prise de masse', icon: '💪', color: '#f59e0b' },
    { value: 'weight_loss' as Goal, label: 'Perte de poids', icon: '🔥', color: '#ef4444' },
    { value: 'strength' as Goal, label: 'Force', icon: '⚡', color: '#8b5cf6' },
    { value: 'endurance' as Goal, label: 'Endurance', icon: '🏃', color: '#10b981' },
    { value: 'health' as Goal, label: 'Santé générale', icon: '❤️', color: '#ec4899' },
  ];

  const frequencies = [
    { value: '1-2' as Frequency, label: '1-2 fois/semaine', icon: '📅' },
    { value: '3-4' as Frequency, label: '3-4 fois/semaine', icon: '📆' },
    { value: '5-6' as Frequency, label: '5-6 fois/semaine', icon: '🗓️' },
    { value: '7+' as Frequency, label: 'Tous les jours', icon: '🔥' },
  ];

  const handleSave = async () => {
    if (!user) return;

    setSaving(true);
    try {
      // Construire l'objectif textuel
      const goalText = goal ? goals.find(g => g.value === goal)?.label : '';
      const levelText = fitnessLevel ? fitnessLevels.find(l => l.value === fitnessLevel)?.label : '';
      
      let objectiveText = '';
      if (goalText && levelText) {
        objectiveText = `${goalText} - ${levelText}`;
      } else if (goalText) {
        objectiveText = goalText;
      }

      const response = await apiCall(`/users/profile/${user.id}`, {
        method: 'PUT',
        body: JSON.stringify({
          bio: bio.trim() || undefined,
          objective: objectiveText || undefined,
        }),
      });

      if (response.ok) {
        await updateProfile();
        console.log('✅ Profil configuré');
        router.replace('/(tabs)');
      } else {
        Alert.alert('Erreur', 'Impossible de sauvegarder le profil');
      }
    } catch (error) {
      console.error('❌ Erreur sauvegarde profil:', error);
      Alert.alert('Erreur', 'Impossible de sauvegarder le profil');
    } finally {
      setSaving(false);
    }
  };

  const skipSetup = () => {
    console.log('⏭️ Configuration ignorée');
    router.replace('/(tabs)');
  };

  const nextStep = () => {
    if (step < 4) setStep(step + 1);
  };

  const prevStep = () => {
    if (step > 1) setStep(step - 1);
  };

  const canContinue = () => {
    if (step === 1) return true; // Bio optionnelle
    if (step === 2) return fitnessLevel !== null;
    if (step === 3) return goal !== null;
    if (step === 4) return frequency !== null;
    return false;
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <LinearGradient
        colors={theme.mode === 'dark' ? ['#1e1b4b', '#312e81'] : ['#6366f1', '#8b5cf6']}
        style={[styles.header, { paddingTop: insets.top + 20 }]}
      >
        <Text style={styles.headerTitle}>🦍 Configuration du profil</Text>
        <Text style={styles.headerSubtitle}>Étape {step}/4</Text>
        
        {/* Progress bar */}
        <View style={styles.progressBar}>
          {[1, 2, 3, 4].map((s) => (
            <View
              key={s}
              style={[
                styles.progressDot,
                s <= step && styles.progressDotActive,
              ]}
            />
          ))}
        </View>
      </LinearGradient>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Étape 1: Bio */}
        {step === 1 && (
          <View style={styles.stepContainer}>
            <Text style={[styles.stepTitle, { color: theme.colors.textPrimary }]}>
              Parle-nous de toi
            </Text>
            <Text style={[styles.stepDesc, { color: theme.colors.textSecondary }]}>
              Écris une courte bio pour te présenter (optionnel)
            </Text>

            <View style={[styles.textAreaContainer, { backgroundColor: theme.colors.surface, borderColor: theme.colors.border }]}>
              <TextInput
                style={[styles.textArea, { color: theme.colors.textPrimary }]}
                value={bio}
                onChangeText={setBio}
                placeholder="Ex: Passionné de fitness depuis 3 ans, j'adore le powerlifting..."
                placeholderTextColor={theme.colors.textSecondary}
                multiline
                numberOfLines={4}
                maxLength={200}
              />
              <Text style={[styles.charCount, { color: theme.colors.textSecondary }]}>
                {bio.length}/200
              </Text>
            </View>
          </View>
        )}

        {/* Étape 2: Niveau */}
        {step === 2 && (
          <View style={styles.stepContainer}>
            <Text style={[styles.stepTitle, { color: theme.colors.textPrimary }]}>
              Quel est ton niveau ?
            </Text>
            <Text style={[styles.stepDesc, { color: theme.colors.textSecondary }]}>
              Cela nous aidera à personnaliser ton expérience
            </Text>

            <View style={styles.optionsGrid}>
              {fitnessLevels.map((level) => (
                <TouchableOpacity
                  key={level.value}
                  style={[
                    styles.optionCard,
                    { backgroundColor: theme.colors.surface, borderColor: theme.colors.border },
                    fitnessLevel === level.value && { borderColor: theme.colors.accent, borderWidth: 2 },
                  ]}
                  onPress={() => setFitnessLevel(level.value)}
                >
                  <Text style={styles.optionIcon}>{level.icon}</Text>
                  <Text style={[styles.optionLabel, { color: theme.colors.textPrimary }]}>
                    {level.label}
                  </Text>
                  <Text style={[styles.optionDesc, { color: theme.colors.textSecondary }]}>
                    {level.desc}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        )}

        {/* Étape 3: Objectif */}
        {step === 3 && (
          <View style={styles.stepContainer}>
            <Text style={[styles.stepTitle, { color: theme.colors.textPrimary }]}>
              Quel est ton objectif principal ?
            </Text>
            <Text style={[styles.stepDesc, { color: theme.colors.textSecondary }]}>
              Tu pourras le modifier plus tard
            </Text>

            <View style={styles.optionsGrid}>
              {goals.map((g) => (
                <TouchableOpacity
                  key={g.value}
                  style={[
                    styles.goalCard,
                    { backgroundColor: theme.colors.surface, borderColor: theme.colors.border },
                    goal === g.value && { borderColor: g.color, borderWidth: 2 },
                  ]}
                  onPress={() => setGoal(g.value)}
                >
                  <Text style={styles.goalIcon}>{g.icon}</Text>
                  <Text style={[styles.goalLabel, { color: theme.colors.textPrimary }]}>
                    {g.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        )}

        {/* Étape 4: Fréquence */}
        {step === 4 && (
          <View style={styles.stepContainer}>
            <Text style={[styles.stepTitle, { color: theme.colors.textPrimary }]}>
              À quelle fréquence t'entraînes-tu ?
            </Text>
            <Text style={[styles.stepDesc, { color: theme.colors.textSecondary }]}>
              Cela nous aide à adapter tes programmes
            </Text>

            <View style={styles.optionsList}>
              {frequencies.map((freq) => (
                <TouchableOpacity
                  key={freq.value}
                  style={[
                    styles.frequencyCard,
                    { backgroundColor: theme.colors.surface, borderColor: theme.colors.border },
                    frequency === freq.value && { borderColor: theme.colors.accent, borderWidth: 2 },
                  ]}
                  onPress={() => setFrequency(freq.value)}
                >
                  <Text style={styles.frequencyIcon}>{freq.icon}</Text>
                  <Text style={[styles.frequencyLabel, { color: theme.colors.textPrimary }]}>
                    {freq.label}
                  </Text>
                  {frequency === freq.value && (
                    <Ionicons name="checkmark-circle" size={24} color={theme.colors.accent} />
                  )}
                </TouchableOpacity>
              ))}
            </View>
          </View>
        )}
      </ScrollView>

      {/* Navigation buttons */}
      <View style={[styles.footer, { backgroundColor: theme.colors.surface, paddingBottom: insets.bottom + 20 }]}>
        <View style={styles.footerButtons}>
          {step > 1 && (
            <TouchableOpacity
              style={[styles.backButton, { borderColor: theme.colors.border }]}
              onPress={prevStep}
            >
              <Ionicons name="arrow-back" size={20} color={theme.colors.textPrimary} />
              <Text style={[styles.backButtonText, { color: theme.colors.textPrimary }]}>
                Retour
              </Text>
            </TouchableOpacity>
          )}

          <TouchableOpacity
            style={[styles.skipButton]}
            onPress={skipSetup}
          >
            <Text style={[styles.skipText, { color: theme.colors.textSecondary }]}>
              Passer
            </Text>
          </TouchableOpacity>

          {step < 4 ? (
            <TouchableOpacity
              style={[
                styles.nextButton,
                { backgroundColor: theme.colors.accent },
                !canContinue() && { opacity: 0.5 },
              ]}
              onPress={nextStep}
              disabled={!canContinue()}
            >
              <Text style={styles.nextButtonText}>Suivant</Text>
              <Ionicons name="arrow-forward" size={20} color="#fff" />
            </TouchableOpacity>
          ) : (
            <TouchableOpacity
              style={[
                styles.nextButton,
                { backgroundColor: theme.colors.accent },
                (!canContinue() || saving) && { opacity: 0.5 },
              ]}
              onPress={handleSave}
              disabled={!canContinue() || saving}
            >
              {saving ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <>
                  <Text style={styles.nextButtonText}>Terminer</Text>
                  <Ionicons name="checkmark" size={20} color="#fff" />
                </>
              )}
            </TouchableOpacity>
          )}
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingHorizontal: 20,
    paddingBottom: 24,
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '800',
    color: '#fff',
    marginBottom: 8,
  },
  headerSubtitle: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.8)',
    marginBottom: 20,
  },
  progressBar: {
    flexDirection: 'row',
    gap: 8,
  },
  progressDot: {
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: 'rgba(255,255,255,0.3)',
  },
  progressDotActive: {
    backgroundColor: '#fff',
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 120,
  },
  stepContainer: {
    gap: 20,
  },
  stepTitle: {
    fontSize: 24,
    fontWeight: '700',
    textAlign: 'center',
  },
  stepDesc: {
    fontSize: 16,
    textAlign: 'center',
    lineHeight: 22,
  },
  textAreaContainer: {
    borderRadius: 16,
    borderWidth: 1,
    padding: 16,
  },
  textArea: {
    fontSize: 16,
    minHeight: 100,
    textAlignVertical: 'top',
  },
  charCount: {
    fontSize: 12,
    textAlign: 'right',
    marginTop: 8,
  },
  optionsGrid: {
    gap: 12,
  },
  optionCard: {
    padding: 20,
    borderRadius: 16,
    borderWidth: 1,
    alignItems: 'center',
  },
  optionIcon: {
    fontSize: 40,
    marginBottom: 12,
  },
  optionLabel: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 4,
  },
  optionDesc: {
    fontSize: 14,
    textAlign: 'center',
  },
  goalCard: {
    padding: 20,
    borderRadius: 16,
    borderWidth: 1,
    alignItems: 'center',
    flexDirection: 'row',
    gap: 12,
  },
  goalIcon: {
    fontSize: 32,
  },
  goalLabel: {
    fontSize: 16,
    fontWeight: '600',
    flex: 1,
  },
  optionsList: {
    gap: 12,
  },
  frequencyCard: {
    padding: 20,
    borderRadius: 16,
    borderWidth: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  frequencyIcon: {
    fontSize: 28,
  },
  frequencyLabel: {
    fontSize: 16,
    fontWeight: '600',
    flex: 1,
  },
  footer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    paddingTop: 20,
    paddingHorizontal: 20,
    borderTopWidth: 1,
    borderTopColor: 'rgba(0,0,0,0.1)',
  },
  footerButtons: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderRadius: 12,
    borderWidth: 1,
  },
  backButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
  skipButton: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 14,
  },
  skipText: {
    fontSize: 14,
    fontWeight: '500',
  },
  nextButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: 12,
  },
  nextButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});