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
  return date.toISOString().split("T")[0];
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

  const start = new Date(startDate);
  const end = new Date(endDate);

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
