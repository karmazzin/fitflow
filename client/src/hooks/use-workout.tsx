import { useState, useEffect } from "react";
import { workoutData } from "@/lib/workout-data";

export function useWorkout() {
  const [currentWeek, setCurrentWeek] = useState<number>(1);
  const [totalWorkouts, setTotalWorkouts] = useState<number>(0);
  const [streak, setStreak] = useState<number>(0);
  const [userSettings, setUserSettings] = useState({
    goal: "general_fitness",
    experience: "beginner",
    equipment: ["bodyweight", "dumbbells"]
  });

  // Load user data from localStorage on mount
  useEffect(() => {
    const savedWeek = localStorage.getItem("fitflow-current-week");
    const savedSettings = localStorage.getItem("fitflow-user-settings");
    
    if (savedWeek) {
      setCurrentWeek(parseInt(savedWeek, 10));
    }
    
    if (savedSettings) {
      setUserSettings(JSON.parse(savedSettings));
    }

    // Calculate stats
    const completedWorkouts = JSON.parse(localStorage.getItem("fitflow-completed-workouts") || "[]");
    setTotalWorkouts(completedWorkouts.length);
    calculateStreak(completedWorkouts);
  }, []);

  // Save current week to localStorage when it changes
  useEffect(() => {
    localStorage.setItem("fitflow-current-week", currentWeek.toString());
  }, [currentWeek]);

  // Save user settings to localStorage when they change
  useEffect(() => {
    localStorage.setItem("fitflow-user-settings", JSON.stringify(userSettings));
  }, [userSettings]);

  const calculateStreak = (completedWorkouts: string[]) => {
    if (completedWorkouts.length === 0) {
      setStreak(0);
      return;
    }

    // Sort workouts by date and calculate consecutive days
    const workoutDates = completedWorkouts
      .map(workout => new Date(workout.split('-').slice(2).join('-')))
      .sort((a, b) => b.getTime() - a.getTime());

    let currentStreak = 1;
    const today = new Date();
    
    // Check if most recent workout was today or yesterday
    const mostRecent = workoutDates[0];
    const daysDiff = Math.floor((today.getTime() - mostRecent.getTime()) / (1000 * 60 * 60 * 24));
    
    if (daysDiff > 1) {
      setStreak(0);
      return;
    }

    // Count consecutive days
    for (let i = 1; i < workoutDates.length; i++) {
      const diff = Math.floor((workoutDates[i-1].getTime() - workoutDates[i].getTime()) / (1000 * 60 * 60 * 24));
      if (diff <= 2) { // Allow for rest days
        currentStreak++;
      } else {
        break;
      }
    }

    setStreak(currentStreak);
  };

  const progressToNextWeek = () => {
    if (currentWeek < 7) {
      setCurrentWeek(currentWeek + 1);
    }
  };

  const updateUserSettings = (newSettings: Partial<typeof userSettings>) => {
    setUserSettings(prev => ({ ...prev, ...newSettings }));
  };

  const getCompletedWorkouts = () => {
    const completed = JSON.parse(localStorage.getItem("fitflow-completed-workouts") || "[]");
    return completed;
  };

  const isWorkoutCompleted = (dayType: string, week?: number) => {
    const weekToCheck = week || currentWeek;
    const completed = getCompletedWorkouts();
    return completed.some((workout: string) => 
      workout.startsWith(`${weekToCheck}-${dayType}`)
    );
  };

  const getWeeklyProgress = () => {
    const completed = getCompletedWorkouts();
    const currentWeekWorkouts = completed.filter((workout: string) => 
      workout.startsWith(`${currentWeek}-`)
    );
    return {
      completed: currentWeekWorkouts.length,
      total: 3, // A, B, C
      percentage: Math.round((currentWeekWorkouts.length / 3) * 100)
    };
  };

  // Check if user should auto-progress to next week
  const checkAutoProgression = () => {
    const weeklyProgress = getWeeklyProgress();
    if (weeklyProgress.completed >= 3 && currentWeek < 7) {
      const lastWorkoutDate = localStorage.getItem("fitflow-last-workout-date");
      const daysSinceLastWorkout = lastWorkoutDate ? 
        Math.floor((Date.now() - new Date(lastWorkoutDate).getTime()) / (1000 * 60 * 60 * 24)) : 0;
      
      // Auto-progress if all workouts completed and it's been at least 1 day
      if (daysSinceLastWorkout >= 1) {
        progressToNextWeek();
        return true;
      }
    }
    return false;
  };

  const getWorkoutByDay = (dayType: string) => {
    const workout = workoutData.workouts[dayType as keyof typeof workoutData.workouts];
    if (!workout) return null;

    // Combine warm-up, main training, and cool-down exercises
    return {
      name: workout.name,
      type: workout.type,
      warmUp: workoutData.warmUpExercises,
      mainTraining: workout.exercises,
      coolDown: workoutData.coolDownExercises
    };
  };

  const getExerciseFormula = (exerciseId: string, week: number) => {
    // Find exercises from all sources
    const allExercises = [
      ...workoutData.warmUpExercises,
      ...workoutData.coolDownExercises,
      ...workoutData.workouts.A.exercises,
      ...workoutData.workouts.B.exercises,
      ...workoutData.workouts.C.exercises,
    ];
    
    const exercise = allExercises.find(ex => ex.id === exerciseId);
    if (exercise && exercise.weekFormulas) {
      const weekKey = week.toString() as keyof typeof exercise.weekFormulas;
      return exercise.weekFormulas[weekKey] || "3 sets × 10 reps";
    }
    return "3 sets × 10 reps";
  };

  const getTrainingDays = () => {
    return workoutData.trainingDays;
  };

  return {
    currentWeek,
    setCurrentWeek,
    totalWorkouts,
    streak,
    userSettings,
    workoutData,
    progressToNextWeek,
    updateUserSettings,
    getCompletedWorkouts,
    isWorkoutCompleted,
    getWeeklyProgress,
    checkAutoProgression,
    getWorkoutByDay,
    getExerciseFormula,
    getTrainingDays
  };
};