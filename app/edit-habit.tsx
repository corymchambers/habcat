import { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  Pressable,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from "react-native";
import { useRouter, useLocalSearchParams } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import Ionicons from "@expo/vector-icons/Ionicons";
import { colors, spacing, fontSize, borderRadius } from "@/constants/theme";
import { getAllHabits, updateHabit, deleteHabit, parseDays, DayOfWeek } from "@/database";

const DAYS: { key: DayOfWeek; label: string }[] = [
  { key: "mon", label: "Mon" },
  { key: "tue", label: "Tue" },
  { key: "wed", label: "Wed" },
  { key: "thu", label: "Thu" },
  { key: "fri", label: "Fri" },
  { key: "sat", label: "Sat" },
  { key: "sun", label: "Sun" },
];

export default function EditHabitScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const habitId = parseInt(id || "0", 10);

  const [name, setName] = useState("");
  const [selectedDays, setSelectedDays] = useState<Set<DayOfWeek>>(new Set());
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const habits = getAllHabits();
    const habit = habits.find((h) => h.id === habitId);
    if (habit) {
      setName(habit.name);
      setSelectedDays(new Set(parseDays(habit.days)));
    }
    setLoading(false);
  }, [habitId]);

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

    updateHabit(habitId, name.trim(), Array.from(selectedDays));
    router.back();
  };

  const handleDelete = () => {
    Alert.alert(
      "Delete Habit",
      "Are you sure you want to delete this habit? This will also delete all completion history.",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: () => {
            deleteHabit(habitId);
            router.back();
          },
        },
      ]
    );
  };

  const canSave = name.trim().length > 0 && selectedDays.size > 0;

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loading}>
          <Text style={styles.loadingText}>Loading...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={["top", "bottom"]}>
      <KeyboardAvoidingView
        style={styles.content}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
      >
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>Edit Habit</Text>
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

        {/* Footer */}
        <View style={styles.footer}>
          <Pressable
            style={[styles.saveButton, !canSave && styles.saveButtonDisabled]}
            onPress={handleSave}
            disabled={!canSave}
          >
            <Text style={styles.saveButtonText}>Save Changes</Text>
          </Pressable>

          <Pressable style={styles.deleteButton} onPress={handleDelete}>
            <Text style={styles.deleteButtonText}>Delete Habit</Text>
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
  loading: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  loadingText: {
    fontSize: fontSize.base,
    color: colors.mutedForeground,
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
    gap: spacing.sm,
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
  deleteButton: {
    padding: spacing.md,
    alignItems: "center",
  },
  deleteButtonText: {
    fontSize: fontSize.base,
    fontWeight: "500",
    color: colors.destructive,
  },
});
