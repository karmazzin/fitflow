import { 
  type User, 
  type InsertUser,
  type WorkoutProgram,
  type InsertWorkoutProgram,
  type TrainingDay,
  type InsertTrainingDay,
  type Exercise,
  type InsertExercise,
  type WorkoutSession,
  type InsertWorkoutSession,
  type ExerciseCompletion,
  type InsertExerciseCompletion,
  type UserSettings,
  type InsertUserSettings
} from "@shared/schema";
import { randomUUID } from "crypto";

export interface IStorage {
  // User methods
  getUser(id: string): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;

  // Program methods
  getAllPrograms(): Promise<WorkoutProgram[]>;
  getProgram(id: string): Promise<WorkoutProgram | undefined>;
  createProgram(program: InsertWorkoutProgram): Promise<WorkoutProgram>;
  updateProgram(id: string, updates: Partial<WorkoutProgram>): Promise<WorkoutProgram | undefined>;

  // Session methods
  createSession(session: InsertWorkoutSession): Promise<WorkoutSession>;
  updateSession(id: string, updates: Partial<WorkoutSession>): Promise<WorkoutSession | undefined>;
  getUserSessions(userId: string): Promise<WorkoutSession[]>;

  // Exercise completion methods
  createExerciseCompletion(completion: InsertExerciseCompletion): Promise<ExerciseCompletion>;
  getSessionCompletions(sessionId: string): Promise<ExerciseCompletion[]>;

  // Settings methods
  getUserSettings(userId: string): Promise<UserSettings | undefined>;
  updateUserSettings(userId: string, updates: Partial<UserSettings>): Promise<UserSettings>;

  // Statistics methods
  getUserStats(userId: string): Promise<any>;

  // Sync methods
  syncOfflineData(data: any): Promise<void>;
}

export class MemStorage implements IStorage {
  private users: Map<string, User>;
  private programs: Map<string, WorkoutProgram>;
  private trainingDays: Map<string, TrainingDay>;
  private exercises: Map<string, Exercise>;
  private sessions: Map<string, WorkoutSession>;
  private completions: Map<string, ExerciseCompletion>;
  private userSettings: Map<string, UserSettings>;

  constructor() {
    this.users = new Map();
    this.programs = new Map();
    this.trainingDays = new Map();
    this.exercises = new Map();
    this.sessions = new Map();
    this.completions = new Map();
    this.userSettings = new Map();

    // Initialize with default data
    this.initializeDefaultData();
  }

  private initializeDefaultData() {
    // Create default workout program
    const defaultProgram: WorkoutProgram = {
      id: "default-program",
      userId: "default-user",
      name: "Progressive Training Program",
      totalWeeks: 7,
      currentWeek: 1,
      startDate: new Date(),
      autoProgression: true,
      createdAt: new Date(),
    };
    this.programs.set(defaultProgram.id, defaultProgram);

    // Create default training days
    const trainingDayA: TrainingDay = {
      id: "day-a",
      programId: "default-program",
      dayType: "A",
      name: "Day A - Upper Body",
      description: "Upper body focused workout",
      estimatedDuration: 60,
    };
    this.trainingDays.set(trainingDayA.id, trainingDayA);

    const trainingDayB: TrainingDay = {
      id: "day-b", 
      programId: "default-program",
      dayType: "B",
      name: "Day B - Lower Body",
      description: "Lower body focused workout",
      estimatedDuration: 65,
    };
    this.trainingDays.set(trainingDayB.id, trainingDayB);

    const trainingDayC: TrainingDay = {
      id: "day-c",
      programId: "default-program", 
      dayType: "C",
      name: "Day C - Full Body",
      description: "Full body workout",
      estimatedDuration: 70,
    };
    this.trainingDays.set(trainingDayC.id, trainingDayC);
  }

  async getUser(id: string): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = randomUUID();
    const user: User = { ...insertUser, id };
    this.users.set(id, user);
    return user;
  }

  async getAllPrograms(): Promise<WorkoutProgram[]> {
    return Array.from(this.programs.values());
  }

  async getProgram(id: string): Promise<WorkoutProgram | undefined> {
    return this.programs.get(id);
  }

  async createProgram(insertProgram: InsertWorkoutProgram): Promise<WorkoutProgram> {
    const id = randomUUID();
    const program: WorkoutProgram = {
      ...insertProgram,
      id,
      totalWeeks: insertProgram.totalWeeks ?? 7,
      currentWeek: insertProgram.currentWeek ?? 1,
      autoProgression: insertProgram.autoProgression ?? true,
      createdAt: new Date(),
    };
    this.programs.set(id, program);
    return program;
  }

  async updateProgram(id: string, updates: Partial<WorkoutProgram>): Promise<WorkoutProgram | undefined> {
    const program = this.programs.get(id);
    if (!program) return undefined;

    const updatedProgram = { ...program, ...updates };
    this.programs.set(id, updatedProgram);
    return updatedProgram;
  }

  async createSession(insertSession: InsertWorkoutSession): Promise<WorkoutSession> {
    const id = randomUUID();
    const session: WorkoutSession = { 
      ...insertSession, 
      id,
      endTime: insertSession.endTime ?? null,
      completed: insertSession.completed ?? false,
      exercisesCompleted: insertSession.exercisesCompleted ?? 0,
    };
    this.sessions.set(id, session);
    return session;
  }

  async updateSession(id: string, updates: Partial<WorkoutSession>): Promise<WorkoutSession | undefined> {
    const session = this.sessions.get(id);
    if (!session) return undefined;

    const updatedSession = { ...session, ...updates };
    this.sessions.set(id, updatedSession);
    return updatedSession;
  }

  async getUserSessions(userId: string): Promise<WorkoutSession[]> {
    return Array.from(this.sessions.values()).filter(
      session => {
        const program = this.programs.get(session.programId);
        return program?.userId === userId;
      }
    );
  }

  async createExerciseCompletion(insertCompletion: InsertExerciseCompletion): Promise<ExerciseCompletion> {
    const id = randomUUID();
    const completion: ExerciseCompletion = { 
      ...insertCompletion, 
      id,
      completed: insertCompletion.completed ?? false,
      sets: insertCompletion.sets ?? null,
      reps: insertCompletion.reps ?? null,
      weight: insertCompletion.weight ?? null,
      notes: insertCompletion.notes ?? null,
    };
    this.completions.set(id, completion);
    return completion;
  }

  async getSessionCompletions(sessionId: string): Promise<ExerciseCompletion[]> {
    return Array.from(this.completions.values()).filter(
      completion => completion.sessionId === sessionId
    );
  }

  async getUserSettings(userId: string): Promise<UserSettings | undefined> {
    return this.userSettings.get(userId);
  }

  async updateUserSettings(userId: string, updates: Partial<UserSettings>): Promise<UserSettings> {
    const existing = this.userSettings.get(userId);
    const settings: UserSettings = {
      id: existing?.id || randomUUID(),
      userId,
      workoutReminders: true,
      restDayAlerts: false,
      theme: 'light',
      ...existing,
      ...updates,
    };
    this.userSettings.set(userId, settings);
    return settings;
  }

  async getUserStats(userId: string): Promise<any> {
    const sessions = await this.getUserSessions(userId);
    const completedSessions = sessions.filter(s => s.completed);
    
    const totalWorkouts = completedSessions.length;
    const totalDuration = completedSessions.reduce((sum, s) => {
      if (s.endTime && s.startTime) {
        return sum + (s.endTime.getTime() - s.startTime.getTime()) / 1000;
      }
      return sum;
    }, 0);

    // Calculate streak (simplified)
    const streak = this.calculateStreak(completedSessions);

    return {
      totalWorkouts,
      totalDuration,
      streak,
      averageDuration: totalWorkouts > 0 ? totalDuration / totalWorkouts : 0,
    };
  }

  private calculateStreak(sessions: WorkoutSession[]): number {
    if (sessions.length === 0) return 0;
    
    // Sort by date descending
    const sortedSessions = sessions
      .filter(s => s.endTime)
      .sort((a, b) => b.endTime!.getTime() - a.endTime!.getTime());

    let streak = 1;
    const today = new Date();
    
    for (let i = 1; i < sortedSessions.length; i++) {
      const current = sortedSessions[i];
      const previous = sortedSessions[i - 1];
      
      const daysDiff = Math.floor(
        (previous.endTime!.getTime() - current.endTime!.getTime()) / (1000 * 60 * 60 * 24)
      );
      
      if (daysDiff <= 2) { // Allow for rest days
        streak++;
      } else {
        break;
      }
    }

    return streak;
  }

  async syncOfflineData(data: any): Promise<void> {
    // Handle offline data synchronization
    if (data.sessions) {
      for (const sessionData of data.sessions) {
        await this.createSession(sessionData);
      }
    }
    
    if (data.completions) {
      for (const completionData of data.completions) {
        await this.createExerciseCompletion(completionData);
      }
    }
  }
}

export const storage = new MemStorage();
