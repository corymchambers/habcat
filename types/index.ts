// Day of week type
export type DayOfWeek = "mon" | "tue" | "wed" | "thu" | "fri" | "sat" | "sun";

// Habit type
export interface Habit {
  id: number;
  name: string;
  days: DayOfWeek[];
  createdAt: Date;
}

// Completion type
export interface Completion {
  id: number;
  habitId: number;
  date: string; // YYYY-MM-DD format
  completedAt: Date;
}
