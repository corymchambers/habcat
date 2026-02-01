import { useState, useCallback, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  ScrollView,
  Alert,
} from "react-native";
import { useFocusEffect } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import Ionicons from "@expo/vector-icons/Ionicons";
import * as Haptics from "expo-haptics";
import { colors, spacing, fontSize } from "@/constants/theme";
import { CatMascot } from "@/components/CatMascot";
import { ReviewPrompt } from "@/components/ReviewPrompt";
import { useReviewPrompt } from "@/context/ReviewPromptContext";
import {
  getTodayHabits,
  getCompletionsForDate,
  toggleHabitCompletion,
  formatDate,
} from "@/database";

type Habit = {
  id: number;
  name: string;
  days: string;
  createdAt: Date | null;
};

export default function TodayScreen() {
  const [habits, setHabits] = useState<Habit[]>([]);
  const [completedIds, setCompletedIds] = useState<Set<number>>(new Set());
  const today = formatDate(new Date());
  const { shouldShowReviewPrompt, recordFullCompletion } = useReviewPrompt();

  const loadData = useCallback(() => {
    const todayHabits = getTodayHabits();
    setHabits(todayHabits);

    const completions = getCompletionsForDate(today);
    setCompletedIds(new Set(completions.map((c) => c.habitId)));
  }, [today]);

  useFocusEffect(
    useCallback(() => {
      loadData();
    }, [loadData])
  );

  // Check if all habits are now complete and record it
  const checkFullCompletion = useCallback(
    (newCompletedIds: Set<number>, totalHabits: number) => {
      if (totalHabits > 0 && newCompletedIds.size === totalHabits) {
        recordFullCompletion(today);
      }
    },
    [today, recordFullCompletion]
  );

  const handleToggle = (habitId: number) => {
    const isCurrentlyCompleted = completedIds.has(habitId);

    if (isCurrentlyCompleted) {
      Alert.alert(
        "Uncheck habit?",
        "Are you sure you want to mark this habit as incomplete?",
        [
          { text: "Cancel", style: "cancel" },
          {
            text: "Uncheck",
            onPress: () => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              toggleHabitCompletion(habitId, today);
              setCompletedIds((prev) => {
                const next = new Set(prev);
                next.delete(habitId);
                return next;
              });
            },
          },
        ]
      );
    } else {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      toggleHabitCompletion(habitId, today);
      setCompletedIds((prev) => {
        const next = new Set(prev);
        next.add(habitId);
        // Check for full completion after adding
        checkFullCompletion(next, habits.length);
        return next;
      });
    }
  };

  const completedCount = completedIds.size;
  const totalCount = habits.length;

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <View style={styles.header}>
        <View>
          <Text style={styles.title}>Today</Text>
          <Text style={styles.subtitle}>
            {completedCount} of {totalCount} complete
          </Text>
        </View>
        <CatMascot
          variant={totalCount > 0 && completedCount === totalCount ? "celebrating" : "sitting"}
          size="lg"
        />
      </View>

      <ScrollView style={styles.list} contentContainerStyle={styles.listContent}>
        {habits.length === 0 ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyText}>No habits for today</Text>
            <Text style={styles.emptySubtext}>
              Add habits in the Habits tab
            </Text>
          </View>
        ) : (
          habits.map((habit) => {
            const isCompleted = completedIds.has(habit.id);
            return (
              <Pressable
                key={habit.id}
                style={styles.habitItem}
                onPress={() => handleToggle(habit.id)}
              >
                <Text
                  style={[
                    styles.habitName,
                    isCompleted && styles.habitNameCompleted,
                  ]}
                >
                  {habit.name}
                </Text>
                <View
                  style={[
                    styles.checkbox,
                    isCompleted && styles.checkboxCompleted,
                  ]}
                >
                  {isCompleted && (
                    <Ionicons
                      name="checkmark"
                      size={20}
                      color={colors.primaryForeground}
                    />
                  )}
                </View>
              </Pressable>
            );
          })
        )}
      </ScrollView>
      <ReviewPrompt visible={shouldShowReviewPrompt} />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
    paddingBottom: spacing.lg,
  },
  title: {
    fontSize: fontSize.xxl,
    fontWeight: "700",
    color: colors.foreground,
  },
  subtitle: {
    fontSize: fontSize.base,
    color: colors.mutedForeground,
    marginTop: spacing.xs,
  },
  mascotPlaceholder: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: colors.muted,
  },
  list: {
    flex: 1,
  },
  listContent: {
    paddingHorizontal: spacing.lg,
  },
  habitItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  habitName: {
    fontSize: fontSize.base,
    fontWeight: "500",
    color: colors.foreground,
    flex: 1,
  },
  habitNameCompleted: {
    textDecorationLine: "line-through",
    color: colors.mutedForeground,
  },
  checkbox: {
    width: 28,
    height: 28,
    borderRadius: 14,
    borderWidth: 2,
    borderColor: colors.habitBorder,
    alignItems: "center",
    justifyContent: "center",
  },
  checkboxCompleted: {
    backgroundColor: colors.success,
    borderColor: colors.success,
  },
  emptyState: {
    alignItems: "center",
    paddingTop: spacing.xl * 2,
  },
  emptyText: {
    fontSize: fontSize.lg,
    fontWeight: "600",
    color: colors.foreground,
  },
  emptySubtext: {
    fontSize: fontSize.base,
    color: colors.mutedForeground,
    marginTop: spacing.sm,
  },
});
