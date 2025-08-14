import { sql } from "drizzle-orm";
import { pgTable, text, varchar, integer, boolean, timestamp, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
});

export const workoutPrograms = pgTable("workout_programs", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull(),
  name: text("name").notNull(),
  totalWeeks: integer("total_weeks").notNull().default(7),
  currentWeek: integer("current_week").notNull().default(1),
  startDate: timestamp("start_date").notNull(),
  autoProgression: boolean("auto_progression").notNull().default(true),
  createdAt: timestamp("created_at").notNull().default(sql`now()`),
});

export const trainingDays = pgTable("training_days", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  programId: varchar("program_id").notNull(),
  dayType: text("day_type").notNull(), // 'A', 'B', 'C'
  name: text("name").notNull(),
  description: text("description"),
  estimatedDuration: integer("estimated_duration"), // in minutes
});

export const exercises = pgTable("exercises", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  trainingDayId: varchar("training_day_id").notNull(),
  name: text("name").notNull(),
  description: text("description"),
  instructions: text("instructions").array(),
  videoUrl: text("video_url"),
  orderIndex: integer("order_index").notNull(),
  weekFormulas: jsonb("week_formulas").notNull(), // { "1": "3x8-10", "2": "3x10-12", etc. }
});

export const workoutSessions = pgTable("workout_sessions", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  programId: varchar("program_id").notNull(),
  trainingDayId: varchar("training_day_id").notNull(),
  weekNumber: integer("week_number").notNull(),
  startTime: timestamp("start_time").notNull(),
  endTime: timestamp("end_time"),
  completed: boolean("completed").notNull().default(false),
  exercisesCompleted: integer("exercises_completed").notNull().default(0),
  totalExercises: integer("total_exercises").notNull(),
});

export const exerciseCompletions = pgTable("exercise_completions", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  sessionId: varchar("session_id").notNull(),
  exerciseId: varchar("exercise_id").notNull(),
  completed: boolean("completed").notNull().default(false),
  sets: integer("sets"),
  reps: text("reps"),
  weight: text("weight"),
  notes: text("notes"),
});

export const userSettings = pgTable("user_settings", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().unique(),
  workoutReminders: boolean("workout_reminders").notNull().default(true),
  restDayAlerts: boolean("rest_day_alerts").notNull().default(false),
  theme: text("theme").notNull().default('light'),
});

// Insert schemas
export const insertWorkoutProgramSchema = createInsertSchema(workoutPrograms).omit({
  id: true,
  createdAt: true,
});

export const insertTrainingDaySchema = createInsertSchema(trainingDays).omit({
  id: true,
});

export const insertExerciseSchema = createInsertSchema(exercises).omit({
  id: true,
});

export const insertWorkoutSessionSchema = createInsertSchema(workoutSessions).omit({
  id: true,
});

export const insertExerciseCompletionSchema = createInsertSchema(exerciseCompletions).omit({
  id: true,
});

export const insertUserSettingsSchema = createInsertSchema(userSettings).omit({
  id: true,
});

// Types
export type WorkoutProgram = typeof workoutPrograms.$inferSelect;
export type InsertWorkoutProgram = z.infer<typeof insertWorkoutProgramSchema>;

export type TrainingDay = typeof trainingDays.$inferSelect;
export type InsertTrainingDay = z.infer<typeof insertTrainingDaySchema>;

export type Exercise = typeof exercises.$inferSelect;
export type InsertExercise = z.infer<typeof insertExerciseSchema>;

export type WorkoutSession = typeof workoutSessions.$inferSelect;
export type InsertWorkoutSession = z.infer<typeof insertWorkoutSessionSchema>;

export type ExerciseCompletion = typeof exerciseCompletions.$inferSelect;
export type InsertExerciseCompletion = z.infer<typeof insertExerciseCompletionSchema>;

export type UserSettings = typeof userSettings.$inferSelect;
export type InsertUserSettings = z.infer<typeof insertUserSettingsSchema>;

export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
});
