import { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  Pressable,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import Ionicons from "@expo/vector-icons/Ionicons";
import { colors, spacing, fontSize, borderRadius } from "@/constants/theme";
import { createHabit, DayOfWeek } from "@/database";

const DAYS: { key: DayOfWeek; label: string }[] = [
  { key: "mon", label: "Mon" },
  { key: "tue", label: "Tue" },
  { key: "wed", label: "Wed" },
  { key: "thu", label: "Thu" },
  { key: "fri", label: "Fri" },
  { key: "sat", label: "Sat" },
  { key: "sun", label: "Sun" },
];

export default function NewHabitScreen() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [selectedDays, setSelectedDays] = useState<Set<DayOfWeek>>(
    new Set(["mon", "tue", "wed", "thu", "fri"])
  );

  const toggleDay = (day: DayOfWeek) => {
    setSelectedDays((prev) => {
      const next = new Set(prev);
      if (next.has(day)) {
        next.delete(day);
      } else {
        next.add(day);
      }
      return next;
    });
  };

  const handleSave = () => {
    if (!name.trim() || selectedDays.size === 0) return;

    createHabit(name.trim(), Array.from(selectedDays));
    router.back();
  };

  const canSave = name.trim().length > 0 && selectedDays.size > 0;

  return (
    <SafeAreaView style={styles.container} edges={["top", "bottom"]}>
      <KeyboardAvoidingView
        style={styles.content}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
      >
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>New Habit</Text>
          <Pressable onPress={() => router.back()} hitSlop={8}>
            <Ionicons name="close" size={24} color={colors.foreground} />
          </Pressable>
        </View>

        {/* Form */}
        <View style={styles.form}>
          <View style={styles.field}>
            <Text style={styles.label}>Habit name</Text>
            <TextInput
              style={styles.input}
              placeholder="e.g., Morning meditation"
              placeholderTextColor={colors.mutedForeground}
              value={name}
              onChangeText={setName}
              autoFocus
            />
          </View>

          <View style={styles.field}>
            <Text style={styles.label}>Repeat on</Text>
            <View style={styles.daysContainer}>
              {DAYS.map(({ key, label }) => {
                const isSelected = selectedDays.has(key);
                return (
                  <Pressable
                    key={key}
                    style={[
                      styles.dayButton,
                      isSelected && styles.dayButtonSelected,
                    ]}
                    onPress={() => toggleDay(key)}
                  >
                    <Text
                      style={[
                        styles.dayText,
                        isSelected && styles.dayTextSelected,
                      ]}
                    >
                      {label}
                    </Text>
                  </Pressable>
                );
              })}
            </View>
          </View>
        </View>

        {/* Save button */}
        <View style={styles.footer}>
          <Pressable
            style={[styles.saveButton, !canSave && styles.saveButtonDisabled]}
            onPress={handleSave}
            disabled={!canSave}
          >
            <Text style={styles.saveButtonText}>Add Habit</Text>
          </Pressable>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    flex: 1,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
  },
  title: {
    fontSize: fontSize.xl,
    fontWeight: "700",
    color: colors.foreground,
  },
  form: {
    flex: 1,
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
  },
  field: {
    marginBottom: spacing.lg,
  },
  label: {
    fontSize: fontSize.sm,
    fontWeight: "500",
    color: colors.mutedForeground,
    marginBottom: spacing.sm,
  },
  input: {
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.primary,
    borderRadius: borderRadius.md,
    padding: spacing.md,
    fontSize: fontSize.base,
    color: colors.foreground,
  },
  daysContainer: {
    flexDirection: "row",
    gap: spacing.sm,
  },
  dayButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: colors.secondary,
    alignItems: "center",
    justifyContent: "center",
  },
  dayButtonSelected: {
    backgroundColor: colors.primary,
  },
  dayText: {
    fontSize: fontSize.sm,
    fontWeight: "500",
    color: colors.secondaryForeground,
  },
  dayTextSelected: {
    color: colors.primaryForeground,
  },
  footer: {
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.lg,
  },
  saveButton: {
    backgroundColor: colors.primary,
    borderRadius: borderRadius.md,
    padding: spacing.md,
    alignItems: "center",
  },
  saveButtonDisabled: {
    opacity: 0.5,
  },
  saveButtonText: {
    fontSize: fontSize.base,
    fontWeight: "600",
    color: colors.primaryForeground,
  },
});
