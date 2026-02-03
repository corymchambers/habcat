import { sqliteTable, text, integer } from "drizzle-orm/sqlite-core";

// Habits table
export const habits = sqliteTable("habits", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  name: text("name").notNull(),
  // Days stored as comma-separated: "mon,tue,wed,thu,fri,sat,sun"
  days: text("days").notNull(),
  createdAt: integer("created_at", { mode: "timestamp" })
    .notNull()
    .$defaultFn(() => new Date()),
  // Soft delete - null means active, timestamp means deleted
  deletedAt: integer("deleted_at", { mode: "timestamp" }),
});

// Habit completions table
export const completions = sqliteTable("completions", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  habitId: integer("habit_id")
    .notNull()
    .references(() => habits.id, { onDelete: "cascade" }),
  // Date stored as YYYY-MM-DD string for easy querying
  date: text("date").notNull(),
  completedAt: integer("completed_at", { mode: "timestamp" })
    .notNull()
    .$defaultFn(() => new Date()),
});
