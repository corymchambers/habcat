import { drizzle } from "drizzle-orm/expo-sqlite";
import { openDatabaseSync } from "expo-sqlite";
import { eq, and, inArray } from "drizzle-orm";
import * as schema from "./schema";
import { habits, completions } from "./schema";

// Open the database
const expo = openDatabaseSync("habcat.db");

// Create drizzle instance
export const db = drizzle(expo, { schema });

// Initialize database tables
export function initDatabase() {
  expo.execSync(`
    CREATE TABLE IF NOT EXISTS habits (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      days TEXT NOT NULL,
      created_at INTEGER NOT NULL DEFAULT (strftime('%s', 'now') * 1000)
    );

    CREATE TABLE IF NOT EXISTS completions (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      habit_id INTEGER NOT NULL REFERENCES habits(id) ON DELETE CASCADE,
      date TEXT NOT NULL,
      completed_at INTEGER NOT NULL DEFAULT (strftime('%s', 'now') * 1000),
      UNIQUE(habit_id, date)
    );
  `);
}

// Day of week helpers
export type DayOfWeek = "mon" | "tue" | "wed" | "thu" | "fri" | "sat" | "sun";

const dayMap: Record<number, DayOfWeek> = {
  0: "sun",
  1: "mon",
  2: "tue",
  3: "wed",
  4: "thu",
  5: "fri",
  6: "sat",
};

export function getTodayDayOfWeek(): DayOfWeek {
  return dayMap[new Date().getDay()];
}

export function formatDate(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

// Parse YYYY-MM-DD as local noon to avoid timezone boundary issues
export function parseLocalDate(dateStr: string): Date {
  return new Date(dateStr + "T12:00:00");
}

export function parseDays(days: string): DayOfWeek[] {
  return days.split(",") as DayOfWeek[];
}

export function formatDays(days: DayOfWeek[]): string {
  return days.join(",");
}

export function formatDaysDisplay(days: DayOfWeek[]): string {
  const allDays: DayOfWeek[] = ["mon", "tue", "wed", "thu", "fri", "sat", "sun"];
  const weekdays: DayOfWeek[] = ["mon", "tue", "wed", "thu", "fri"];
  const weekend: DayOfWeek[] = ["sat", "sun"];

  if (days.length === 7) return "Every day";
  if (
    days.length === 5 &&
    weekdays.every((d) => days.includes(d))
  ) {
    return "Weekdays";
  }
  if (
    days.length === 2 &&
    weekend.every((d) => days.includes(d))
  ) {
    return "Weekends";
  }

  const dayLabels: Record<DayOfWeek, string> = {
    mon: "Mon",
    tue: "Tue",
    wed: "Wed",
    thu: "Thu",
    fri: "Fri",
    sat: "Sat",
    sun: "Sun",
  };

  return days.map((d) => dayLabels[d]).join(", ");
}

// Habit CRUD
export function getAllHabits() {
  return db.select().from(habits).all();
}

export function getHabitsForDay(day: DayOfWeek) {
  const allHabits = getAllHabits();
  return allHabits.filter((h) => parseDays(h.days).includes(day));
}

export function getTodayHabits() {
  return getHabitsForDay(getTodayDayOfWeek());
}

export function createHabit(name: string, days: DayOfWeek[]) {
  return db
    .insert(habits)
    .values({ name, days: formatDays(days) })
    .returning()
    .get();
}

export function updateHabit(id: number, name: string, days: DayOfWeek[]) {
  return db
    .update(habits)
    .set({ name, days: formatDays(days) })
    .where(eq(habits.id, id))
    .returning()
    .get();
}

export function deleteHabit(id: number) {
  return db.delete(habits).where(eq(habits.id, id)).run();
}

// Completion CRUD
export function getCompletionsForDate(date: string) {
  return db.select().from(completions).where(eq(completions.date, date)).all();
}

export function getCompletionsForDateRange(startDate: string, endDate: string) {
  return db
    .select()
    .from(completions)
    .where(
      and(
        eq(completions.date, completions.date), // placeholder for range
      )
    )
    .all()
    .filter((c) => c.date >= startDate && c.date <= endDate);
}

export function isHabitCompletedOnDate(habitId: number, date: string): boolean {
  const result = db
    .select()
    .from(completions)
    .where(and(eq(completions.habitId, habitId), eq(completions.date, date)))
    .get();
  return !!result;
}

export function toggleHabitCompletion(habitId: number, date: string): boolean {
  const existing = db
    .select()
    .from(completions)
    .where(and(eq(completions.habitId, habitId), eq(completions.date, date)))
    .get();

  if (existing) {
    db.delete(completions).where(eq(completions.id, existing.id)).run();
    return false;
  } else {
    db.insert(completions).values({ habitId, date }).run();
    return true;
  }
}

// History/Stats
export function getCompletionStats(startDate: string, endDate: string) {
  const allHabits = getAllHabits();
  const allCompletions = getCompletionsForDateRange(startDate, endDate);

  // Calculate expected completions for date range
  let expectedCount = 0;
  let completedCount = allCompletions.length;

  const start = parseLocalDate(startDate);
  const end = parseLocalDate(endDate);

  for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
    const day = dayMap[d.getDay()];
    for (const habit of allHabits) {
      if (parseDays(habit.days).includes(day)) {
        expectedCount++;
      }
    }
  }

  return {
    completed: completedCount,
    expected: expectedCount,
    percentage: expectedCount > 0 ? Math.round((completedCount / expectedCount) * 100) : 0,
  };
}

export function getDayCompletionStatus(
  date: string,
  habitIds: number[]
): "complete" | "partial" | "none" {
  if (habitIds.length === 0) return "none";

  const dayCompletions = getCompletionsForDate(date);
  const completedHabitIds = dayCompletions.map((c) => c.habitId);
  const completedCount = habitIds.filter((id) =>
    completedHabitIds.includes(id)
  ).length;

  if (completedCount === 0) return "none";
  if (completedCount === habitIds.length) return "complete";
  return "partial";
}

// Get habits scheduled for a specific date
export function getHabitsForDate(date: string) {
  const d = parseLocalDate(date);
  const day = dayMap[d.getDay()];
  return getHabitsForDay(day);
}

// Get detailed day data for history
export interface DayDetail {
  date: string;
  habits: Array<{
    id: number;
    name: string;
    completed: boolean;
  }>;
  completed: number;
  total: number;
}

export function getDayDetails(date: string): DayDetail {
  const scheduledHabits = getHabitsForDate(date);
  const dayCompletions = getCompletionsForDate(date);
  const completedIds = new Set(dayCompletions.map((c) => c.habitId));

  const habits = scheduledHabits.map((h) => ({
    id: h.id,
    name: h.name,
    completed: completedIds.has(h.id),
  }));

  return {
    date,
    habits,
    completed: habits.filter((h) => h.completed).length,
    total: habits.length,
  };
}

// Get all day details for a date range
export function getHistoryData(startDate: string, endDate: string): DayDetail[] {
  const result: DayDetail[] = [];
  const start = parseLocalDate(startDate);
  const end = parseLocalDate(endDate);

  for (let d = new Date(end); d >= start; d.setDate(d.getDate() - 1)) {
    const dateStr = formatDate(d);
    const dayDetail = getDayDetails(dateStr);
    // Only include days that had scheduled habits
    if (dayDetail.total > 0) {
      result.push(dayDetail);
    }
  }

  return result;
}

// Streak calculation
export interface StreakData {
  current: number;
  longest: number;
}

export function getStreaks(): StreakData {
  const allHabits = getAllHabits();
  if (allHabits.length === 0) {
    return { current: 0, longest: 0 };
  }

  // Get all completions sorted by date
  const allCompletions = db.select().from(completions).all();
  const completionsByDate = new Map<string, Set<number>>();

  for (const c of allCompletions) {
    if (!completionsByDate.has(c.date)) {
      completionsByDate.set(c.date, new Set());
    }
    completionsByDate.get(c.date)!.add(c.habitId);
  }

  // Find the earliest habit creation or completion date
  const today = new Date();
  const todayStr = formatDate(today);

  // Calculate streaks going backwards from today
  let currentStreak = 0;
  let longestStreak = 0;
  let tempStreak = 0;
  let streakBroken = false;

  // Go back up to 365 days (or until we find no more data)
  for (let i = 0; i < 365; i++) {
    const d = new Date(today);
    d.setDate(d.getDate() - i);
    const dateStr = formatDate(d);
    const dow = dayMap[d.getDay()];

    // Get habits scheduled for this day
    const scheduledHabits = allHabits.filter((h) =>
      parseDays(h.days).includes(dow)
    );

    if (scheduledHabits.length === 0) {
      // No habits scheduled, doesn't break streak
      continue;
    }

    const completedIds = completionsByDate.get(dateStr) || new Set();
    const allCompleted = scheduledHabits.every((h) => completedIds.has(h.id));

    if (allCompleted) {
      tempStreak++;
      if (!streakBroken) {
        currentStreak = tempStreak;
      }
      longestStreak = Math.max(longestStreak, tempStreak);
    } else {
      streakBroken = true;
      tempStreak = 0;
    }
  }

  return { current: currentStreak, longest: longestStreak };
}
