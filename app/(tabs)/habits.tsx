import { useState, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  ScrollView,
} from "react-native";
import { useFocusEffect, useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import Ionicons from "@expo/vector-icons/Ionicons";
import { colors, spacing, fontSize, borderRadius } from "@/constants/theme";
import { CatMascot } from "@/components/CatMascot";
import { getAllHabits, parseDays, formatDaysDisplay } from "@/database";

type Habit = {
  id: number;
  name: string;
  days: string;
  createdAt: Date | null;
};

export default function HabitsScreen() {
  const [habits, setHabits] = useState<Habit[]>([]);
  const router = useRouter();

  useFocusEffect(
    useCallback(() => {
      const allHabits = getAllHabits();
      setHabits(allHabits);
    }, [])
  );

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <View style={styles.header}>
        <View>
          <Text style={styles.title}>Habits</Text>
          <Text style={styles.subtitle}>
            {habits.length} {habits.length === 1 ? "habit" : "habits"}
          </Text>
        </View>
        <CatMascot variant="sitting" size="lg" />
      </View>

      <ScrollView style={styles.list} contentContainerStyle={styles.listContent}>
        {habits.length === 0 ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyText}>No habits yet</Text>
            <Text style={styles.emptySubtext}>
              Tap the + button to add your first habit
            </Text>
          </View>
        ) : (
          habits.map((habit) => (
            <Pressable
              key={habit.id}
              style={styles.habitItem}
              onPress={() => router.push(`/edit-habit?id=${habit.id}`)}
            >
              <View style={styles.habitInfo}>
                <Text style={styles.habitName}>{habit.name}</Text>
                <Text style={styles.habitDays}>
                  {formatDaysDisplay(parseDays(habit.days))}
                </Text>
              </View>
              <Ionicons
                name="chevron-forward"
                size={20}
                color={colors.mutedForeground}
              />
            </Pressable>
          ))
        )}
      </ScrollView>

      <Pressable
        style={styles.fab}
        onPress={() => router.push("/new-habit")}
      >
        <Ionicons name="add" size={28} color={colors.primaryForeground} />
      </Pressable>
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
    paddingBottom: 100,
  },
  habitItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  habitInfo: {
    flex: 1,
  },
  habitName: {
    fontSize: fontSize.base,
    fontWeight: "500",
    color: colors.foreground,
  },
  habitDays: {
    fontSize: fontSize.sm,
    color: colors.mutedForeground,
    marginTop: spacing.xs,
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
  fab: {
    position: "absolute",
    bottom: 24,
    right: 24,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: colors.primary,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 4,
  },
});
