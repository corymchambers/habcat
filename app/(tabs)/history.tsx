import { useState, useCallback, useMemo } from "react";
import { View, Text, StyleSheet, Pressable, ScrollView } from "react-native";
import { useFocusEffect } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { colors, spacing, fontSize, borderRadius } from "@/constants/theme";
import {
  getAllHabits,
  getCompletionsForDateRange,
  parseDays,
  formatDate,
  DayOfWeek,
} from "@/database";

type FilterPeriod = "week" | "month" | "year";

const dayMap: Record<number, DayOfWeek> = {
  0: "sun",
  1: "mon",
  2: "tue",
  3: "wed",
  4: "thu",
  5: "fri",
  6: "sat",
};

export default function HistoryScreen() {
  const [period, setPeriod] = useState<FilterPeriod>("month");
  const [habits, setHabits] = useState<
    { id: number; name: string; days: string }[]
  >([]);
  const [completions, setCompletions] = useState<
    { habitId: number; date: string }[]
  >([]);

  const today = useMemo(() => new Date(), []);

  const { startDate, endDate } = useMemo(() => {
    const end = new Date(today);
    const start = new Date(today);

    if (period === "week") {
      start.setDate(end.getDate() - 6);
    } else if (period === "month") {
      start.setDate(1);
    } else {
      start.setMonth(0, 1);
    }

    return {
      startDate: formatDate(start),
      endDate: formatDate(end),
    };
  }, [period, today]);

  useFocusEffect(
    useCallback(() => {
      setHabits(getAllHabits());
      setCompletions(getCompletionsForDateRange(startDate, endDate));
    }, [startDate, endDate])
  );

  const stats = useMemo(() => {
    let expectedCount = 0;
    const completedCount = completions.length;

    const start = new Date(startDate);
    const end = new Date(endDate);

    for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
      const day = dayMap[d.getDay()];
      for (const habit of habits) {
        if (parseDays(habit.days).includes(day)) {
          expectedCount++;
        }
      }
    }

    return {
      completed: completedCount,
      expected: expectedCount,
      percentage:
        expectedCount > 0
          ? Math.round((completedCount / expectedCount) * 100)
          : 0,
    };
  }, [habits, completions, startDate, endDate]);

  // Generate calendar data for month view
  const calendarData = useMemo(() => {
    if (period !== "month") return null;

    const year = today.getFullYear();
    const month = today.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startDayOfWeek = (firstDay.getDay() + 6) % 7; // Monday = 0

    const completionsByDate = new Map<string, number>();
    const expectedByDate = new Map<string, number>();

    // Calculate expected habits per day
    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(year, month, day);
      const dateStr = formatDate(date);
      const dow = dayMap[date.getDay()];

      let expected = 0;
      for (const habit of habits) {
        if (parseDays(habit.days).includes(dow)) {
          expected++;
        }
      }
      expectedByDate.set(dateStr, expected);
    }

    // Count completions per day
    for (const c of completions) {
      const count = completionsByDate.get(c.date) || 0;
      completionsByDate.set(c.date, count + 1);
    }

    const weeks: Array<
      Array<{
        day: number | null;
        status: "complete" | "partial" | "none" | "future";
        isToday: boolean;
      }>
    > = [];

    let currentWeek: typeof weeks[0] = [];

    // Add empty cells for days before the 1st
    for (let i = 0; i < startDayOfWeek; i++) {
      currentWeek.push({ day: null, status: "none", isToday: false });
    }

    const todayStr = formatDate(today);

    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(year, month, day);
      const dateStr = formatDate(date);
      const isToday = dateStr === todayStr;
      const isFuture = date > today;

      let status: "complete" | "partial" | "none" | "future" = "none";

      if (isFuture) {
        status = "future";
      } else {
        const expected = expectedByDate.get(dateStr) || 0;
        const completed = completionsByDate.get(dateStr) || 0;

        if (expected === 0) {
          status = "none";
        } else if (completed >= expected) {
          status = "complete";
        } else if (completed > 0) {
          status = "partial";
        }
      }

      currentWeek.push({ day, status, isToday });

      if (currentWeek.length === 7) {
        weeks.push(currentWeek);
        currentWeek = [];
      }
    }

    // Pad the last week
    while (currentWeek.length > 0 && currentWeek.length < 7) {
      currentWeek.push({ day: null, status: "none", isToday: false });
    }
    if (currentWeek.length === 7) {
      weeks.push(currentWeek);
    }

    return weeks;
  }, [period, today, habits, completions]);

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <View style={styles.header}>
        <View>
          <Text style={styles.title}>History</Text>
          <Text style={styles.subtitle}>Your journey so far</Text>
        </View>
        {/* Cat mascot placeholder */}
        <View style={styles.mascotPlaceholder} />
      </View>

      {/* Period filter */}
      <View style={styles.filterContainer}>
        {(["week", "month", "year"] as FilterPeriod[]).map((p) => (
          <Pressable
            key={p}
            style={[styles.filterButton, period === p && styles.filterButtonActive]}
            onPress={() => setPeriod(p)}
          >
            <Text
              style={[
                styles.filterText,
                period === p && styles.filterTextActive,
              ]}
            >
              {p.charAt(0).toUpperCase() + p.slice(1)}
            </Text>
          </Pressable>
        ))}
      </View>

      <ScrollView style={styles.content}>
        {/* Stats card */}
        <View style={styles.statsCard}>
          <View style={styles.statItem}>
            <Text style={styles.statLabel}>Completion</Text>
            <Text style={styles.statValue}>{stats.percentage}%</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statLabel}>Habits done</Text>
            <Text style={styles.statValue}>
              {stats.completed} / {stats.expected}
            </Text>
          </View>
        </View>

        {/* Calendar (month view only) */}
        {period === "month" && calendarData && (
          <View style={styles.calendarCard}>
            <View style={styles.calendarHeader}>
              {["M", "T", "W", "T", "F", "S", "S"].map((d, i) => (
                <Text key={i} style={styles.calendarDayLabel}>
                  {d}
                </Text>
              ))}
            </View>
            {calendarData.map((week, weekIndex) => (
              <View key={weekIndex} style={styles.calendarWeek}>
                {week.map((cell, dayIndex) => (
                  <View
                    key={dayIndex}
                    style={[
                      styles.calendarCell,
                      cell.status === "complete" && styles.calendarCellComplete,
                      cell.status === "partial" && styles.calendarCellPartial,
                      cell.status === "future" && styles.calendarCellFuture,
                      cell.isToday && styles.calendarCellToday,
                    ]}
                  >
                    {cell.day && (
                      <Text
                        style={[
                          styles.calendarDayText,
                          cell.status === "future" &&
                            styles.calendarDayTextFuture,
                        ]}
                      >
                        {cell.day}
                      </Text>
                    )}
                  </View>
                ))}
              </View>
            ))}
            <View style={styles.legend}>
              <View style={styles.legendItem}>
                <View
                  style={[styles.legendDot, { backgroundColor: colors.success }]}
                />
                <Text style={styles.legendText}>Complete</Text>
              </View>
              <View style={styles.legendItem}>
                <View
                  style={[
                    styles.legendDot,
                    { backgroundColor: colors.successMuted },
                  ]}
                />
                <Text style={styles.legendText}>Partial</Text>
              </View>
            </View>
          </View>
        )}

        {/* Simple stats for week/year view */}
        {period !== "month" && (
          <View style={styles.simpleStats}>
            <Text style={styles.simpleStatsText}>
              You completed {stats.completed} habits out of {stats.expected}{" "}
              scheduled this {period}.
            </Text>
          </View>
        )}
      </ScrollView>
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
    paddingBottom: spacing.md,
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
  filterContainer: {
    flexDirection: "row",
    paddingHorizontal: spacing.lg,
    marginBottom: spacing.md,
    gap: spacing.sm,
  },
  filterButton: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.full,
    backgroundColor: colors.secondary,
  },
  filterButtonActive: {
    backgroundColor: colors.primary,
  },
  filterText: {
    fontSize: fontSize.sm,
    fontWeight: "500",
    color: colors.secondaryForeground,
  },
  filterTextActive: {
    color: colors.primaryForeground,
  },
  content: {
    flex: 1,
    paddingHorizontal: spacing.lg,
  },
  statsCard: {
    flexDirection: "row",
    justifyContent: "space-between",
    backgroundColor: colors.card,
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    marginBottom: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
  },
  statItem: {},
  statLabel: {
    fontSize: fontSize.sm,
    color: colors.mutedForeground,
    marginBottom: spacing.xs,
  },
  statValue: {
    fontSize: fontSize.xl,
    fontWeight: "700",
    color: colors.foreground,
  },
  calendarCard: {
    backgroundColor: colors.card,
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    borderWidth: 1,
    borderColor: colors.border,
  },
  calendarHeader: {
    flexDirection: "row",
    marginBottom: spacing.sm,
  },
  calendarDayLabel: {
    flex: 1,
    textAlign: "center",
    fontSize: fontSize.sm,
    fontWeight: "500",
    color: colors.mutedForeground,
  },
  calendarWeek: {
    flexDirection: "row",
    marginBottom: spacing.xs,
  },
  calendarCell: {
    flex: 1,
    aspectRatio: 1,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: borderRadius.full,
    margin: 2,
  },
  calendarCellComplete: {
    backgroundColor: colors.success,
  },
  calendarCellPartial: {
    backgroundColor: colors.successMuted,
  },
  calendarCellFuture: {
    opacity: 0.4,
  },
  calendarCellToday: {
    borderWidth: 2,
    borderColor: colors.primary,
  },
  calendarDayText: {
    fontSize: fontSize.sm,
    fontWeight: "500",
    color: colors.foreground,
  },
  calendarDayTextFuture: {
    color: colors.mutedForeground,
  },
  legend: {
    flexDirection: "row",
    justifyContent: "center",
    gap: spacing.lg,
    marginTop: spacing.md,
  },
  legendItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.xs,
  },
  legendDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  legendText: {
    fontSize: fontSize.sm,
    color: colors.mutedForeground,
  },
  simpleStats: {
    backgroundColor: colors.card,
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    borderWidth: 1,
    borderColor: colors.border,
  },
  simpleStatsText: {
    fontSize: fontSize.base,
    color: colors.foreground,
    textAlign: "center",
  },
});
