import { CatMascot } from '@/components/CatMascot';
import { DaySelector } from '@/components/DaySelector';
import { borderRadius, colors, fontSize, spacing } from '@/constants/theme';
import { useOnboarding } from '@/context/OnboardingContext';
import {
  createHabit,
  DayOfWeek,
  formatDate,
  toggleHabitCompletion,
} from '@/database';
import Ionicons from '@expo/vector-icons/Ionicons';
import * as Haptics from 'expo-haptics';
import { useState } from 'react';
import {
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export function Onboarding() {
  const {
    step,
    firstHabitId,
    setFirstHabitId,
    advanceStep,
    completeOnboarding,
  } = useOnboarding();

  // Step 2 state - default to Mon-Fri
  const [habitName, setHabitName] = useState('');
  const [selectedDays, setSelectedDays] = useState<DayOfWeek[]>([
    'mon', 'tue', 'wed', 'thu', 'fri'
  ]);

  // Step 3 state
  const [isChecked, setIsChecked] = useState(false);

  const toggleDay = (day: DayOfWeek) => {
    setSelectedDays((prev) =>
      prev.includes(day) ? prev.filter((d) => d !== day) : [...prev, day],
    );
  };

  const handleCreateHabit = async () => {
    if (!habitName.trim() || selectedDays.length === 0) return;

    const habit = createHabit(habitName.trim(), selectedDays);
    setFirstHabitId(habit.id);
    await advanceStep();
  };

  const handleCheckHabit = async () => {
    if (!firstHabitId) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    toggleHabitCompletion(firstHabitId, formatDate(new Date()));
    setIsChecked(true);
    // Small delay before advancing to let the animation be seen
    setTimeout(() => {
      advanceStep();
    }, 500);
  };

  // Step 1: Welcome
  if (step === 1) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.skipContainer}>
          <Pressable style={styles.skipButton} onPress={completeOnboarding}>
            <Text style={styles.skipText}>Skip</Text>
          </Pressable>
        </View>
        <View style={styles.content}>
          <CatMascot variant="waving" size="xl" />
          <Text style={styles.title}>Welcome to Habcat</Text>
          <Text style={styles.description}>
            No streaks. No guilt. Just simple daily habits.
          </Text>
        </View>
        <View style={styles.footer}>
          <Pressable style={styles.button} onPress={advanceStep}>
            <Text style={styles.buttonText}>Get Started</Text>
          </Pressable>
        </View>
      </SafeAreaView>
    );
  }

  // Step 2: Create first habit
  if (step === 2) {
    const canContinue = habitName.trim().length > 0 && selectedDays.length > 0;

    return (
      <SafeAreaView style={styles.container}>
        <KeyboardAvoidingView
          style={styles.keyboardAvoid}
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        >
          <View style={styles.skipContainer}>
            <Pressable style={styles.skipButton} onPress={completeOnboarding}>
              <Text style={styles.skipText}>Skip</Text>
            </Pressable>
          </View>
          <ScrollView
            style={styles.scrollView}
            contentContainerStyle={styles.scrollContent}
            keyboardShouldPersistTaps="handled"
          >
            <View style={styles.stepHeader}>
              <CatMascot variant="peeking" size="lg" />
              <Text style={styles.title}>Create your first habit</Text>
              <Text style={styles.description}>
                Start small. You can change it anytime.
              </Text>
            </View>

            <View style={styles.form}>
              <Text style={styles.label}>Habit name</Text>
              <TextInput
                style={styles.input}
                value={habitName}
                onChangeText={setHabitName}
                placeholder="e.g., Drink water, Read, Stretch"
                placeholderTextColor={colors.mutedForeground}
                autoFocus
                returnKeyType="done"
                blurOnSubmit
                onSubmitEditing={() => Keyboard.dismiss()}
              />

              <Text style={[styles.label, { marginTop: spacing.lg }]}>
                Days of week
              </Text>
              <DaySelector
                selectedDays={selectedDays}
                onToggleDay={toggleDay}
              />
            </View>
          </ScrollView>

          <View style={styles.footer}>
            <Pressable
              style={[styles.button, !canContinue && styles.buttonDisabled]}
              onPress={handleCreateHabit}
              disabled={!canContinue}
            >
              <Text style={styles.buttonText}>Add Habit</Text>
            </Pressable>
          </View>
        </KeyboardAvoidingView>
      </SafeAreaView>
    );
  }

  // Step 3: Today (guided)
  if (step === 3) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.skipContainer}>
          <Pressable style={styles.skipButton} onPress={completeOnboarding}>
            <Text style={styles.skipText}>Skip</Text>
          </Pressable>
        </View>
        <View style={styles.todayHeader}>
          <View>
            <Text style={styles.title}>Today</Text>
            <Text style={styles.subtitle}>Here is today's habit</Text>
          </View>
          <CatMascot variant="sitting" size="lg" />
        </View>

        <View style={styles.todayContent}>
          <Pressable
            style={styles.habitItem}
            onPress={handleCheckHabit}
            disabled={isChecked}
          >
            <Text
              style={[styles.habitName, isChecked && styles.habitNameCompleted]}
            >
              {habitName}
            </Text>
            <View
              style={[styles.checkbox, isChecked && styles.checkboxCompleted]}
            >
              {isChecked && (
                <Ionicons
                  name="checkmark"
                  size={20}
                  color={colors.primaryForeground}
                />
              )}
            </View>
          </Pressable>

          {!isChecked && (
            <Text style={styles.helperText}>
              Tap the circle when you're done
            </Text>
          )}
        </View>
      </SafeAreaView>
    );
  }

  // Step 4: First completion
  if (step === 4) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.skipContainer}>
          <Pressable style={styles.skipButton} onPress={completeOnboarding}>
            <Text style={styles.skipText}>Skip</Text>
          </Pressable>
        </View>
        <View style={styles.content}>
          <CatMascot variant="celebrating" size="xl" />
          <Text style={styles.title}>Nice work</Text>
          <Text style={styles.description}>That's it. Come back tomorrow.</Text>
        </View>
        <View style={styles.footer}>
          <Pressable style={styles.button} onPress={completeOnboarding}>
            <Text style={styles.buttonText}>Continue</Text>
          </Pressable>
        </View>
      </SafeAreaView>
    );
  }

  return null;
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  keyboardAvoid: {
    flex: 1,
    backgroundColor: colors.background,
  },
  skipContainer: {
    alignItems: 'flex-end',
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.sm,
  },
  skipButton: {
    padding: spacing.sm,
  },
  skipText: {
    fontSize: fontSize.sm,
    color: colors.mutedForeground,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.xl,
  },
  content: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.xl,
  },
  stepHeader: {
    alignItems: 'center',
    marginBottom: spacing.xl,
  },
  title: {
    fontSize: fontSize.xxl,
    fontWeight: '700',
    color: colors.foreground,
    marginTop: spacing.lg,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: fontSize.base,
    color: colors.mutedForeground,
    marginTop: spacing.xs,
  },
  description: {
    fontSize: fontSize.base,
    color: colors.mutedForeground,
    textAlign: 'center',
    marginTop: spacing.md,
    lineHeight: 24,
  },
  footer: {
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.xl,
  },
  button: {
    backgroundColor: colors.primary,
    paddingVertical: spacing.md,
    borderRadius: borderRadius.lg,
    alignItems: 'center',
  },
  buttonDisabled: {
    opacity: 0.5,
  },
  buttonText: {
    color: colors.primaryForeground,
    fontSize: fontSize.base,
    fontWeight: '600',
  },
  form: {
    marginTop: spacing.md,
  },
  label: {
    fontSize: fontSize.sm,
    fontWeight: '500',
    color: colors.foreground,
    marginBottom: spacing.sm,
  },
  input: {
    backgroundColor: colors.muted,
    borderRadius: borderRadius.md,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    fontSize: fontSize.base,
    color: colors.foreground,
  },
  todayHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
    paddingBottom: spacing.lg,
  },
  todayContent: {
    paddingHorizontal: spacing.lg,
  },
  habitItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  habitName: {
    fontSize: fontSize.base,
    fontWeight: '500',
    color: colors.foreground,
    flex: 1,
  },
  habitNameCompleted: {
    textDecorationLine: 'line-through',
    color: colors.mutedForeground,
  },
  checkbox: {
    width: 28,
    height: 28,
    borderRadius: 14,
    borderWidth: 2,
    borderColor: colors.habitBorder,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkboxCompleted: {
    backgroundColor: colors.success,
    borderColor: colors.success,
  },
  helperText: {
    fontSize: fontSize.sm,
    color: colors.mutedForeground,
    textAlign: 'center',
    marginTop: spacing.lg,
  },
});
